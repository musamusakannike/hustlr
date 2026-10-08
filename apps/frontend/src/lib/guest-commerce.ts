"use client";

import type { AddCartInput, Cart, CartItem } from "@/types/cart";
import type { StorefrontProduct } from "@/types/storefront";
import { cartService, wishlistService } from "@/services/storefront";

const GUEST_CART_PREFIX = "hustlr_guest_cart_";
const GUEST_WISHLIST_PREFIX = "hustlr_guest_wishlist_";
const GUEST_WISHLIST_PRODUCTS_PREFIX = "hustlr_guest_wishlist_products_";

function getCartKey(slug: string): string {
  return `${GUEST_CART_PREFIX}${slug}`;
}

function getWishlistKey(slug: string): string {
  return `${GUEST_WISHLIST_PREFIX}${slug}`;
}

function getWishlistProductsKey(slug: string): string {
  return `${GUEST_WISHLIST_PRODUCTS_PREFIX}${slug}`;
}

export function getGuestCart(slug: string): Cart {
  if (typeof window === "undefined" || !slug) {
    return { items: [], subtotal: 0, count: 0 };
  }
  try {
    const raw = localStorage.getItem(getCartKey(slug));
    if (!raw) return { items: [], subtotal: 0, count: 0 };
    const parsed = JSON.parse(raw) as Cart;
    const items = parsed.items || [];
    const subtotal = items.reduce(
      (sum, i) => sum + (i.priceSnapshot || i.product?.price || 0) * (i.quantity || 1),
      0
    );
    const count = items.reduce((sum, i) => sum + (i.quantity || 1), 0);
    return {
      items,
      subtotal,
      count,
    };
  } catch {
    return { items: [], subtotal: 0, count: 0 };
  }
}

export function getGuestCartCount(slug: string): number {
  return getGuestCart(slug).count;
}

export function saveGuestCart(slug: string, cart: Cart): void {
  if (typeof window === "undefined" || !slug) return;
  try {
    localStorage.setItem(getCartKey(slug), JSON.stringify(cart));
  } catch {
    // ignore quota errors
  }
}

export function addGuestCartItem(
  slug: string,
  input: AddCartInput,
  productInfo?: CartItem["product"]
): Cart {
  const cart = getGuestCart(slug);
  const items = [...cart.items];
  const inputVariants = input.selectedVariants || {};

  const existingIndex = items.findIndex(
    (item) =>
      item.productId === input.productId &&
      JSON.stringify(item.selectedVariants || {}) === JSON.stringify(inputVariants)
  );

  const priceSnapshot = productInfo?.price || 0;

  if (existingIndex >= 0) {
    const existing = items[existingIndex];
    items[existingIndex] = {
      ...existing,
      quantity: existing.quantity + (input.quantity || 1),
      priceSnapshot: existing.priceSnapshot || priceSnapshot,
      product: productInfo || existing.product,
    };
  } else {
    const newItem: CartItem = {
      id: `guest_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      productId: input.productId,
      quantity: input.quantity || 1,
      selectedVariants: inputVariants,
      priceSnapshot,
      product: productInfo,
    };
    items.push(newItem);
  }

  const subtotal = items.reduce(
    (sum, i) => sum + (i.priceSnapshot || i.product?.price || 0) * i.quantity,
    0
  );
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const updatedCart: Cart = { items, subtotal, count };

  saveGuestCart(slug, updatedCart);
  return updatedCart;
}

export function updateGuestCartItem(slug: string, itemId: string, quantity: number): Cart {
  const cart = getGuestCart(slug);
  let items = [...cart.items];

  if (quantity <= 0) {
    items = items.filter((i) => i.id !== itemId);
  } else {
    items = items.map((i) => (i.id === itemId ? { ...i, quantity } : i));
  }

  const subtotal = items.reduce(
    (sum, i) => sum + (i.priceSnapshot || i.product?.price || 0) * i.quantity,
    0
  );
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const updatedCart: Cart = { items, subtotal, count };

  saveGuestCart(slug, updatedCart);
  return updatedCart;
}

export function removeGuestCartItem(slug: string, itemId: string): Cart {
  const cart = getGuestCart(slug);
  const items = cart.items.filter((i) => i.id !== itemId);
  const subtotal = items.reduce(
    (sum, i) => sum + (i.priceSnapshot || i.product?.price || 0) * i.quantity,
    0
  );
  const count = items.reduce((sum, i) => sum + i.quantity, 0);
  const updatedCart: Cart = { items, subtotal, count };

  saveGuestCart(slug, updatedCart);
  return updatedCart;
}

export function clearGuestCart(slug: string): Cart {
  const empty: Cart = { items: [], subtotal: 0, count: 0 };
  saveGuestCart(slug, empty);
  return empty;
}

// ----------------------------------------------------
// Wishlist
// ----------------------------------------------------

export function getGuestWishlistIds(slug: string): string[] {
  if (typeof window === "undefined" || !slug) return [];
  try {
    const raw = localStorage.getItem(getWishlistKey(slug));
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function getGuestWishlistProducts(slug: string): StorefrontProduct[] {
  if (typeof window === "undefined" || !slug) return [];
  try {
    const raw = localStorage.getItem(getWishlistProductsKey(slug));
    return raw ? (JSON.parse(raw) as StorefrontProduct[]) : [];
  } catch {
    return [];
  }
}

export function isGuestWishlisted(slug: string, productId: string): boolean {
  const ids = getGuestWishlistIds(slug);
  return ids.includes(productId);
}

export function getGuestWishlistCount(slug: string): number {
  return getGuestWishlistIds(slug).length;
}

export function toggleGuestWishlist(
  slug: string,
  productId: string,
  product?: StorefrontProduct
): { wishlisted: boolean; count: number } {
  if (typeof window === "undefined" || !slug) {
    return { wishlisted: false, count: 0 };
  }

  const ids = getGuestWishlistIds(slug);
  const products = getGuestWishlistProducts(slug);

  const exists = ids.includes(productId);
  let nextIds: string[];
  let nextProducts: StorefrontProduct[];
  let wishlisted = false;

  if (exists) {
    nextIds = ids.filter((id) => id !== productId);
    nextProducts = products.filter((p) => p.id !== productId);
    wishlisted = false;
  } else {
    nextIds = [...ids, productId];
    if (product) {
      nextProducts = [...products.filter((p) => p.id !== productId), { ...product, isWishlisted: true }];
    } else {
      nextProducts = products;
    }
    wishlisted = true;
  }

  try {
    localStorage.setItem(getWishlistKey(slug), JSON.stringify(nextIds));
    localStorage.setItem(getWishlistProductsKey(slug), JSON.stringify(nextProducts));
  } catch {
    // ignore
  }

  return { wishlisted, count: nextIds.length };
}

export function clearGuestWishlist(slug: string): void {
  if (typeof window === "undefined" || !slug) return;
  try {
    localStorage.removeItem(getWishlistKey(slug));
    localStorage.removeItem(getWishlistProductsKey(slug));
  } catch {
    // ignore
  }
}

export async function syncGuestDataToServer(slug: string): Promise<void> {
  if (typeof window === "undefined" || !slug) return;
  try {
    const guestCart = getGuestCart(slug);
    if (guestCart.items.length > 0) {
      for (const item of guestCart.items) {
        await cartService.add(slug, {
          productId: item.productId,
          quantity: item.quantity,
          selectedVariants: item.selectedVariants,
        }).catch(() => null);
      }
      clearGuestCart(slug);
    }

    const guestWishlistIds = getGuestWishlistIds(slug);
    if (guestWishlistIds.length > 0) {
      for (const id of guestWishlistIds) {
        await wishlistService.toggle(slug, id).catch(() => null);
      }
      clearGuestWishlist(slug);
    }
  } catch {
    // ignore sync errors
  }
}
