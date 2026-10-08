import type { ProductInput } from "@/types/product";
import { TransportError } from "@/lib/transport";

export interface ProductValidationErrors {
  title?: string;
  description?: string;
  category?: string;
  price?: string;
  compareAtPrice?: string;
  stock?: string;
  sku?: string;
  shippingFee?: string;
  weightKg?: string;
  variants?: string;
  images?: string;
  general?: string;
}

/**
 * Validates product input on the client side before making a request.
 * Rules match the server-side Joi schema and business requirements.
 */
export function validateProductInput(form: ProductInput): ProductValidationErrors {
  const errors: ProductValidationErrors = {};

  // Title validation
  const trimmedTitle = (form.title || "").trim();
  if (!trimmedTitle) {
    errors.title = "Product title is required. Please enter a product title.";
  } else if (trimmedTitle.length < 2) {
    errors.title = "Product title must be at least 2 characters long.";
  }

  // Price validation
  if (form.price === undefined || form.price === null || Number.isNaN(form.price)) {
    errors.price = "Price is required. Please enter a valid product price.";
  } else if (form.price <= 0) {
    errors.price = "Price is required and must be greater than 0.";
  }

  // Compare-at price validation
  if (form.compareAtPrice !== null && form.compareAtPrice !== undefined) {
    if (form.compareAtPrice < 0) {
      errors.compareAtPrice = "Compare-at price cannot be negative.";
    } else if (form.compareAtPrice <= form.price) {
      errors.compareAtPrice = "Compare-at price should be higher than the regular price.";
    }
  }

  // Stock validation (when no variants)
  if (!form.hasVariants) {
    if (form.stock === undefined || form.stock === null || Number.isNaN(form.stock)) {
      errors.stock = "Stock quantity is required. Please enter available stock.";
    } else if (form.stock < 0) {
      errors.stock = "Stock quantity cannot be negative.";
    } else if (!Number.isInteger(form.stock)) {
      errors.stock = "Stock quantity must be a whole number.";
    }
  }

  // Variants validation
  if (form.hasVariants) {
    if (!form.variants || form.variants.length === 0) {
      errors.variants = "Please add at least one variant option (e.g. Size or Color).";
    } else if (form.variants.some((v) => !v.name.trim())) {
      errors.variants = "Each variant option must have a name (e.g. Size or Color).";
    } else if (form.variants.some((v) => !v.options || v.options.length === 0)) {
      errors.variants = "Each variant option must have at least one option value (e.g. S, M, L).";
    } else if (!form.variantCombinations || form.variantCombinations.length === 0) {
      errors.variants = "Please generate at least one variant combination.";
    } else if (form.variantCombinations.some((c) => c.price < 0)) {
      errors.variants = "Variant combination prices cannot be negative.";
    } else if (form.variantCombinations.some((c) => c.stock < 0)) {
      errors.variants = "Variant combination stock quantities cannot be negative.";
    }
  }

  // Shipping fee validation
  if (form.shippingFee !== undefined && form.shippingFee !== null && form.shippingFee < 0) {
    errors.shippingFee = "Shipping fee cannot be negative.";
  }

  // Weight validation
  if (form.weightKg !== undefined && form.weightKg !== null && form.weightKg < 0) {
    errors.weightKg = "Weight cannot be negative.";
  }

  return errors;
}

/**
 * Extracts and maps server validation errors into field-specific errors
 * and a human-friendly general summary message.
 */
export function extractValidationErrors(error: unknown): {
  message: string;
  fieldErrors: ProductValidationErrors;
} {
  const fieldErrors: ProductValidationErrors = {};
  let message = "Something went wrong. Please try again.";

  if (error instanceof TransportError) {
    message = error.message;

    // Check if error has structured details
    const rawDetails = (error as { details?: Array<{ field?: string; message?: string }> }).details;
    if (Array.isArray(rawDetails) && rawDetails.length > 0) {
      for (const d of rawDetails) {
        if (!d.field || !d.message) continue;
        mapFieldDetail(d.field, d.message, fieldErrors);
      }
    }

    // Check if error has errors array
    if (Array.isArray(error.errors)) {
      for (const item of error.errors) {
        if (typeof item === "string") {
          mapStringError(item, fieldErrors);
        } else if (typeof item === "object" && item && "field" in item && "message" in item) {
          mapFieldDetail((item as { field: string }).field, (item as { message: string }).message, fieldErrors);
        }
      }
    }
  } else if (error instanceof Error) {
    message = error.message;
    mapStringError(error.message, fieldErrors);
  }

  // If server top-level message is still the generic "Validation failed", pick the first specific error
  if (message.toLowerCase() === "validation failed" || message.toLowerCase() === "something went wrong. please try again.") {
    const firstDetailMessage =
      fieldErrors.title ||
      fieldErrors.price ||
      fieldErrors.stock ||
      fieldErrors.compareAtPrice ||
      fieldErrors.variants ||
      fieldErrors.category ||
      fieldErrors.shippingFee ||
      fieldErrors.weightKg ||
      fieldErrors.general;

    if (firstDetailMessage) {
      message = firstDetailMessage;
    }
  }

  return { message, fieldErrors };
}

function mapFieldDetail(
  field: string,
  rawMsg: string,
  fieldErrors: ProductValidationErrors
) {
  const cleanMsg = rawMsg.replace(/['"]/g, "").trim();
  const root = field.split(".")[0];

  switch (root) {
    case "title":
      fieldErrors.title = cleanMsg;
      break;
    case "price":
      fieldErrors.price = cleanMsg;
      break;
    case "compareAtPrice":
      fieldErrors.compareAtPrice = cleanMsg;
      break;
    case "stock":
      fieldErrors.stock = cleanMsg;
      break;
    case "category":
      fieldErrors.category = cleanMsg;
      break;
    case "variants":
    case "variantCombinations":
      fieldErrors.variants = cleanMsg;
      break;
    case "shippingFee":
      fieldErrors.shippingFee = cleanMsg;
      break;
    case "weightKg":
      fieldErrors.weightKg = cleanMsg;
      break;
    case "sku":
      fieldErrors.sku = cleanMsg;
      break;
    case "images":
      fieldErrors.images = cleanMsg;
      break;
    default:
      fieldErrors.general = cleanMsg;
      break;
  }
}

function mapStringError(errStr: string, fieldErrors: ProductValidationErrors) {
  const lower = errStr.toLowerCase();
  if (lower.includes("title")) {
    fieldErrors.title = fieldErrors.title || errStr;
  } else if (lower.includes("compare-at") || lower.includes("compareat")) {
    fieldErrors.compareAtPrice = fieldErrors.compareAtPrice || errStr;
  } else if (lower.includes("price")) {
    fieldErrors.price = fieldErrors.price || errStr;
  } else if (lower.includes("stock")) {
    fieldErrors.stock = fieldErrors.stock || errStr;
  } else if (lower.includes("variant")) {
    fieldErrors.variants = fieldErrors.variants || errStr;
  } else if (lower.includes("shipping")) {
    fieldErrors.shippingFee = fieldErrors.shippingFee || errStr;
  } else if (lower.includes("weight")) {
    fieldErrors.weightKg = fieldErrors.weightKg || errStr;
  }
}
