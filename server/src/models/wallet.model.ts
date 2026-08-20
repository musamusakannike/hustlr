import mongoose, { Document, Schema } from "mongoose";
import { DEFAULT_CURRENCY } from "../config/constants.config";

export interface IWallet extends Document {
  sellerId: mongoose.Types.ObjectId;
  balance: number;
  pendingBalance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    balance: { type: Number, default: 0, min: 0 },
    pendingBalance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: DEFAULT_CURRENCY },
  },
  { timestamps: true },
);

export const Wallet = mongoose.model<IWallet>("Wallet", walletSchema);
