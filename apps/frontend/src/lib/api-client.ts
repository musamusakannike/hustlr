import type { Transport, UploadContext } from "@/lib/transport";
import { TransportError } from "@/lib/transport";
import { setAuthCookie, clearAuthCookie } from "@/lib/auth-cookie";
import type { ApiEnvelope } from "@/types/common";
import type { RegisterPendingResponse, AuthResponse } from "@/types/auth";
import type { Store, SlugCheckResult, UploadResult, StoreSetupInput } from "@/types/store";
import type { WebsiteTemplate, TemplateListFilters } from "@/types/template";
import type { Product, ProductFilters, ProductInput, BulkStatusInput } from "@/types/product";
import type { StoreCategory, CategoryInput } from "@/types/category";
import type { Kyc, KycInput, Bank } from "@/types/kyc";
import type {
  Subscription,
  SubscriptionPlan,
  SubscribeInput,
  InitializeSubscriptionResult,
  VerifySubscriptionResult,
} from "@/types/subscription";
import type { Paginated } from "@/types/common";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

/** Fetch wrapper that unwraps the `{ success, message, data }` envelope. */
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("hustlr_token") || localStorage.getItem("token")
      : null;

  const authHeaders: Record<string, string> = token
    ? { Authorization: `Bearer ${token}` }
    : {};

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      ...init,
      headers: {
        ...(init.body instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
        ...authHeaders,
        ...init.headers,
      },
    });
  } catch {
    throw new TransportError(
      "Cannot reach the Hustlr API. Check your connection and try again.",
      0
    );
  }

  const payload = (await response.json().catch(() => null)) as
    | ApiEnvelope<T>
    | null;

  if (!response.ok || !payload?.success) {
    throw new TransportError(
      payload?.message ?? "Something went wrong. Please try again.",
      response.status
    );
  }
  return payload.data;
}

function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

function send<T>(
  method: "POST" | "PUT" | "PATCH",
  path: string,
  body?: unknown
): Promise<T> {
  return request<T>(path, { method, body: JSON.stringify(body ?? {}) });
}

function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: "DELETE" });
}

function qs(params?: Record<string, string | number | undefined>): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "" && value !== "all") {
      search.set(key, String(value));
    }
  }
  const str = search.toString();
  return str ? `?${str}` : "";
}

/**
 * HTTP transport bound to the Express API. Route paths mirror
 * server/src/routes/{index,seller}.route.ts exactly.
 */
export class ApiTransport implements Transport {
  // ── Auth (§1): /auth/seller/* ────────────────────────────────
  registerSeller(input: { name: string; email: string; password: string; referralCode?: string }) {
    return send<RegisterPendingResponse>("POST", "/auth/seller/register", input);
  }
  async verifySellerOtp(input: { email: string; otp: string }) {
    const res = await send<AuthResponse & { token?: string; user?: any }>("POST", "/auth/seller/verify-otp", input);
    if (typeof window !== "undefined") {
      if (res.token) {
        localStorage.setItem("hustlr_token", res.token);
        setAuthCookie(res.token);
      }
      if (res.user) localStorage.setItem("hustlr_user", JSON.stringify(res.user));
    }
    return res;
  }
  resendSellerOtp(email: string) {
    return send<RegisterPendingResponse>("POST", "/auth/seller/resend-otp", { email });
  }
  async loginSeller(input: { email: string; password: string }) {
    const res = await send<AuthResponse & { token?: string; user?: any }>("POST", "/auth/seller/login", input);
    if (typeof window !== "undefined") {
      if (res.token) {
        localStorage.setItem("hustlr_token", res.token);
        setAuthCookie(res.token);
      }
      if (res.user) localStorage.setItem("hustlr_user", JSON.stringify(res.user));
    }
    return res;
  }
  async googleSeller(input: { idToken: string }) {
    const res = await send<AuthResponse & { token?: string; user?: any }>("POST", "/auth/seller/google", input);
    if (typeof window !== "undefined") {
      if (res.token) {
        localStorage.setItem("hustlr_token", res.token);
        setAuthCookie(res.token);
      }
      if (res.user) localStorage.setItem("hustlr_user", JSON.stringify(res.user));
    }
    return res;
  }
  forgotSellerPassword(input: { email: string }) {
    return send<{ message: string }>("POST", "/auth/seller/forgot-password", input);
  }
  resetSellerPassword(input: { email: string; otp: string; newPassword: string }) {
    return send<{ message: string }>("POST", "/auth/seller/reset-password", input);
  }
  async logoutSeller() {
    try {
      return await send<{ message: string }>("POST", "/auth/seller/logout");
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("hustlr_token");
        localStorage.removeItem("hustlr_user");
        localStorage.removeItem("hustlr_mock_session");
        clearAuthCookie();
      }
    }
  }
  async getSellerMe(): Promise<AuthResponse> {
    const res = await get<any>("/auth/seller/me");
    const user = (res && typeof res === "object" && "user" in res) ? res.user : res;
    return { user };
  }

  // ── Store (§2) ───────────────────────────────────────────────
  async getStore() {
    const store = await get<any>("/store");
    if (store && store.templateId && typeof store.templateId === "object") {
      store.templateId = store.templateId._id || store.templateId.id;
    }
    return store as Store;
  }
  setupStore(input: StoreSetupInput) {
    return send<Store>("PUT", "/store/setup", input);
  }
  checkSlug(slug: string) {
    return get<SlugCheckResult>(`/store/slug-check${qs({ slug })}`);
  }
  setStoreTemplate(templateId: string) {
    return send<Store>("PUT", "/store/template", { templateId });
  }
  async uploadAsset(ctx: UploadContext): Promise<UploadResult> {
    const form = new FormData();
    form.append("file", ctx.file);
    const url =
      ctx.kind.startsWith("kyc")
        ? "/upload/document"
        : "/upload/image";
    return request<UploadResult>(url, { method: "POST", body: form });
  }

  // ── Templates (§3) ───────────────────────────────────────────
  async listTemplates(filters?: TemplateListFilters) {
    const list = await get<any[]>(
      `/templates${qs(filters as Record<string, string> | undefined)}`
    );
    if (!Array.isArray(list)) return [];
    return list.map((t) => ({
      ...t,
      id: t.id || t._id,
      _id: t._id || t.id,
    })) as WebsiteTemplate[];
  }

  // ── KYC (§4) ─────────────────────────────────────────────────
  getMyKyc() {
    return get<Kyc>("/kyc");
  }
  upsertKyc(input: KycInput) {
    return send<Kyc>("PUT", "/kyc", input);
  }
  submitKyc() {
    return send<Kyc>("POST", "/kyc/submit");
  }

  // ── Subscriptions (§5) ───────────────────────────────────────
  listPlans() {
    return get<SubscriptionPlan[]>("/plans");
  }
  getCurrentSubscription() {
    return get<Subscription | null>("/subscriptions/current");
  }
  subscribeFree() {
    return send<VerifySubscriptionResult>("POST", "/subscriptions/free");
  }
  initializeSubscription(input: SubscribeInput) {
    return send<InitializeSubscriptionResult>("POST", "/subscriptions/initialize", input);
  }
  verifySubscription(reference: string) {
    return send<VerifySubscriptionResult>("POST", "/subscriptions/verify", { reference });
  }
  cancelSubscription() {
    return send<Subscription>("POST", "/subscriptions/cancel");
  }
  changePlan(input: SubscribeInput) {
    return send<InitializeSubscriptionResult>("POST", "/subscriptions/change-plan", input);
  }

  // ── Products (§6): /seller/products* ─────────────────────────
  listProducts(filters?: ProductFilters) {
    return get<Paginated<Product>>(
      `/seller/products${qs(filters as Record<string, string | number> | undefined)}`
    );
  }
  getProduct(productId: string) {
    return get<Product>(`/seller/products/${productId}`);
  }
  createProduct(input: ProductInput) {
    return send<Product>("POST", "/seller/products", input);
  }
  updateProduct(productId: string, input: Partial<ProductInput>) {
    return send<Product>("PUT", `/seller/products/${productId}`, input);
  }
  setProductStatus(productId: string, status: ProductInput["status"]) {
    return send<Product>("PATCH", `/seller/products/${productId}/status`, { status });
  }
  bulkProductStatus(input: BulkStatusInput) {
    return send<{ updated: number }>("PATCH", "/seller/products/bulk-status", input);
  }
  archiveProduct(productId: string) {
    return del<Product>(`/seller/products/${productId}`);
  }

  // ── Categories (§7): /seller/categories* ─────────────────────
  listCategories() {
    return get<StoreCategory[]>("/seller/categories");
  }
  createCategory(input: CategoryInput) {
    return send<StoreCategory>("POST", "/seller/categories", input);
  }
  updateCategory(categoryId: string, input: Partial<CategoryInput>) {
    return send<StoreCategory>("PUT", `/seller/categories/${categoryId}`, input);
  }
  deleteCategory(categoryId: string) {
    return del<{ message: string }>(`/seller/categories/${categoryId}`);
  }

  // ── Misc ─────────────────────────────────────────────────────
  listBanks() {
    return get<Bank[]>("/paystack-banks");
  }
}
