import { DEFAULT_CURRENCY, DEFAULT_CURRENCY_SYMBOL } from "../config/constants.config";
import { env } from "../config/env.config";
import { Cart } from "../models/cart.model";
import { Product } from "../models/product.model";
import { Order } from "../models/order.model";
import { BuyerProfile, type IBuyerProfile } from "../models/buyer-profile.model";
import { Store, type IStore } from "../models/store.model";
import { User } from "../models/user.model";
import { PlatformTransaction } from "../models/platform-transaction.model";
import type { IShippingAddress } from "../models/buyer-profile.model";
import { ApiError } from "../utils/api-error.util";
import { generateOrderPdfs } from "../utils/pdf.util";
import { APP_DOMAIN } from "../config/constants.config";
import { getCartView } from "./cart.service";
import { markCouponUsed, validateCouponForStore } from "./coupon.service";
import { commissionForSeller, nextOrderNumber } from "./order.service";
import { decrementStock, restoreStock } from "./product.service";
import { initializeTransaction, verifyTransaction } from "./paystack.service";
import { createNotification } from "./notification.service";

async function buildQuote(
  buyerProfileId: string,
  storeId: string,
  couponCode?: string,
) {
  const view = await getCartView(buyerProfileId, storeId);
  if (!view.items.length) throw ApiError.badRequest("Cart is empty");
  const detailed = [];
  for (const item of view.items) {
    if (!item.available || !item.product) throw ApiError.badRequest("A cart item is no longer available");
    if (item.quantity > item.stock) throw ApiError.badRequest(`Insufficient stock for ${item.product.title}`);
    const product = await Product.findById(item.productId);
    if (!product) throw ApiError.badRequest("Product missing");
    detailed.push({
      item,
      product,
      lineTotal: item.currentPrice * item.quantity,
    });
  }
  const subtotal = detailed.reduce((s, d) => s + d.lineTotal, 0);
  const shippingTotal = detailed.reduce((s, d) => s + d.product.shippingFee * d.item.quantity, 0);
  let discountAmount = 0;
  let coupon = null;
  if (couponCode) {
    const result = await validateCouponForStore(storeId, couponCode, {
      subtotal,
      buyerProfileId,
      items: detailed.map((d) => ({ product: d.product, lineTotal: d.lineTotal })),
    });
    discountAmount = result.discount;
    coupon = result.coupon;
  }
  const totalAmount = Math.max(0, Math.round((subtotal + shippingTotal - discountAmount) * 100) / 100);
  return { detailed, subtotal, shippingTotal, discountAmount, totalAmount, coupon };
}

export async function initiateCheckout(
  buyer: IBuyerProfile,
  store: IStore,
  input: { shippingAddress: IShippingAddress; couponCode?: string; saveAddress?: boolean },
) {
  const quote = await buildQuote(String(buyer._id), String(store._id), input.couponCode);
  if (input.saveAddress) {
    if (input.shippingAddress.isDefault) {
      buyer.shippingAddresses.forEach((a) => {
        a.isDefault = false;
      });
    }
    buyer.shippingAddresses.push(input.shippingAddress);
    await buyer.save();
  }
  const commissionPercent = await commissionForSeller(String(store.sellerId));
  const commissionAmount = Math.round((quote.totalAmount * commissionPercent) / 100 * 100) / 100;
  const payoutAmount = Math.round((quote.totalAmount - commissionAmount) * 100) / 100;
  const orderNumber = await nextOrderNumber(store);
  const order = await Order.create({
    buyerProfileId: buyer._id,
    storeId: store._id,
    sellerId: store.sellerId,
    orderNumber,
    items: quote.detailed.map((d) => ({
      productId: d.product._id,
      title: d.product.title,
      price: d.item.currentPrice,
      quantity: d.item.quantity,
      selectedVariants: d.item.selectedVariants,
      image: d.product.images[0] ?? "",
      shippingFee: d.product.shippingFee,
    })),
    shippingAddress: input.shippingAddress,
    subtotal: quote.subtotal,
    shippingTotal: quote.shippingTotal,
    discountAmount: quote.discountAmount,
    couponCode: input.couponCode?.toUpperCase() ?? "",
    totalAmount: quote.totalAmount,
    currency: store.currency || DEFAULT_CURRENCY,
    paymentStatus: "pending",
    deliveryStatus: "processing",
    commissionPercent,
    commissionAmount,
    payoutAmount,
    escrowStatus: "locked",
  });
  const callbackUrl = store.customDomainVerified && store.customDomain
    ? `https://${store.customDomain}/order-confirmation`
    : `https://${store.slug}.${env.isProd ? APP_DOMAIN : env.devPlatformDomain}:${env.isProd ? "" : "3000"}/order-confirmation`.replace(":3000", env.isProd ? "" : ":3000").replace("https://", env.isProd ? "https://" : "http://");
  const pay = await initializeTransaction({
    email: buyer.email,
    amount: quote.totalAmount,
    reference: orderNumber,
    callbackUrl,
    metadata: {
      orderId: String(order._id),
      storeId: String(store._id),
      buyerProfileId: String(buyer._id),
      type: "order",
    },
  });
  order.paymentReference = pay.reference;
  await order.save();
  return { order, authorizationUrl: pay.authorizationUrl, reference: pay.reference };
}

export async function fulfillPaidOrder(order: InstanceType<typeof Order>) {
  if (order.paymentStatus === "paid") return order;
  order.paymentStatus = "paid";
  order.paidAt = new Date();
  order.deliveryStatus = "processing";
  order.escrowStatus = "locked";
  for (const item of order.items) {
    await decrementStock(String(item.productId), item.quantity, item.selectedVariants);
  }
  if (order.couponCode) {
    try {
      const { coupon } = await validateCouponForStore(String(order.storeId), order.couponCode, {
        buyerProfileId: String(order.buyerProfileId),
      });
      await markCouponUsed(coupon, String(order.buyerProfileId), String(order._id));
    } catch {
      // coupon may have been validated at initiate
    }
  }
  await Cart.findOneAndUpdate(
    { buyerProfileId: order.buyerProfileId, storeId: order.storeId },
    { items: [] },
  );
  const store = await Store.findById(order.storeId);
  if (store) {
    try {
      const pdfs = await generateOrderPdfs(order, store);
      order.receiptUrl = pdfs.receiptUrl;
      order.invoiceUrl = pdfs.invoiceUrl;
    } catch {
      // PDF/R2 optional
    }
  }
  await order.save();
  await PlatformTransaction.create({
    type: "order_payment",
    amount: order.totalAmount,
    currency: order.currency,
    gateway: "paystack",
    reference: order.orderNumber,
    status: "success",
    sellerId: order.sellerId,
    storeId: order.storeId,
    buyerProfileId: order.buyerProfileId,
    orderId: order._id,
  });
  const buyer = await BuyerProfile.findById(order.buyerProfileId);
  const seller = await User.findById(order.sellerId);
  if (buyer) {
    await createNotification({
      recipientId: buyer._id,
      recipientType: "buyer",
      storeId: order.storeId,
      type: "order_new",
      title: "Order confirmed",
      message: `Order ${order.orderNumber} totaling ${DEFAULT_CURRENCY_SYMBOL}${order.totalAmount} is paid.`,
      link: `/orders/${order._id}`,
      email: {
        to: buyer.email,
        templateName: "orderConfirmationBuyer",
        data: {
          name: buyer.name,
          storeName: store?.name ?? "",
          orderNumber: order.orderNumber,
          amount: order.totalAmount,
          currencySymbol: store?.currencySymbol ?? DEFAULT_CURRENCY_SYMBOL,
        },
      },
    });
  }
  if (seller) {
    await createNotification({
      recipientId: seller._id,
      recipientType: "seller",
      type: "order_new",
      title: "New order received",
      message: `Order ${order.orderNumber} worth ${DEFAULT_CURRENCY_SYMBOL}${order.totalAmount}`,
      link: `/dashboard/orders/${order._id}`,
      email: {
        to: seller.email,
        templateName: "newOrderSeller",
        data: {
          name: seller.name,
          orderNumber: order.orderNumber,
          amount: order.totalAmount,
          currencySymbol: store?.currencySymbol ?? DEFAULT_CURRENCY_SYMBOL,
        },
      },
    });
  }
  return order;
}

export async function failOrder(order: InstanceType<typeof Order>) {
  if (order.paymentStatus === "paid") return order;
  order.paymentStatus = "failed";
  await order.save();
  return order;
}

export async function verifyCheckout(reference: string) {
  const result = await verifyTransaction(reference);
  const order = await Order.findOne({
    $or: [{ orderNumber: reference }, { paymentReference: reference }],
  });
  if (!order) throw ApiError.notFound("Order not found");
  if (result.success) return fulfillPaidOrder(order);
  await failOrder(order);
  throw ApiError.badRequest("Payment was not successful");
}

export async function handlePaystackWebhook(event: string, data: Record<string, unknown>) {
  const reference = String(data.reference ?? "");
  if (!reference) return;
  if (event === "charge.success") {
    const metadata = (data.metadata ?? {}) as { type?: string; orderId?: string };
    if (metadata.type === "order" || data.channel) {
      const order = await Order.findOne({
        $or: [{ orderNumber: reference }, { paymentReference: reference }, { _id: metadata.orderId }],
      });
      if (order) await fulfillPaidOrder(order);
    }
  }
  if (event === "charge.failed") {
    const order = await Order.findOne({ $or: [{ orderNumber: reference }, { paymentReference: reference }] });
    if (order && order.paymentStatus !== "paid") await failOrder(order);
  }
}
