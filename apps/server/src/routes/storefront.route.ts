import { Router } from "express";
import * as storefront from "../controllers/storefront.controller";
import * as cart from "../controllers/cart.controller";
import * as checkout from "../controllers/checkout.controller";
import * as misc from "../controllers/misc.controller";
import { optionalBuyer, protectBuyer } from "../middlewares/auth.middleware";
import { resolveStore } from "../middlewares/resolve-store.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  addCartSchema,
  checkoutSchema,
  disputeSchema,
  reviewSchema,
  updateCartSchema,
  verifyRefSchema,
} from "../validations/commerce.validation";
import Joi from "joi";

const router = Router();
router.use(resolveStore);

router.get("/storefront/info", optionalBuyer, storefront.info);
router.get("/storefront/products", optionalBuyer, storefront.products);
router.get("/storefront/products/:slug/reviews", optionalBuyer, storefront.reviews);
router.get("/storefront/products/:slug", optionalBuyer, storefront.product);
router.get("/storefront/categories", optionalBuyer, storefront.categories);
router.get("/storefront/featured", optionalBuyer, storefront.featured);
router.get("/storefront/new-arrivals", optionalBuyer, storefront.newArrivals);
router.get("/storefront/best-sellers", optionalBuyer, storefront.bestSellers);
router.get("/storefront/blog/tags", storefront.blogTags);
router.get("/storefront/blog/:slug", storefront.blogPost);
router.get("/storefront/blog", storefront.blog);
router.post(
  "/storefront/coupons/validate",
  optionalBuyer,
  validate(Joi.object({ code: Joi.string().required(), subtotal: Joi.number() })),
  storefront.validateCoupon,
);

router.get("/cart", protectBuyer, cart.getCart);
router.post("/cart/add", protectBuyer, validate(addCartSchema), cart.addItem);
router.patch("/cart/items/:itemId", protectBuyer, validate(updateCartSchema), cart.updateItem);
router.delete("/cart/items/:itemId", protectBuyer, cart.removeItem);
router.delete("/cart/clear", protectBuyer, cart.clear);
router.get("/cart/count", protectBuyer, cart.count);

router.post("/checkout/initiate", protectBuyer, validate(checkoutSchema), checkout.initiate);
router.post("/checkout/verify", protectBuyer, validate(verifyRefSchema), checkout.verify);

router.get("/orders", protectBuyer, checkout.buyerOrders);
router.get("/orders/:orderId/receipt", protectBuyer, checkout.receipt);
router.get("/orders/:orderId", protectBuyer, checkout.buyerOrder);
router.post("/orders/:orderId/confirm", protectBuyer, checkout.confirmReceipt);
router.post("/orders/:orderId/dispute", protectBuyer, validate(disputeSchema), checkout.openDispute);

router.post("/reviews", protectBuyer, validate(reviewSchema), misc.createReview);
router.post("/wishlist/toggle", protectBuyer, misc.toggleWish);
router.get("/wishlist", protectBuyer, misc.getWish);
router.delete("/wishlist/clear", protectBuyer, misc.clearWish);

router.get("/disputes", protectBuyer, misc.buyerDisputes);
router.get("/disputes/:disputeId", protectBuyer, misc.getDispute);
router.post("/disputes/:disputeId/messages", protectBuyer, misc.messageDispute);
router.get("/referrals", protectBuyer, misc.myReferrals);

export default router;
