import Joi from "joi";

export const productSchema = Joi.object({
  title: Joi.string().trim().min(2).required().messages({
    "string.empty": "Product title is required. Please enter a product title.",
    "string.min": "Product title must be at least 2 characters long.",
    "any.required": "Product title is required. Please enter a product title.",
  }),
  description: Joi.string().allow(""),
  category: Joi.string().allow(""),
  price: Joi.number().min(0).required().messages({
    "number.base": "Price must be a valid number. Please enter a valid price.",
    "number.min": "Price cannot be negative. Please enter 0 or higher.",
    "any.required": "Price is required. Please enter a product price.",
  }),
  compareAtPrice: Joi.number().min(0).allow(null).messages({
    "number.base": "Compare-at price must be a valid number.",
    "number.min": "Compare-at price cannot be negative.",
  }),
  sku: Joi.string().allow(""),
  stock: Joi.number().integer().min(0).required().messages({
    "number.base": "Stock quantity must be a valid number.",
    "number.integer": "Stock quantity must be a whole number.",
    "number.min": "Stock quantity cannot be negative.",
    "any.required": "Stock quantity is required. Please enter available stock.",
  }),
  images: Joi.array().items(Joi.string()),
  weightKg: Joi.number().min(0).allow(null).messages({
    "number.base": "Weight must be a valid number.",
    "number.min": "Weight cannot be negative.",
  }),
  hasVariants: Joi.boolean(),
  variants: Joi.array().items(
    Joi.object({
      name: Joi.string().trim().required().messages({
        "string.empty": "Variant option name is required (e.g. Size or Color).",
        "any.required": "Variant option name is required (e.g. Size or Color).",
      }),
      options: Joi.array().items(Joi.string().trim()).min(1).required().messages({
        "array.min": "Each variant must have at least one option value.",
        "any.required": "Each variant must have at least one option value.",
      }),
    }),
  ),
  variantCombinations: Joi.array().items(
    Joi.object({
      combination: Joi.object().required().messages({
        "any.required": "Variant combination options are required.",
      }),
      price: Joi.number().min(0).required().messages({
        "number.base": "Variant price must be a valid number.",
        "number.min": "Variant price cannot be negative.",
        "any.required": "Variant price is required.",
      }),
      stock: Joi.number().integer().min(0).required().messages({
        "number.base": "Variant stock must be a valid number.",
        "number.integer": "Variant stock must be a whole number.",
        "number.min": "Variant stock cannot be negative.",
        "any.required": "Variant stock is required.",
      }),
      sku: Joi.string().allow(""),
      image: Joi.string().allow(""),
    }),
  ),
  status: Joi.string().valid("draft", "active", "archived").messages({
    "any.only": "Status must be draft, active, or archived.",
  }),
  isFeatured: Joi.boolean(),
  tags: Joi.array().items(Joi.string()),
  shippingFee: Joi.number().min(0).messages({
    "number.base": "Shipping fee must be a valid number.",
    "number.min": "Shipping fee cannot be negative.",
  }),
  estimatedDeliveryDays: Joi.string().allow(""),
});

export const productUpdateSchema = productSchema.fork(
  ["title", "price", "stock"],
  (s) => s.optional(),
);

export const statusSchema = Joi.object({
  status: Joi.string().valid("draft", "active", "archived").required(),
});

export const bulkStatusSchema = Joi.object({
  productIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
  status: Joi.string().valid("draft", "active", "archived").required(),
});

export const bulkDeleteSchema = Joi.object({
  productIds: Joi.array().items(Joi.string().hex().length(24)).min(1).required(),
});

export const categorySchema = Joi.object({
  name: Joi.string().min(2).required(),
  image: Joi.string().allow(""),
  description: Joi.string().allow(""),
  order: Joi.number(),
  isActive: Joi.boolean(),
});

export const addCartSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  quantity: Joi.number().integer().min(1).required(),
  selectedVariants: Joi.object().pattern(Joi.string(), Joi.string()),
});

export const updateCartSchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

export const checkoutSchema = Joi.object({
  shippingAddress: Joi.object({
    fullName: Joi.string().required(),
    streetAddress: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required(),
    phoneNumber: Joi.string().required(),
    isDefault: Joi.boolean(),
  }).required(),
  couponCode: Joi.string().allow(""),
  saveAddress: Joi.boolean(),
});

export const verifyRefSchema = Joi.object({
  reference: Joi.string().required(),
});

export const shipSchema = Joi.object({
  trackingNumber: Joi.string().allow(""),
  trackingNote: Joi.string().allow(""),
});

export const disputeSchema = Joi.object({
  reason: Joi.string().required(),
  description: Joi.string().min(10).required(),
  evidenceImages: Joi.array().items(Joi.string()),
  resolutionPreference: Joi.string().valid("Refund", "Replacement").required(),
});

export const messageSchema = Joi.object({
  message: Joi.string().min(1).required(),
  attachments: Joi.array().items(Joi.string()),
});

export const reviewSchema = Joi.object({
  productId: Joi.string().hex().length(24).required(),
  orderId: Joi.string().hex().length(24).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  title: Joi.string().allow(""),
  comment: Joi.string().max(2000).allow(""),
  images: Joi.array().items(Joi.string()),
});

export const couponSchema = Joi.object({
  code: Joi.string().min(3).required(),
  type: Joi.string().valid("percentage", "fixed").required(),
  value: Joi.number().min(0).required(),
  minimumOrderAmount: Joi.number().min(0).allow(null),
  maxUsageCount: Joi.number().integer().min(1).allow(null),
  maxUsagePerBuyer: Joi.number().integer().min(1),
  startDate: Joi.date().allow(null),
  expiryDate: Joi.date().allow(null),
  isActive: Joi.boolean(),
  appliesTo: Joi.string().valid("all", "specific_products", "specific_categories"),
  applicableProductIds: Joi.array().items(Joi.string().hex().length(24)),
  applicableCategories: Joi.array().items(Joi.string()),
});

export const withdrawSchema = Joi.object({
  amount: Joi.number().positive().required(),
});

export const subscribeSchema = Joi.object({
  planId: Joi.string().hex().length(24).required(),
  billingCycle: Joi.string().valid("monthly", "yearly").required(),
});

export const blogSchema = Joi.object({
  title: Joi.string().min(3).required(),
  content: Joi.string().allow(""),
  excerpt: Joi.string().allow(""),
  coverImage: Joi.string().allow(""),
  tags: Joi.array().items(Joi.string()),
  metaTitle: Joi.string().allow(""),
  metaDescription: Joi.string().allow(""),
});

export const ticketSchema = Joi.object({
  topic: Joi.string().required(),
  subject: Joi.string().required(),
  message: Joi.string().required(),
  attachments: Joi.array().items(Joi.string()),
});

export const aiThreadSchema = Joi.object({
  title: Joi.string().max(80).allow(""),
});

export const aiRenameSchema = Joi.object({
  title: Joi.string().min(1).max(80).required(),
});

export const aiMessageSchema = Joi.object({
  content: Joi.string().min(1).max(8000).required(),
});

export const resolveDisputeSchema = Joi.object({
  resolution: Joi.string().valid("refund", "replacement", "rejected").required(),
  refundAmount: Joi.number().min(0),
  resolutionNote: Joi.string().required(),
});
