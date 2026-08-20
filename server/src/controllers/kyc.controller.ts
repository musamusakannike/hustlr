import type { Request, Response } from "express";
import * as kycService from "../services/kyc.service";
import { listBanks } from "../services/paystack.service";
import { asyncHandler } from "../utils/async-handler.util";
import { sendSuccess } from "../utils/api-response.util";
import { getPagination, paginationMeta } from "../utils/pagination.util";
import { uploadFile } from "../utils/upload.util";

export const upsertKyc = asyncHandler(async (req: Request, res: Response) => {
  const kyc = await kycService.upsertKyc(String(req.user!._id), req.body);
  sendSuccess(res, kyc, "KYC saved");
});

export const submitKyc = asyncHandler(async (req: Request, res: Response) => {
  const kyc = await kycService.submitKyc(String(req.user!._id));
  sendSuccess(res, kyc, "KYC submitted");
});

export const getMyKyc = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await kycService.getMyKyc(String(req.user!._id)));
});

export const paystackBanks = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await listBanks());
});

export const uploadKycDoc = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: "No file uploaded" });
    return;
  }
  const kind = (req.query.kind as string) || "document";
  const url = await uploadFile(req.file, `kyc/${req.user!._id}/${kind}`);
  sendSuccess(res, { url });
});

export const adminListKyc = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await kycService.listAdminKyc({
    status: req.query.status as string,
    search: req.query.search as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const adminGetKyc = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await kycService.getAdminKyc(req.params.kycId));
});

export const adminApproveKyc = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await kycService.approveKyc(req.params.kycId), "KYC approved");
});

export const adminRejectKyc = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await kycService.rejectKyc(req.params.kycId, req.body.reviewerNote), "KYC rejected");
});

export const adminRequestKycInfo = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await kycService.requestKycInfo(req.params.kycId, req.body.reviewerNote, req.body.requestedFiles),
    "More info requested",
  );
});
