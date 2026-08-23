"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { kycService } from "@/services/billing";
import type { KycInput } from "@/types/kyc";

/**
 * Polls while the application is pending so the simulated (mock) or real
 * admin review flips the status banner without a manual refresh.
 */
export function useKyc() {
  return useQuery({
    queryKey: ["kyc"],
    queryFn: () => kycService.get(),
    refetchInterval: (query) =>
      query.state.data?.status === "pending" ? 4000 : false,
  });
}

export function useUpsertKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: KycInput) => kycService.upsert(input),
    onSuccess: (kyc) => {
      queryClient.setQueryData(["kyc"], kyc);
    },
  });
}

export function useSubmitKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => kycService.submit(),
    onSuccess: (kyc) => {
      queryClient.setQueryData(["kyc"], kyc);
    },
  });
}

export function useBanks() {
  return useQuery({
    queryKey: ["banks"],
    queryFn: () => kycService.listBanks(),
    staleTime: Infinity,
  });
}
