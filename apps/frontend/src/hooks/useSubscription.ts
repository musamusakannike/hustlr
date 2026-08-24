"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscriptionService } from "@/services/billing";
import type {
  PlanEntitlements,
  SubscribeInput,
} from "@/types/subscription";

export function usePlans() {
  return useQuery({
    queryKey: ["plans"],
    queryFn: () => subscriptionService.listPlans(),
    staleTime: 5 * 60_000,
  });
}

export function useCurrentSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: () => subscriptionService.current(),
  });
}

/** Derives plan entitlements (limits + feature flags) for tier gating. */
export function usePlanEntitlements(): {
  entitlements: PlanEntitlements;
  isLoading: boolean;
  planName: "free" | "pro" | "pro+";
} {
  const { data: subscription } = useCurrentSubscription();
  const { data: plans } = usePlans();

  const planName = subscription?.planName ?? "free";
  const plan = plans?.find((p) => p.name === planName);
  return {
    entitlements: {
      maxProducts: plan?.maxProducts ?? 25,
      allowCustomDomain: plan?.allowCustomDomain ?? false,
      allowProTemplates: plan?.allowProTemplates ?? false,
      allowProPlusTemplates: plan?.allowProPlusTemplates ?? false,
      allowBlog: plan?.allowBlog ?? false,
      commissionPercent: plan?.commissionPercent ?? 10,
    },
    isLoading: !plans,
    planName,
  };
}

function useInvalidateSubscription() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["subscription"] });
    queryClient.invalidateQueries({ queryKey: ["store"] });
    queryClient.invalidateQueries({ queryKey: ["templates"] });
  };
}

export function useSubscribeFree() {
  const invalidate = useInvalidateSubscription();
  return useMutation({
    mutationFn: () => subscriptionService.subscribeFree(),
    onSuccess: invalidate,
  });
}

export function useInitializeSubscription() {
  return useMutation({
    mutationFn: (input: SubscribeInput) => subscriptionService.initialize(input),
  });
}

export function useVerifySubscription() {
  const invalidate = useInvalidateSubscription();
  return useMutation({
    mutationFn: (reference: string) => subscriptionService.verify(reference),
    onSuccess: invalidate,
  });
}

export function useCancelSubscription() {
  const invalidate = useInvalidateSubscription();
  return useMutation({
    mutationFn: () => subscriptionService.cancel(),
    onSuccess: invalidate,
  });
}

export function useChangePlan() {
  const invalidate = useInvalidateSubscription();
  return useMutation({
    mutationFn: (input: SubscribeInput) => subscriptionService.changePlan(input),
    onSuccess: invalidate,
  });
}
