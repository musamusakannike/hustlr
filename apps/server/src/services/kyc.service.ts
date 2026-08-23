import { User } from "../models/user.model";
import { Kyc } from "../models/kyc.model";
import { Store } from "../models/store.model";
import { ApiError } from "../utils/api-error.util";
import { sendEmail } from "../utils/email.util";
import { SUPPORT_EMAIL } from "../config/constants.config";
import { createNotification } from "./notification.service";
import { listBanks } from "./paystack.service";
import { refreshStoreLiveStatus } from "./store-helper.service";
import { escapeRegex } from "../utils/pagination.util";

const REQUIRED_FIELDS = [
  "firstName",
  "lastName",
  "verificationType",
  "documentId",
  "idDocumentUrl",
  "selfieUrl",
  "address",
  "proofOfAddressUrl",
] as const;

export async function upsertKyc(sellerId: string, payload: Record<string, unknown>) {
  let kyc = await Kyc.findOne({ sellerId });
  if (!kyc) kyc = new Kyc({ sellerId, status: "draft" });
  if (kyc.status === "pending") {
    throw ApiError.badRequest("KYC is under review and cannot be edited");
  }
  const allowed = [
    "firstName",
    "lastName",
    "otherName",
    "verificationType",
    "documentId",
    "idDocumentUrl",
    "selfieUrl",
    "address",
    "proofOfAddressUrl",
    "businessRegistrationUrl",
    "bankDetails",
  ];
  for (const key of allowed) {
    if (payload[key] !== undefined) {
      (kyc as unknown as Record<string, unknown>)[key] = payload[key];
    }
  }
  if (kyc.status === "info_requested") {
    kyc.status = "draft";
  }
  await kyc.save();
  return kyc;
}

export async function submitKyc(sellerId: string) {
  const kyc = await Kyc.findOne({ sellerId });
  if (!kyc) throw ApiError.badRequest("Complete KYC details first");
  for (const field of REQUIRED_FIELDS) {
    if (!kyc.get(field)) throw ApiError.badRequest(`Missing required field: ${field}`);
  }
  if (!kyc.bankDetails?.accountNumber || !kyc.bankDetails?.bankCode) {
    throw ApiError.badRequest("Bank details are required");
  }
  if (kyc.bankDetails.bankCode) {
    const banks = (await listBanks()) as Array<{ code: string }>;
    if (Array.isArray(banks) && !banks.some((b) => b.code === kyc.bankDetails?.bankCode)) {
      throw ApiError.badRequest("Invalid bank code");
    }
  }
  kyc.status = "pending";
  kyc.submittedAt = new Date();
  kyc.requestedFiles = [];
  await kyc.save();

  const seller = await User.findById(sellerId);
  const admins = await User.find({ role: "admin" });
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        recipientId: admin._id,
        recipientType: "admin",
        type: "kyc_submitted",
        title: "New KYC application",
        message: `${seller?.name ?? "A seller"} submitted a KYC application.`,
        link: `/admin/kyc/${kyc._id}`,
        email: {
          to: admin.email,
          templateName: "adminKycSubmitted",
          data: { sellerName: seller?.name ?? "", email: seller?.email ?? "" },
        },
      }),
    ),
  );
  if (seller) {
    await sendEmail({
      to: seller.email,
      templateName: "kycSubmitted",
      data: { name: seller.name },
    });
  }
  if (!admins.length) {
    await sendEmail({
      to: SUPPORT_EMAIL,
      templateName: "adminKycSubmitted",
      data: { sellerName: seller?.name ?? "", email: seller?.email ?? "" },
    }).catch(() => undefined);
  }
  return kyc;
}

export async function getMyKyc(sellerId: string) {
  return Kyc.findOne({ sellerId });
}

export async function listAdminKyc(params: {
  status?: string;
  search?: string;
  skip: number;
  limit: number;
}) {
  const filter: Record<string, unknown> = {};
  if (params.status) filter.status = params.status;
  if (params.search) {
    const users = await User.find({
      $or: [
        { name: new RegExp(escapeRegex(params.search), "i") },
        { email: new RegExp(escapeRegex(params.search), "i") },
      ],
    }).select("_id");
    filter.sellerId = { $in: users.map((u) => u._id) };
  }
  const [items, total] = await Promise.all([
    Kyc.find(filter)
      .populate("sellerId", "name email")
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(params.skip)
      .limit(params.limit),
    Kyc.countDocuments(filter),
  ]);
  return { items, total };
}

export async function getAdminKyc(kycId: string) {
  const kyc = await Kyc.findById(kycId).populate("sellerId", "name email");
  if (!kyc) throw ApiError.notFound("KYC application not found");
  return kyc;
}

export async function approveKyc(kycId: string) {
  const kyc = await Kyc.findById(kycId);
  if (!kyc) throw ApiError.notFound("KYC application not found");
  kyc.status = "approved";
  kyc.reviewedAt = new Date();
  await kyc.save();
  const seller = await User.findById(kyc.sellerId);
  const store = await Store.findOne({ sellerId: kyc.sellerId });
  if (store) await refreshStoreLiveStatus(store);
  if (seller) {
    await createNotification({
      recipientId: seller._id,
      recipientType: "seller",
      type: "kyc_approved",
      title: "KYC approved",
      message: "Your identity verification was approved. You can now subscribe and go live.",
      link: "/dashboard/billing",
      email: { to: seller.email, templateName: "kycApproved", data: { name: seller.name } },
    });
  }
  return kyc;
}

export async function rejectKyc(kycId: string, reviewerNote: string) {
  const kyc = await Kyc.findById(kycId);
  if (!kyc) throw ApiError.notFound("KYC application not found");
  kyc.status = "rejected";
  kyc.reviewerNote = reviewerNote;
  kyc.reviewedAt = new Date();
  await kyc.save();
  const seller = await User.findById(kyc.sellerId);
  if (seller) {
    await createNotification({
      recipientId: seller._id,
      recipientType: "seller",
      type: "kyc_rejected",
      title: "KYC rejected",
      message: reviewerNote,
      link: "/dashboard/kyc",
      email: {
        to: seller.email,
        templateName: "kycRejected",
        data: { name: seller.name, reason: reviewerNote },
      },
    });
  }
  return kyc;
}

export async function requestKycInfo(kycId: string, reviewerNote: string, requestedFiles: string[]) {
  const kyc = await Kyc.findById(kycId);
  if (!kyc) throw ApiError.notFound("KYC application not found");
  kyc.status = "info_requested";
  kyc.reviewerNote = reviewerNote;
  kyc.requestedFiles = requestedFiles;
  kyc.reviewedAt = new Date();
  await kyc.save();
  const seller = await User.findById(kyc.sellerId);
  if (seller) {
    await createNotification({
      recipientId: seller._id,
      recipientType: "seller",
      type: "kyc_info_requested",
      title: "More KYC information needed",
      message: reviewerNote,
      link: "/dashboard/kyc",
      email: {
        to: seller.email,
        templateName: "kycInfoRequested",
        data: { name: seller.name, reason: reviewerNote, files: requestedFiles.join(", ") },
      },
    });
  }
  return kyc;
}
