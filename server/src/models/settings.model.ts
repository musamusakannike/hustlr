import mongoose, { Document, Schema } from "mongoose";
import {
  APP_NAME,
  DEFAULT_ESCROW_HOURS,
  DEFAULT_MIN_WITHDRAWAL,
  SUPPORT_EMAIL,
} from "../config/constants.config";

export interface ISettings extends Document {
  platformName: string;
  platformCommissionPercent: number;
  escrowAutoReleaseHours: number;
  minimumWithdrawalAmount: number;
  payoutGateway: string;
  payoutCurrency: string;
  defaultSellerReferralRewardAmount: number;
  sellerReferralEnabled: boolean;
  supportEmail: string;
  maintenanceMode: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    platformName: { type: String, default: APP_NAME },
    platformCommissionPercent: { type: Number, default: 10 },
    escrowAutoReleaseHours: { type: Number, default: DEFAULT_ESCROW_HOURS },
    minimumWithdrawalAmount: { type: Number, default: DEFAULT_MIN_WITHDRAWAL },
    payoutGateway: { type: String, default: "paystack" },
    payoutCurrency: { type: String, default: "NGN" },
    defaultSellerReferralRewardAmount: { type: Number, default: 5000 },
    sellerReferralEnabled: { type: Boolean, default: true },
    supportEmail: { type: String, default: SUPPORT_EMAIL },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const Settings = mongoose.model<ISettings>("Settings", settingsSchema);
