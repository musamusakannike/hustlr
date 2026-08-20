import { Review } from "../models/review.model";
import { Order } from "../models/order.model";
import { Product } from "../models/product.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/api-error.util";
import { recomputeProductRating } from "./product.service";
import { createNotification } from "./notification.service";
import { getSellerStore } from "./store-helper.service";

export async function createReview(
  buyerProfileId: string,
  storeId: string,
  input: {
    productId: string;
    orderId: string;
    rating: number;
    title?: string;
    comment?: string;
    images?: string[];
  },
) {
  const order = await Order.findOne({
    _id: input.orderId,
    buyerProfileId,
    storeId,
    paymentStatus: "paid",
  });
  if (!order) throw ApiError.forbidden("You can only review products you purchased");
  if (!["confirmed", "delivered"].includes(order.deliveryStatus)) {
    throw ApiError.badRequest("Confirm delivery before reviewing");
  }
  const item = order.items.find((i) => String(i.productId) === input.productId);
  if (!item) throw ApiError.badRequest("This product is not in the order");
  const existing = await Review.findOne({
    buyerProfileId,
    orderId: order._id,
    productId: input.productId,
  });
  if (existing) throw ApiError.conflict("You already reviewed this product for this order");
  const product = await Product.findById(input.productId);
  const review = await Review.create({
    productId: input.productId,
    storeId,
    buyerProfileId,
    orderId: order._id,
    rating: input.rating,
    title: input.title ?? "",
    comment: input.comment ?? "",
    images: input.images ?? [],
    isVerifiedPurchase: true,
    productTitle: item.title,
    productImage: item.image,
    variantInfo: item.selectedVariants,
  });
  await recomputeProductRating(input.productId);
  const seller = product ? await User.findById(product.sellerId) : null;
  if (seller) {
    await createNotification({
      recipientId: seller._id,
      recipientType: "seller",
      type: "review_new",
      title: "New review",
      message: `New ${input.rating}-star review on ${item.title}`,
      link: "/dashboard/reviews",
      email: {
        to: seller.email,
        templateName: "newReview",
        data: { name: seller.name, productTitle: item.title, rating: input.rating },
      },
    });
  }
  return review;
}

export async function sellerReply(sellerId: string, reviewId: string, text: string) {
  const store = await getSellerStore(sellerId);
  const review = await Review.findOne({ _id: reviewId, storeId: store._id });
  if (!review) throw ApiError.notFound("Review not found");
  if (review.sellerReply?.text) throw ApiError.badRequest("You already replied to this review");
  review.sellerReply = { text, repliedAt: new Date() };
  await review.save();
  return review;
}

export async function listSellerReviews(
  sellerId: string,
  query: { rating?: number; status?: string; skip: number; limit: number },
) {
  const store = await getSellerStore(sellerId);
  const filter: Record<string, unknown> = { storeId: store._id };
  if (query.rating) filter.rating = query.rating;
  if (query.status) filter.status = query.status;
  const [items, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(query.skip).limit(query.limit),
    Review.countDocuments(filter),
  ]);
  return { items, total };
}

export async function adminListReviews(query: {
  status?: string;
  skip: number;
  limit: number;
}) {
  const filter: Record<string, unknown> = {};
  if (query.status) filter.status = query.status;
  const [items, total] = await Promise.all([
    Review.find(filter).sort({ createdAt: -1 }).skip(query.skip).limit(query.limit),
    Review.countDocuments(filter),
  ]);
  return { items, total };
}

export async function setReviewStatus(reviewId: string, status: "published" | "hidden" | "flagged") {
  const review = await Review.findById(reviewId);
  if (!review) throw ApiError.notFound("Review not found");
  review.status = status;
  await review.save();
  await recomputeProductRating(String(review.productId));
  return review;
}

export async function deleteReview(reviewId: string) {
  const review = await Review.findById(reviewId);
  if (!review) throw ApiError.notFound("Review not found");
  const productId = String(review.productId);
  await review.deleteOne();
  await recomputeProductRating(productId);
}

export async function backfillRatings(): Promise<number> {
  const products = await Product.find().select("_id");
  for (const p of products) await recomputeProductRating(String(p._id));
  return products.length;
}
