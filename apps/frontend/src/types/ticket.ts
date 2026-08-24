export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type TicketPriority = "Low" | "Medium" | "High";

export interface TicketMessage {
  senderId: string;
  senderRole: "buyer" | "seller" | "admin";
  senderName: string;
  message: string;
  attachments: string[];
  createdAt: string;
}

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  userType: "seller" | "buyer";
  storeId?: string | null;
  topic: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  messages: TicketMessage[];
  awaitingResponseFrom: "user" | "admin" | null;
  resolvedAt?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicketInput {
  topic: string;
  subject: string;
  message: string;
  priority?: TicketPriority;
}