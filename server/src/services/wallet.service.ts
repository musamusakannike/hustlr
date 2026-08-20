import mongoose from "mongoose";
import { APP_NAME, DEFAULT_CURRENCY_SYMBOL } from "../config/constants.config";
import { Wallet } from "../models/wallet.model";
import { WalletTransaction } from "../models/wallet-transaction.model";
import { Kyc } from "../models/kyc.model";
import { User } from "../models/user.model";
import { Store } from "../models/store.model";
import { ApiError } from "../utils/api-error.util";
import { getSettings } from "./settings.service";
import { createNotification } from "./notification.service";
import { createTransferRecipient, initiateTransfer } from "./paystack.service";
import { escapeRegex } from "../utils/pagination.util";

export async function getOrCreateWallet(sellerId: string) {
  let wallet = await Wallet.findOne({ sellerId });
  if (!wallet) wallet = await Wallet.create({ sellerId });
  return wallet;
}

export async function creditWallet(
  sellerId: string,
  amount: number,
  type: "escrow_credit" | "referral_bonus" | "subscription_credit" | "adjustment",
  description: string,
  orderId?: string,
) {
  const wallet = await getOrCreateWallet(sellerId);
  wallet.balance += amount;
  await wallet.save();
  await WalletTransaction.create({
    sellerId,
    walletId: wallet._id,
    type,
    status: "completed",
    amount,
    description,
    orderId: orderId ?? null,
  });
  return wallet;
}

export async function listTransactions(
  sellerId: string,
  query: { type?: string; status?: string; skip: number; limit: number },
) {
  const filter: Record<string, unknown> = { sellerId };
  if (query.type) filter.type = query.type;
  if (query.status) filter.status = query.status;
  const [items, total] = await Promise.all([
    WalletTransaction.find(filter).sort({ createdAt: -1 }).skip(query.skip).limit(query.limit),
    WalletTransaction.countDocuments(filter),
  ]);
  return { items, total };
}

export async function requestWithdrawal(sellerId: string, amount: number) {
  const settings = await getSettings();
  if (amount < settings.minimumWithdrawalAmount) {
    throw ApiError.badRequest(`Minimum withdrawal is ${DEFAULT_CURRENCY_SYMBOL}${settings.minimumWithdrawalAmount}`);
  }
  const kyc = await Kyc.findOne({ sellerId, status: "approved" });
  if (!kyc?.bankDetails?.accountNumber) {
    throw ApiError.forbidden("Verified bank details are required before withdrawing");
  }
  const wallet = await getOrCreateWallet(sellerId);
  if (amount <= 0 || amount > wallet.balance) {
    throw ApiError.badRequest("Insufficient wallet balance");
  }
  wallet.balance -= amount;
  wallet.pendingBalance += amount;
  await wallet.save();
  const tx = await WalletTransaction.create({
    sellerId,
    walletId: wallet._id,
    type: "withdrawal",
    status: "awaiting_approval",
    amount,
    description: "Withdrawal request",
    bankSnapshot: kyc.bankDetails,
  });
  const store = await Store.findOne({ sellerId });
  const seller = await User.findById(sellerId);
  const admins = await User.find({ role: "admin" });
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        recipientId: admin._id,
        recipientType: "admin",
        type: "withdrawal_requested",
        title: "New withdrawal request",
        message: `${store?.name ?? seller?.name} requested ${DEFAULT_CURRENCY_SYMBOL}${amount}`,
        link: `/admin/payouts/${tx._id}`,
        email: {
          to: admin.email,
          templateName: "withdrawalRequestedAdmin",
          data: {
            storeName: store?.name ?? "",
            amount,
            currencySymbol: DEFAULT_CURRENCY_SYMBOL,
          },
        },
      }),
    ),
  );
  return tx;
}

export async function listPayouts(query: {
  status?: string;
  search?: string;
  skip: number;
  limit: number;
}) {
  const filter: Record<string, unknown> = { type: "withdrawal" };
  if (query.status) filter.status = query.status;
  if (query.search) {
    const users = await User.find({
      $or: [
        { name: new RegExp(escapeRegex(query.search), "i") },
        { email: new RegExp(escapeRegex(query.search), "i") },
      ],
    }).select("_id");
    filter.sellerId = { $in: users.map((u) => u._id) };
  }
  const [items, total] = await Promise.all([
    WalletTransaction.find(filter)
      .populate("sellerId", "name email")
      .sort({ createdAt: -1 })
      .skip(query.skip)
      .limit(query.limit),
    WalletTransaction.countDocuments(filter),
  ]);
  return { items, total };
}

export async function approvePayout(id: string) {
  const tx = await WalletTransaction.findById(id);
  if (!tx || tx.type !== "withdrawal") throw ApiError.notFound("Payout not found");
  if (tx.status !== "awaiting_approval") throw ApiError.badRequest("Payout is not awaiting approval");
  tx.status = "approved";
  await tx.save();
  const seller = await User.findById(tx.sellerId);
  if (seller) {
    await createNotification({
      recipientId: seller._id,
      recipientType: "seller",
      type: "withdrawal_approved",
      title: "Withdrawal approved",
      message: `Your withdrawal of ${DEFAULT_CURRENCY_SYMBOL}${tx.amount} was approved.`,
      link: "/dashboard/wallet",
      email: {
        to: seller.email,
        templateName: "withdrawalUpdate",
        data: {
          name: seller.name,
          amount: tx.amount,
          status: "approved",
          currencySymbol: DEFAULT_CURRENCY_SYMBOL,
        },
      },
    });
  }
  return tx;
}

export async function dispatchPayout(id: string) {
  const tx = await WalletTransaction.findById(id);
  if (!tx || tx.type !== "withdrawal") throw ApiError.notFound("Payout not found");
  if (tx.status !== "approved") throw ApiError.badRequest("Payout must be approved first");
  if (!tx.bankSnapshot?.accountNumber || !tx.bankSnapshot.bankCode) {
    throw ApiError.badRequest("Missing bank details");
  }
  const recipient = await createTransferRecipient({
    name: tx.bankSnapshot.accountName,
    accountNumber: tx.bankSnapshot.accountNumber,
    bankCode: tx.bankSnapshot.bankCode,
  });
  const transfer = await initiateTransfer({
    amount: tx.amount,
    recipient,
    reference: `PAYOUT-${tx._id}-${Date.now()}`,
    reason: `${APP_NAME} seller payout`,
  });
  tx.status = "dispatched";
  tx.paystackReference = transfer.reference;
  await tx.save();
  const seller = await User.findById(tx.sellerId);
  if (seller) {
    await createNotification({
      recipientId: seller._id,
      recipientType: "seller",
      type: "withdrawal_dispatched",
      title: "Withdrawal dispatched",
      message: `Your withdrawal of ${DEFAULT_CURRENCY_SYMBOL}${tx.amount} has been sent.`,
      link: "/dashboard/wallet",
      email: {
        to: seller.email,
        templateName: "withdrawalUpdate",
        data: {
          name: seller.name,
          amount: tx.amount,
          status: "dispatched",
          currencySymbol: DEFAULT_CURRENCY_SYMBOL,
        },
      },
    });
  }
  return tx;
}

export async function rejectPayout(id: string, reason: string) {
  const tx = await WalletTransaction.findById(id);
  if (!tx || tx.type !== "withdrawal") throw ApiError.notFound("Payout not found");
  if (!["awaiting_approval", "approved"].includes(tx.status)) {
    throw ApiError.badRequest("This payout cannot be rejected");
  }
  const wallet = await getOrCreateWallet(String(tx.sellerId));
  wallet.pendingBalance = Math.max(0, wallet.pendingBalance - tx.amount);
  wallet.balance += tx.amount;
  await wallet.save();
  tx.status = "rejected";
  tx.rejectionReason = reason;
  await tx.save();
  await WalletTransaction.create({
    sellerId: tx.sellerId,
    walletId: wallet._id,
    type: "withdrawal_reversal",
    status: "completed",
    amount: tx.amount,
    description: `Withdrawal rejected: ${reason}`,
  });
  const seller = await User.findById(tx.sellerId);
  if (seller) {
    await createNotification({
      recipientId: seller._id,
      recipientType: "seller",
      type: "withdrawal_rejected",
      title: "Withdrawal rejected",
      message: reason,
      link: "/dashboard/wallet",
      email: {
        to: seller.email,
        templateName: "withdrawalUpdate",
        data: {
          name: seller.name,
          amount: tx.amount,
          status: "rejected",
          reason,
          currencySymbol: DEFAULT_CURRENCY_SYMBOL,
        },
      },
    });
  }
  return tx;
}

export async function completeTransfer(reference: string, success: boolean) {
  const tx = await WalletTransaction.findOne({ paystackReference: reference, type: "withdrawal" });
  if (!tx) return null;
  const wallet = await getOrCreateWallet(String(tx.sellerId));
  if (success) {
    tx.status = "completed";
    wallet.pendingBalance = Math.max(0, wallet.pendingBalance - tx.amount);
    await wallet.save();
    await tx.save();
  } else {
    tx.status = "failed";
    wallet.pendingBalance = Math.max(0, wallet.pendingBalance - tx.amount);
    wallet.balance += tx.amount;
    await wallet.save();
    await tx.save();
    await WalletTransaction.create({
      sellerId: tx.sellerId,
      walletId: wallet._id,
      type: "withdrawal_reversal",
      status: "completed",
      amount: tx.amount,
      description: "Paystack transfer failed — funds returned",
    });
  }
  return tx;
}

export function asObjectId(id: string) {
  return new mongoose.Types.ObjectId(id);
}
