import { Router } from "express";
import * as store from "../controllers/store.controller";
import * as product from "../controllers/product.controller";
import * as kyc from "../controllers/kyc.controller";
import * as subscription from "../controllers/subscription.controller";
import * as order from "../controllers/order.controller";
import * as misc from "../controllers/misc.controller";
import * as aiPartner from "../controllers/ai-partner.controller";
import { protectSeller } from "../middlewares/auth.middleware";
import { aiPartnerLimiter } from "../middlewares/rate-limiter.middleware";
import { imageUpload, productImageUpload } from "../middlewares/upload.middleware";
import { validate } from "../middlewares/validate.middleware";
import { customDomainSchema, storeSetupSchema, templateSelectSchema } from "../validations/store.validation";
import { kycUpdateSchema } from "../validations/kyc.validation";
import {
  blogSchema,
  bulkDeleteSchema,
  bulkStatusSchema,
  categorySchema,
  couponSchema,
  productSchema,
  productUpdateSchema,
  shipSchema,
  statusSchema,
  subscribeSchema,
  withdrawSchema,
  aiThreadSchema,
  aiRenameSchema,
  aiMessageSchema,
} from "../validations/commerce.validation";

const router = Router();
router.use(protectSeller);

router.put("/store/setup", validate(storeSetupSchema), store.setupStore);
router.get("/store", store.getStore);
router.get("/store/slug-check", store.checkSlug);
router.put("/store/template", validate(templateSelectSchema), store.setTemplate);
router.put("/store/custom-domain", validate(customDomainSchema), store.setDomain);
router.post("/store/verify-domain", store.verifyDomain);
router.delete("/store/custom-domain", store.removeDomain);
router.post("/store/upload", imageUpload.single("file"), store.uploadStoreAsset);

router.get("/templates", store.listTemplates);
router.get("/template-sections", store.listTemplateSections);

router.get("/kyc", kyc.getMyKyc);
router.put("/kyc", validate(kycUpdateSchema), kyc.upsertKyc);
router.post("/kyc/submit", kyc.submitKyc);
router.post("/kyc/upload", imageUpload.single("file"), kyc.uploadKycDoc);

router.get("/plans", subscription.listPlans);
router.get("/subscriptions/current", subscription.currentSubscription);
router.post("/subscriptions/free", subscription.subscribeFree);
router.post("/subscriptions/initialize", validate(subscribeSchema), subscription.initializeSubscription);
router.post("/subscriptions/verify", subscription.verifySubscription);
router.post("/subscriptions/cancel", subscription.cancelSubscription);
router.post("/subscriptions/change-plan", validate(subscribeSchema), subscription.changePlan);

router.post("/products", validate(productSchema), product.createProduct);
router.get("/products", product.listProducts);
router.patch("/products/bulk-status", validate(bulkStatusSchema), product.bulkStatus);
router.delete("/products/bulk-delete", validate(bulkDeleteSchema), product.bulkDelete);
router.get("/products/:productId", product.getProduct);
router.put("/products/:productId", validate(productUpdateSchema), product.updateProduct);
router.patch("/products/:productId/status", validate(statusSchema), product.setStatus);
router.delete("/products/:productId", product.archiveProduct);
router.post("/products/:productId/images", productImageUpload.array("images", 8), product.uploadImages);
router.delete("/products/:productId/images/:imageIndex", product.deleteImage);

router.post("/categories", validate(categorySchema), product.createCategory);
router.get("/categories", product.listCategories);
router.put("/categories/:categoryId", product.updateCategory);
router.delete("/categories/:categoryId", product.deleteCategory);

router.get("/orders/stats", order.stats);
router.get("/orders", order.list);
router.get("/orders/:orderId", order.detail);
router.patch("/orders/:orderId/ship", validate(shipSchema), order.ship);
router.patch("/orders/:orderId/in-transit", order.inTransit);
router.patch("/orders/:orderId/delivered", order.delivered);
router.get("/orders/:orderId/invoice", order.invoice);

router.get("/wallet", misc.wallet);
router.get("/wallet/transactions", misc.walletTx);
router.post("/wallet/withdraw", validate(withdrawSchema), misc.withdraw);

router.post("/coupons", validate(couponSchema), misc.createCoupon);
router.get("/coupons", misc.listCoupons);
router.put("/coupons/:couponId", misc.updateCoupon);
router.patch("/coupons/:couponId/toggle", misc.toggleCoupon);
router.delete("/coupons/:couponId", misc.deleteCoupon);
router.get("/coupons/:couponId/usage", misc.couponUsage);

router.get("/reviews", misc.sellerReviews);
router.post("/reviews/:reviewId/reply", misc.replyReview);

router.get("/disputes", misc.sellerDisputes);
router.get("/disputes/:disputeId", misc.getDispute);
router.post("/disputes/:disputeId/messages", misc.messageDispute);

router.post("/blog", validate(blogSchema), misc.createBlog);
router.get("/blog", misc.listBlog);
router.get("/blog/:postId", misc.getBlog);
router.put("/blog/:postId", misc.updateBlog);
router.patch("/blog/:postId/publish", misc.publishBlog);
router.patch("/blog/:postId/unpublish", misc.unpublishBlog);
router.delete("/blog/:postId", misc.archiveBlog);

router.get("/analytics/overview", misc.analyticsOverview);
router.get("/analytics/revenue-trend", misc.analyticsTrend);
router.get("/analytics/top-products", misc.analyticsTop);
router.get("/analytics/order-status", misc.analyticsStatus);
router.get("/analytics/customers", misc.analyticsCustomers);
router.get("/analytics/product-performance", misc.analyticsProducts);

router.post("/ai/improve-title", misc.aiTitle);
router.post("/ai/rewrite-description", misc.aiDescription);
router.post("/ai/generate-seo", misc.aiSeo);
router.post("/ai/storefront-questions", misc.aiStorefrontQuestions);
router.post("/ai/storefront-copy", misc.aiStorefrontCopy);

router.get("/ai/threads", aiPartner.listThreads);
router.post("/ai/threads", validate(aiThreadSchema), aiPartner.createThread);
router.patch("/ai/threads/:threadId", validate(aiRenameSchema), aiPartner.renameThread);
router.delete("/ai/threads/:threadId", aiPartner.deleteThread);
router.get("/ai/threads/:threadId/messages", aiPartner.listMessages);
router.post(
  "/ai/threads/:threadId/messages",
  aiPartnerLimiter,
  validate(aiMessageSchema),
  aiPartner.postMessage,
);
router.post("/ai/actions/:actionId/apply", aiPartner.applyAction);
router.post("/ai/actions/:actionId/dismiss", aiPartner.dismissAction);

router.get("/referrals", misc.myReferrals);

export default router;
