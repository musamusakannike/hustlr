import mongoose from "mongoose";
import { Notification } from "../models/notification.model";
import { sendEmail } from "../utils/email.util";

type RecipientType = "seller" | "buyer" | "admin";

export async function createNotification(params: {
  recipientId: mongoose.Types.ObjectId | string;
  recipientType: RecipientType;
  storeId?: mongoose.Types.ObjectId | string | null;
  type: string;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, unknown>;
  email?: { to: string; templateName: string; data?: Record<string, string | number | undefined> };
}): Promise<void> {
  await Notification.create({
    recipientId: params.recipientId,
    recipientType: params.recipientType,
    storeId: params.storeId ?? null,
    type: params.type,
    title: params.title,
    message: params.message,
    link: params.link ?? "",
    metadata: params.metadata ?? {},
  });
  if (params.email?.to) {
    await sendEmail({
      to: params.email.to,
      templateName: params.email.templateName,
      data: params.email.data,
    }).catch(() => undefined);
  }
}

export async function listNotifications(params: {
  recipientId: string;
  isRead?: boolean;
  type?: string;
  page: number;
  limit: number;
  skip: number;
}) {
  const filter: Record<string, unknown> = { recipientId: params.recipientId };
  if (typeof params.isRead === "boolean") filter.isRead = params.isRead;
  if (params.type) filter.type = params.type;
  const [items, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(params.skip).limit(params.limit),
    Notification.countDocuments(filter),
  ]);
  return { items, total };
}

export async function unreadCount(recipientId: string): Promise<number> {
  return Notification.countDocuments({ recipientId, isRead: false });
}

export async function markRead(recipientId: string, notificationId: string) {
  const doc = await Notification.findOneAndUpdate(
    { _id: notificationId, recipientId },
    { isRead: true, readAt: new Date() },
    { new: true },
  );
  return doc;
}

export async function markAllRead(recipientId: string) {
  await Notification.updateMany(
    { recipientId, isRead: false },
    { isRead: true, readAt: new Date() },
  );
}

export async function deleteNotification(recipientId: string, notificationId: string) {
  await Notification.deleteOne({ _id: notificationId, recipientId });
}
