import type { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";
import { APP_NAME } from "../config/constants.config";
import { env } from "../config/env.config";
import { ApiError } from "../utils/api-error.util";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Cannot ${req.method} ${req.originalUrl}`));
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  let statusCode = 500;
  let message = "Internal server error";
  let errors: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => e.message);
  } else if (err instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = "Invalid ID";
  } else if (typeof err === "object" && err && "code" in err && (err as { code: number }).code === 11000) {
    statusCode = 409;
    const dup = err as { keyPattern?: Record<string, unknown>; keyValue?: Record<string, unknown> };
    const fields = dup.keyPattern
      ? Object.keys(dup.keyPattern)
      : dup.keyValue
        ? Object.keys(dup.keyValue)
        : [];
    if (fields.includes("slug")) {
      message = "This store slug is already taken";
    } else if (fields.includes("sellerId")) {
      message = "Store already exists for this seller";
    } else if (fields.includes("email")) {
      message = "Email already in use";
    } else if (fields.includes("referralCode")) {
      message = "Referral code already in use";
    } else if (fields.includes("customDomain")) {
      message = "This domain is already in use";
    } else if (fields.length) {
      message = `Duplicate value for ${fields.join(", ")}`;
    } else {
      message = "Duplicate value";
    }
  } else if (err instanceof Error) {
    message = env.isProd ? "Internal server error" : err.message;
  }

  if (statusCode >= 500) {
    console.error(`[${APP_NAME}]`, err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}
