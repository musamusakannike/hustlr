import { TICKET_NUMBER_PREFIX } from "../config/constants.config";
import { SupportTicket } from "../models/support-ticket.model";
import { User } from "../models/user.model";
import { BuyerProfile } from "../models/buyer-profile.model";
import { createNotification } from "./notification.service";
import { ApiError } from "../utils/api-error.util";
import { escapeRegex } from "../utils/pagination.util";

async function nextTicketNumber(): Promise<string> {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const prefix = `${TICKET_NUMBER_PREFIX}-${ymd}-`;
  const count = await SupportTicket.countDocuments({ ticketNumber: new RegExp(`^${prefix}`) });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

export async function createTicket(input: {
  userId: string;
  userType: "seller" | "buyer";
  storeId?: string;
  topic: string;
  subject: string;
  message: string;
  attachments?: string[];
  senderName: string;
}) {
  const ticket = await SupportTicket.create({
    ticketNumber: await nextTicketNumber(),
    userId: input.userId,
    userType: input.userType,
    storeId: input.storeId ?? null,
    topic: input.topic,
    subject: input.subject,
    messages: [
      {
        senderId: input.userId,
        senderRole: input.userType,
        senderName: input.senderName,
        message: input.message,
        attachments: input.attachments ?? [],
        createdAt: new Date(),
        readByAdmin: false,
        readByUser: true,
      },
    ],
    awaitingResponseFrom: "admin",
  });

  const admins = await User.find({ role: "admin" });
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        recipientId: admin._id,
        recipientType: "admin",
        storeId: input.storeId,
        type: "ticket_created",
        title: "New support ticket",
        message: `Ticket #${ticket.ticketNumber} (${input.userType}): ${input.subject}`,
        link: "/admin/support-tickets",
        email: {
          to: admin.email,
          templateName: "adminNewTicket",
          data: {
            ticketNumber: ticket.ticketNumber,
            senderName: input.senderName,
            userType: input.userType,
            topic: input.topic,
            subject: input.subject,
            message: input.message,
          },
        },
      }),
    ),
  );

  return ticket;
}

export async function listUserTickets(
  userId: string,
  query: { status?: string; skip: number; limit: number },
) {
  const filter: Record<string, unknown> = { userId };
  if (query.status) filter.status = query.status;
  const [items, total] = await Promise.all([
    SupportTicket.find(filter).sort({ updatedAt: -1 }).skip(query.skip).limit(query.limit),
    SupportTicket.countDocuments(filter),
  ]);
  return { items, total };
}

export async function getUserTicket(userId: string, ticketId: string) {
  const ticket = await SupportTicket.findOne({ _id: ticketId, userId });
  if (!ticket) throw ApiError.notFound("Ticket not found");
  return ticket;
}

export async function addUserMessage(
  userId: string,
  ticketId: string,
  senderName: string,
  role: "buyer" | "seller",
  message: string,
  attachments?: string[],
) {
  const ticket = await getUserTicket(userId, ticketId);
  ticket.messages.push({
    senderId: userId as unknown as (typeof ticket.messages)[number]["senderId"],
    senderRole: role,
    senderName,
    message,
    attachments: attachments ?? [],
    createdAt: new Date(),
    readByAdmin: false,
    readByUser: true,
  });
  ticket.awaitingResponseFrom = "admin";
  if (ticket.status === "Resolved") ticket.status = "Open";
  await ticket.save();

  const admins = await User.find({ role: "admin" });
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        recipientId: admin._id,
        recipientType: "admin",
        storeId: ticket.storeId,
        type: "ticket_reply",
        title: "New ticket reply",
        message: `${senderName} replied to #${ticket.ticketNumber}`,
        link: "/admin/support-tickets",
        email: {
          to: admin.email,
          templateName: "ticketReply",
          data: {
            name: admin.name,
            ticketNumber: ticket.ticketNumber,
            senderName,
            senderRole: role,
            message,
          },
        },
      }),
    ),
  );

  return ticket;
}

export async function listAdminTickets(query: {
  status?: string;
  priority?: string;
  topic?: string;
  userType?: string;
  search?: string;
  skip: number;
  limit: number;
}) {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  if (query.priority) filter.priority = query.priority;
  if (query.topic) filter.topic = query.topic;
  if (query.userType) filter.userType = query.userType;
  if (query.search) {
    filter.$or = [
      { subject: new RegExp(escapeRegex(query.search), "i") },
      { ticketNumber: new RegExp(escapeRegex(query.search), "i") },
    ];
  }
  const [items, total] = await Promise.all([
    SupportTicket.find(filter).sort({ updatedAt: -1 }).skip(query.skip).limit(query.limit),
    SupportTicket.countDocuments(filter),
  ]);
  return { items, total };
}

export async function pendingCount() {
  return SupportTicket.countDocuments({ awaitingResponseFrom: "admin", status: { $nin: ["Closed"] } });
}

export async function unreadAdminCount() {
  return SupportTicket.countDocuments({ "messages.readByAdmin": false });
}

export async function getAdminTicket(ticketId: string) {
  const ticket = await SupportTicket.findById(ticketId);
  if (!ticket) throw ApiError.notFound("Ticket not found");
  return ticket;
}

export async function addAdminMessage(
  ticketId: string,
  adminId: string,
  adminName: string,
  message: string,
  attachments?: string[],
) {
  const ticket = await getAdminTicket(ticketId);
  ticket.messages.push({
    senderId: adminId as unknown as (typeof ticket.messages)[number]["senderId"],
    senderRole: "admin",
    senderName: adminName,
    message,
    attachments: attachments ?? [],
    createdAt: new Date(),
    readByAdmin: true,
    readByUser: false,
  });
  ticket.awaitingResponseFrom = "user";
  if (ticket.status === "Open") ticket.status = "In Progress";
  await ticket.save();

  const recipient =
    ticket.userType === "seller"
      ? await User.findById(ticket.userId)
      : await BuyerProfile.findById(ticket.userId);

  if (recipient) {
    const link = ticket.userType === "seller" ? "/dashboard/support" : "/orders";
    await createNotification({
      recipientId: recipient._id,
      recipientType: ticket.userType,
      storeId: ticket.storeId,
      type: "ticket_reply",
      title: "Support reply received",
      message: `${adminName} replied to ticket #${ticket.ticketNumber}`,
      link,
      email: {
        to: recipient.email,
        templateName: "ticketReply",
        data: {
          name: recipient.name,
          ticketNumber: ticket.ticketNumber,
          senderName: adminName,
          senderRole: "Admin Support",
          message,
        },
      },
    });
  }

  return ticket;
}

export async function setTicketStatus(ticketId: string, status: "Open" | "In Progress" | "Resolved" | "Closed") {
  const ticket = await getAdminTicket(ticketId);
  ticket.status = status;
  if (status === "Resolved") ticket.resolvedAt = new Date();
  if (status === "Closed") ticket.closedAt = new Date();
  await ticket.save();

  if (status === "Resolved") {
    const recipient =
      ticket.userType === "seller"
        ? await User.findById(ticket.userId)
        : await BuyerProfile.findById(ticket.userId);

    if (recipient) {
      const link = ticket.userType === "seller" ? "/dashboard/support" : "/orders";
      await createNotification({
        recipientId: recipient._id,
        recipientType: ticket.userType,
        storeId: ticket.storeId,
        type: "ticket_resolved",
        title: "Support ticket resolved",
        message: `Your ticket #${ticket.ticketNumber} has been resolved.`,
        link,
        email: {
          to: recipient.email,
          templateName: "ticketResolved",
          data: {
            name: recipient.name,
            ticketNumber: ticket.ticketNumber,
            subject: ticket.subject,
          },
        },
      });
    }
  }

  return ticket;
}
