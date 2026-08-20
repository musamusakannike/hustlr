import jwt, { type SignOptions } from "jsonwebtoken";
import { env } from "../config/env.config";
import { ApiError } from "./api-error.util";

export type SellerTokenPayload = {
  userId: string;
  email: string;
  role: "seller" | "admin";
  isVerified: boolean;
  type: "platform";
};

export type BuyerTokenPayload = {
  buyerProfileId: string;
  storeId: string;
  email: string;
  name: string;
  type: "buyer";
};

export type TokenPayload = SellerTokenPayload | BuyerTokenPayload;

export function signToken(payload: TokenPayload): string {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, env.jwtSecret, options);
}

export function verifyToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, env.jwtSecret) as TokenPayload;
  } catch {
    throw ApiError.unauthorized("Invalid or expired token");
  }
}

export function isSellerPayload(payload: TokenPayload): payload is SellerTokenPayload {
  return payload.type === "platform";
}

export function isBuyerPayload(payload: TokenPayload): payload is BuyerTokenPayload {
  return payload.type === "buyer";
}
