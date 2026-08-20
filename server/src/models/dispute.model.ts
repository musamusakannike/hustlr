import mongoose, { Document, Schema } from "mongoose";

export interface IDisputeMessage {
  senderId: mongoose.Types.ObjectId;
  senderRole: "buyer" | "seller" | "admin";
  senderName: string;
  message: string;
  attachments: string[];
  createdAt: Date;
}

export interface IDispute extends Document {
  orderId: mongoose.Types.ObjectId;
  storeId: mongoose.Types.ObjectId;
  buyerProfileId: mongoose.Types.ObjectId;
  sellerId: mongoose.Types.ObjectId;
  reason: string;
  description: string;
  evidenceImages: string[];
  severity: "Low" | "Medium" | "High";
  status: "Open" | "In Progress" | "Resolved";
  resolutionPreference: "Refund" | "Replacement";
  refundAmount?: number;
  resolutionNote?: string;
  resolution?: "refund" | "replacement" | "rejected";
  resolvedAt?: Date | null;
  messages: IDisputeMessage[];
  awaitingResponseFrom: "buyer" | "seller" | "admin" | null;
  createdAt: Date;
  updatedAt: Date;
}

const disputeSchema = new Schema<IDispute>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, unique: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    buyerProfileId: { type: Schema.Types.ObjectId, ref: "BuyerProfile", required: true },
    sellerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reason: { type: String, required: true },
    description: { type: String, required: true },
    evidenceImages: { type: [String], default: [] },
    severity: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open", index: true },
    resolutionPreference: { type: String, enum: ["Refund", "Replacement"], required: true },
    refundAmount: { type: Number, default: 0 },
    resolutionNote: { type: String, default: "" },
    resolution: { type: String, enum: ["refund", "replacement", "rejected"] },
    resolvedAt: { type: Date, default: null },
    messages: [
      {
        senderId: { type: Schema.Types.ObjectId, required: true },
        senderRole: { type: String, enum: ["buyer", "seller", "admin"], required: true },
        senderName: { type: String, required: true },
        message: { type: String, required: true },
        attachments: { type: [String], default: [] },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    awaitingResponseFrom: {
      type: String,
      enum: ["buyer", "seller", "admin", null],
      default: "seller",
    },
  },
  { timestamps: true },
);

export const Dispute = mongoose.model<IDispute>("Dispute", disputeSchema);
