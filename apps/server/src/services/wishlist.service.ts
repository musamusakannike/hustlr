import { Wishlist } from "../models/wishlist.model";
import { Product } from "../models/product.model";
import { ApiError } from "../utils/api-error.util";

export async function toggleWishlist(buyerProfileId: string, storeId: string, productId: string) {
  const product = await Product.findOne({ _id: productId, storeId, status: "active" });
  if (!product) throw ApiError.notFound("Product not found");
  let wish = await Wishlist.findOne({ buyerProfileId, storeId });
  if (!wish) wish = await Wishlist.create({ buyerProfileId, storeId, products: [] });
  const idx = wish.products.findIndex((id) => String(id) === productId);
  let wished = false;
  if (idx >= 0) wish.products.splice(idx, 1);
  else {
    wish.products.push(product._id);
    wished = true;
  }
  await wish.save();
  return { wished, count: wish.products.length };
}

export async function getWishlist(buyerProfileId: string, storeId: string) {
  const wish = await Wishlist.findOne({ buyerProfileId, storeId }).populate("products");
  return wish?.products ?? [];
}

export async function clearWishlist(buyerProfileId: string, storeId: string) {
  await Wishlist.findOneAndUpdate({ buyerProfileId, storeId }, { products: [] });
}
