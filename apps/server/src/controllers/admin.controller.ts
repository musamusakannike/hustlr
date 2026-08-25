import type { Request, Response } from "express";
import * as adminService from "../services/admin.service";
import * as walletService from "../services/wallet.service";
import * as disputeService from "../services/dispute.service";
import * as reviewService from "../services/review.service";
import * as ticketService from "../services/ticket.service";
import { asyncHandler } from "../utils/async-handler.util";
import { sendSuccess } from "../utils/api-response.util";
import { getPagination, paginationMeta } from "../utils/pagination.util";
import { toCsv } from "../utils/csv.util";
import { AuditLog } from "../models/audit-log.model";
import { PlatformTransaction } from "../models/platform-transaction.model";

export const users = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await adminService.listUsers({
    role: req.query.role as string,
    search: req.query.search as string,
    banned: req.query.banned as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const usersStats = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await adminService.userStats());
});

export const user = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.getUser(req.params.userId));
});

export const banUser = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.banUser(req.params.userId, req.body.reason), "User banned");
});

export const unbanUser = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.unbanUser(req.params.userId), "User unbanned");
});

export const promote = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.promoteAdmin(req.params.userId), "Promoted to admin");
});

export const exportUsers = asyncHandler(async (_req: Request, res: Response) => {
  const csv = await adminService.exportUsersCsv();
  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=users.csv");
  res.send(csv);
});

export const buyers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await adminService.listBuyers({
    storeId: req.query.storeId as string,
    search: req.query.search as string,
    banned: req.query.banned as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const buyer = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.getBuyer(req.params.buyerProfileId));
});

export const banBuyer = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.banBuyer(req.params.buyerProfileId, req.body.reason));
});

export const stores = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await adminService.listStores({
    isLive: req.query.isLive as string,
    search: req.query.search as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});

export const store = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.getStoreAdmin(req.params.storeId));
});

export const toggleLive = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.toggleStoreLive(req.params.storeId, Boolean(req.body.live)));
});

export const overview = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await adminService.platformOverview());
});
export const gmv = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.gmvTrend((req.query.period as string) || "30d"));
});
export const topStores = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await adminService.topStores());
});
export const plansAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await adminService.planAnalytics());
});
export const kycFunnel = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await adminService.kycFunnel());
});
export const disputesAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await adminService.disputeAnalytics());
});
export const payoutsAnalytics = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await adminService.payoutAnalytics());
});

export const payouts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await walletService.listPayouts({
    status: req.query.status as string,
    search: req.query.search as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});
export const approvePayout = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await walletService.approvePayout(req.params.id));
});
export const dispatchPayout = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await walletService.dispatchPayout(req.params.id));
});
export const rejectPayout = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await walletService.rejectPayout(req.params.id, req.body.rejectionReason));
});

export const disputes = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await disputeService.listAdminDisputes({
    status: req.query.status as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});
export const dispute = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await disputeService.getAccessibleDispute(req.params.disputeId, { admin: true }));
});
export const resolveDispute = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await disputeService.resolveDispute(req.params.disputeId, req.body));
});

export const reviews = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await reviewService.adminListReviews({
    status: req.query.status as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});
export const hideReview = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await reviewService.setReviewStatus(req.params.reviewId, "hidden"));
});
export const flagReview = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await reviewService.setReviewStatus(req.params.reviewId, "flagged"));
});
export const publishReview = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await reviewService.setReviewStatus(req.params.reviewId, "published"));
});
export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  await reviewService.deleteReview(req.params.reviewId);
  sendSuccess(res, null, "Deleted");
});

export const tickets = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await ticketService.listAdminTickets({
    status: req.query.status as string,
    priority: req.query.priority as string,
    topic: req.query.topic as string,
    userType: req.query.userType as string,
    search: req.query.search as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});
export const ticketPending = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, { count: await ticketService.pendingCount() });
});
export const ticketUnread = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, { count: await ticketService.unreadAdminCount() });
});
export const ticket = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await ticketService.getAdminTicket(req.params.ticketId));
});
export const ticketReply = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await ticketService.addAdminMessage(
      req.params.ticketId,
      String(req.user!._id),
      req.user!.name,
      req.body.message,
      req.body.attachments,
    ),
  );
});
export const ticketStatus = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await ticketService.setTicketStatus(req.params.ticketId, req.body.status));
});

export const templates = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.listAdminTemplates(req.query as Record<string, unknown>));
});
export const createTemplate = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.createTemplate(req.body), "Created", 201);
});
export const updateTemplate = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.updateTemplate(req.params.templateId, req.body));
});
export const deactivateTemplate = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.deactivateTemplate(req.params.templateId));
});
export const deleteTemplate = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteTemplate(req.params.templateId);
  sendSuccess(res, null, "Template deleted successfully");
});

export const listTemplateSections = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.listTemplateSections(req.query as Record<string, unknown>));
});
export const createTemplateSection = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.createTemplateSection(req.body), "Created", 201);
});
export const updateTemplateSection = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.updateTemplateSection(req.params.sectionId, req.body));
});
export const deleteTemplateSection = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteTemplateSection(req.params.sectionId);
  sendSuccess(res, null, "Section deleted");
});
export const previewTemplateSection = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.previewTemplateSection(req.body));
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.createGlobalCategory(req.body), "Created", 201);
});
export const listCategories = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await adminService.listGlobalCategories());
});
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.updateGlobalCategory(req.params.categoryId, req.body));
});
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  await adminService.deleteGlobalCategory(req.params.categoryId);
  sendSuccess(res, null, "Deactivated");
});

export const auditLogs = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await adminService.listAuditLogs({
    action: req.query.action as string,
    category: req.query.category as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});
export const auditLog = asyncHandler(async (req: Request, res: Response) => {
  const log = await AuditLog.findById(req.params.logId);
  sendSuccess(res, log);
});
export const auditOptions = asyncHandler(async (_req: Request, res: Response) => {
  const [actions, categories] = await Promise.all([
    AuditLog.distinct("action"),
    AuditLog.distinct("category"),
  ]);
  sendSuccess(res, { actions, categories });
});
export const auditExport = asyncHandler(async (_req: Request, res: Response) => {
  const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(5000).lean();
  const csv = toCsv(logs as unknown as Record<string, unknown>[]);
  res.setHeader("Content-Type", "text/csv");
  res.send(csv);
});

export const transactions = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const { items, total } = await adminService.listTransactionsAdmin({
    type: req.query.type as string,
    skip,
    limit,
  });
  sendSuccess(res, { items, meta: paginationMeta(total, page, limit) });
});
export const transaction = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await PlatformTransaction.findById(req.params.id));
});
export const transactionStats = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await adminService.transactionStats());
});
export const transactionExport = asyncHandler(async (_req: Request, res: Response) => {
  const rows = await PlatformTransaction.find().sort({ createdAt: -1 }).limit(5000).lean();
  res.setHeader("Content-Type", "text/csv");
  res.send(toCsv(rows as unknown as Record<string, unknown>[]));
});

export const sellerReferrals = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await adminService.listSellerReferrals());
});
export const buyerReferrals = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await adminService.listBuyerReferrals());
});
export const reverseReferral = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.reverseReferral(req.params.id));
});

export const orders = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, skip } = getPagination(req);
  const result = await adminService.listOrdersAdmin({
    search: req.query.search as string,
    paymentStatus: req.query.paymentStatus as string,
    deliveryStatus: req.query.deliveryStatus as string,
    from: req.query.from as string,
    to: req.query.to as string,
    skip,
    limit,
  });
  sendSuccess(res, result);
});

export const order = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.getOrderAdmin(req.params.orderId));
});

export const updateOrderAddress = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.updateOrderAddressAdmin(req.params.orderId, req.body.shippingAddress || req.body));
});

export const confirmOrder = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.confirmOrderAdmin(req.params.orderId));
});

export const cancelOrder = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.cancelOrderAdmin(req.params.orderId, req.body.reason));
});

