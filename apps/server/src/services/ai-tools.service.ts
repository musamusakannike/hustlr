import crypto from "crypto";
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { Order } from "../models/order.model";
import { Product } from "../models/product.model";
import { Dispute } from "../models/dispute.model";
import { WalletTransaction } from "../models/wallet-transaction.model";
import { DEFAULT_CURRENCY } from "../config/constants.config";
import { getSellerStore, getSellerPlan } from "./store-helper.service";
import { getOrCreateWallet } from "./wallet.service";
import { improveTitle, rewriteDescription, generateSeo } from "./ai.service";
import type { IAiAction } from "../models/ai-message.model";

const SOURCE: Record<string, string> = {
  get_wallet: "Wallet",
  get_escrow_summary: "Escrow",
  get_revenue: "Orders",
  get_order_health: "Orders",
  get_inventory: "Inventory",
  get_disputes: "Disputes",
  search_products: "Catalog",
  draft_catalog_copy: "Catalog",
  draft_coupon: "Coupons",
  draft_price_change: "Catalog",
  draft_restock: "Inventory",
};

export const PARTNER_TOOLS: ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "get_wallet",
      description: "Available balance, pending escrow-held balance, and recent payouts.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_escrow_summary",
      description: "Funds still locked in escrow, ageing buckets, and order counts.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_revenue",
      description: "GMV, platform commission, and net after fees for a period. Net is not product cost.",
      parameters: {
        type: "object",
        properties: {
          period: { type: "string", enum: ["7d", "30d", "90d"], description: "Lookback window" },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_order_health",
      description: "Order counts by delivery status, delayed fulfillment, unconfirmed deliveries.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_inventory",
      description: "Low stock SKUs, 7/30 day sales velocity, suggested restock quantities.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "get_disputes",
      description: "Open disputes and amounts at risk.",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Find products in this store by title or SKU.",
      parameters: {
        type: "object",
        properties: { query: { type: "string" } },
        required: ["query"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "draft_catalog_copy",
      description: "Propose title/description/SEO for a product. Does not save until the seller applies.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string" },
          title: { type: "string" },
          description: { type: "string" },
        },
        required: ["productId"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "draft_coupon",
      description: "Propose a coupon. Does not create until the seller applies.",
      parameters: {
        type: "object",
        properties: {
          code: { type: "string" },
          type: { type: "string", enum: ["percentage", "fixed"] },
          value: { type: "number" },
          minimumOrderAmount: { type: "number" },
        },
        required: ["code", "type", "value"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "draft_price_change",
      description: "Propose a new product price. Does not save until applied.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string" },
          price: { type: "number" },
        },
        required: ["productId", "price"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "draft_restock",
      description: "Propose adding stock units. Does not save until applied.",
      parameters: {
        type: "object",
        properties: {
          productId: { type: "string" },
          addUnits: { type: "number" },
        },
        required: ["productId", "addUnits"],
      },
    },
  },
];

function periodStart(period: string): Date {
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  return new Date(Date.now() - days * 24 * 3600 * 1000);
}

function fact(source: string, data: Record<string, unknown>) {
  return { currency: DEFAULT_CURRENCY, asOf: new Date().toISOString(), source, ...data };
}

function action(
  type: IAiAction["type"],
  previewLabel: string,
  payload: Record<string, unknown>,
): { proposedAction: IAiAction } {
  return {
    proposedAction: {
      actionId: crypto.randomUUID(),
      type,
      status: "proposed",
      previewLabel,
      payload,
    },
  };
}

export function citationForTool(name: string): { source: string; asOf: Date } {
  return { source: SOURCE[name] ?? name, asOf: new Date() };
}

export async function runPartnerTool(
  sellerId: string,
  name: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  const store = await getSellerStore(sellerId);
  const storeId = store._id;

  if (name === "get_wallet") {
    const wallet = await getOrCreateWallet(sellerId);
    const recent = await WalletTransaction.find({ sellerId, type: "withdrawal" })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();
    return fact("Wallet", {
      available: wallet.balance,
      pending: wallet.pendingBalance,
      recentPayouts: recent.map((t) => ({
        amount: t.amount,
        status: t.status,
        createdAt: t.createdAt,
      })),
    });
  }

  if (name === "get_escrow_summary") {
    const locked = await Order.aggregate([
      { $match: { storeId, escrowStatus: "locked", paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$payoutAmount" }, count: { $sum: 1 } } },
    ]);
    return fact("Escrow", {
      lockedAmount: locked[0]?.total ?? 0,
      lockedOrders: locked[0]?.count ?? 0,
    });
  }

  if (name === "get_revenue") {
    const period = String(args.period ?? "30d");
    const start = periodStart(period);
    const plan = await getSellerPlan(sellerId);
    const commissionPercent = plan?.commissionPercent ?? 10;
    const rows = await Order.aggregate([
      { $match: { storeId, paymentStatus: "paid", createdAt: { $gte: start } } },
      {
        $group: {
          _id: null,
          gmv: { $sum: "$totalAmount" },
          commission: { $sum: "$commissionAmount" },
          net: { $sum: "$payoutAmount" },
          orders: { $sum: 1 },
        },
      },
    ]);
    const r = rows[0] ?? { gmv: 0, commission: 0, net: 0, orders: 0 };
    return fact("Orders", {
      period,
      gmv: r.gmv,
      platformCommission: r.commission,
      netAfterFees: r.net,
      orderCount: r.orders,
      planCommissionPercent: commissionPercent,
      note: "netAfterFees is GMV minus platform commission, not after product cost (COGS unknown).",
    });
  }

  if (name === "get_order_health") {
    const byStatus = await Order.aggregate([
      { $match: { storeId } },
      { $group: { _id: "$deliveryStatus", count: { $sum: 1 } } },
    ]);
    const delayed = await Order.countDocuments({
      storeId,
      paymentStatus: "paid",
      deliveryStatus: "processing",
      createdAt: { $lt: new Date(Date.now() - 3 * 24 * 3600 * 1000) },
    });
    const unconfirmed = await Order.countDocuments({
      storeId,
      paymentStatus: "paid",
      deliveryStatus: "delivered",
      escrowStatus: "locked",
    });
    return fact("Orders", {
      byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
      delayedFulfillment: delayed,
      deliveredAwaitingConfirm: unconfirmed,
    });
  }

  if (name === "get_inventory") {
    const products = await Product.find({ storeId, status: { $ne: "archived" } })
      .select("title stock price sku")
      .lean();
    const since7 = new Date(Date.now() - 7 * 24 * 3600 * 1000);
    const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const sold = await Order.aggregate([
      { $match: { storeId, paymentStatus: "paid", createdAt: { $gte: since30 } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.productId",
          sold30: { $sum: "$items.quantity" },
          sold7: {
            $sum: { $cond: [{ $gte: ["$createdAt", since7] }, "$items.quantity", 0] },
          },
        },
      },
    ]);
    const velocity = new Map(sold.map((s) => [String(s._id), s]));
    const rows = products.map((p) => {
      const v = velocity.get(String(p._id));
      const sold7 = v?.sold7 ?? 0;
      const sold30 = v?.sold30 ?? 0;
      const daily = sold30 / 30;
      const coverDays = daily > 0 ? Math.round(p.stock / daily) : null;
      const suggested = daily > 0 ? Math.max(0, Math.ceil(daily * 14 - p.stock)) : 0;
      return {
        productId: String(p._id),
        title: p.title,
        sku: p.sku,
        stock: p.stock,
        sold7,
        sold30,
        coverDays,
        suggestedRestock: suggested,
      };
    });
    rows.sort((a, b) => (a.coverDays ?? 999) - (b.coverDays ?? 999));
    return fact("Inventory", { products: rows.slice(0, 25) });
  }

  if (name === "get_disputes") {
    const open = await Dispute.find({ storeId, status: { $in: ["Open", "In Progress"] } })
      .select("reason status refundAmount createdAt orderId")
      .limit(20)
      .lean();
    const atRisk = open.reduce((sum, d) => sum + (d.refundAmount ?? 0), 0);
    return fact("Disputes", {
      openCount: open.length,
      amountAtRisk: atRisk,
      items: open.map((d) => ({
        id: String(d._id),
        reason: d.reason,
        status: d.status,
        refundAmount: d.refundAmount ?? 0,
        createdAt: d.createdAt,
      })),
    });
  }

  if (name === "search_products") {
    const q = String(args.query ?? "").trim();
    const items = await Product.find({
      storeId,
      status: { $ne: "archived" },
      $or: [
        { title: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
        { sku: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") },
      ],
    })
      .select("title price stock sku status")
      .limit(10)
      .lean();
    return fact("Catalog", {
      items: items.map((p) => ({
        productId: String(p._id),
        title: p.title,
        price: p.price,
        stock: p.stock,
        sku: p.sku,
        status: p.status,
      })),
    });
  }

  if (name === "draft_catalog_copy") {
    const product = await Product.findOne({ _id: args.productId, storeId });
    if (!product) return { error: "Product not found in this store" };
    const title = await improveTitle({ title: product.title, description: product.description });
    const desc = await rewriteDescription({
      title: product.title,
      description: product.description,
    });
    const seo = await generateSeo({ name: product.title, description: product.description });
    const nextTitle = title.suggestions[0] ?? product.title;
    return {
      ...action("catalog", `Update copy for ${product.title}`, {
        productId: String(product._id),
        title: nextTitle,
        description: desc.description,
        highlights: desc.highlights,
        seo,
      }),
      source: "Catalog",
      asOf: new Date().toISOString(),
    };
  }

  if (name === "draft_coupon") {
    const code = String(args.code).toUpperCase();
    const type = args.type === "fixed" ? "fixed" : "percentage";
    const value = Number(args.value);
    return {
      ...action("coupon", `Create coupon ${code} (${type} ${value})`, {
        code,
        type,
        value,
        minimumOrderAmount: args.minimumOrderAmount ?? null,
        isActive: true,
        appliesTo: "all",
      }),
      source: "Coupons",
      asOf: new Date().toISOString(),
    };
  }

  if (name === "draft_price_change") {
    const product = await Product.findOne({ _id: args.productId, storeId });
    if (!product) return { error: "Product not found in this store" };
    const price = Number(args.price);
    return {
      ...action("price", `Set ${product.title} to ${DEFAULT_CURRENCY} ${price}`, {
        productId: String(product._id),
        price,
      }),
      source: "Catalog",
      asOf: new Date().toISOString(),
    };
  }

  if (name === "draft_restock") {
    const product = await Product.findOne({ _id: args.productId, storeId });
    if (!product) return { error: "Product not found in this store" };
    const addUnits = Math.max(0, Math.floor(Number(args.addUnits)));
    return {
      ...action("restock", `Add ${addUnits} units to ${product.title}`, {
        productId: String(product._id),
        addUnits,
        currentStock: product.stock,
      }),
      source: "Inventory",
      asOf: new Date().toISOString(),
    };
  }

  return { error: `Unknown tool ${name}` };
}
