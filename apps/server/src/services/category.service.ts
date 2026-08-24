import { StoreCategory } from "../models/store-category.model";
import { ApiError } from "../utils/api-error.util";
import { slugify, uniqueSlug } from "../utils/slug.util";
import { getSellerStore } from "./store-helper.service";
import { refreshCategoryCounts } from "./product.service";

export async function createStoreCategory(sellerId: string, payload: Record<string, unknown>) {
  const store = await getSellerStore(sellerId);
  const name = String(payload.name);
  const slug = await uniqueSlug(name, async (s) =>
    Boolean(await StoreCategory.exists({ storeId: store._id, slug: s })),
  );
  const cat = await StoreCategory.create({
    storeId: store._id,
    name,
    slug,
    image: payload.image ?? "",
    description: payload.description ?? "",
    order: payload.order ?? 0,
  });
  await refreshCategoryCounts(String(store._id));
  return cat;
}

export async function listStoreCategories(sellerId: string) {
  const store = await getSellerStore(sellerId);
  return StoreCategory.find({ storeId: store._id }).sort({ order: 1, name: 1 });
}

export async function updateStoreCategory(sellerId: string, id: string, payload: Record<string, unknown>) {
  const store = await getSellerStore(sellerId);
  const cat = await StoreCategory.findOne({ _id: id, storeId: store._id });
  if (!cat) throw ApiError.notFound("Category not found");
  if (payload.name) {
    cat.name = String(payload.name);
    cat.slug = slugify(cat.name);
  }
  if (payload.image !== undefined) cat.image = String(payload.image);
  if (payload.description !== undefined) cat.description = String(payload.description);
  if (payload.order !== undefined) cat.order = Number(payload.order);
  if (payload.isActive !== undefined) cat.isActive = Boolean(payload.isActive);
  await cat.save();
  return cat;
}

export async function deleteStoreCategory(sellerId: string, id: string) {
  const store = await getSellerStore(sellerId);
  const cat = await StoreCategory.findOne({ _id: id, storeId: store._id });
  if (!cat) throw ApiError.notFound("Category not found");
  cat.isActive = false;
  await cat.save();
  return cat;
}
