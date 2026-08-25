import { User } from "../models/user.model";
import { BuyerProfile } from "../models/buyer-profile.model";
import { Store } from "../models/store.model";
import { Order } from "../models/order.model";
import { Kyc } from "../models/kyc.model";
import { Subscription } from "../models/subscription.model";
import { Wallet } from "../models/wallet.model";
import { Product } from "../models/product.model";
import { Dispute } from "../models/dispute.model";
import { WalletTransaction } from "../models/wallet-transaction.model";
import { PlatformTransaction } from "../models/platform-transaction.model";
import { AuditLog } from "../models/audit-log.model";
import { SellerReferral } from "../models/seller-referral.model";
import { BuyerReferral } from "../models/buyer-referral.model";
import { WebsiteTemplate } from "../models/website-template.model";
import { TemplateSection } from "../models/template-section.model";
import { SubscriptionPlan } from "../models/subscription-plan.model";
import { GlobalCategory } from "../models/global-category.model";
import { ApiError } from "../utils/api-error.util";
import { escapeRegex } from "../utils/pagination.util";
import { toCsv } from "../utils/csv.util";
import { refreshStoreLiveStatus } from "./store-helper.service";
import { slugify, uniqueSlug } from "../utils/slug.util";
import { createNotification } from "./notification.service";
import {
  colorVariablesFromScheme,
  layoutSectionsFromDefaults,
  normalizeColorScheme,
  normalizeThemeSettings,
} from "../utils/storefront-theme.util";
import { compileHtmlSection, inferFieldSchema, sanitizeCss, sanitizeHtml, scopeCss } from "../utils/html-template.util";

export async function listUsers(query: {
  role?: string;
  search?: string;
  banned?: string;
  skip: number;
  limit: number;
}) {
  const filter: Record<string, unknown> = {};
  if (query.role) filter.role = query.role;
  if (query.banned === "true") filter.banned = true;
  if (query.banned === "false") filter.banned = false;
  if (query.search) {
    filter.$or = [
      { name: new RegExp(escapeRegex(query.search), "i") },
      { email: new RegExp(escapeRegex(query.search), "i") },
    ];
  }
  const [items, total] = await Promise.all([
    User.find(filter).select("-passwordHash -verificationOtp -resetPasswordOtp").sort({ createdAt: -1 }).skip(query.skip).limit(query.limit),
    User.countDocuments(filter),
  ]);
  return { items, total };
}

export async function userStats() {
  const [totalSellers, totalAdmins, week, month, plans, kyc] = await Promise.all([
    User.countDocuments({ role: "seller" }),
    User.countDocuments({ role: "admin" }),
    User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 3600 * 1000) } }),
    User.countDocuments({ createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } }),
    Subscription.aggregate([{ $match: { status: { $in: ["active", "grace_period"] } } }, { $group: { _id: "$planName", count: { $sum: 1 } } }]),
    Kyc.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);
  return {
    totalSellers,
    totalAdmins,
    newThisWeek: week,
    newThisMonth: month,
    sellersByPlan: Object.fromEntries(plans.map((p) => [p._id, p.count])),
    kycByStatus: Object.fromEntries(kyc.map((k) => [k._id, k.count])),
  };
}

export async function getUser(userId: string) {
  const user = await User.findById(userId).select("-passwordHash");
  if (!user) throw ApiError.notFound("User not found");
  const [store, kyc, sub, wallet, orders] = await Promise.all([
    Store.findOne({ sellerId: userId }),
    Kyc.findOne({ sellerId: userId }),
    Subscription.findOne({ sellerId: userId, status: { $in: ["active", "grace_period"] } }),
    Wallet.findOne({ sellerId: userId }),
    Order.countDocuments({ sellerId: userId }),
  ]);
  return { user, store, kyc, subscription: sub, wallet, orderCount: orders };
}

export async function banUser(userId: string, reason: string) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  user.banned = true;
  user.bannedAt = new Date();
  user.banReason = reason;
  await user.save();
  const store = await Store.findOne({ sellerId: userId });
  if (store) {
    store.isLive = false;
    await store.save();
  }
  await createNotification({
    recipientId: user._id,
    recipientType: "seller",
    type: "account_banned",
    title: "Account banned",
    message: reason,
    email: { to: user.email, templateName: "custom", data: { message: reason, subject: "Account banned" } },
  });
  return user;
}

export async function unbanUser(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  user.banned = false;
  user.banReason = null;
  await user.save();
  const store = await Store.findOne({ sellerId: userId });
  if (store) await refreshStoreLiveStatus(store);
  return user;
}

export async function promoteAdmin(userId: string) {
  const user = await User.findById(userId);
  if (!user) throw ApiError.notFound("User not found");
  user.role = "admin";
  await user.save();
  return user;
}

export async function exportUsersCsv() {
  const users = await User.find().select("name email role isVerified banned createdAt").lean();
  return toCsv(users as Record<string, unknown>[]);
}

export async function listBuyers(query: {
  storeId?: string;
  search?: string;
  banned?: string;
  skip: number;
  limit: number;
}) {
  const filter: Record<string, unknown> = {};
  if (query.storeId) filter.storeId = query.storeId;
  if (query.banned === "true") filter.banned = true;
  if (query.search) {
    filter.$or = [
      { name: new RegExp(escapeRegex(query.search), "i") },
      { email: new RegExp(escapeRegex(query.search), "i") },
    ];
  }
  const [items, total] = await Promise.all([
    BuyerProfile.find(filter).sort({ createdAt: -1 }).skip(query.skip).limit(query.limit),
    BuyerProfile.countDocuments(filter),
  ]);
  return { items, total };
}

export async function getBuyer(id: string) {
  const buyer = await BuyerProfile.findById(id);
  if (!buyer) throw ApiError.notFound("Buyer not found");
  const orders = await Order.find({ buyerProfileId: id }).sort({ createdAt: -1 }).limit(50);
  return { buyer, orders };
}

export async function banBuyer(id: string, reason: string) {
  const buyer = await BuyerProfile.findById(id);
  if (!buyer) throw ApiError.notFound("Buyer not found");
  buyer.banned = true;
  buyer.bannedAt = new Date();
  buyer.banReason = reason;
  await buyer.save();
  return buyer;
}

export async function listStores(query: {
  isLive?: string;
  search?: string;
  skip: number;
  limit: number;
}) {
  const filter: Record<string, unknown> = {};
  if (query.isLive === "true") filter.isLive = true;
  if (query.isLive === "false") filter.isLive = false;
  if (query.search) filter.name = new RegExp(escapeRegex(query.search), "i");
  const [items, total] = await Promise.all([
    Store.find(filter).sort({ createdAt: -1 }).skip(query.skip).limit(query.limit),
    Store.countDocuments(filter),
  ]);
  return { items, total };
}

export async function getStoreAdmin(storeId: string) {
  const store = await Store.findById(storeId);
  if (!store) throw ApiError.notFound("Store not found");
  const [products, orders, revenue] = await Promise.all([
    Product.countDocuments({ storeId }),
    Order.countDocuments({ storeId }),
    Order.aggregate([
      { $match: { storeId: store._id, paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);
  return { store, products, orders, revenue: revenue[0]?.total ?? 0 };
}

export async function toggleStoreLive(storeId: string, live: boolean) {
  const store = await Store.findById(storeId);
  if (!store) throw ApiError.notFound("Store not found");
  store.liveOverride = live;
  store.isLive = live;
  await store.save();
  return store;
}

export async function platformOverview() {
  const [gmv, commission, stores, buyers, orders] = await Promise.all([
    Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
    Order.aggregate([{ $match: { paymentStatus: "paid" } }, { $group: { _id: null, total: { $sum: "$commissionAmount" } } }]),
    Store.aggregate([{ $group: { _id: "$isLive", count: { $sum: 1 } } }]),
    BuyerProfile.countDocuments(),
    Order.aggregate([{ $group: { _id: "$deliveryStatus", count: { $sum: 1 } } }]),
  ]);
  const thisMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const lastMonth = new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1);
  const [thisGmv, lastGmv] = await Promise.all([
    Order.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: thisMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
    Order.aggregate([
      { $match: { paymentStatus: "paid", createdAt: { $gte: lastMonth, $lt: thisMonth } } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]),
  ]);
  const tm = thisGmv[0]?.total ?? 0;
  const lm = lastGmv[0]?.total ?? 0;
  return {
    gmv: gmv[0]?.total ?? 0,
    platformRevenue: commission[0]?.total ?? 0,
    stores: Object.fromEntries(stores.map((s) => [s._id ? "live" : "offline", s.count])),
    totalBuyers: buyers,
    ordersByStatus: Object.fromEntries(orders.map((o) => [o._id, o.count])),
    gmvThisMonth: tm,
    gmvChangePercent: lm ? Math.round(((tm - lm) / lm) * 1000) / 10 : 100,
  };
}

export async function gmvTrend(period: string) {
  const days = period === "12m" ? 365 : Number(period.replace("d", "")) || 30;
  const from = new Date(Date.now() - days * 24 * 3600 * 1000);
  return Order.aggregate([
    { $match: { paymentStatus: "paid", createdAt: { $gte: from } } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        gmv: { $sum: "$totalAmount" },
        revenue: { $sum: "$commissionAmount" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { date: "$_id", gmv: 1, revenue: 1, orders: 1, _id: 0 } },
  ]);
}

export async function topStores() {
  return Order.aggregate([
    { $match: { paymentStatus: "paid" } },
    { $group: { _id: "$storeId", revenue: { $sum: "$totalAmount" }, orders: { $sum: 1 } } },
    { $sort: { revenue: -1 } },
    { $limit: 20 },
  ]);
}

export async function planAnalytics() {
  return Subscription.aggregate([
    { $match: { status: { $in: ["active", "grace_period"] } } },
    { $group: { _id: "$planName", count: { $sum: 1 }, revenue: { $sum: "$amount" } } },
  ]);
}

export async function kycFunnel() {
  return Kyc.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);
}

export async function disputeAnalytics() {
  const [byStatus, avg] = await Promise.all([
    Dispute.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Dispute.aggregate([
      { $match: { status: "Resolved", resolvedAt: { $ne: null } } },
      { $project: { hours: { $divide: [{ $subtract: ["$resolvedAt", "$createdAt"] }, 3600000] } } },
      { $group: { _id: null, avgHours: { $avg: "$hours" } } },
    ]),
  ]);
  const refunds = await Dispute.countDocuments({ resolution: "refund" });
  const total = await Dispute.countDocuments();
  return {
    byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    averageResolutionHours: avg[0]?.avgHours ?? 0,
    refundRate: total ? refunds / total : 0,
  };
}

export async function payoutAnalytics() {
  const rows = await WalletTransaction.aggregate([
    { $match: { type: "withdrawal" } },
    { $group: { _id: "$status", total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  return Object.fromEntries(rows.map((r) => [r._id, { total: r.total, count: r.count }]));
}

export async function listAuditLogs(query: {
  action?: string;
  category?: string;
  skip: number;
  limit: number;
}) {
  const filter: Record<string, unknown> = {};
  if (query.action) filter.action = query.action;
  if (query.category) filter.category = query.category;
  const [items, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(query.skip).limit(query.limit),
    AuditLog.countDocuments(filter),
  ]);
  return { items, total };
}

export async function listTransactionsAdmin(query: {
  type?: string;
  skip: number;
  limit: number;
}) {
  const filter: Record<string, unknown> = {};
  if (query.type) filter.type = query.type;
  const [items, total] = await Promise.all([
    PlatformTransaction.find(filter).sort({ createdAt: -1 }).skip(query.skip).limit(query.limit),
    PlatformTransaction.countDocuments(filter),
  ]);
  return { items, total };
}

export async function transactionStats() {
  return PlatformTransaction.aggregate([
    { $group: { _id: "$type", volume: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
}

export async function listSellerReferrals() {
  return SellerReferral.find().populate("referrerId refereeId", "name email").sort({ createdAt: -1 });
}

export async function listBuyerReferrals() {
  return BuyerReferral.find().sort({ createdAt: -1 }).limit(200);
}

export async function reverseReferral(id: string) {
  const ref = await SellerReferral.findById(id);
  if (!ref) throw ApiError.notFound("Referral not found");
  ref.status = "reversed";
  await ref.save();
  return ref;
}

function normalizeTemplatePayload(payload: Record<string, unknown>) {
  const defaultSections = Array.isArray(payload.defaultSections)
    ? (payload.defaultSections as Array<Record<string, unknown>>)
    : undefined;
  const defaultColorScheme = payload.defaultColorScheme
    ? normalizeColorScheme(payload.defaultColorScheme as Record<string, string>)
    : undefined;
  const themeSettings = payload.themeSettings
    ? normalizeThemeSettings(payload.themeSettings as Record<string, unknown>)
    : undefined;

  const next: Record<string, unknown> = { ...payload };
  if (defaultColorScheme) {
    next.defaultColorScheme = defaultColorScheme;
    if (!payload.colorVariables) next.colorVariables = colorVariablesFromScheme(defaultColorScheme);
  }
  if (themeSettings) next.themeSettings = themeSettings;
  if (defaultSections) {
    next.defaultSections = defaultSections;
    next.layoutSections = layoutSectionsFromDefaults(defaultSections);
  }
  return next;
}

export async function createTemplate(payload: Record<string, unknown>) {
  const name = String(payload.name || "Untitled Template");
  const rawSlug = payload.slug ? String(payload.slug) : name;
  const slug = await uniqueSlug(rawSlug, async (s) => Boolean(await WebsiteTemplate.exists({ slug: s })));
  return WebsiteTemplate.create({ ...normalizeTemplatePayload(payload), slug });
}

export async function updateTemplate(id: string, payload: Record<string, unknown>) {
  const t = await WebsiteTemplate.findByIdAndUpdate(id, normalizeTemplatePayload(payload), { new: true });
  if (!t) throw ApiError.notFound("Template not found");
  return t;
}

function normalizeSectionPayload(payload: Record<string, unknown>) {
  const kind = payload.kind === "html" ? "html" : "react";
  const html = kind === "html" ? sanitizeHtml(String(payload.html || "")) : "";
  const css = kind === "html" ? sanitizeCss(String(payload.css || "")) : "";
  const fieldSchema =
    kind === "html"
      ? Array.isArray(payload.fieldSchema) && payload.fieldSchema.length
        ? payload.fieldSchema
        : inferFieldSchema(html)
      : [];
  return {
    name: String(payload.name || "Untitled section"),
    description: String(payload.description || ""),
    category: String(payload.category || "general"),
    kind,
    type: String(payload.type || (kind === "html" ? "html-block" : "hero")),
    variant: String(payload.variant || "default"),
    html,
    css,
    fieldSchema,
    bindings: Array.isArray(payload.bindings) ? payload.bindings.map(String) : [],
    defaultData: (payload.defaultData as Record<string, unknown>) || {},
    isActive: payload.isActive !== false,
  };
}

export async function listTemplateSections(query: Record<string, unknown>) {
  const filter: Record<string, unknown> = {};
  if (query.kind && query.kind !== "all") filter.kind = query.kind;
  if (query.isActive === "true") filter.isActive = true;
  if (query.isActive === "false") filter.isActive = false;
  if (query.search && typeof query.search === "string" && query.search.trim()) {
    const regex = new RegExp(escapeRegex(query.search.trim()), "i");
    filter.$or = [{ name: regex }, { key: regex }, { type: regex }];
  }
  return TemplateSection.find(filter).sort({ updatedAt: -1 });
}

export async function createTemplateSection(payload: Record<string, unknown>) {
  const name = String(payload.name || "Untitled section");
  const rawKey = payload.key ? String(payload.key) : name;
  const key = await uniqueSlug(rawKey, async (s) => Boolean(await TemplateSection.exists({ key: s })));
  return TemplateSection.create({ ...normalizeSectionPayload(payload), key });
}

export async function updateTemplateSection(id: string, payload: Record<string, unknown>) {
  const next = normalizeSectionPayload(payload);
  const t = await TemplateSection.findByIdAndUpdate(id, next, { new: true });
  if (!t) throw ApiError.notFound("Section not found");
  return t;
}

export async function deleteTemplateSection(id: string) {
  const t = await TemplateSection.findByIdAndDelete(id);
  if (!t) throw ApiError.notFound("Section not found");
  return t;
}

export async function previewTemplateSection(payload: Record<string, unknown>) {
  const html = sanitizeHtml(String(payload.html || ""));
  const css = scopeCss(sanitizeCss(String(payload.css || "")), ".hustlr-html-preview");
  const compiled = compileHtmlSection(html, {
    data: (payload.data as Record<string, unknown>) || {},
    store: { name: "Preview Store", logo: "", url: "#" },
    products: {
      featured: [
        { title: "Sample Product", image: "", price: "₦12,000", url: "#" },
        { title: "Another Product", image: "", price: "₦8,500", url: "#" },
      ],
    },
    categories: [{ name: "Apparel", url: "#" }],
  });
  return {
    html: compiled,
    css,
    fieldSchema: inferFieldSchema(html),
  };
}

export async function deactivateTemplate(id: string) {
  const t = await WebsiteTemplate.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!t) throw ApiError.notFound("Template not found");
  return t;
}

export async function deleteTemplate(id: string) {
  const storesCount = await Store.countDocuments({ templateId: id });
  if (storesCount > 0) {
    throw ApiError.badRequest(
      `Cannot delete this template because ${storesCount} merchant store(s) are currently using it. You can deactivate it instead.`,
    );
  }
  const t = await WebsiteTemplate.findByIdAndDelete(id);
  if (!t) throw ApiError.notFound("Template not found");
  return t;
}

export async function listAdminTemplates(query: Record<string, unknown>) {
  const filter: Record<string, unknown> = {};
  if (query.tier && query.tier !== "all") filter.tier = query.tier;
  if (query.category && query.category !== "all") filter.category = query.category;
  if (query.isActive === "true") filter.isActive = true;
  if (query.isActive === "false") filter.isActive = false;
  if (query.search && typeof query.search === "string" && query.search.trim()) {
    const regex = new RegExp(escapeRegex(query.search.trim()), "i");
    filter.$or = [
      { name: regex },
      { slug: regex },
      { category: regex },
      { description: regex },
    ];
  }

  const templates = await WebsiteTemplate.find(filter).sort({ createdAt: -1 }).lean();

  const counts = await Store.aggregate([
    { $match: { templateId: { $ne: null } } },
    { $group: { _id: "$templateId", count: { $sum: 1 } } },
  ]);
  const countMap = new Map<string, number>();
  for (const c of counts) {
    if (c._id) countMap.set(String(c._id), c.count);
  }

  return templates.map((t) => ({
    ...t,
    storesUsing: countMap.get(String(t._id)) || 0,
  }));
}

export async function upsertPlan(id: string | null, payload: Record<string, unknown>) {
  if (id) {
    const plan = await SubscriptionPlan.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
    if (!plan) throw ApiError.notFound("Plan not found");
    return plan;
  }
  return SubscriptionPlan.create(payload);
}

export async function listPlansAdmin() {
  let plans = await SubscriptionPlan.find().sort({ monthlyPrice: 1 }).lean();
  if (!plans || plans.length === 0) {
    const defaultPlans = [
      {
        name: "free" as const,
        slug: "free" as const,
        monthlyPrice: 0,
        yearlyPrice: 0,
        features: [
          "Up to 25 Products Listing",
          "Access to Free Store Templates",
          "Paystack Escrow Protection",
          "Standard Email Support",
        ],
        maxProducts: 25,
        allowCustomDomain: false,
        allowProTemplates: false,
        allowProPlusTemplates: false,
        allowBlog: false,
        commissionPercent: 10,
        isActive: true,
      },
      {
        name: "pro" as const,
        slug: "pro" as const,
        monthlyPrice: 15000,
        yearlyPrice: 150000,
        features: [
          "Unlimited Product Listings",
          "Access to All Pro Templates",
          "Discount Coupons & Promotions",
          "Custom Storefront Colors",
          "Priority Support",
        ],
        maxProducts: null,
        allowCustomDomain: false,
        allowProTemplates: true,
        allowProPlusTemplates: false,
        allowBlog: true,
        commissionPercent: 7,
        isActive: true,
      },
      {
        name: "pro+" as const,
        slug: "pro-plus" as const,
        monthlyPrice: 35000,
        yearlyPrice: 350000,
        features: [
          "Everything in Pro",
          "Custom Domain Mapping (yourname.com)",
          "Access to All Templates (including Pro+)",
          "Lowest Platform Commission (5%)",
          "Dedicated Account Manager",
        ],
        maxProducts: null,
        allowCustomDomain: true,
        allowProTemplates: true,
        allowProPlusTemplates: true,
        allowBlog: true,
        commissionPercent: 5,
        isActive: true,
      },
    ];
    await SubscriptionPlan.insertMany(defaultPlans);
    plans = await SubscriptionPlan.find().sort({ monthlyPrice: 1 }).lean();
  }

  const counts = await Subscription.aggregate([
    { $match: { status: { $in: ["active", "grace_period"] } } },
    { $group: { _id: "$planName", count: { $sum: 1 }, revenue: { $sum: "$amount" } } },
  ]);

  const countMap = new Map(
    counts.map((c) => [c._id, { count: c.count, revenue: c.revenue }]),
  );

  return plans.map((p) => ({
    ...p,
    activeSubscribers: countMap.get(p.name)?.count || 0,
    activeRevenue: countMap.get(p.name)?.revenue || 0,
  }));
}

export async function createGlobalCategory(payload: { name: string; description?: string; image?: string }) {
  const slug = slugify(payload.name);
  return GlobalCategory.create({ ...payload, slug });
}

export async function updateGlobalCategory(id: string, payload: Record<string, unknown>) {
  const cat = await GlobalCategory.findByIdAndUpdate(id, payload, { new: true });
  if (!cat) throw ApiError.notFound("Category not found");
  return cat;
}

export async function deleteGlobalCategory(id: string) {
  await GlobalCategory.findByIdAndUpdate(id, { isActive: false });
}

export async function listGlobalCategories() {
  return GlobalCategory.find({ isActive: true }).sort({ name: 1 });
}

export async function listOrdersAdmin(query: {
  search?: string;
  paymentStatus?: string;
  deliveryStatus?: string;
  from?: string;
  to?: string;
  skip?: number;
  limit?: number;
}) {
  const filter: Record<string, unknown> = {};
  if (query.paymentStatus && query.paymentStatus !== "All") {
    filter.paymentStatus = query.paymentStatus;
  }
  if (query.deliveryStatus && query.deliveryStatus !== "All") {
    filter.deliveryStatus = query.deliveryStatus;
  }
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) (filter.createdAt as Record<string, unknown>).$gte = new Date(query.from);
    if (query.to) (filter.createdAt as Record<string, unknown>).$lte = new Date(query.to);
  }
  if (query.search) {
    const rx = new RegExp(escapeRegex(query.search), "i");
    filter.$or = [{ orderNumber: rx }, { paymentReference: rx }, { "shippingAddress.fullName": rx }];
  }
  const skip = query.skip || 0;
  const limit = query.limit || 20;

  const [orders, total] = await Promise.all([
    Order.find(filter)
      .populate("sellerId", "name email")
      .populate("storeId", "name slug subdomain")
      .populate("buyerProfileId", "name email phoneNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(filter),
  ]);

  return { orders, total, page: Math.floor(skip / limit) + 1, limit };
}

export async function getOrderAdmin(orderId: string) {
  const order = await Order.findById(orderId)
    .populate("sellerId", "name email")
    .populate("storeId", "name slug subdomain logo")
    .populate("buyerProfileId", "name email phoneNumber")
    .lean();
  if (!order) throw ApiError.notFound("Order not found");
  const disputes = await Dispute.find({ orderId: order._id }).lean();
  return { order, disputes };
}

export async function updateOrderAddressAdmin(orderId: string, address: Record<string, unknown>) {
  const order = await Order.findByIdAndUpdate(
    orderId,
    { $set: { shippingAddress: address } },
    { new: true },
  );
  if (!order) throw ApiError.notFound("Order not found");
  return order;
}

export async function confirmOrderAdmin(orderId: string) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound("Order not found");
  order.deliveryStatus = "confirmed";
  order.confirmedAt = new Date();
  await order.save();
  return order;
}

export async function cancelOrderAdmin(orderId: string, reason?: string) {
  const order = await Order.findById(orderId);
  if (!order) throw ApiError.notFound("Order not found");
  order.paymentStatus = "refunded";
  order.deliveryStatus = "refunded";
  if (reason) order.trackingNote = `Admin cancellation: ${reason}`;
  await order.save();
  return order;
}

