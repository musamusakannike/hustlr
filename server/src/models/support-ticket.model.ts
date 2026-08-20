import mongoose, { Document, Schema } from "mongoose";

export interface ITicketMessage {
  senderId: mongoose.Types.ObjectId;
  senderRole: "buyer" | "seller" | "admin";
  senderName: string;
  message: string;
  attachments: string[];
  createdAt: Date;
  readByAdmin: boolean;
  readByUser: boolean;
}

export interface ISupportTicket extends Document {
  ticketNumber: string;
  userId: mongoose.Types.ObjectId;
  userType: "seller" | "buyer";
  storeId?: mongoose.Types.ObjectId | null;
  topic: string;
  subject: string;
  status: "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "Low" | "Medium" | "High";
  messages: ITicketMessage[];
  awaitingResponseFrom: "user" | "admin" | null;
  resolvedAt?: Date | null;
  closedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, required: true, index: true },
    userType: { type: String, enum: ["seller", "buyer"], required: true },
    storeId: { type: Schema.Types.ObjectId, ref: "Store", default: null },
    topic: { type: String, required: true },
    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved", "Closed"],
      default: "Open",
      index: true,
    },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Medium" },
    messages: [
      {
        senderId: { type: Schema.Types.ObjectId, required: true },
        senderRole: { type: String, enum: ["buyer", "seller", "admin"], required: true },
        senderName: { type: String, required: true },
        message: { type: String, required: true },
        attachments: { type: [String], default: [] },
        createdAt: { type: Date, default: Date.now },
        readByAdmin: { type: Boolean, default: false },
        readByUser: { type: Boolean, default: true },
      },
    ],
    awaitingResponseFrom: { type: String, enum: ["user", "admin", null], default: "admin" },
    resolvedAt: { type: Date, default: null },
    closedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export const SupportTicket = mongoose.model<ISupportTicket>("SupportTicket", supportTicketSchema);
