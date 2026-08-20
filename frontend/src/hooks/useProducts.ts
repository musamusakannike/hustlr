"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService, categoryService } from "@/services/products";
import type {
  ProductFilters,
  ProductInput,
  BulkStatusInput,
} from "@/types/product";
import type { CategoryInput } from "@/types/category";

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: [
      "products",
      filters.status ?? "all",
      filters.category ?? "all",
      filters.search ?? "",
      filters.page ?? 1,
    ],
    queryFn: () => productService.list(filters),
    placeholderData: (prev) => prev,
  });
}

export function useProduct(productId: string) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => productService.get(productId),
    enabled: Boolean(productId),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInput) => productService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      input,
    }: {
      productId: string;
      input: Partial<ProductInput>;
    }) => productService.update(productId, input),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.setQueryData(["product", product.id], product);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useSetProductStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      productId,
      status,
    }: {
      productId: string;
      status: ProductInput["status"];
    }) => productService.setStatus(productId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useBulkProductStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BulkStatusInput) => productService.bulkStatus(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useArchiveProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (productId: string) => productService.archive(productId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.list(),
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInput) => categoryService.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      categoryId,
      input,
    }: {
      categoryId: string;
      input: Partial<CategoryInput>;
    }) => categoryService.update(categoryId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (categoryId: string) => categoryService.delete(categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
