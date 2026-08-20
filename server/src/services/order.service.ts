import { DEFAULT_CURRENCY_SYMBOL, ORDER_NUMBER_PREFIX } from "../config/constants.config";
import { Order } from "../models/order.model";
import type { IStore } from "../models/store.model";
import { User } from "../models/user.model";
import { BuyerProfile } from "../models/buyer-profile.model";
import { BuyerReferral } from "../models/buyer-referral.model";
import { BuyerWallet } from "../models/buyer-wallet.model";
import { Dispute } from "../models/dispute.model";
import { ApiError } from "../utils/api-error.util";
import { escapeRegex } from "../utils/pagination.util";
import { getSellerStore, getSellerPlan } from "./store-helper.service";
import { createNotification } from "./notification.service";
import { creditWallet } from "./wallet.service";
import { getSettings } from "./settings.service";

export async function nextOrderNumber(store: IStore): Promise<string> {
  const date = new Date();
  const ymd = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const initials = store.slug
    .split("-")
    .map((p) => p[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase()
    .padEnd(2, "X");
  const prefix = `${ORDER_NUMBER_PREFIX}-${initials}-${ymd}-`;
  const count = await Order.countDocuments({ orderNumber: new RegExp(`^${prefix}`) });
  return `${prefix}${String(count + 1).padStart(4, "0")}`;
}

export async function listSellerOrders(
  sellerId: string,
  query: {
    deliveryStatus?: string;
    paymentStatus?: string;
    search?: string;
    from?: string;
    to?: string;
    skip: number;
    limit: number;
  },
) {
  const store = await getSellerStore(sellerId);
  const filter: Record<string, unknown> = { storeId: store._id };
  if (query.deliveryStatus) filter.deliveryStatus = query.deliveryStatus;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.search) filter.orderNumber = new RegExp(escapeRegex(query.search), "i");
  if (query.from || query.to) {
    filter.createdAt = {
      ...(query.from ? { $gte: new Date(query.from) } : {}),
      ...(query.to ? { $lte: new Date(query.to) } : {}),
    };
  }
  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(query.skip).limit(query.limit),
    Order.countDocuments(filter),
  ]);
  return { items, total };
}

export async function getSellerOrder(sellerId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, sellerId }).populate(
    "buyerProfileId",
    "name email",
  );
  if (!order) throw ApiError.notFound("Order not found");
  return order;
}

export async function markShipped(
  sellerId: string,
  orderId: string,
  trackingNumber?: string,
  trackingNote?: string,
) {
  const order = await Order.findOne({ _id: orderId, sellerId, paymentStatus: "paid" });
  if (!order) throw ApiError.notFound("Order not found");
  order.deliveryStatus = "shipped";
  order.shippedAt = new Date();
  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (trackingNote) order.trackingNote = trackingNote;
  await order.save();
  const buyer = await BuyerProfile.findById(order.buyerProfileId);
  if (buyer) {
    await createNotification({
      recipientId: buyer._id,
      recipientType: "buyer",
      storeId: order.storeId,
      type: "order_shipped",
      title: "Order shipped",
      message: `Your order ${order.orderNumber} has been shipped.`,
      link: `/orders/${order._id}`,
      email: {
        to: buyer.email,
        templateName: "orderShipped",
        data: {
          name: buyer.name,
          orderNumber: order.orderNumber,
          trackingNumber: order.trackingNumber,
          trackingNote: order.trackingNote,
        },
      },
    });
  }
  return order;
}

export async function markInTransit(sellerId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, sellerId, paymentStatus: "paid" });
  if (!order) throw ApiError.notFound("Order not found");
  order.deliveryStatus = "in_transit";
  await order.save();
  return order;
}

export async function markDelivered(sellerId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, sellerId, paymentStatus: "paid" });
  if (!order) throw ApiError.notFound("Order not found");
  order.deliveryStatus = "delivered";
  order.deliveredAt = new Date();
  await order.save();
  const buyer = await BuyerProfile.findById(order.buyerProfileId);
  if (buyer) {
    await createNotification({
      recipientId: buyer._id,
      recipientType: "buyer",
      storeId: order.storeId,
      type: "order_delivered",
      title: "Confirm your delivery",
      message: `Please confirm you received order ${order.orderNumber}.`,
      link: `/orders/${order._id}`,
      email: {
        to: buyer.email,
        templateName: "orderDelivered",
        data: { name: buyer.name, orderNumber: order.orderNumber },
      },
    });
  }
  return order;
}

export async function sellerOrderStats(sellerId: string) {
  const store = await getSellerStore(sellerId);
  const paid = { paymentStatus: "paid", storeId: store._id };
  const [total, byStatus, revenueAgg, today, week, month] = await Promise.all([
    Order.countDocuments({ storeId: store._id }),
    Order.aggregate([
      { $match: { storeId: store._id } },
      { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: paid },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]),
    Order.countDocuments({
      ...paid,
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }),
    Order.countDocuments({
      ...paid,
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) },
    }),
    Order.countDocuments({
      ...paid,
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
    }),
  ]);
  const revenue = revenueAgg[0]?.total ?? 0;
  const paidCount = revenueAgg[0]?.count ?? 0;
  return {
    totalOrders: total,
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    totalRevenue: revenue,
    averageOrderValue: paidCount ? revenue / paidCount : 0,
    ordersToday: today,
    ordersThisWeek: week,
    ordersThisMonth: month,
  };
}

export async function listBuyerOrders(
  buyerProfileId: string,
  storeId: string,
  query: { deliveryStatus?: string; skip: number; limit: number },
) {
  const filter: Record<string, unknown> = { buyerProfileId, storeId };
  if (query.deliveryStatus) filter.deliveryStatus = query.deliveryStatus;
  const [items, total] = await Promise.all([
    Order.find(filter).sort({ createdAt: -1 }).skip(query.skip).limit(query.limit),
    Order.countDocuments(filter),
  ]);
  return { items, total };
}

export async function getBuyerOrder(buyerProfileId: string, storeId: string, orderId: string) {
  const order = await Order.findOne({ _id: orderId, buyerProfileId, storeId });
  if (!order) throw ApiError.notFound("Order not found");
  return order;
}

export async function confirmOrder(order: InstanceType<typeof Order>, auto = false) {
  if (order.paymentStatus !== "paid") throw ApiError.badRequest("Order is not paid");
  if (order.escrowStatus === "released") return order;
  if (order.deliveryStatus === "disputed") throw ApiError.badRequest("Order is in dispute");
  order.deliveryStatus = "confirmed";
  order.confirmedAt = new Date();
  order.escrowStatus = "released";
  order.escrowReleasedAt = new Date();
  await order.save();
  await creditWallet(
    String(order.sellerId),
    order.payoutAmount,
    "escrow_credit",
    `Escrow release for ${order.orderNumber}`,
    String(order._id),
  );
  const seller = await User.findById(order.sellerId);
  const buyer = await BuyerProfile.findById(order.buyerProfileId);
  if (seller) {
    await createNotification({
      recipientId: seller._id,
      recipientType: "seller",
      type: "order_confirmed",
      title: "Order confirmed",
      message: `Order ${order.orderNumber} confirmed. ${DEFAULT_CURRENCY_SYMBOL}${order.payoutAmount} credited.`,
      link: `/dashboard/orders/${order._id}`,
      email: {
        to: seller.email,
        templateName: "orderConfirmedSeller",
        data: {
          name: seller.name,
          orderNumber: order.orderNumber,
          amount: order.payoutAmount,
          currencySymbol: DEFAULT_CURRENCY_SYMBOL,
        },
      },
    });
  }
  if (auto && buyer) {
    await createNotification({
      recipientId: buyer._id,
      recipientType: "buyer",
      storeId: order.storeId,
      type: "order_auto_confirmed",
      title: "Order auto-confirmed",
      message: `Order ${order.orderNumber} was auto-confirmed after the escrow window.`,
      email: {
        to: buyer.email,
        templateName: "orderAutoConfirmed",
        data: { name: buyer.name, orderNumber: order.orderNumber },
      },
    });
  }
  await rewardBuyerReferral(order);
  return order;
}

async function rewardBuyerReferral(order: InstanceType<typeof Order>) {
  const paidCount = await Order.countDocuments({
    buyerProfileId: order.buyerProfileId,
    paymentStatus: "paid",
    deliveryStatus: "confirmed",
  });
  if (paidCount !== 1) return;
  const referral = await BuyerReferral.findOne({
    refereeId: order.buyerProfileId,
    status: "pending",
  });
  if (!referral) return;
  await BuyerWallet.findOneAndUpdate(
    { buyerProfileId: referral.referrerId, storeId: order.storeId },
    { $inc: { balance: referral.referrerRewardAmount } },
    { upsert: true, new: true },
  );
  referral.status = "rewarded";
  referral.rewardedAt = new Date();
  referral.orderId = order._id;
  await referral.save();
  const referrer = await BuyerProfile.findById(referral.referrerId);
  if (referrer) {
    await createNotification({
      recipientId: referrer._id,
      recipientType: "buyer",
      storeId: order.storeId,
      type: "referral_reward",
      title: "Referral reward",
      message: `You earned ${DEFAULT_CURRENCY_SYMBOL}${referral.referrerRewardAmount} for a successful referral.`,
      email: {
        to: referrer.email,
        templateName: "referralReward",
        data: {
          name: referrer.name,
          amount: referral.referrerRewardAmount,
          currencySymbol: DEFAULT_CURRENCY_SYMBOL,
        },
      },
    });
  }
}

export async function openDispute(
  buyerProfileId: string,
  storeId: string,
  orderId: string,
  input: {
    reason: string;
    description: string;
    evidenceImages?: string[];
    resolutionPreference: "Refund" | "Replacement";
  },
) {
  const order = await getBuyerOrder(buyerProfileId, storeId, orderId);
  if (order.paymentStatus !== "paid") throw ApiError.badRequest("Only paid orders can be disputed");
  if (["confirmed", "refunded"].includes(order.deliveryStatus)) {
    throw ApiError.badRequest("This order can no longer be disputed");
  }
  const existing = await Dispute.findOne({ orderId: order._id });
  if (existing) throw ApiError.conflict("A dispute already exists for this order");
  const dispute = await Dispute.create({
    orderId: order._id,
    storeId: order.storeId,
    buyerProfileId: order.buyerProfileId,
    sellerId: order.sellerId,
    reason: input.reason,
    description: input.description,
    evidenceImages: input.evidenceImages ?? [],
    resolutionPreference: input.resolutionPreference,
    awaitingResponseFrom: "seller",
  });
  order.deliveryStatus = "disputed";
  order.escrowStatus = "disputed";
  await order.save();
  const seller = await User.findById(order.sellerId);
  const buyer = await BuyerProfile.findById(buyerProfileId);
  const admins = await User.find({ role: "admin" });
  if (seller) {
    await createNotification({
      recipientId: seller._id,
      recipientType: "seller",
      type: "dispute_opened",
      title: "Dispute opened",
      message: `A dispute was opened on ${order.orderNumber}: ${input.reason}`,
      link: `/dashboard/disputes/${dispute._id}`,
      email: {
        to: seller.email,
        templateName: "disputeOpened",
        data: { orderNumber: order.orderNumber, reason: input.reason },
      },
    });
  }
  await Promise.all(
    admins.map((admin) =>
      createNotification({
        recipientId: admin._id,
        recipientType: "admin",
        type: "dispute_opened",
        title: "New dispute",
        message: `${order.orderNumber}: ${input.reason}`,
        link: `/admin/disputes/${dispute._id}`,
        email: {
          to: admin.email,
          templateName: "disputeOpened",
          data: { orderNumber: order.orderNumber, reason: input.reason },
        },
      }),
    ),
  );
  void buyer;
  return dispute;
}

export async function autoReleaseEscrow(): Promise<number> {
  const settings = await getSettings();
  const cutoff = new Date(Date.now() - settings.escrowAutoReleaseHours * 3600 * 1000);
  const orders = await Order.find({
    paymentStatus: "paid",
    deliveryStatus: "delivered",
    escrowStatus: "locked",
    deliveredAt: { $lte: cutoff },
  });
  for (const order of orders) {
    await confirmOrder(order, true);
  }
  return orders.length;
}

export async function commissionForSeller(sellerId: string): Promise<number> {
  const plan = await getSellerPlan(sellerId);
  if (plan) return plan.commissionPercent;
  const settings = await getSettings();
  return settings.platformCommissionPercent;
}
