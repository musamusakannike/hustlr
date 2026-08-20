import { Product } from "../models/product.model";
import { StoreCategory } from "../models/store-category.model";
import { MAX_PRODUCT_IMAGES } from "../config/constants.config";
import { ApiError } from "../utils/api-error.util";
import { slugify, uniqueSlug } from "../utils/slug.util";
import { escapeRegex } from "../utils/pagination.util";
import { getSellerPlan, getSellerStore } from "./store-helper.service";
import { User } from "../models/user.model";
import { createNotification } from "./notification.service";

export async function ensureCategory(storeId: string, name: string) {
  if (!name) return;
  const slug = slugify(name);
  const existing = await StoreCategory.findOne({ storeId, slug });
  if (existing) return existing;
  return StoreCategory.create({ storeId, name, slug, isActive: true });
}

export async function createProduct(sellerId: string, payload: Record<string, unknown>) {
  const store = await getSellerStore(sellerId);
  const plan = await getSellerPlan(sellerId);
  if (plan?.maxProducts != null) {
    const count = await Product.countDocuments({
      storeId: store._id,
      status: { $ne: "archived" },
    });
    if (count >= plan.maxProducts) {
      throw ApiError.forbidden(`Your plan allows a maximum of ${plan.maxProducts} products`);
    }
  }
  const title = String(payload.title);
  const slug = await uniqueSlug(title, async (s) =>
    Boolean(await Product.exists({ storeId: store._id, slug: s })),
  );
  if (payload.category) await ensureCategory(String(store._id), String(payload.category));
  const product = await Product.create({
    storeId: store._id,
    sellerId,
    title,
    slug,
    description: payload.description ?? "",
    category: payload.category ?? "",
    price: payload.price,
    compareAtPrice: payload.compareAtPrice ?? null,
    sku: payload.sku ?? "",
    stock: payload.stock ?? 0,
    images: payload.images ?? [],
    weightKg: payload.weightKg ?? null,
    hasVariants: payload.hasVariants ?? false,
    variants: payload.variants ?? [],
    variantCombinations: payload.variantCombinations ?? [],
    status: payload.status ?? "draft",
    isFeatured: payload.isFeatured ?? false,
    tags: payload.tags ?? [],
    shippingFee: payload.shippingFee ?? 0,
    estimatedDeliveryDays: payload.estimatedDeliveryDays ?? "",
  });
  await refreshCategoryCounts(String(store._id));
  return product;
}

export async function listSellerProducts(
  sellerId: string,
  query: {
    status?: string;
    category?: string;
    search?: string;
    skip: number;
    limit: number;
  },
) {
  const store = await getSellerStore(sellerId);
  const filter: Record<string, unknown> = { storeId: store._id };
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.search) filter.title = new RegExp(escapeRegex(query.search), "i");
  const [items, total] = await Promise.all([
    Product.find(filter).sort({ createdAt: -1 }).skip(query.skip).limit(query.limit),
    Product.countDocuments(filter),
  ]);
  return { items, total };
}

export async function getSellerProduct(sellerId: string, productId: string) {
  const product = await Product.findOne({ _id: productId, sellerId });
  if (!product) throw ApiError.notFound("Product not found");
  return product;
}

export async function updateProduct(sellerId: string, productId: string, payload: Record<string, unknown>) {
  const product = await getSellerProduct(sellerId, productId);
  const allowed = [
    "title",
    "description",
    "category",
    "price",
    "compareAtPrice",
    "sku",
    "stock",
    "weightKg",
    "hasVariants",
    "variants",
    "variantCombinations",
    "isFeatured",
    "tags",
    "shippingFee",
    "estimatedDeliveryDays",
    "images",
  ];
  for (const key of allowed) {
    if (payload[key] !== undefined) {
      (product as unknown as Record<string, unknown>)[key] = payload[key];
    }
  }
  if (payload.title && payload.title !== product.title) {
    product.slug = await uniqueSlug(String(payload.title), async (s) =>
      Boolean(await Product.exists({ storeId: product.storeId, slug: s, _id: { $ne: product._id } })),
    );
  }
  if (payload.category) await ensureCategory(String(product.storeId), String(payload.category));
  await product.save();
  await refreshCategoryCounts(String(product.storeId));
  return product;
}

export async function setProductStatus(sellerId: string, productId: string, status: "draft" | "active" | "archived") {
  const product = await getSellerProduct(sellerId, productId);
  product.status = status;
  await product.save();
  await refreshCategoryCounts(String(product.storeId));
  return product;
}

export async function archiveProduct(sellerId: string, productId: string) {
  return setProductStatus(sellerId, productId, "archived");
}

export async function addProductImages(sellerId: string, productId: string, urls: string[]) {
  const product = await getSellerProduct(sellerId, productId);
  if (product.images.length + urls.length > MAX_PRODUCT_IMAGES) {
    throw ApiError.badRequest(`Maximum of ${MAX_PRODUCT_IMAGES} images allowed`);
  }
  product.images.push(...urls);
  await product.save();
  return product;
}

export async function removeProductImage(sellerId: string, productId: string, imageIndex: number) {
  const product = await getSellerProduct(sellerId, productId);
  if (imageIndex < 0 || imageIndex >= product.images.length) {
    throw ApiError.badRequest("Invalid image index");
  }
  product.images.splice(imageIndex, 1);
  await product.save();
  return product;
}

export async function bulkStatus(sellerId: string, productIds: string[], status: "draft" | "active" | "archived") {
  const store = await getSellerStore(sellerId);
  await Product.updateMany({ _id: { $in: productIds }, storeId: store._id }, { status });
  await refreshCategoryCounts(String(store._id));
  return { updated: productIds.length };
}

export async function bulkArchive(sellerId: string, productIds: string[]) {
  return bulkStatus(sellerId, productIds, "archived");
}

export async function decrementStock(productId: string, quantity: number, combination?: Record<string, string>) {
  const product = await Product.findOneAndUpdate(
    { _id: productId, stock: { $gte: quantity } },
    { $inc: { stock: -quantity, orderCount: quantity } },
    { new: true },
  );
  if (!product) throw ApiError.badRequest("Insufficient stock");
  if (combination && product.hasVariants) {
    const combo = product.variantCombinations.find((c) =>
      Object.entries(combination).every(([k, v]) => c.combination[k] === v),
    );
    if (combo) {
      combo.stock = Math.max(0, combo.stock - quantity);
      await product.save();
    }
  }
  if (product.stock <= 0) {
    product.status = "draft";
    await product.save();
    const seller = await User.findById(product.sellerId);
    if (seller) {
      await createNotification({
        recipientId: seller._id,
        recipientType: "seller",
        type: "low_stock",
        title: "Out of stock",
        message: `${product.title} is out of stock and was moved to draft.`,
        link: `/dashboard/products/${product._id}`,
        email: {
          to: seller.email,
          templateName: "lowStock",
          data: { name: seller.name, productTitle: product.title },
        },
      });
    }
  }
  return product;
}

export async function restoreStock(productId: string, quantity: number) {
  await Product.findByIdAndUpdate(productId, { $inc: { stock: quantity } });
}

export async function refreshCategoryCounts(storeId: string) {
  const cats = await StoreCategory.find({ storeId });
  await Promise.all(
    cats.map(async (cat) => {
      cat.productCount = await Product.countDocuments({
        storeId,
        category: cat.name,
        status: "active",
      });
      await cat.save();
    }),
  );
}

export async function recomputeProductRating(productId: string) {
  const { Review } = await import("../models/review.model");
  const agg = await Review.aggregate([
    { $match: { productId: new (await import("mongoose")).Types.ObjectId(productId), status: "published" } },
    { $group: { _id: "$productId", ratingSum: { $sum: "$rating" }, reviewCount: { $sum: 1 } } },
  ]);
  const stats = agg[0] || { ratingSum: 0, reviewCount: 0 };
  const rating = stats.reviewCount ? stats.ratingSum / stats.reviewCount : 0;
  await Product.findByIdAndUpdate(productId, {
    ratingSum: stats.ratingSum,
    reviewCount: stats.reviewCount,
    rating,
  });
}
