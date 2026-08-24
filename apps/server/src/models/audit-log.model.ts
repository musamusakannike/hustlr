import mongoose, { Document, Schema } from "mongoose";

export interface IAuditLog extends Document {
  actorId?: mongoose.Types.ObjectId | null;
  actorEmail?: string;
  action: string;
  category: string;
  outcome: "success" | "failure";
  description: string;
  entityType?: string;
  entityId?: string;
  metadata: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    actorId: { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
    actorEmail: { type: String, default: "" },
    action: { type: String, required: true, index: true },
    category: { type: String, required: true, index: true },
    outcome: { type: String, enum: ["success", "failure"], default: "success" },
    description: { type: String, default: "" },
    entityType: { type: String, default: "" },
    entityId: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
    ipAddress: { type: String, default: "" },
    userAgent: { type: String, default: "" },
    source: { type: String, default: "admin" },
  },
  { timestamps: true },
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>("AuditLog", auditLogSchema);
