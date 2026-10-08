import { Dispute } from "../models/dispute.model";
import { Order } from "../models/order.model";
import { Store } from "../models/store.model";
import { User } from "../models/user.model";
import { BuyerProfile } from "../models/buyer-profile.model";
import { PlatformTransaction } from "../models/platform-transaction.model";
import { ApiError } from "../utils/api-error.util";
import { refundTransaction } from "./paystack.service";
import { confirmOrder } from "./order.service";
import { createNotification } from "./notification.service";
import { getSellerStore } from "./store-helper.service";

export async function getAccessibleDispute(
  disputeId: string,
  actor: { sellerId?: string; buyerId?: string; admin?: boolean },
) {
  const dispute = await Dispute.findById(disputeId);
  if (!dispute) throw ApiError.notFound("Dispute not found");
  if (actor.admin) return dispute;
  if (actor.sellerId && String(dispute.sellerId) === actor.sellerId) return dispute;
  if (actor.buyerId && String(dispute.buyerProfileId) === actor.buyerId) return dispute;
  throw ApiError.forbidden("Not allowed");
}

export async function addDisputeMessage(
  dispute: InstanceType<typeof Dispute>,
  sender: { id: string; role: "buyer" | "seller" | "admin"; name: string },
  message: string,
  attachments?: string[],
) {
  dispute.messages.push({
    senderId: sender.id as unknown as (typeof dispute.messages)[number]["senderId"],
    senderRole: sender.role,
    senderName: sender.name,
    message,
    attachments: attachments ?? [],
    createdAt: new Date(),
  });
  dispute.status = dispute.status === "Open" ? "In Progress" : dispute.status;
  dispute.awaitingResponseFrom = sender.role === "admin" ? "seller" : "admin";
  await dispute.save();

  const order = await Order.findById(dispute.orderId);
  const [buyer, seller, admins] = await Promise.all([
    BuyerProfile.findById(dispute.buyerProfileId),
    User.findById(dispute.sellerId),
    User.find({ role: "admin" }),
  ]);

  const msgPayload = {
    orderNumber: order?.orderNumber ?? "",
    senderName: sender.name,
    senderRole: sender.role,
    message,
  };

  if (sender.role !== "buyer" && buyer) {
    await createNotification({
      recipientId: buyer._id,
      recipientType: "buyer",
      storeId: dispute.storeId,
      type: "dispute_message",
      title: "New dispute message",
      message: `${sender.name} replied to dispute on order ${order?.orderNumber ?? ""}.`,
      link: `/orders/${dispute.orderId}`,
      email: {
        to: buyer.email,
        templateName: "disputeMessageAlert",
        data: { ...msgPayload, name: buyer.name },
      },
    });
  }

  if (sender.role !== "seller" && seller) {
    await createNotification({
      recipientId: seller._id,
      recipientType: "seller",
      type: "dispute_message",
      title: "New dispute message",
      message: `${sender.name} replied to dispute on order ${order?.orderNumber ?? ""}.`,
      link: `/dashboard/disputes/${dispute._id}`,
      email: {
        to: seller.email,
        templateName: "disputeMessageAlert",
        data: { ...msgPayload, name: seller.name },
      },
    });
  }

  if (sender.role !== "admin") {
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          recipientId: admin._id,
          recipientType: "admin",
          storeId: dispute.storeId,
          type: "dispute_message",
          title: "New dispute message",
          message: `${sender.name} (${sender.role}) posted on dispute for ${order?.orderNumber ?? ""}.`,
          link: `/admin/disputes/${dispute._id}`,
          email: {
            to: admin.email,
            templateName: "disputeMessageAlert",
            data: { ...msgPayload, name: admin.name },
          },
        }),
      ),
    );
  }

  return dispute;
}

export async function listSellerDisputes(sellerId: string, skip: number, limit: number) {
  const store = await getSellerStore(sellerId);
  const filter = { storeId: store._id };
  const [items, total] = await Promise.all([
    Dispute.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Dispute.countDocuments(filter),
  ]);
  return { items, total };
}

export async function listBuyerDisputes(buyerId: string, storeId: string, skip: number, limit: number) {
  const filter = { buyerProfileId: buyerId, storeId };
  const [items, total] = await Promise.all([
    Dispute.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Dispute.countDocuments(filter),
  ]);
  return { items, total };
}

export async function listAdminDisputes(query: {
  status?: string;
  skip: number;
  limit: number;
}) {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  const [items, total] = await Promise.all([
    Dispute.find(filter).sort({ createdAt: -1 }).skip(query.skip).limit(query.limit),
    Dispute.countDocuments(filter),
  ]);
  return { items, total };
}

export async function resolveDispute(
  disputeId: string,
  input: { resolution: "refund" | "replacement" | "rejected"; refundAmount?: number; resolutionNote: string },
) {
  const dispute = await Dispute.findById(disputeId);
  if (!dispute) throw ApiError.notFound("Dispute not found");
  const order = await Order.findById(dispute.orderId);
  if (!order) throw ApiError.notFound("Order not found");
  dispute.resolution = input.resolution;
  dispute.resolutionNote = input.resolutionNote;
  dispute.status = "Resolved";
  dispute.resolvedAt = new Date();
  dispute.awaitingResponseFrom = null;

  if (input.resolution === "refund") {
    const amount = input.refundAmount ?? order.totalAmount;
    dispute.refundAmount = amount;
    await refundTransaction(order.orderNumber, amount);
    order.paymentStatus = amount >= order.totalAmount ? "refunded" : "partially_refunded";
    order.escrowStatus = "refunded";
    order.deliveryStatus = "refunded";
    await PlatformTransaction.create({
      type: "refund",
      amount,
      currency: order.currency,
      gateway: "paystack",
      reference: `REFUND-${order.orderNumber}`,
      status: "success",
      sellerId: order.sellerId,
      storeId: order.storeId,
      buyerProfileId: order.buyerProfileId,
      orderId: order._id,
    });
  } else if (input.resolution === "replacement") {
    order.deliveryStatus = "processing";
    order.escrowStatus = "locked";
  } else {
    await confirmOrder(order);
  }
  await order.save();
  await dispute.save();

  const seller = await User.findById(dispute.sellerId);
  const buyer = await BuyerProfile.findById(dispute.buyerProfileId);
  const store = await Store.findById(dispute.storeId);
  const payload = {
    orderNumber: order.orderNumber,
    resolution: input.resolution,
    note: input.resolutionNote,
  };

  if (input.resolution === "refund") {
    const refundAmount = input.refundAmount ?? order.totalAmount;
    const refundPayload = {
      orderNumber: order.orderNumber,
      amount: refundAmount,
      currencySymbol: order.currency === "NGN" ? "₦" : order.currency,
      storeName: store?.name ?? "",
      reason: input.resolutionNote || "Dispute resolved with refund",
    };
    if (buyer) {
      await createNotification({
        recipientId: buyer._id,
        recipientType: "buyer",
        storeId: dispute.storeId,
        type: "order_refunded",
        title: "Refund processed",
        message: `Refund of ₦${refundAmount} processed for order ${order.orderNumber}.`,
        link: `/orders/${order._id}`,
        email: {
          to: buyer.email,
          templateName: "orderRefundedBuyer",
          data: { ...refundPayload, name: buyer.name },
        },
      });
    }
    if (seller) {
      await createNotification({
        recipientId: seller._id,
        recipientType: "seller",
        type: "order_refunded",
        title: "Refund deduction",
        message: `Refund of ₦${refundAmount} deducted on order ${order.orderNumber}.`,
        link: `/dashboard/orders/${order._id}`,
        email: {
          to: seller.email,
          templateName: "orderRefundedSeller",
          data: { ...refundPayload, name: seller.name },
        },
      });
    }
    const admins = await User.find({ role: "admin" });
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          recipientId: admin._id,
          recipientType: "admin",
          storeId: dispute.storeId,
          type: "admin_refund",
          title: "Refund processed",
          message: `Refund of ₦${refundAmount} issued for order ${order.orderNumber}.`,
          link: `/admin/disputes/${dispute._id}`,
          email: {
            to: admin.email,
            templateName: "adminRefundAlert",
            data: { ...refundPayload, name: admin.name },
          },
        }),
      ),
    );
  } else {
    if (seller) {
      await createNotification({
        recipientId: seller._id,
        recipientType: "seller",
        type: "dispute_resolved",
        title: "Dispute resolved",
        message: `Dispute on ${order.orderNumber} resolved: ${input.resolution}`,
        email: { to: seller.email, templateName: "disputeResolved", data: payload },
      });
    }
    if (buyer) {
      await createNotification({
        recipientId: buyer._id,
        recipientType: "buyer",
        storeId: dispute.storeId,
        type: "dispute_resolved",
        title: "Dispute resolved",
        message: `Your dispute on ${order.orderNumber} was resolved: ${input.resolution}`,
        email: { to: buyer.email, templateName: "disputeResolved", data: payload },
      });
    }
    const admins = await User.find({ role: "admin" });
    await Promise.all(
      admins.map((admin) =>
        createNotification({
          recipientId: admin._id,
          recipientType: "admin",
          storeId: dispute.storeId,
          type: "dispute_resolved",
          title: "Dispute resolved",
          message: `Dispute on ${order.orderNumber} concluded as ${input.resolution}.`,
          link: `/admin/disputes/${dispute._id}`,
          email: { to: admin.email, templateName: "adminDisputeResolved", data: payload },
        }),
      ),
    );
  }
  return dispute;
}
