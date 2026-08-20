import { Cart } from "../models/cart.model";
import { Product } from "../models/product.model";
import { ApiError } from "../utils/api-error.util";

function variantsKey(selected: Record<string, string>): string {
  return JSON.stringify(
    Object.keys(selected)
      .sort()
      .reduce((acc, k) => {
        acc[k] = selected[k];
        return acc;
      }, {} as Record<string, string>),
  );
}

function unitPrice(product: InstanceType<typeof Product>, selected: Record<string, string>): number {
  if (!product.hasVariants) return product.price;
  const combo = product.variantCombinations.find(
    (c) => variantsKey(c.combination) === variantsKey(selected),
  );
  return combo?.price ?? product.price;
}

function availableStock(product: InstanceType<typeof Product>, selected: Record<string, string>): number {
  if (!product.hasVariants) return product.stock;
  const combo = product.variantCombinations.find(
    (c) => variantsKey(c.combination) === variantsKey(selected),
  );
  return combo?.stock ?? product.stock;
}

function assertVariants(product: InstanceType<typeof Product>, selected: Record<string, string>) {
  if (!product.hasVariants) return;
  for (const variant of product.variants) {
    if (!selected[variant.name] || !variant.options.includes(selected[variant.name])) {
      throw ApiError.badRequest(`Invalid variant selection for ${variant.name}`);
    }
  }
}

export async function getOrCreateCart(buyerProfileId: string, storeId: string) {
  let cart = await Cart.findOne({ buyerProfileId, storeId });
  if (!cart) cart = await Cart.create({ buyerProfileId, storeId, items: [] });
  return cart;
}

export async function getCartView(buyerProfileId: string, storeId: string) {
  const cart = await getOrCreateCart(buyerProfileId, storeId);
  const items = await Promise.all(
    cart.items.map(async (item) => {
      const product = await Product.findById(item.productId);
      const currentPrice = product ? unitPrice(product, item.selectedVariants) : item.priceSnapshot;
      return {
        itemId: item._id,
        productId: item.productId,
        quantity: item.quantity,
        selectedVariants: item.selectedVariants,
        priceSnapshot: item.priceSnapshot,
        currentPrice,
        priceChanged: product ? currentPrice !== item.priceSnapshot : false,
        available: Boolean(product && product.status === "active"),
        stock: product ? availableStock(product, item.selectedVariants) : 0,
        product: product
          ? {
              title: product.title,
              slug: product.slug,
              images: product.images,
              status: product.status,
              shippingFee: product.shippingFee,
            }
          : null,
      };
    }),
  );
  return { cartId: cart._id, items, count: items.reduce((s, i) => s + i.quantity, 0) };
}

export async function addToCart(
  buyerProfileId: string,
  storeId: string,
  input: { productId: string; quantity: number; selectedVariants?: Record<string, string> },
) {
  const product = await Product.findById(input.productId);
  if (!product || String(product.storeId) !== storeId || product.status !== "active") {
    throw ApiError.badRequest("Product is not available");
  }
  const selected = input.selectedVariants ?? {};
  assertVariants(product, selected);
  const stock = availableStock(product, selected);
  if (input.quantity < 1) throw ApiError.badRequest("Quantity must be at least 1");
  const cart = await getOrCreateCart(buyerProfileId, storeId);
  const existing = cart.items.find(
    (i) => String(i.productId) === input.productId && variantsKey(i.selectedVariants) === variantsKey(selected),
  );
  const nextQty = (existing?.quantity ?? 0) + input.quantity;
  if (nextQty > stock) throw ApiError.badRequest("Not enough stock");
  if (existing) existing.quantity = nextQty;
  else {
    cart.items.push({
      productId: product._id,
      quantity: input.quantity,
      selectedVariants: selected,
      priceSnapshot: unitPrice(product, selected),
    } as (typeof cart.items)[number]);
  }
  await cart.save();
  return getCartView(buyerProfileId, storeId);
}

export async function updateCartItem(
  buyerProfileId: string,
  storeId: string,
  itemId: string,
  quantity: number,
) {
  if (quantity < 1) throw ApiError.badRequest("Quantity must be at least 1");
  const cart = await getOrCreateCart(buyerProfileId, storeId);
  const item = cart.items.id(itemId);
  if (!item) throw ApiError.notFound("Cart item not found");
  const product = await Product.findById(item.productId);
  if (!product) throw ApiError.notFound("Product no longer exists");
  if (quantity > availableStock(product, item.selectedVariants)) {
    throw ApiError.badRequest("Not enough stock");
  }
  item.quantity = quantity;
  await cart.save();
  return getCartView(buyerProfileId, storeId);
}

export async function removeCartItem(buyerProfileId: string, storeId: string, itemId: string) {
  const cart = await getOrCreateCart(buyerProfileId, storeId);
  const item = cart.items.id(itemId);
  if (!item) throw ApiError.notFound("Cart item not found");
  item.deleteOne();
  await cart.save();
  return getCartView(buyerProfileId, storeId);
}

export async function clearCart(buyerProfileId: string, storeId: string) {
  const cart = await getOrCreateCart(buyerProfileId, storeId);
  cart.items.splice(0, cart.items.length);
  await cart.save();
  return getCartView(buyerProfileId, storeId);
}

export async function cartCount(buyerProfileId: string, storeId: string) {
  const cart = await Cart.findOne({ buyerProfileId, storeId });
  return cart ? cart.items.reduce((s, i) => s + i.quantity, 0) : 0;
}

export async function cleanupStaleCarts(): Promise<number> {
  const cutoff = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const res = await Cart.deleteMany({ updatedAt: { $lt: cutoff } });
  return res.deletedCount;
}
