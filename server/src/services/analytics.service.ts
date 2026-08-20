import { Order } from "../models/order.model";
import { Product } from "../models/product.model";
import { BuyerProfile } from "../models/buyer-profile.model";
import { Wallet } from "../models/wallet.model";
import { getOrCreateWallet } from "./wallet.service";
import { getSellerStore } from "./store-helper.service";

function periodStart(period: string): Date {
  const now = Date.now();
  const map: Record<string, number> = {
    "7d": 7,
    "30d": 30,
    "90d": 90,
    "12m": 365,
  };
  return new Date(now - (map[period] ?? 30) * 24 * 3600 * 1000);
}

export async function sellerOverview(sellerId: string) {
  const store = await getSellerStore(sellerId);
  const paid = { storeId: store._id, paymentStatus: "paid" };
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const [revenue, thisMonth, lastMonth, orders, customers, newCustomers, wallet] = await Promise.all([
    Order.aggregate([{ $match: paid }, { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: { ...paid, createdAt: { $gte: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { ...paid, createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.countDocuments({ storeId: store._id }),
    Order.distinct("buyerProfileId", paid),
    BuyerProfile.countDocuments({ storeId: store._id, createdAt: { $gte: thisMonthStart } }),
    getOrCreateWallet(sellerId),
  ]);
  const totalRevenue = revenue[0]?.total ?? 0;
  const monthRevenue = thisMonth[0]?.total ?? 0;
  const lastRevenue = lastMonth[0]?.total ?? 0;
  const monthOrders = thisMonth[0]?.count ?? 0;
  const pct = lastRevenue ? ((monthRevenue - lastRevenue) / lastRevenue) * 100 : 100;
  return {
    totalRevenue,
    revenueThisMonth: monthRevenue,
    revenueChangePercent: Math.round(pct * 10) / 10,
    totalOrders: orders,
    ordersThisMonth: monthOrders,
    averageOrderValue: revenue[0]?.count ? totalRevenue / revenue[0].count : 0,
    totalCustomers: customers.length,
    newCustomersThisMonth: newCustomers,
    walletBalance: wallet.balance,
  };
}

export async function revenueTrend(sellerId: string, period: string, groupBy: string) {
  const store = await getSellerStore(sellerId);
  const from = periodStart(period);
  const format =
    groupBy === "month" ? "%Y-%m" : groupBy === "week" ? "%Y-%U" : "%Y-%m-%d";
  return Order.aggregate([
    { $match: { storeId: store._id, paymentStatus: "paid", createdAt: { $gte: from } } },
    {
      $group: {
        _id: { $dateToString: { format, date: "$createdAt" } },
        revenue: { $sum: "$totalAmount" },
        orderCount: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: "$_id", revenue: 1, orderCount: 1 } },
  ]);
}

export async function topProducts(sellerId: string, limit: number, sortBy: string) {
  const store = await getSellerStore(sellerId);
  const sort: Record<string, 1 | -1> = sortBy === "orders" ? { orders: -1 } : { revenue: -1 };
  return Order.aggregate([
    { $match: { storeId: store._id, paymentStatus: "paid" } },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.productId",
        title: { $first: "$items.title" },
        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        orders: { $sum: "$items.quantity" },
      },
    },
    { $sort: sort },
    { $limit: limit },
  ]);
}

export async function orderStatusBreakdown(sellerId: string) {
  const store = await getSellerStore(sellerId);
  const rows = await Order.aggregate([
    { $match: { storeId: store._id } },
    { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id, r.count]));
}

export async function customerAnalytics(sellerId: string) {
  const store = await getSellerStore(sellerId);
  const top = await Order.aggregate([
    { $match: { storeId: store._id, paymentStatus: "paid" } },
    { $group: { _id: "$buyerProfileId", spend: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
    { $sort: { spend: -1 } },
    { $limit: 10 },
  ]);
  const returning = top.filter((t) => t.orders > 1).length;
  return {
    totalCustomers: await BuyerProfile.countDocuments({ storeId: store._id }),
    topCustomers: top,
    returningInTop10: returning,
  };
}

export async function productPerformance(sellerId: string, skip: number, limit: number) {
  const store = await getSellerStore(sellerId);
  const [items, total] = await Promise.all([
    Product.find({ storeId: store._id })
      .select("title slug views viewCount orderCount rating reviewCount price status")
      .sort({ orderCount: -1 })
      .skip(skip)
      .limit(limit),
    Product.countDocuments({ storeId: store._id }),
  ]);
  return {
    items: items.map((p) => ({
      id: p._id,
      title: p.title,
      views: p.viewCount,
      orders: p.orderCount,
      revenueEstimate: p.price * p.orderCount,
      conversionRate: p.viewCount ? p.orderCount / p.viewCount : 0,
      averageRating: p.rating,
      status: p.status,
    })),
    total,
  };
}

void Wallet;
