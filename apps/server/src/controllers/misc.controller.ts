import type { Request, Response } from "express";
import * as walletService from "../services/wallet.service";
import * as couponService from "../services/coupon.service";
import * as reviewService from "../services/review.service";
import * as wishlistService from "../services/wishlist.service";
import * as blogService from "../services/blog.service";
import * as analyticsService from "../services/analytics.service";
import * as notificationService from "../services/notification.service";
import * as ticketService from "../services/ticket.service";
import * as disputeService from "../services/dispute.service";
import * as aiService from "../services/ai.service";
import * as adminService from "../services/admin.service";
import { getSettings, updateSettings } from "../services/settings.service";
import { uploadFile } from "../utils/upload.util";
import { APP_NAME } from "../config/constants.config";
import { asyncHandler } from "../utils/async-handler.util";
import { sendSuccess } from "../utils/api-response.util";
import { getPagination, paginationMeta } from "../utils/pagination.util";
import { ApiError } from "../utils/api-error.util";
import { SellerReferral } from "../models/seller-referral.model";
import { BuyerReferral } from "../models/buyer-referral.model";

export const health = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, { status: "ok", app: APP_NAME, time: new Date().toISOString() });
});

export const wallet = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await walletService.getOrCreateWallet(String(req.user!._id)));
});

export const walletTx = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await walletService.listTransactions(String(req.user!._id), {
    type: req.query.type as string,
    status: req.query.status as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const withdraw = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await walletService.requestWithdrawal(String(req.user!._id), req.body.amount), "Withdrawal requested");
});

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await couponService.createCoupon(String(req.user!._id), req.body), "Created", 201);
});

export const listCoupons = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await couponService.listCoupons(String(req.user!._id), {
    isActive: req.query.isActive === undefined ? undefined : req.query.isActive === "true",
    search: req.query.search as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await couponService.updateCoupon(String(req.user!._id), req.params.couponId, req.body));
});

export const toggleCoupon = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await couponService.toggleCoupon(String(req.user!._id), req.params.couponId));
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await couponService.deleteCoupon(String(req.user!._id), req.params.couponId));
});

export const couponUsage = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await couponService.couponUsage(String(req.user!._id), req.params.couponId));
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await reviewService.createReview(String(req.buyer!._id), String(req.store!._id), req.body),
    "Review submitted",
    201,
  );
});

export const sellerReviews = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await reviewService.listSellerReviews(String(req.user!._id), {
    rating: req.query.rating ? Number(req.query.rating) : undefined,
    status: req.query.status as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const replyReview = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await reviewService.sellerReply(String(req.user!._id), req.params.reviewId, req.body.text));
});

export const toggleWish = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await wishlistService.toggleWishlist(String(req.buyer!._id), String(req.store!._id), req.body.productId));
});

export const getWish = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await wishlistService.getWishlist(String(req.buyer!._id), String(req.store!._id)));
});

export const clearWish = asyncHandler(async (req: Request, res: Response) => {
  await wishlistService.clearWishlist(String(req.buyer!._id), String(req.store!._id));
  sendSuccess(res, null, "Wishlist cleared");
});

export const createBlog = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await blogService.createPost(String(req.user!._id), req.body), "Created", 201);
});

export const listBlog = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await blogService.listPosts(String(req.user!._id), {
    status: req.query.status as string,
    search: req.query.search as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const getBlog = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await blogService.getPost(String(req.user!._id), req.params.postId));
});

export const updateBlog = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await blogService.updatePost(String(req.user!._id), req.params.postId, req.body));
});

export const publishBlog = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await blogService.publishPost(String(req.user!._id), req.params.postId));
});

export const unpublishBlog = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await blogService.unpublishPost(String(req.user!._id), req.params.postId));
});

export const archiveBlog = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await blogService.archivePost(String(req.user!._id), req.params.postId));
});

export const analyticsOverview = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await analyticsService.sellerOverview(String(req.user!._id)));
});
export const analyticsTrend = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await analyticsService.revenueTrend(
      String(req.user!._id),
      (req.query.period as string) || "30d",
      (req.query.groupBy as string) || "day",
    ),
  );
});
export const analyticsTop = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await analyticsService.topProducts(
      String(req.user!._id),
      Number(req.query.limit) || 10,
      (req.query.sortBy as string) || "revenue",
    ),
  );
});
export const analyticsStatus = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await analyticsService.orderStatusBreakdown(String(req.user!._id)));
});
export const analyticsCustomers = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await analyticsService.customerAnalytics(String(req.user!._id)));
});
export const analyticsProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await analyticsService.productPerformance(String(req.user!._id), skip, limit);
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const recipientId = String((req.user ?? req.buyer)!._id);
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await notificationService.listNotifications({
    recipientId,
    isRead: req.query.isRead === undefined ? undefined : req.query.isRead === "true",
    type: req.query.type as string,
    page,
    limit,
    skip,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const unreadNotifications = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, {
    count: await notificationService.unreadCount(String((req.user ?? req.buyer)!._id)),
  });
});

export const readNotification = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await notificationService.markRead(String((req.user ?? req.buyer)!._id), req.params.notificationId),
  );
});

export const readAllNotifications = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.markAllRead(String((req.user ?? req.buyer)!._id));
  sendSuccess(res, null, "All read");
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  await notificationService.deleteNotification(String((req.user ?? req.buyer)!._id), req.params.notificationId);
  sendSuccess(res, null, "Deleted");
});

export const createTicket = asyncHandler(async (req: Request, res: Response) => {
  const isBuyer = Boolean(req.buyer);
  sendSuccess(
    res,
    await ticketService.createTicket({
      userId: String((req.user ?? req.buyer)!._id),
      userType: isBuyer ? "buyer" : "seller",
      storeId: req.store ? String(req.store._id) : undefined,
      topic: req.body.topic,
      subject: req.body.subject,
      message: req.body.message,
      attachments: req.body.attachments,
      senderName: (req.user ?? req.buyer)!.name,
    }),
    "Ticket created",
    201,
  );
});

export const listTickets = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await ticketService.listUserTickets(String((req.user ?? req.buyer)!._id), {
    status: req.query.status as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const getTicket = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await ticketService.getUserTicket(String((req.user ?? req.buyer)!._id), req.params.ticketId));
});

export const replyTicket = asyncHandler(async (req: Request, res: Response) => {
  const isBuyer = Boolean(req.buyer);
  sendSuccess(
    res,
    await ticketService.addUserMessage(
      String((req.user ?? req.buyer)!._id),
      req.params.ticketId,
      (req.user ?? req.buyer)!.name,
      isBuyer ? "buyer" : "seller",
      req.body.message,
      req.body.attachments,
    ),
  );
});

export const sellerDisputes = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await disputeService.listSellerDisputes(String(req.user!._id), skip, limit);
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const buyerDisputes = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await disputeService.listBuyerDisputes(
    String(req.buyer!._id),
    String(req.store!._id),
    skip,
    limit,
  );
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const getDispute = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await disputeService.getAccessibleDispute(req.params.disputeId, {
      sellerId: req.user ? String(req.user._id) : undefined,
      buyerId: req.buyer ? String(req.buyer._id) : undefined,
      admin: req.user?.role === "admin",
    }),
  );
});

export const messageDispute = asyncHandler(async (req: Request, res: Response) => {
  const dispute = await disputeService.getAccessibleDispute(req.params.disputeId, {
    sellerId: req.user && req.user.role !== "admin" ? String(req.user._id) : undefined,
    buyerId: req.buyer ? String(req.buyer._id) : undefined,
    admin: req.user?.role === "admin",
  });
  const role = req.user?.role === "admin" ? "admin" : req.buyer ? "buyer" : "seller";
  const actor = req.user ?? req.buyer;
  if (!actor) throw ApiError.unauthorized();
  sendSuccess(
    res,
    await disputeService.addDisputeMessage(
      dispute,
      { id: String(actor._id), role, name: actor.name },
      req.body.message,
      req.body.attachments,
    ),
  );
});

export const aiTitle = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await aiService.improveTitle(req.body));
});
export const aiDescription = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await aiService.rewriteDescription(req.body));
});
export const aiSeo = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await aiService.generateSeo(req.body));
});

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");
  const url = await uploadFile(req.file, "uploads/images");
  sendSuccess(res, { url });
});

export const uploadDocument = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) throw ApiError.badRequest("No file uploaded");
  const url = await uploadFile(req.file, "uploads/documents");
  sendSuccess(res, { url });
});

export const myReferrals = asyncHandler(async (req: Request, res: Response) => {
  if (req.buyer) {
    sendSuccess(res, {
      code: req.buyer.referralCode,
      referrals: await BuyerReferral.find({ referrerId: req.buyer._id }),
    });
    return;
  }
  sendSuccess(res, {
    code: req.user!.referralCode,
    referrals: await SellerReferral.find({ referrerId: req.user!._id }),
  });
});

export const getPlatformSettings = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await getSettings());
});

export const updatePlatformSettings = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await updateSettings(req.body));
});

export { adminService };
