import { Router } from "express";
import * as auth from "../controllers/auth.controller";
import { protectBuyer, protectPlatform } from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/rate-limiter.middleware";
import { resolveStore } from "../middlewares/resolve-store.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  emailSchema,
  googleSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
  verifyOtpSchema,
} from "../validations/auth.validation";

const router = Router();

const seller = Router();
seller.post("/register", authLimiter, validate(registerSchema), auth.registerSeller);
seller.post("/verify-otp", authLimiter, validate(verifyOtpSchema), auth.verifySellerOtp);
seller.post("/resend-otp", authLimiter, validate(emailSchema), auth.resendSellerOtp);
seller.post("/login", authLimiter, validate(loginSchema), auth.loginSeller);
seller.post("/google", authLimiter, validate(googleSchema), auth.googleSeller);
seller.post("/forgot-password", authLimiter, validate(emailSchema), auth.forgotSeller);
seller.post("/reset-password", authLimiter, validate(resetPasswordSchema), auth.resetSeller);
seller.post("/logout", auth.logoutSeller);
seller.get("/me", protectPlatform, auth.meSeller);

const buyer = Router();
buyer.use(resolveStore);
buyer.post("/register", authLimiter, validate(registerSchema), auth.registerBuyer);
buyer.post("/verify-otp", authLimiter, validate(verifyOtpSchema), auth.verifyBuyerOtp);
buyer.post("/resend-otp", authLimiter, validate(emailSchema), auth.resendBuyerOtp);
buyer.post("/login", authLimiter, validate(loginSchema), auth.loginBuyer);
buyer.post("/google", authLimiter, validate(googleSchema), auth.googleBuyer);
buyer.post("/forgot-password", authLimiter, validate(emailSchema), auth.forgotBuyer);
buyer.post("/reset-password", authLimiter, validate(resetPasswordSchema), auth.resetBuyer);
buyer.post("/logout", auth.logoutBuyer);
buyer.get("/me", protectBuyer, auth.meBuyer);

router.use("/seller", seller);
router.use("/buyer", buyer);
router.post("/google", authLimiter, validate(googleSchema), auth.googleSeller);

export default router;
