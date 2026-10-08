import type { NextFunction, Request, Response } from "express";
import type { ObjectSchema, ValidationErrorItem } from "joi";
import { ApiError } from "../utils/api-error.util";

type Source = "body" | "query" | "params";

function formatFieldName(raw: string): string {
  const map: Record<string, string> = {
    title: "Product title",
    price: "Price",
    compareAtPrice: "Compare-at price",
    stock: "Stock quantity",
    category: "Category",
    sku: "SKU",
    weightKg: "Weight",
    shippingFee: "Shipping fee",
    hasVariants: "Variants flag",
    variants: "Variants",
    variantCombinations: "Variant combinations",
    images: "Photos",
    status: "Product status",
    estimatedDeliveryDays: "Estimated delivery days",
    name: "Name",
    email: "Email address",
    password: "Password",
  };
  return map[raw] || raw.replace(/([A-Z])/g, " $1").toLowerCase();
}

export function humanizeJoiDetail(detail: ValidationErrorItem): { field: string; message: string } {
  const field = detail.path.join(".") || (detail.context?.key as string) || "field";
  const rawKey = (detail.context?.key as string) || detail.path[detail.path.length - 1]?.toString() || "field";
  const fieldLabel = formatFieldName(rawKey);

  const rawMessage = detail.message;
  const isRawJoi = rawMessage.includes(`"${rawKey}"`) || rawMessage.includes(`"${field}"`) || rawMessage.startsWith(`"`);

  let message = rawMessage.replace(/['"]/g, "").trim();

  // If the message is a raw default Joi template, turn it into clear, friendly guidance
  if (isRawJoi) {
    if (detail.type === "any.required" || detail.type === "string.empty") {
      message = `${fieldLabel} is required. Please enter a valid ${fieldLabel.toLowerCase()}.`;
    } else if (detail.type === "string.min") {
      const limit = detail.context?.limit;
      message = `${fieldLabel} must be at least ${limit} characters long.`;
    } else if (detail.type === "number.min") {
      const limit = detail.context?.limit;
      message = `${fieldLabel} cannot be negative. Please enter ${limit} or higher.`;
    } else if (detail.type === "number.base") {
      message = `${fieldLabel} must be a valid number.`;
    } else if (detail.type === "number.integer") {
      message = `${fieldLabel} must be a whole number.`;
    } else if (detail.type === "array.min") {
      message = `${fieldLabel} must contain at least ${detail.context?.limit} item(s).`;
    } else {
      if (message.startsWith(rawKey)) {
        message = `${fieldLabel}${message.slice(rawKey.length)}`;
      }
    }
  }

  return { field, message };
}

export function validate(schema: ObjectSchema, source: Source = "body") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });
    if (error) {
      const details = error.details.map(humanizeJoiDetail);
      const errors = details.map((d) => d.message);
      const primaryMessage = details[0]?.message || "Validation failed";

      throw ApiError.badRequest(primaryMessage, errors, details);
    }
    req[source] = value;
    next();
  };
}
