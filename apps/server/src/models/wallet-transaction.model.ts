import mongoose, { Document, Schema } from "mongoose";

export type WalletTxType =
  | "escrow_credit"
  | "withdrawal"
  | "withdrawal_reversal"
  | "referral_bonus"
  | "subscription_credit"
  | "adjustment";

export type WalletTxStatus =
  | "completed"
  | "awaiting_approval"
  | "approved"
  | "dispatched"
  | "failed"
  | "rejected";

export interface IWalletTransaction extends Document {
  sellerId: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  type: WalletTxType;
  status: WalletTxStatus;
  amount: number;
  description: string;
  orderId?: mongoose.Types.ObjectId | null;
  paystackReference?: string;
  bankSnapshot?: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountName: string;
  };
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const walletTransactionSchema = new Schema<IWalletTransaction>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    walletId: { type: Schema.Types.ObjectId, ref: "Wallet", required: true },
    type: {
      type: String,
      enum: [
        "escrow_credit",
        "withdrawal",
        "withdrawal_reversal",
        "referral_bonus",
        "subscription_credit",
        "adjustment",
      ],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["completed", "awaiting_approval", "approved", "dispatched", "failed", "rejected"],
      default: "completed",
      index: true,
    },
    amount: { type: Number, required: true },
    description: { type: String, default: "" },
    orderId: { type: Schema.Types.ObjectId, ref: "Order", default: null },
    paystackReference: { type: String, default: "" },
    bankSnapshot: {
      bankName: String,
      bankCode: String,
      accountNumber: String,
      accountName: String,
    },
    rejectionReason: { type: String, default: "" },
  },
  { timestamps: true },
);

export const WalletTransaction = mongoose.model<IWalletTransaction>(
  "WalletTransaction",
  walletTransactionSchema,
);
