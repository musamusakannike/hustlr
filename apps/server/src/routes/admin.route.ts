import { Router } from "express";
import * as admin from "../controllers/admin.controller";
import * as kyc from "../controllers/kyc.controller";
import * as subscription from "../controllers/subscription.controller";
import * as misc from "../controllers/misc.controller";
import { protectAdmin } from "../middlewares/auth.middleware";
import { auditRequest } from "../middlewares/audit.middleware";
import { validate } from "../middlewares/validate.middleware";
import { rejectSchema, requestInfoSchema } from "../validations/kyc.validation";
import { messageSchema, resolveDisputeSchema } from "../validations/commerce.validation";
import Joi from "joi";

const router = Router();
router.use(protectAdmin);

router.get("/users/stats", admin.usersStats);
router.get("/users/export", admin.exportUsers);
router.get("/users", admin.users);
router.get("/users/:userId", admin.user);
router.patch("/users/:userId/ban", auditRequest("ban_user", "users", "User"), admin.banUser);
router.patch("/users/:userId/unban", auditRequest("unban_user", "users", "User"), admin.unbanUser);
router.patch("/users/:userId/promote-admin", auditRequest("promote_admin", "users", "User"), admin.promote);

router.get("/buyers", admin.buyers);
router.get("/buyers/:buyerProfileId", admin.buyer);
router.patch("/buyers/:buyerProfileId/ban", admin.banBuyer);

router.get("/stores", admin.stores);
router.get("/stores/:storeId", admin.store);
router.patch("/stores/:storeId/toggle-live", auditRequest("toggle_store_live", "stores", "Store"), admin.toggleLive);

router.get("/kyc", kyc.adminListKyc);
router.get("/kyc/:kycId", kyc.adminGetKyc);
router.patch("/kyc/:kycId/approve", auditRequest("kyc_approve", "kyc", "Kyc"), kyc.adminApproveKyc);
router.patch("/kyc/:kycId/reject", validate(rejectSchema), auditRequest("kyc_reject", "kyc", "Kyc"), kyc.adminRejectKyc);
router.patch(
  "/kyc/:kycId/request-info",
  validate(requestInfoSchema),
  auditRequest("kyc_request_info", "kyc", "Kyc"),
  kyc.adminRequestKycInfo,
);

router.get("/plans", subscription.adminListPlans);
router.post("/plans", auditRequest("plan_create", "plans"), subscription.adminUpsertPlan);
router.put("/plans/:planId", auditRequest("plan_update", "plans"), subscription.adminUpsertPlan);

router.get("/templates", admin.templates);
router.post("/templates", auditRequest("template_create", "templates"), admin.createTemplate);
router.put("/templates/:templateId", admin.updateTemplate);
router.patch("/templates/:templateId/deactivate", admin.deactivateTemplate);
router.delete("/templates/:templateId", admin.deleteTemplate);

router.get("/categories", admin.listCategories);
router.post("/categories", admin.createCategory);
router.put("/categories/:categoryId", admin.updateCategory);
router.delete("/categories/:categoryId", admin.deleteCategory);

router.get("/payouts", admin.payouts);
router.post("/payouts/:id/approve", auditRequest("payout_approve", "payouts"), admin.approvePayout);
router.post("/payouts/:id/dispatch", auditRequest("payout_dispatch", "payouts"), admin.dispatchPayout);
router.post("/payouts/:id/reject", auditRequest("payout_reject", "payouts"), admin.rejectPayout);

router.get("/orders", admin.orders);
router.get("/orders/:orderId", admin.order);
router.patch("/orders/:orderId/address", admin.updateOrderAddress);
router.post("/orders/:orderId/confirm", admin.confirmOrder);
router.post("/orders/:orderId/cancel", admin.cancelOrder);

router.get("/disputes", admin.disputes);
router.get("/disputes/:disputeId", admin.dispute);
router.post("/disputes/:disputeId/messages", validate(messageSchema), misc.messageDispute);
router.post("/disputes/:disputeId/resolve", validate(resolveDisputeSchema), admin.resolveDispute);

router.get("/reviews", admin.reviews);
router.patch("/reviews/:reviewId/hide", admin.hideReview);
router.patch("/reviews/:reviewId/flag", admin.flagReview);
router.patch("/reviews/:reviewId/publish", admin.publishReview);
router.delete("/reviews/:reviewId", admin.deleteReview);

router.get("/tickets/pending-count", admin.ticketPending);
router.get("/tickets/unread-count", admin.ticketUnread);
router.get("/tickets", admin.tickets);
router.get("/tickets/:ticketId", admin.ticket);
router.post("/tickets/:ticketId/messages", validate(messageSchema), admin.ticketReply);
router.patch("/tickets/:ticketId/status", admin.ticketStatus);

router.get("/analytics/overview", admin.overview);
router.get("/analytics/gmv-trend", admin.gmv);
router.get("/analytics/stores", admin.topStores);
router.get("/analytics/plans", admin.plansAnalytics);
router.get("/analytics/kyc-funnel", admin.kycFunnel);
router.get("/analytics/disputes", admin.disputesAnalytics);
router.get("/analytics/payouts", admin.payoutsAnalytics);

router.get("/settings", misc.getPlatformSettings);
router.put("/settings", auditRequest("settings_update", "settings"), misc.updatePlatformSettings);

router.get("/audit-logs/filter-options", admin.auditOptions);
router.get("/audit-logs/export", admin.auditExport);
router.get("/audit-logs", admin.auditLogs);
router.get("/audit-logs/:logId", admin.auditLog);

router.get("/transactions/stats", admin.transactionStats);
router.get("/transactions/export", admin.transactionExport);
router.get("/transactions", admin.transactions);
router.get("/transactions/:id", admin.transaction);

router.get("/referrals", admin.sellerReferrals);
router.get("/referrals/buyer", admin.buyerReferrals);
router.post("/referrals/:id/reverse", admin.reverseReferral);

void Joi;

export default router;
