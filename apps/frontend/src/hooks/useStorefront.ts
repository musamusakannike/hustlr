"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  buyerOrderService,
  cartService,
  checkoutService,
  storefrontService,
  wishlistService,
} from "@/services/storefront";
import type { StorefrontFilters, StorefrontProduct } from "@/types/storefront";
import type { AddCartInput, CartItem, CheckoutInput } from "@/types/cart";
import { useOptionalBuyerAuth } from "@/context/BuyerAuthContext";
import {
  addGuestCartItem,
  clearGuestCart,
  getGuestCart,
  getGuestCartCount,
  getGuestWishlistCount,
  getGuestWishlistProducts,
  removeGuestCartItem,
  toggleGuestWishlist,
  updateGuestCartItem,
} from "@/lib/guest-commerce";

export function useStorefrontInfo(slug: string) {
  return useQuery({
    queryKey: ["storefront-info", slug],
    queryFn: () => storefrontService.info(slug),
    retry: false,
  });
}

export function useStorefrontProducts(slug: string, filters: StorefrontFilters = {}) {
  return useQuery({
    queryKey: ["storefront-products", slug, filters],
    queryFn: () => storefrontService.products(slug, filters),
    placeholderData: (prev) => prev,
  });
}

export function useStorefrontProduct(slug: string, productSlug: string) {
  return useQuery({
    queryKey: ["storefront-product", slug, productSlug],
    queryFn: () => storefrontService.product(slug, productSlug),
    enabled: Boolean(productSlug),
  });
}

export function useStorefrontCategories(slug: string) {
  return useQuery({
    queryKey: ["storefront-categories", slug],
    queryFn: () => storefrontService.categories(slug),
  });
}

export function useFeatured(slug: string) {
  return useQuery({
    queryKey: ["storefront-featured", slug],
    queryFn: () => storefrontService.featured(slug),
  });
}

export function useNewArrivals(slug: string) {
  return useQuery({
    queryKey: ["storefront-new", slug],
    queryFn: () => storefrontService.newArrivals(slug),
  });
}

export function useBestSellers(slug: string) {
  return useQuery({
    queryKey: ["storefront-best", slug],
    queryFn: () => storefrontService.bestSellers(slug),
  });
}

export function useCart() {
  const ctx = useOptionalBuyerAuth();
  const slug = ctx?.slug ?? "";
  const isAuthenticated = ctx?.isAuthenticated ?? false;
  return useQuery({
    queryKey: ["cart", slug, isAuthenticated],
    queryFn: async () => {
      if (isAuthenticated) {
        return cartService.get(slug);
      }
      return getGuestCart(slug);
    },
    enabled: !!slug,
  });
}

export function useCartCount() {
  const ctx = useOptionalBuyerAuth();
  const slug = ctx?.slug ?? "";
  const isAuthenticated = ctx?.isAuthenticated ?? false;
  return useQuery({
    queryKey: ["cart-count", slug, isAuthenticated],
    queryFn: async () => {
      if (isAuthenticated) {
        return cartService.count(slug);
      }
      return { count: getGuestCartCount(slug) };
    },
    enabled: !!slug,
    refetchInterval: 10_000,
  });
}

export function useAddToCart(overrideSlug?: string) {
  const ctx = useOptionalBuyerAuth();
  const slug = overrideSlug || ctx?.slug || "";
  const isAuthenticated = ctx?.isAuthenticated ?? false;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: AddCartInput & { product?: CartItem["product"] }) => {
      if (isAuthenticated) {
        const { product, ...payload } = input;
        return cartService.add(slug, payload);
      }
      return addGuestCartItem(slug, input, input.product);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart", slug] });
      qc.invalidateQueries({ queryKey: ["cart-count", slug] });
    },
  });
}

export function useUpdateCart() {
  const ctx = useOptionalBuyerAuth();
  const slug = ctx?.slug ?? "";
  const isAuthenticated = ctx?.isAuthenticated ?? false;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: string; quantity: number }) => {
      if (isAuthenticated) {
        return cartService.update(slug, itemId, quantity);
      }
      return updateGuestCartItem(slug, itemId, quantity);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart", slug] });
      qc.invalidateQueries({ queryKey: ["cart-count", slug] });
    },
  });
}

export function useRemoveCartItem() {
  const ctx = useOptionalBuyerAuth();
  const slug = ctx?.slug ?? "";
  const isAuthenticated = ctx?.isAuthenticated ?? false;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      if (isAuthenticated) {
        return cartService.remove(slug, itemId);
      }
      return removeGuestCartItem(slug, itemId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart", slug] });
      qc.invalidateQueries({ queryKey: ["cart-count", slug] });
    },
  });
}

export function useClearCart() {
  const ctx = useOptionalBuyerAuth();
  const slug = ctx?.slug ?? "";
  const isAuthenticated = ctx?.isAuthenticated ?? false;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (isAuthenticated) {
        return cartService.clear(slug);
      }
      return clearGuestCart(slug);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart", slug] });
      qc.invalidateQueries({ queryKey: ["cart-count", slug] });
    },
  });
}

export function useCheckout() {
  const ctx = useOptionalBuyerAuth();
  const slug = ctx?.slug ?? "";
  return useMutation({
    mutationFn: (input: CheckoutInput) => checkoutService.initiate(slug, input),
  });
}

export function useVerifyCheckout() {
  const ctx = useOptionalBuyerAuth();
  const slug = ctx?.slug ?? "";
  return useMutation({
    mutationFn: (reference: string) => checkoutService.verify(slug, reference),
  });
}

export function useToggleWish() {
  const ctx = useOptionalBuyerAuth();
  const slug = ctx?.slug ?? "";
  const isAuthenticated = ctx?.isAuthenticated ?? false;
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      arg: string | { productId: string; product?: StorefrontProduct }
    ) => {
      const productId = typeof arg === "string" ? arg : arg.productId;
      const product = typeof arg === "string" ? undefined : arg.product;
      if (isAuthenticated) {
        return wishlistService.toggle(slug, productId);
      }
      return toggleGuestWishlist(slug, productId, product);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist", slug] });
      qc.invalidateQueries({ queryKey: ["wishlist-count", slug] });
      qc.invalidateQueries({ queryKey: ["storefront-product", slug] });
      qc.invalidateQueries({ queryKey: ["storefront-products", slug] });
      qc.invalidateQueries({ queryKey: ["featured-products", slug] });
      qc.invalidateQueries({ queryKey: ["new-arrivals", slug] });
      qc.invalidateQueries({ queryKey: ["best-sellers", slug] });
    },
  });
}

export function useWishlist() {
  const ctx = useOptionalBuyerAuth();
  const slug = ctx?.slug ?? "";
  const isAuthenticated = ctx?.isAuthenticated ?? false;
  return useQuery({
    queryKey: ["wishlist", slug, isAuthenticated],
    queryFn: async () => {
      if (isAuthenticated) {
        return wishlistService.list(slug);
      }
      return getGuestWishlistProducts(slug);
    },
    enabled: !!slug,
  });
}

export function useWishlistCount() {
  const ctx = useOptionalBuyerAuth();
  const slug = ctx?.slug ?? "";
  const isAuthenticated = ctx?.isAuthenticated ?? false;
  return useQuery({
    queryKey: ["wishlist-count", slug, isAuthenticated],
    queryFn: async () => {
      if (isAuthenticated) {
        const list = await wishlistService.list(slug).catch(() => []);
        return { count: list.length };
      }
      return { count: getGuestWishlistCount(slug) };
    },
    enabled: !!slug,
    refetchInterval: 10_000,
  });
}

export function useBuyerOrders() {
  const ctx = useOptionalBuyerAuth();
  const slug = ctx?.slug ?? "";
  const isAuthenticated = ctx?.isAuthenticated ?? false;
  return useQuery({
    queryKey: ["buyer-orders", slug],
    queryFn: () => buyerOrderService.list(slug),
    enabled: isAuthenticated && !!slug,
  });
}

export function useBuyerOrder(orderId: string) {
  const ctx = useOptionalBuyerAuth();
  const slug = ctx?.slug ?? "";
  return useQuery({
    queryKey: ["buyer-order", slug, orderId],
    queryFn: () => buyerOrderService.get(slug, orderId),
    enabled: Boolean(orderId) && !!slug,
  });
}

export function useConfirmReceipt() {
  const ctx = useOptionalBuyerAuth();
  const slug = ctx?.slug ?? "";
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => buyerOrderService.confirm(slug, orderId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["buyer-order", slug] }),
  });
}

export function useProductReviews(slug: string, productSlug: string) {
  return useQuery({
    queryKey: ["storefront-reviews", slug, productSlug],
    queryFn: () => storefrontService.reviews(slug, productSlug),
    enabled: Boolean(productSlug),
  });
}
