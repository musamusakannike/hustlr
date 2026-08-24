"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { storeService, templateService } from "@/services/store";
import type { StoreSetupInput } from "@/types/store";
import type { TemplateListFilters } from "@/types/template";

export function useStore() {
  return useQuery({
    queryKey: ["store"],
    queryFn: () => storeService.getStore(),
  });
}

export function useSetupStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: StoreSetupInput) => storeService.setupStore(input),
    onSuccess: (store) => {
      queryClient.setQueryData(["store"], store);
    },
  });
}

export function useSlugCheck(slug: string | null) {
  return useQuery({
    queryKey: ["slug-check", slug],
    queryFn: () => storeService.checkSlug(slug as string),
    enabled: Boolean(slug && slug.length >= 3),
    staleTime: 0,
  });
}

export function useSetTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (templateId: string) => storeService.setTemplate(templateId),
    onSuccess: (store) => {
      queryClient.setQueryData(["store"], store);
    },
  });
}

export function useUploadAsset() {
  return useMutation({
    mutationFn: storeService.uploadAsset,
  });
}

export function useTemplates(filters?: TemplateListFilters) {
  return useQuery({
    queryKey: ["templates", filters?.tier ?? "all", filters?.category ?? "all"],
    queryFn: () => templateService.list(filters),
  });
}
