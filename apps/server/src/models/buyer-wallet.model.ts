import mongoose, { Document, Schema } from "mongoose";
import { DEFAULT_CURRENCY } from "../config/constants.config";

export interface IBuyerWallet extends Document {
  buyerProfileId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  balance: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

const buyerWalletSchema = new Schema<IBuyerWallet>(
  {
    buyerProfileId: { type: Schema.Types.ObjectId, ref: "BuyerProfile", required: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true },
    balance: { type: Number, default: 0, min: 0 },
    currency: { type: String, default: DEFAULT_CURRENCY },
  },
  { timestamps: true },
);

buyerWalletSchema.index({ buyerProfileId: 1, storeId: 1 }, { unique: true });

export const BuyerWallet = mongoose.model<IBuyerWallet>("BuyerWallet", buyerWalletSchema);
