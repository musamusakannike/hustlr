import mongoose, { Document, Schema } from "mongoose";

export type KycStatus = "draft" | "pending" | "approved" | "rejected" | "info_requested";
export type VerificationType = "NIN" | "Driver's License" | "International Passport" | "Voter's Card";

export interface IBankDetails {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface IKyc extends Document {
  sellerId: mongoose.Types.ObjectId;
  status: KycStatus;
  firstName?: string;
  lastName?: string;
  otherName?: string;
  verificationType?: VerificationType;
  documentId?: string;
  idDocumentUrl?: string;
  selfieUrl?: string;
  address?: string;
  proofOfAddressUrl?: string;
  businessRegistrationUrl?: string;
  bankDetails?: IBankDetails;
  reviewerNote?: string;
  requestedFiles: string[];
  submittedAt?: Date | null;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const kycSchema = new Schema<IKyc>(
  {
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "info_requested"],
      default: "draft",
      index: true,
    },
    firstName: { type: String, default: "" },
    lastName: { type: String, default: "" },
    otherName: { type: String, default: "" },
    verificationType: {
      type: String,
      enum: ["NIN", "Driver's License", "International Passport", "Voter's Card"],
    },
    documentId: { type: String, default: "" },
    idDocumentUrl: { type: String, default: "" },
    selfieUrl: { type: String, default: "" },
    address: { type: String, default: "" },
    proofOfAddressUrl: { type: String, default: "" },
    businessRegistrationUrl: { type: String, default: "" },
    bankDetails: {
      bankName: { type: String, default: "" },
      bankCode: { type: String, default: "" },
      accountNumber: { type: String, default: "" },
      accountName: { type: String, default: "" },
    },
    reviewerNote: { type: String, default: "" },
    requestedFiles: { type: [String], default: [] },
    submittedAt: { type: Date, default: null },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Kyc = mongoose.model<IKyc>("Kyc", kycSchema);
