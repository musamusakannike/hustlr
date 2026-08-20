import type { Request, Response } from "express";
import * as checkoutService from "../services/checkout.service";
import * as orderService from "../services/order.service";
import { completeTransfer } from "../services/wallet.service";
import { verifyPaystackSignature } from "../services/paystack.service";
import { asyncHandler } from "../utils/async-handler.util";
import { sendSuccess } from "../utils/api-response.util";
import { ApiError } from "../utils/api-error.util";
import { verifySubscriptionPayment } from "../services/subscription.service";

export const initiate = asyncHandler(async (req: Request, res: Response) => {
  const data = await checkoutService.initiateCheckout(req.buyer!, req.store!, req.body);
  sendSuccess(res, data, "Checkout initialized");
});

export const verify = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await checkoutService.verifyCheckout(req.body.reference), "Payment verified");
});

export const paystackWebhook = asyncHandler(async (req: Request, res: Response) => {
  const raw = (req as Request & { rawBody?: Buffer }).rawBody ?? Buffer.from(JSON.stringify(req.body));
  if (!verifyPaystackSignature(raw, req.header("x-paystack-signature"))) {
    throw ApiError.unauthorized("Invalid Paystack signature");
  }
  const event = req.body.event as string;
  const data = req.body.data as Record<string, unknown>;
  if (event === "charge.success" || event === "charge.failed") {
    const meta = (data?.metadata ?? {}) as { type?: string };
    if (meta.type === "subscription") {
      if (event === "charge.success") await verifySubscriptionPayment(String(data.reference));
    } else {
      await checkoutService.handlePaystackWebhook(event, data);
    }
  }
  if (event === "transfer.success") await completeTransfer(String(data.reference), true);
  if (event === "transfer.failed" || event === "transfer.reversed") {
    await completeTransfer(String(data.reference), false);
  }
  sendSuccess(res, { received: true });
});

export const buyerOrders = asyncHandler(async (req: Request, res: Response) => {
  const { getPagination, paginationMeta } = await import("../utils/pagination.util");
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await orderService.listBuyerOrders(
    String(req.buyer!._id),
    String(req.store!._id),
    { deliveryStatus: req.query.deliveryStatus as string, skip, limit },
  );
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const buyerOrder = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await orderService.getBuyerOrder(String(req.buyer!._id), String(req.store!._id), req.params.orderId),
  );
});

export const confirmReceipt = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getBuyerOrder(
    String(req.buyer!._id),
    String(req.store!._id),
    req.params.orderId,
  );
  sendSuccess(res, await orderService.confirmOrder(order), "Order confirmed");
});

export const openDispute = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await orderService.openDispute(String(req.buyer!._id), String(req.store!._id), req.params.orderId, req.body),
    "Dispute opened",
    201,
  );
});

export const receipt = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getBuyerOrder(
    String(req.buyer!._id),
    String(req.store!._id),
    req.params.orderId,
  );
  sendSuccess(res, { url: order.receiptUrl });
});
