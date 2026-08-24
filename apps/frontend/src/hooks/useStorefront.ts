"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  buyerOrderService,
  cartService,
  checkoutService,
  storefrontService,
  wishlistService,
} from "@/services/storefront";
import type { StorefrontFilters } from "@/types/storefront";
import type { AddCartInput, CheckoutInput } from "@/types/cart";
import { useBuyerAuth } from "@/context/BuyerAuthContext";

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
  const { slug, isAuthenticated } = useBuyerAuth();
  return useQuery({
    queryKey: ["cart", slug],
    queryFn: () => cartService.get(slug),
    enabled: isAuthenticated,
  });
}

export function useCartCount() {
  const { slug, isAuthenticated } = useBuyerAuth();
  return useQuery({
    queryKey: ["cart-count", slug],
    queryFn: () => cartService.count(slug),
    enabled: isAuthenticated,
    refetchInterval: 20_000,
  });
}

export function useAddToCart() {
  const { slug } = useBuyerAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: AddCartInput) => cartService.add(slug, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart", slug] });
      qc.invalidateQueries({ queryKey: ["cart-count", slug] });
    },
  });
}

export function useUpdateCart() {
  const { slug } = useBuyerAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      cartService.update(slug, itemId, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart", slug] }),
  });
}

export function useRemoveCartItem() {
  const { slug } = useBuyerAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (itemId: string) => cartService.remove(slug, itemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart", slug] });
      qc.invalidateQueries({ queryKey: ["cart-count", slug] });
    },
  });
}

export function useCheckout() {
  const { slug } = useBuyerAuth();
  return useMutation({
    mutationFn: (input: CheckoutInput) => checkoutService.initiate(slug, input),
  });
}

export function useVerifyCheckout() {
  const { slug } = useBuyerAuth();
  return useMutation({
    mutationFn: (reference: string) => checkoutService.verify(slug, reference),
  });
}

export function useToggleWish() {
  const { slug } = useBuyerAuth();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => wishlistService.toggle(slug, productId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wishlist", slug] });
      qc.invalidateQueries({ queryKey: ["storefront-product", slug] });
    },
  });
}

export function useWishlist() {
  const { slug, isAuthenticated } = useBuyerAuth();
  return useQuery({
    queryKey: ["wishlist", slug],
    queryFn: () => wishlistService.list(slug),
    enabled: isAuthenticated,
  });
}

export function useBuyerOrders() {
  const { slug, isAuthenticated } = useBuyerAuth();
  return useQuery({
    queryKey: ["buyer-orders", slug],
    queryFn: () => buyerOrderService.list(slug),
    enabled: isAuthenticated,
  });
}

export function useBuyerOrder(orderId: string) {
  const { slug } = useBuyerAuth();
  return useQuery({
    queryKey: ["buyer-order", slug, orderId],
    queryFn: () => buyerOrderService.get(slug, orderId),
    enabled: Boolean(orderId),
  });
}

export function useConfirmReceipt() {
  const { slug } = useBuyerAuth();
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
