import type { NextFunction, Request, Response } from "express";
import { BUYER_SESSION_COOKIE, SELLER_SESSION_COOKIE } from "../config/constants.config";
import { BuyerProfile } from "../models/buyer-profile.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/api-error.util";
import { asyncHandler } from "../utils/async-handler.util";
import { isBuyerPayload, isSellerPayload, verifyToken } from "../utils/jwt.util";

function extractBearer(req: Request): string | null {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return null;
}

function extractPlatformToken(req: Request): string | null {
  return extractBearer(req) || (req.cookies?.[SELLER_SESSION_COOKIE] as string | undefined) || null;
}

function extractBuyerToken(req: Request): string | null {
  return extractBearer(req) || (req.cookies?.[BUYER_SESSION_COOKIE] as string | undefined) || null;
}

export const protectSeller = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractPlatformToken(req);
  if (!token) throw ApiError.unauthorized("Authentication required");
  const payload = verifyToken(token);
  if (!isSellerPayload(payload) || payload.role !== "seller") {
    throw ApiError.unauthorized("Seller authentication required");
  }
  const user = await User.findById(payload.userId);
  if (!user) throw ApiError.unauthorized("Account not found");
  if (user.banned) throw ApiError.forbidden(user.banReason || "Account is banned");
  if (!user.isVerified) throw ApiError.forbidden("Email is not verified");
  req.user = user;
  next();
});

export const protectAdmin = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractPlatformToken(req);
  if (!token) throw ApiError.unauthorized("Authentication required");
  const payload = verifyToken(token);
  if (!isSellerPayload(payload) || payload.role !== "admin") {
    throw ApiError.forbidden("Admin access required");
  }
  const user = await User.findById(payload.userId);
  if (!user || user.role !== "admin") throw ApiError.forbidden("Admin access required");
  if (user.banned) throw ApiError.forbidden("Account is banned");
  req.user = user;
  next();
});

export const protectPlatform = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractPlatformToken(req);
  if (!token) throw ApiError.unauthorized("Authentication required");
  const payload = verifyToken(token);
  if (!isSellerPayload(payload)) throw ApiError.unauthorized("Platform authentication required");
  const user = await User.findById(payload.userId);
  if (!user) throw ApiError.unauthorized("Account not found");
  if (user.banned) throw ApiError.forbidden(user.banReason || "Account is banned");
  req.user = user;
  next();
});

export const protectBuyer = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractBuyerToken(req);
  if (!token) throw ApiError.unauthorized("Buyer authentication required");
  const payload = verifyToken(token);
  if (!isBuyerPayload(payload)) throw ApiError.unauthorized("Buyer authentication required");
  if (!req.store) throw ApiError.badRequest("Store context is required");
  if (payload.storeId !== String(req.store._id)) {
    throw ApiError.forbidden("This session does not belong to this store");
  }
  const buyer = await BuyerProfile.findById(payload.buyerProfileId);
  if (!buyer) throw ApiError.unauthorized("Buyer account not found");
  if (buyer.banned) throw ApiError.forbidden(buyer.banReason || "You are banned from this store");
  if (!buyer.isVerified) throw ApiError.forbidden("Email is not verified");
  req.buyer = buyer;
  next();
});

export const optionalBuyer = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const token = extractBuyerToken(req);
    if (!token || !req.store) return next();
    const payload = verifyToken(token);
    if (!isBuyerPayload(payload) || payload.storeId !== String(req.store._id)) return next();
    const buyer = await BuyerProfile.findById(payload.buyerProfileId);
    if (buyer && !buyer.banned && buyer.isVerified) req.buyer = buyer;
  } catch {
    // public storefront continues without personalization
  }
  next();
});

export const protectSellerOrBuyer = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const platformToken = extractPlatformToken(req);
  if (platformToken) {
    try {
      const payload = verifyToken(platformToken);
      if (isSellerPayload(payload)) {
        const user = await User.findById(payload.userId);
        if (user && !user.banned) {
          req.user = user;
          return next();
        }
      }
    } catch {
      // fall through to buyer
    }
  }
  const buyerToken = extractBuyerToken(req);
  if (!buyerToken) throw ApiError.unauthorized("Authentication required");
  const payload = verifyToken(buyerToken);
  if (!isBuyerPayload(payload)) throw ApiError.unauthorized("Authentication required");
  if (req.store && payload.storeId !== String(req.store._id)) {
    throw ApiError.forbidden("This session does not belong to this store");
  }
  const buyer = await BuyerProfile.findById(payload.buyerProfileId);
  if (!buyer) throw ApiError.unauthorized("Buyer account not found");
  if (buyer.banned) throw ApiError.forbidden(buyer.banReason || "You are banned from this store");
  req.buyer = buyer;
  next();
});
