import { NEW_ARRIVAL_DAYS } from "../config/constants.config";
import { Product } from "../models/product.model";
import { StoreCategory } from "../models/store-category.model";
import { Review } from "../models/review.model";
import { Wishlist } from "../models/wishlist.model";
import { BlogPost } from "../models/blog-post.model";
import { ApiError } from "../utils/api-error.util";
import { escapeRegex } from "../utils/pagination.util";
import { publicStoreInfo } from "./store.service";
import type { IStore } from "../models/store.model";

async function wishSet(buyerId?: string, storeId?: string): Promise<Set<string>> {
  if (!buyerId || !storeId) return new Set();
  const wish = await Wishlist.findOne({ buyerProfileId: buyerId, storeId });
  return new Set((wish?.products ?? []).map((id) => String(id)));
}

function withWish<T extends { _id: unknown }>(products: T[], wished: Set<string>) {
  return products.map((p) => ({ ...p, isWishlisted: wished.has(String(p._id)) }));
}

export async function storefrontInfo(store: IStore) {
  return publicStoreInfo(store);
}

export async function storefrontProducts(
  storeId: string,
  query: {
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    skip: number;
    limit: number;
  },
  buyerId?: string,
) {
  const filter: Record<string, unknown> = { storeId, status: "active" };
  if (query.category) filter.category = query.category;
  if (query.search) {
    filter.$or = [
      { title: new RegExp(escapeRegex(query.search), "i") },
      { tags: new RegExp(escapeRegex(query.search), "i") },
    ];
  }
  if (query.minPrice != null || query.maxPrice != null) {
    filter.price = {
      ...(query.minPrice != null ? { $gte: query.minPrice } : {}),
      ...(query.maxPrice != null ? { $lte: query.maxPrice } : {}),
    };
  }
  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    popular: { orderCount: -1 },
  };
  const sort = sortMap[query.sort ?? "newest"] ?? { createdAt: -1 };
  const [items, total] = await Promise.all([
    Product.find(filter).sort(sort).skip(query.skip).limit(query.limit).lean(),
    Product.countDocuments(filter),
  ]);
  const wished = await wishSet(buyerId, storeId);
  return { items: withWish(items, wished), total };
}

export async function storefrontProduct(storeId: string, slug: string, buyerId?: string) {
  const product = await Product.findOneAndUpdate(
    { storeId, slug, status: "active" },
    { $inc: { viewCount: 1 } },
    { new: true },
  ).lean();
  if (!product) throw ApiError.notFound("Product not found");
  const wished = await wishSet(buyerId, storeId);
  return { ...product, isWishlisted: wished.has(String(product._id)) };
}

export async function storefrontCategories(storeId: string) {
  return StoreCategory.find({ storeId, isActive: true }).sort({ order: 1, name: 1 });
}

export async function featuredProducts(storeId: string, buyerId?: string) {
  const items = await Product.find({ storeId, status: "active", isFeatured: true })
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();
  return withWish(items, await wishSet(buyerId, storeId));
}

export async function newArrivals(storeId: string, buyerId?: string) {
  const since = new Date(Date.now() - NEW_ARRIVAL_DAYS * 24 * 3600 * 1000);
  const items = await Product.find({ storeId, status: "active", createdAt: { $gte: since } })
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();
  return withWish(items, await wishSet(buyerId, storeId));
}

export async function bestSellers(storeId: string, buyerId?: string) {
  const items = await Product.find({ storeId, status: "active" })
    .sort({ orderCount: -1 })
    .limit(12)
    .lean();
  return withWish(items, await wishSet(buyerId, storeId));
}

export async function productReviews(storeId: string, slug: string, skip: number, limit: number) {
  const product = await Product.findOne({ storeId, slug, status: "active" });
  if (!product) throw ApiError.notFound("Product not found");
  const filter = { productId: product._id, status: "published" };
  const [items, total, breakdown] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Review.countDocuments(filter),
    Review.aggregate([
      { $match: { productId: product._id, status: "published" } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
    ]),
  ]);
  const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  breakdown.forEach((b) => {
    ratingBreakdown[b._id as 1 | 2 | 3 | 4 | 5] = b.count;
  });
  return { items, total, average: product.rating, ratingBreakdown };
}

export async function storefrontBlog(storeId: string, skip: number, limit: number, tag?: string) {
  const filter: Record<string, unknown> = { storeId, status: "published" };
  if (tag) filter.tags = tag;
  const [items, total] = await Promise.all([
    BlogPost.find(filter).sort({ publishedAt: -1 }).skip(skip).limit(limit),
    BlogPost.countDocuments(filter),
  ]);
  return { items, total };
}

export async function storefrontBlogPost(storeId: string, slug: string) {
  const post = await BlogPost.findOneAndUpdate(
    { storeId, slug, status: "published" },
    { $inc: { viewCount: 1 } },
    { new: true },
  );
  if (!post) throw ApiError.notFound("Post not found");
  return post;
}

export async function storefrontBlogTags(storeId: string) {
  return BlogPost.distinct("tags", { storeId, status: "published" });
}
