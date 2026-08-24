import type { Transport, UploadContext } from "@/lib/transport";
import { TransportError } from "@/lib/transport";
import {
  setAuthCookie,
  clearAuthCookie,
  setBuyerAuthCookie,
  clearBuyerAuthCookie,
} from "@/lib/auth-cookie";
import { fromPaged, withId, type ApiEnvelope, type Paginated } from "@/types/common";
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
import type { Order, OrderFilters, OrderStats, ShipOrderInput } from "@/types/order";
import type { Wallet, WalletTransaction } from "@/types/wallet";
import type { Coupon, CouponInput, CouponValidation } from "@/types/coupon";
import type { Review } from "@/types/review";
import type { Dispute } from "@/types/dispute";
import type { BlogPost, BlogInput } from "@/types/blog";
import type { AppNotification } from "@/types/notification";
import type { SupportTicket, CreateTicketInput } from "@/types/ticket";
import type { ReferralSummary } from "@/types/referral";
import type {
  AnalyticsOverview,
  DomainDns,
  RevenuePoint,
  StorefrontFilters,
  StorefrontInfo,
  StorefrontProduct,
  TopProductRow,
  AiTextResult,
} from "@/types/storefront";
import type { AddCartInput, Cart, CheckoutInput, CheckoutResult } from "@/types/cart";
import type { BuyerAuthResponse, BuyerRegisterInput } from "@/types/buyer";
import type { ForgotPasswordInput, ResetPasswordInput, SellerLoginInput, VerifyOtpInput, GoogleAuthInput } from "@/types/auth";
import type { PaginatedQuery } from "@/types/common";
import type { OpenDisputeInput } from "@/types/dispute";
import type { CreateReviewInput } from "@/types/review";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

type Audience = "seller" | "buyer";

interface RequestOptions {
  audience?: Audience;
  storeSlug?: string | null;
}

let activeStoreSlug: string | null = null;

function mapDoc<T>(doc: T): T {
  if (!doc || typeof doc !== "object") return doc;
  return withId(doc as T & { _id?: unknown; id?: string });
}

function mapList<T>(items: T[] | undefined): T[] {
  return (items ?? []).map((item) => mapDoc(item));
}

function pageOf<T>(raw: unknown): Paginated<T> {
  const data = raw as { items?: T[]; meta?: { page?: number; limit?: number; total?: number; totalPages?: number } };
  const paged = fromPaged<T>(data ?? { items: [] });
  return { ...paged, items: mapList(paged.items) };
}

function persistSeller(res: AuthResponse & { token?: string; user?: AuthResponse["user"] }) {
  if (typeof window === "undefined") return res;
  if (res.token) {
    localStorage.setItem("hustlr_token", res.token);
    setAuthCookie(res.token);
  }
  if (res.user) localStorage.setItem("hustlr_user", JSON.stringify(mapDoc(res.user)));
  return res;
}

function persistBuyer(res: BuyerAuthResponse) {
  if (typeof window === "undefined") return res;
  if (res.token) {
    localStorage.setItem("hustlr_buyer_token", res.token);
    setBuyerAuthCookie(res.token);
  }
  if (res.user) {
    localStorage.setItem("hustlr_buyer_user", JSON.stringify(mapDoc(res.user)));
  }
  return { ...res, user: mapDoc(res.user) };
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  opts: RequestOptions = {}
): Promise<T> {
  const audience = opts.audience ?? "seller";
  const slug = opts.storeSlug ?? activeStoreSlug;
  const tokenKey = audience === "buyer" ? "hustlr_buyer_token" : "hustlr_token";
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem(tokenKey) || (audience === "seller" ? localStorage.getItem("token") : null)
      : null;

  const extra: Record<string, string> = {};
  if (token) extra.Authorization = `Bearer ${token}`;
  if (slug) extra["X-Store-Slug"] = slug;

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      credentials: "include",
      ...init,
      headers: {
        ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...extra,
        ...(init.headers as Record<string, string> | undefined),
      },
    });
  } catch {
    throw new TransportError(
      "Cannot reach the Hustlr API. Check your connection and try again.",
      0
    );
  }

  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;
  if (!response.ok || !payload?.success) {
    throw new TransportError(
      payload?.message ?? "Something went wrong. Please try again.",
      response.status
    );
  }
  return payload.data;
}

function get<T>(path: string, opts?: RequestOptions): Promise<T> {
  return request<T>(path, {}, opts);
}

function send<T>(
  method: "POST" | "PUT" | "PATCH",
  path: string,
  body?: unknown,
  opts?: RequestOptions
): Promise<T> {
  return request<T>(path, { method, body: JSON.stringify(body ?? {}) }, opts);
}

function del<T>(path: string, opts?: RequestOptions): Promise<T> {
  return request<T>(path, { method: "DELETE" }, opts);
}

function qs(params?: Record<string, string | number | boolean | undefined>): string {
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

const sf = (slug: string): RequestOptions => ({ audience: "buyer", storeSlug: slug });

export class ApiTransport implements Transport {
  setStoreSlug(slug: string | null) {
    activeStoreSlug = slug;
  }

  registerSeller(input: { name: string; email: string; password: string; referralCode?: string }) {
    return send<RegisterPendingResponse>("POST", "/auth/seller/register", input);
  }
  async verifySellerOtp(input: VerifyOtpInput) {
    return persistSeller(await send<AuthResponse>("POST", "/auth/seller/verify-otp", input));
  }
  resendSellerOtp(email: string) {
    return send<RegisterPendingResponse>("POST", "/auth/seller/resend-otp", { email });
  }
  async loginSeller(input: SellerLoginInput) {
    return persistSeller(await send<AuthResponse>("POST", "/auth/seller/login", input));
  }
  async googleSeller(input: GoogleAuthInput) {
    return persistSeller(await send<AuthResponse>("POST", "/auth/seller/google", input));
  }
  forgotSellerPassword(input: ForgotPasswordInput) {
    return send<{ message: string }>("POST", "/auth/seller/forgot-password", input);
  }
  resetSellerPassword(input: ResetPasswordInput) {
    return send<{ message: string }>("POST", "/auth/seller/reset-password", {
      email: input.email,
      otp: input.otp,
      password: input.newPassword,
    });
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
    const res = await get<AuthResponse["user"] | AuthResponse>("/auth/seller/me");
    const user = res && typeof res === "object" && "user" in res ? (res as AuthResponse).user : (res as AuthResponse["user"]);
    return { user: mapDoc(user) };
  }

  async getStore() {
    const store = await get<Store>("/store");
    return mapDoc(store);
  }
  async setupStore(input: StoreSetupInput) {
    return mapDoc(await send<Store>("PUT", "/store/setup", input));
  }
  checkSlug(slug: string) {
    return get<SlugCheckResult>(`/store/slug-check${qs({ slug })}`);
  }
  async setStoreTemplate(templateId: string) {
    return mapDoc(await send<Store>("PUT", "/store/template", { templateId }));
  }
  async uploadAsset(ctx: UploadContext): Promise<UploadResult> {
    const form = new FormData();
    form.append("file", ctx.file);
    const url = ctx.kind.startsWith("kyc") ? "/kyc/upload" : "/upload/image";
    return request<UploadResult>(url, { method: "POST", body: form });
  }
  setCustomDomain(domain: string) {
    return send<{ store: Store; dns: DomainDns }>("PUT", "/seller/store/custom-domain", { domain });
  }
  verifyCustomDomain() {
    return send<{ verified: boolean; store: Store }>("POST", "/seller/store/verify-domain");
  }
  async removeCustomDomain() {
    return mapDoc(await del<Store>("/seller/store/custom-domain"));
  }

  async listTemplates(filters?: TemplateListFilters) {
    const list = await get<WebsiteTemplate[]>(
      `/templates${qs(filters as Record<string, string> | undefined)}`
    );
    return mapList(Array.isArray(list) ? list : []);
  }

  async getMyKyc() {
    return mapDoc(await get<Kyc>("/kyc"));
  }
  async upsertKyc(input: KycInput) {
    return mapDoc(await send<Kyc>("PUT", "/kyc", input));
  }
  async submitKyc() {
    return mapDoc(await send<Kyc>("POST", "/kyc/submit"));
  }

  async listPlans() {
    return mapList(await get<SubscriptionPlan[]>("/plans"));
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

  async listProducts(filters?: ProductFilters) {
    const raw = await get<unknown>(
      `/seller/products${qs(filters as Record<string, string | number> | undefined)}`
    );
    return pageOf<Product>(raw);
  }
  async getProduct(productId: string) {
    return mapDoc(await get<Product>(`/seller/products/${productId}`));
  }
  async createProduct(input: ProductInput) {
    return mapDoc(await send<Product>("POST", "/seller/products", input));
  }
  async updateProduct(productId: string, input: Partial<ProductInput>) {
    return mapDoc(await send<Product>("PUT", `/seller/products/${productId}`, input));
  }
  async setProductStatus(productId: string, status: ProductInput["status"]) {
    return mapDoc(await send<Product>("PATCH", `/seller/products/${productId}/status`, { status }));
  }
  bulkProductStatus(input: BulkStatusInput) {
    return send<{ updated: number }>("PATCH", "/seller/products/bulk-status", input);
  }
  async archiveProduct(productId: string) {
    return mapDoc(await del<Product>(`/seller/products/${productId}`));
  }
  async uploadProductImages(productId: string, files: File[]) {
    const form = new FormData();
    files.forEach((file) => form.append("images", file));
    return mapDoc(
      await request<Product>(`/seller/products/${productId}/images`, { method: "POST", body: form })
    );
  }
  async deleteProductImage(productId: string, imageIndex: number) {
    return mapDoc(await del<Product>(`/seller/products/${productId}/images/${imageIndex}`));
  }

  async listCategories() {
    return mapList(await get<StoreCategory[]>("/seller/categories"));
  }
  async createCategory(input: CategoryInput) {
    return mapDoc(await send<StoreCategory>("POST", "/seller/categories", input));
  }
  async updateCategory(categoryId: string, input: Partial<CategoryInput>) {
    return mapDoc(await send<StoreCategory>("PUT", `/seller/categories/${categoryId}`, input));
  }
  deleteCategory(categoryId: string) {
    return del<{ message: string }>(`/seller/categories/${categoryId}`);
  }
  listBanks() {
    return get<Bank[]>("/paystack-banks");
  }

  async listOrders(filters?: OrderFilters) {
    return pageOf<Order>(
      await get<unknown>(`/seller/orders${qs(filters as Record<string, string | number> | undefined)}`)
    );
  }
  async getOrder(orderId: string) {
    return mapDoc(await get<Order>(`/seller/orders/${orderId}`));
  }
  getOrderStats() {
    return get<OrderStats>("/seller/orders/stats");
  }
  async shipOrder(orderId: string, input: ShipOrderInput) {
    return mapDoc(await send<Order>("PATCH", `/seller/orders/${orderId}/ship`, input));
  }
  async markOrderInTransit(orderId: string) {
    return mapDoc(await send<Order>("PATCH", `/seller/orders/${orderId}/in-transit`));
  }
  async markOrderDelivered(orderId: string) {
    return mapDoc(await send<Order>("PATCH", `/seller/orders/${orderId}/delivered`));
  }
  getOrderInvoice(orderId: string) {
    return get<{ url?: string }>(`/seller/orders/${orderId}/invoice`);
  }

  async getWallet() {
    return mapDoc(await get<Wallet>("/seller/wallet"));
  }
  async listWalletTransactions(query?: PaginatedQuery & { type?: string; status?: string }) {
    return pageOf<WalletTransaction>(
      await get<unknown>(`/seller/wallet/transactions${qs(query as Record<string, string | number> | undefined)}`)
    );
  }
  withdrawWallet(amount: number) {
    return send<WalletTransaction>("POST", "/seller/wallet/withdraw", { amount });
  }

  async listCoupons(query?: PaginatedQuery & { isActive?: boolean }) {
    return pageOf<Coupon>(
      await get<unknown>(`/seller/coupons${qs(query as Record<string, string | number | boolean> | undefined)}`)
    );
  }
  async createCoupon(input: CouponInput) {
    return mapDoc(await send<Coupon>("POST", "/seller/coupons", input));
  }
  async updateCoupon(couponId: string, input: Partial<CouponInput>) {
    return mapDoc(await send<Coupon>("PUT", `/seller/coupons/${couponId}`, input));
  }
  async toggleCoupon(couponId: string) {
    return mapDoc(await send<Coupon>("PATCH", `/seller/coupons/${couponId}/toggle`));
  }
  deleteCoupon(couponId: string) {
    return del<{ message: string }>(`/seller/coupons/${couponId}`);
  }

  async listSellerReviews(query?: PaginatedQuery) {
    return pageOf<Review>(
      await get<unknown>(`/seller/reviews${qs(query as Record<string, string | number> | undefined)}`)
    );
  }
  async replyReview(reviewId: string, text: string) {
    return mapDoc(await send<Review>("POST", `/seller/reviews/${reviewId}/reply`, { text }));
  }

  async listSellerDisputes(query?: PaginatedQuery) {
    return pageOf<Dispute>(
      await get<unknown>(`/seller/disputes${qs(query as Record<string, string | number> | undefined)}`)
    );
  }
  async getDispute(disputeId: string) {
    return mapDoc(await get<Dispute>(`/seller/disputes/${disputeId}`));
  }
  async messageDispute(disputeId: string, message: string) {
    return mapDoc(await send<Dispute>("POST", `/seller/disputes/${disputeId}/messages`, { message }));
  }

  async listBlog(query?: PaginatedQuery) {
    return pageOf<BlogPost>(
      await get<unknown>(`/seller/blog${qs(query as Record<string, string | number> | undefined)}`)
    );
  }
  async getBlog(postId: string) {
    return mapDoc(await get<BlogPost>(`/seller/blog/${postId}`));
  }
  async createBlog(input: BlogInput) {
    return mapDoc(await send<BlogPost>("POST", "/seller/blog", input));
  }
  async updateBlog(postId: string, input: Partial<BlogInput>) {
    return mapDoc(await send<BlogPost>("PUT", `/seller/blog/${postId}`, input));
  }
  async publishBlog(postId: string) {
    return mapDoc(await send<BlogPost>("PATCH", `/seller/blog/${postId}/publish`));
  }
  async unpublishBlog(postId: string) {
    return mapDoc(await send<BlogPost>("PATCH", `/seller/blog/${postId}/unpublish`));
  }
  async archiveBlog(postId: string) {
    return mapDoc(await del<BlogPost>(`/seller/blog/${postId}`));
  }

  analyticsOverview() {
    return get<AnalyticsOverview>("/seller/analytics/overview");
  }
  analyticsTrend(period = "30d", groupBy = "day") {
    return get<RevenuePoint[]>(`/seller/analytics/revenue-trend${qs({ period, groupBy })}`);
  }
  analyticsTopProducts() {
    return get<TopProductRow[]>("/seller/analytics/top-products");
  }
  analyticsOrderStatus() {
    return get<Record<string, number>>("/seller/analytics/order-status");
  }
  analyticsCustomers() {
    return get<unknown>("/seller/analytics/customers");
  }

  improveTitle(input: { title: string }) {
    return send<AiTextResult>("POST", "/seller/ai/improve-title", input);
  }
  rewriteDescription(input: { title?: string; description: string }) {
    return send<AiTextResult>("POST", "/seller/ai/rewrite-description", input);
  }
  generateSeo(input: { title: string; description?: string }) {
    return send<AiTextResult>("POST", "/seller/ai/generate-seo", input);
  }

  getReferrals() {
    return get<ReferralSummary>("/seller/referrals");
  }
  async listNotifications(query?: PaginatedQuery) {
    return pageOf<AppNotification>(
      await get<unknown>(`/notifications${qs(query as Record<string, string | number> | undefined)}`)
    );
  }
  unreadNotificationCount() {
    return get<{ count: number }>("/notifications/unread-count");
  }
  markNotificationRead(id: string) {
    return send<AppNotification>("PATCH", `/notifications/${id}/read`);
  }
  markAllNotificationsRead() {
    return send<{ message?: string }>("PATCH", "/notifications/mark-all-read");
  }
  deleteNotification(id: string) {
    return del<{ message?: string }>(`/notifications/${id}`);
  }

  async listTickets(query?: PaginatedQuery) {
    return pageOf<SupportTicket>(
      await get<unknown>(`/tickets${qs(query as Record<string, string | number> | undefined)}`)
    );
  }
  async getTicket(ticketId: string) {
    return mapDoc(await get<SupportTicket>(`/tickets/${ticketId}`));
  }
  async createTicket(input: CreateTicketInput) {
    return mapDoc(await send<SupportTicket>("POST", "/tickets", input));
  }
  async replyTicket(ticketId: string, message: string) {
    return mapDoc(await send<SupportTicket>("POST", `/tickets/${ticketId}/messages`, { message }));
  }

  async storefrontInfo(slug: string) {
    return get<StorefrontInfo>("/storefront/info", sf(slug));
  }
  async storefrontProducts(slug: string, filters?: StorefrontFilters) {
    return pageOf<StorefrontProduct>(
      await get<unknown>(
        `/storefront/products${qs(filters as Record<string, string | number> | undefined)}`,
        sf(slug)
      )
    );
  }
  async storefrontProduct(slug: string, productSlug: string) {
    return mapDoc(await get<StorefrontProduct>(`/storefront/products/${productSlug}`, sf(slug)));
  }
  async storefrontCategories(slug: string) {
    return mapList(await get<StoreCategory[]>("/storefront/categories", sf(slug)));
  }
  async storefrontFeatured(slug: string) {
    return mapList(await get<StorefrontProduct[]>("/storefront/featured", sf(slug)));
  }
  async storefrontNewArrivals(slug: string) {
    return mapList(await get<StorefrontProduct[]>("/storefront/new-arrivals", sf(slug)));
  }
  async storefrontBestSellers(slug: string) {
    return mapList(await get<StorefrontProduct[]>("/storefront/best-sellers", sf(slug)));
  }
  async storefrontReviews(slug: string, productSlug: string, query?: PaginatedQuery) {
    return pageOf<Review>(
      await get<unknown>(
        `/storefront/products/${productSlug}/reviews${qs(query as Record<string, string | number> | undefined)}`,
        sf(slug)
      )
    );
  }
  async storefrontBlog(slug: string, query?: PaginatedQuery & { tag?: string }) {
    return pageOf<BlogPost>(
      await get<unknown>(`/storefront/blog${qs(query as Record<string, string | number> | undefined)}`, sf(slug))
    );
  }
  async storefrontBlogPost(slug: string, postSlug: string) {
    return mapDoc(await get<BlogPost>(`/storefront/blog/${postSlug}`, sf(slug)));
  }
  validateCoupon(slug: string, code: string, subtotal?: number) {
    return send<CouponValidation>("POST", "/storefront/coupons/validate", { code, subtotal }, sf(slug));
  }

  registerBuyer(slug: string, input: BuyerRegisterInput) {
    return send<RegisterPendingResponse>("POST", "/auth/buyer/register", input, sf(slug));
  }
  async verifyBuyerOtp(slug: string, input: VerifyOtpInput) {
    return persistBuyer(await send<BuyerAuthResponse>("POST", "/auth/buyer/verify-otp", input, sf(slug)));
  }
  resendBuyerOtp(slug: string, email: string) {
    return send<RegisterPendingResponse>("POST", "/auth/buyer/resend-otp", { email }, sf(slug));
  }
  async loginBuyer(slug: string, input: SellerLoginInput) {
    return persistBuyer(await send<BuyerAuthResponse>("POST", "/auth/buyer/login", input, sf(slug)));
  }
  async googleBuyer(slug: string, input: GoogleAuthInput) {
    return persistBuyer(await send<BuyerAuthResponse>("POST", "/auth/buyer/google", input, sf(slug)));
  }
  forgotBuyerPassword(slug: string, input: ForgotPasswordInput) {
    return send<{ message: string }>("POST", "/auth/buyer/forgot-password", input, sf(slug));
  }
  resetBuyerPassword(slug: string, input: ResetPasswordInput) {
    return send<{ message: string }>(
      "POST",
      "/auth/buyer/reset-password",
      { email: input.email, otp: input.otp, password: input.newPassword },
      sf(slug)
    );
  }
  async logoutBuyer(slug: string) {
    try {
      return await send<{ message: string }>("POST", "/auth/buyer/logout", {}, sf(slug));
    } finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("hustlr_buyer_token");
        localStorage.removeItem("hustlr_buyer_user");
        clearBuyerAuthCookie();
      }
    }
  }
  async getBuyerMe(slug: string) {
    const res = await get<BuyerAuthResponse["user"] | BuyerAuthResponse>("/auth/buyer/me", sf(slug));
    const user =
      res && typeof res === "object" && "user" in res
        ? (res as BuyerAuthResponse).user
        : (res as BuyerAuthResponse["user"]);
    return { user: mapDoc(user) };
  }

  async getCart(slug: string) {
    return get<Cart>("/cart", sf(slug));
  }
  addCartItem(slug: string, input: AddCartInput) {
    return send<Cart>("POST", "/cart/add", input, sf(slug));
  }
  updateCartItem(slug: string, itemId: string, quantity: number) {
    return send<Cart>("PATCH", `/cart/items/${itemId}`, { quantity }, sf(slug));
  }
  removeCartItem(slug: string, itemId: string) {
    return del<Cart>(`/cart/items/${itemId}`, sf(slug));
  }
  clearCart(slug: string) {
    return del<Cart>("/cart/clear", sf(slug));
  }
  cartCount(slug: string) {
    return get<{ count: number }>("/cart/count", sf(slug));
  }

  initiateCheckout(slug: string, input: CheckoutInput) {
    return send<CheckoutResult>("POST", "/checkout/initiate", input, sf(slug));
  }
  verifyCheckout(slug: string, reference: string) {
    return send<Order>("POST", "/checkout/verify", { reference }, sf(slug));
  }
  async buyerOrders(slug: string, query?: PaginatedQuery & { deliveryStatus?: string }) {
    return pageOf<Order>(
      await get<unknown>(`/orders${qs(query as Record<string, string | number> | undefined)}`, sf(slug))
    );
  }
  async buyerOrder(slug: string, orderId: string) {
    return mapDoc(await get<Order>(`/orders/${orderId}`, sf(slug)));
  }
  confirmReceipt(slug: string, orderId: string) {
    return send<Order>("POST", `/orders/${orderId}/confirm`, {}, sf(slug));
  }
  openDispute(slug: string, orderId: string, input: OpenDisputeInput) {
    return send<Dispute>("POST", `/orders/${orderId}/dispute`, input, sf(slug));
  }
  buyerOrderReceipt(slug: string, orderId: string) {
    return get<{ url?: string }>(`/orders/${orderId}/receipt`, sf(slug));
  }

  createReview(slug: string, input: CreateReviewInput) {
    return send<Review>("POST", "/reviews", input, sf(slug));
  }
  toggleWishlist(slug: string, productId: string) {
    return send<{ wishlisted: boolean }>("POST", "/wishlist/toggle", { productId }, sf(slug));
  }
  async getWishlist(slug: string) {
    const raw = await get<StorefrontProduct[] | { items: StorefrontProduct[] }>("/wishlist", sf(slug));
    const items = Array.isArray(raw) ? raw : raw.items ?? [];
    return mapList(items);
  }
  clearWishlist(slug: string) {
    return del<{ message?: string }>("/wishlist/clear", sf(slug));
  }
  async buyerDisputes(slug: string) {
    const raw = await get<unknown>("/disputes", sf(slug));
    if (raw && typeof raw === "object" && "items" in (raw as object)) {
      return pageOf<Dispute>(raw);
    }
    return mapList(raw as Dispute[]);
  }
}
