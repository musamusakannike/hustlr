import type { Request, Response } from "express";
import * as orderService from "../services/order.service";
import { asyncHandler } from "../utils/async-handler.util";
import { sendSuccess } from "../utils/api-response.util";
import { getPagination, paginationMeta } from "../utils/pagination.util";

export const list = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await orderService.listSellerOrders(String(req.user!._id), {
    deliveryStatus: req.query.deliveryStatus as string,
    paymentStatus: req.query.paymentStatus as string,
    search: req.query.search as string,
    from: req.query.from as string,
    to: req.query.to as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const stats = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await orderService.sellerOrderStats(String(req.user!._id)));
});

export const detail = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await orderService.getSellerOrder(String(req.user!._id), req.params.orderId));
});

export const ship = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await orderService.markShipped(
      String(req.user!._id),
      req.params.orderId,
      req.body.trackingNumber,
      req.body.trackingNote,
    ),
    "Marked shipped",
  );
});

export const inTransit = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await orderService.markInTransit(String(req.user!._id), req.params.orderId));
});

export const delivered = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await orderService.markDelivered(String(req.user!._id), req.params.orderId));
});

export const invoice = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.getSellerOrder(String(req.user!._id), req.params.orderId);
  sendSuccess(res, { url: order.invoiceUrl });
});
