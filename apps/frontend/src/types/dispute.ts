export type DisputeStatus = "Open" | "In Progress" | "Resolved";
export type DisputeSeverity = "Low" | "Medium" | "High";
export type DisputeResolution = "refund" | "replacement" | "rejected";

export interface DisputeMessage {
  senderId: string;
  senderRole: "buyer" | "seller" | "admin";
  senderName: string;
  message: string;
  attachments: string[];
  createdAt: string;
}

export interface Dispute {
  id: string;
  orderId: string;
  storeId: string;
  buyerProfileId: string;
  sellerId: string;
  reason: string;
  description: string;
  evidenceImages: string[];
  severity: DisputeSeverity;
  status: DisputeStatus;
  resolutionPreference: "Refund" | "Replacement";
  refundAmount?: number;
  resolutionNote?: string;
  resolution?: DisputeResolution;
  resolvedAt?: string | null;
  messages: DisputeMessage[];
  awaitingResponseFrom: "buyer" | "seller" | "admin" | null;
  createdAt: string;
  updatedAt: string;
  order?: { orderNumber?: string; totalAmount?: number };
}

export interface OpenDisputeInput {
  reason: string;
  description: string;
  evidenceImages?: string[];
  resolutionPreference: "Refund" | "Replacement";
}