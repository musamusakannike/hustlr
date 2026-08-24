export interface AppNotification {
  id: string;
  recipientId: string;
  recipientType: "seller" | "buyer" | "admin";
  storeId?: string | null;
  type: string;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}