import { Router } from "express";
import authRoutes from "./auth.route";
import sellerRoutes from "./seller.route";
import storefrontRoutes from "./storefront.route";
import adminRoutes from "./admin.route";
import * as kyc from "../controllers/kyc.controller";
import * as checkout from "../controllers/checkout.controller";
import * as misc from "../controllers/misc.controller";
import * as subscription from "../controllers/subscription.controller";
import * as store from "../controllers/store.controller";
import { protectPlatform, protectSeller, protectSellerOrBuyer } from "../middlewares/auth.middleware";
import { resolveStoreOptional } from "../middlewares/resolve-store.middleware";
import { imageUpload, documentUpload } from "../middlewares/upload.middleware";
import { uploadLimiter } from "../middlewares/rate-limiter.middleware";
import { validate } from "../middlewares/validate.middleware";
import { kycUpdateSchema } from "../validations/kyc.validation";
import { messageSchema, subscribeSchema, ticketSchema, verifyRefSchema } from "../validations/commerce.validation";
import { storeSetupSchema, templateSelectSchema } from "../validations/store.validation";

const router = Router();

router.get("/health", misc.health);
router.get("/paystack-banks", kyc.paystackBanks);
router.get("/plans", subscription.listPlans);
router.post("/webhooks/paystack", checkout.paystackWebhook);

router.use("/auth", authRoutes);

router.put("/store/setup", protectSeller, validate(storeSetupSchema), store.setupStore);
router.get("/store", protectSeller, store.getStore);
router.put("/store/template", protectSeller, validate(templateSelectSchema), store.setTemplate);
router.get("/templates", protectSeller, store.listTemplates);

router.get("/kyc", protectSeller, kyc.getMyKyc);
router.put("/kyc", protectSeller, validate(kycUpdateSchema), kyc.upsertKyc);
router.post("/kyc/submit", protectSeller, kyc.submitKyc);
router.post("/kyc/upload", protectSeller, imageUpload.single("file"), kyc.uploadKycDoc);

router.get("/subscriptions/current", protectSeller, subscription.currentSubscription);
router.post("/subscriptions/free", protectSeller, subscription.subscribeFree);
router.post("/subscriptions/initialize", protectSeller, validate(subscribeSchema), subscription.initializeSubscription);
router.post("/subscriptions/verify", protectSeller, validate(verifyRefSchema), subscription.verifySubscription);
router.post("/subscriptions/cancel", protectSeller, subscription.cancelSubscription);
router.post("/subscriptions/change-plan", protectSeller, validate(subscribeSchema), subscription.changePlan);

router.post("/upload/image", protectPlatform, uploadLimiter, imageUpload.single("file"), misc.uploadImage);
router.post("/upload/document", protectPlatform, uploadLimiter, documentUpload.single("file"), misc.uploadDocument);

router.get("/notifications", resolveStoreOptional, protectSellerOrBuyer, misc.listNotifications);
router.get("/notifications/unread-count", protectSellerOrBuyer, misc.unreadNotifications);
router.patch("/notifications/mark-all-read", protectSellerOrBuyer, misc.readAllNotifications);
router.patch("/notifications/:notificationId/read", protectSellerOrBuyer, misc.readNotification);
router.delete("/notifications/:notificationId", protectSellerOrBuyer, misc.deleteNotification);

router.post("/tickets", protectSellerOrBuyer, resolveStoreOptional, validate(ticketSchema), misc.createTicket);
router.get("/tickets", protectSellerOrBuyer, misc.listTickets);
router.get("/tickets/:ticketId", protectSellerOrBuyer, misc.getTicket);
router.post("/tickets/:ticketId/messages", protectSellerOrBuyer, validate(messageSchema), misc.replyTicket);

router.use("/seller", sellerRoutes);
router.use("/admin", adminRoutes);
router.use("/", storefrontRoutes);

export default router;
