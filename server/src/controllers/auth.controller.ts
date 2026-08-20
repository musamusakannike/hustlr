import type { Request, Response } from "express";
import * as authService from "../services/auth.service";
import { asyncHandler } from "../utils/async-handler.util";
import { sendSuccess } from "../utils/api-response.util";
import {
  clearBuyerSessionCookie,
  clearSellerSessionCookie,
  setBuyerSessionCookie,
  setSellerSessionCookie,
} from "../utils/cookie.util";
import { ApiError } from "../utils/api-error.util";

export const registerSeller = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.registerSeller(req.body);
  sendSuccess(res, data, "Verification code sent", 201);
});

export const verifySellerOtp = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.verifySellerOtp(req.body.email, req.body.otp);
  setSellerSessionCookie(res, data.token);
  sendSuccess(res, data, "Email verified");
});

export const resendSellerOtp = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.resendSellerOtp(req.body.email);
  sendSuccess(res, data, "OTP sent");
});

export const loginSeller = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.loginSeller(req.body.email, req.body.password);
  setSellerSessionCookie(res, data.token);
  sendSuccess(res, data, "Logged in");
});

export const googleSeller = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.googleSeller(req.body.idToken, req.body.referralCode);
  setSellerSessionCookie(res, data.token);
  sendSuccess(res, data, "Logged in");
});

export const forgotSeller = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.forgotSellerPassword(req.body.email);
  sendSuccess(res, data, "If the account exists, an OTP was sent");
});

export const resetSeller = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.resetSellerPassword(req.body.email, req.body.otp, req.body.password);
  sendSuccess(res, data, "Password updated");
});

export const logoutSeller = asyncHandler(async (_req: Request, res: Response) => {
  clearSellerSessionCookie(res);
  sendSuccess(res, null, "Logged out");
});

export const meSeller = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) throw ApiError.unauthorized();
  sendSuccess(res, {
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    isVerified: req.user.isVerified,
    avatar: req.user.avatar,
    referralCode: req.user.referralCode,
  });
});

export const registerBuyer = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.registerBuyer(String(req.store!._id), req.body);
  sendSuccess(res, data, "Verification code sent", 201);
});

export const verifyBuyerOtp = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.verifyBuyerOtp(String(req.store!._id), req.body.email, req.body.otp);
  setBuyerSessionCookie(res, data.token);
  sendSuccess(res, data, "Email verified");
});

export const resendBuyerOtp = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.resendBuyerOtp(String(req.store!._id), req.body.email);
  sendSuccess(res, data, "OTP sent");
});

export const loginBuyer = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.loginBuyer(String(req.store!._id), req.body.email, req.body.password);
  setBuyerSessionCookie(res, data.token);
  sendSuccess(res, data, "Logged in");
});

export const googleBuyer = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.googleBuyer(String(req.store!._id), req.body.idToken, req.body.referralCode);
  setBuyerSessionCookie(res, data.token);
  sendSuccess(res, data, "Logged in");
});

export const forgotBuyer = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.forgotBuyerPassword(String(req.store!._id), req.body.email);
  sendSuccess(res, data, "If the account exists, an OTP was sent");
});

export const resetBuyer = asyncHandler(async (req: Request, res: Response) => {
  const data = await authService.resetBuyerPassword(
    String(req.store!._id),
    req.body.email,
    req.body.otp,
    req.body.password,
  );
  sendSuccess(res, data, "Password updated");
});

export const logoutBuyer = asyncHandler(async (_req: Request, res: Response) => {
  clearBuyerSessionCookie(res);
  sendSuccess(res, null, "Logged out");
});

export const meBuyer = asyncHandler(async (req: Request, res: Response) => {
  if (!req.buyer) throw ApiError.unauthorized();
  sendSuccess(res, {
    id: req.buyer._id,
    storeId: req.buyer.storeId,
    name: req.buyer.name,
    email: req.buyer.email,
    referralCode: req.buyer.referralCode,
    shippingAddresses: req.buyer.shippingAddresses,
  });
});
