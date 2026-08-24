"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  analyticsService,
  blogService,
  couponService,
  disputeService,
  domainService,
  notificationService,
  orderService,
  referralService,
  reviewService,
  ticketService,
  walletService,
} from "@/services/commerce";
import type { OrderFilters, ShipOrderInput } from "@/types/order";
import type { CouponInput } from "@/types/coupon";
import type { BlogInput } from "@/types/blog";
import type { CreateTicketInput } from "@/types/ticket";
import type { PaginatedQuery } from "@/types/common";

export function useOrderStats() {
  return useQuery({
    queryKey: ["seller-order-stats"],
    queryFn: () => orderService.stats(),
  });
}

export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: ["seller-orders", filters],
    queryFn: () => orderService.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useOrder(orderId: string) {
  return useQuery({
    queryKey: ["seller-order", orderId],
    queryFn: () => orderService.get(orderId),
    enabled: Boolean(orderId),
  });
}

export function useShipOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ orderId, input }: { orderId: string; input: ShipOrderInput }) =>
      orderService.ship(orderId, input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-orders"] });
      qc.invalidateQueries({ queryKey: ["seller-order"] });
      qc.invalidateQueries({ queryKey: ["seller-order-stats"] });
    },
  });
}

export function useWallet() {
  return useQuery({
    queryKey: ["seller-wallet"],
    queryFn: () => walletService.get(),
  });
}

export function useWalletTransactions(query?: PaginatedQuery & { type?: string; status?: string }) {
  return useQuery({
    queryKey: ["seller-wallet-tx", query],
    queryFn: () => walletService.transactions(query),
  });
}

export function useWithdraw() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => walletService.withdraw(amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["seller-wallet"] });
      qc.invalidateQueries({ queryKey: ["seller-wallet-tx"] });
    },
  });
}

export function useCoupons(query?: PaginatedQuery & { isActive?: boolean }) {
  return useQuery({
    queryKey: ["seller-coupons", query],
    queryFn: () => couponService.list(query),
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CouponInput) => couponService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller-coupons"] }),
  });
}

export function useToggleCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => couponService.toggle(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller-coupons"] }),
  });
}

export function useSellerReviews(query?: PaginatedQuery) {
  return useQuery({
    queryKey: ["seller-reviews", query],
    queryFn: () => reviewService.list(query),
  });
}

export function useReplyReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, text }: { id: string; text: string }) => reviewService.reply(id, text),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller-reviews"] }),
  });
}

export function useSellerDisputes(query?: PaginatedQuery) {
  return useQuery({
    queryKey: ["seller-disputes", query],
    queryFn: () => disputeService.list(query),
  });
}

export function useDispute(id: string) {
  return useQuery({
    queryKey: ["seller-dispute", id],
    queryFn: () => disputeService.get(id),
    enabled: Boolean(id),
  });
}

export function useMessageDispute() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      disputeService.message(id, message),
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["seller-dispute", vars.id] });
      qc.invalidateQueries({ queryKey: ["seller-disputes"] });
    },
  });
}

export function useBlogPosts(query?: PaginatedQuery) {
  return useQuery({
    queryKey: ["seller-blog", query],
    queryFn: () => blogService.list(query),
  });
}

export function useBlogPost(id: string) {
  return useQuery({
    queryKey: ["seller-blog-post", id],
    queryFn: () => blogService.get(id),
    enabled: Boolean(id),
  });
}

export function useSaveBlog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: string; data: BlogInput }) =>
      input.id ? blogService.update(input.id, input.data) : blogService.create(input.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["seller-blog"] }),
  });
}

export function useAnalyticsOverview() {
  return useQuery({
    queryKey: ["seller-analytics"],
    queryFn: () => analyticsService.overview(),
  });
}

export function useRevenueTrend(period = "30d") {
  return useQuery({
    queryKey: ["seller-analytics-trend", period],
    queryFn: () => analyticsService.trend(period),
  });
}

export function useTopProducts() {
  return useQuery({
    queryKey: ["seller-analytics-top"],
    queryFn: () => analyticsService.top(),
  });
}

export function useReferrals() {
  return useQuery({
    queryKey: ["seller-referrals"],
    queryFn: () => referralService.get(),
  });
}

export function useNotifications(query?: PaginatedQuery) {
  return useQuery({
    queryKey: ["notifications", query],
    queryFn: () => notificationService.list(query),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: ["notifications-unread"],
    queryFn: () => notificationService.unread(),
    refetchInterval: 30_000,
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.readAll(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
      qc.invalidateQueries({ queryKey: ["notifications-unread"] });
    },
  });
}

export function useTickets(query?: PaginatedQuery) {
  return useQuery({
    queryKey: ["tickets", query],
    queryFn: () => ticketService.list(query),
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ["ticket", id],
    queryFn: () => ticketService.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateTicketInput) => ticketService.create(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tickets"] }),
  });
}

export function useReplyTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, message }: { id: string; message: string }) =>
      ticketService.reply(id, message),
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["ticket", vars.id] }),
  });
}

export function useSetDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (domain: string) => domainService.set(domain),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store"] }),
  });
}

export function useVerifyDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => domainService.verify(),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["store"] }),
  });
}
