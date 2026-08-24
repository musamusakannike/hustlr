import type { ApiEnvelope, Paginated } from "@/types/common";
import type {
  AuthResponse,
  ForgotPasswordInput,
  GoogleAuthInput,
  RegisterPendingResponse,
  ResetPasswordInput,
  SellerLoginInput,
  SellerRegisterInput,
  VerifyOtpInput,
} from "@/types/auth";
import type {
  SlugCheckResult,
  Store,
  StoreSetupInput,
  UploadResult,
} from "@/types/store";
import type { TemplateListFilters, WebsiteTemplate } from "@/types/template";
import type {
  BulkStatusInput,
  Product,
  ProductFilters,
  ProductInput,
} from "@/types/product";
import type { CategoryInput, StoreCategory } from "@/types/category";
import type { Bank, Kyc, KycInput } from "@/types/kyc";
import type {
  InitializeSubscriptionResult,
  Subscription,
  SubscriptionPlan,
  SubscribeInput,
  VerifySubscriptionResult,
} from "@/types/subscription";
import type { Order, OrderFilters, OrderStats, ShipOrderInput } from "@/types/order";
import type { Wallet, WalletTransaction } from "@/types/wallet";
import type { Coupon, CouponInput, CouponValidation } from "@/types/coupon";
import type { Review, CreateReviewInput } from "@/types/review";
import type { Dispute, OpenDisputeInput } from "@/types/dispute";
import type { BlogInput, BlogPost } from "@/types/blog";
import type { SupportTicket, CreateTicketInput } from "@/types/ticket";
import type { AppNotification } from "@/types/notification";
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
import type {
  Buyer,
  BuyerAuthResponse,
  BuyerRegisterInput,
} from "@/types/buyer";
import type { PaginatedQuery } from "@/types/common";

export class TransportError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "TransportError";
    this.status = status;
  }
}

export interface UploadContext {
  kind:
    | "store-logo"
    | "store-banner"
    | "store-favicon"
    | "kyc-document"
    | "product-image";
  file: File;
}

export interface Transport {
  // Auth
  registerSeller(input: SellerRegisterInput): Promise<RegisterPendingResponse>;
  verifySellerOtp(input: VerifyOtpInput): Promise<AuthResponse>;
  resendSellerOtp(email: string): Promise<RegisterPendingResponse>;
  loginSeller(input: SellerLoginInput): Promise<AuthResponse>;
  googleSeller(input: GoogleAuthInput): Promise<AuthResponse>;
  forgotSellerPassword(input: ForgotPasswordInput): Promise<{ message: string }>;
  resetSellerPassword(input: ResetPasswordInput): Promise<{ message: string }>;
  logoutSeller(): Promise<{ message: string }>;
  getSellerMe(): Promise<AuthResponse>;

  // Store
  getStore(): Promise<Store>;
  setupStore(input: StoreSetupInput): Promise<Store>;
  checkSlug(slug: string): Promise<SlugCheckResult>;
  setStoreTemplate(templateId: string): Promise<Store>;
  uploadAsset(ctx: UploadContext): Promise<UploadResult>;
  setCustomDomain(domain: string): Promise<{ store: Store; dns: DomainDns }>;
  verifyCustomDomain(): Promise<{ verified: boolean; store: Store }>;
  removeCustomDomain(): Promise<Store>;

  // Templates / KYC / billing
  listTemplates(filters?: TemplateListFilters): Promise<WebsiteTemplate[]>;
  getMyKyc(): Promise<Kyc>;
  upsertKyc(input: KycInput): Promise<Kyc>;
  submitKyc(): Promise<Kyc>;
  listPlans(): Promise<SubscriptionPlan[]>;
  getCurrentSubscription(): Promise<Subscription | null>;
  subscribeFree(): Promise<VerifySubscriptionResult>;
  initializeSubscription(input: SubscribeInput): Promise<InitializeSubscriptionResult>;
  verifySubscription(reference: string): Promise<VerifySubscriptionResult>;
  cancelSubscription(): Promise<Subscription>;
  changePlan(input: SubscribeInput): Promise<InitializeSubscriptionResult>;

  // Catalog
  listProducts(filters?: ProductFilters): Promise<Paginated<Product>>;
  getProduct(productId: string): Promise<Product>;
  createProduct(input: ProductInput): Promise<Product>;
  updateProduct(productId: string, input: Partial<ProductInput>): Promise<Product>;
  setProductStatus(productId: string, status: ProductInput["status"]): Promise<Product>;
  bulkProductStatus(input: BulkStatusInput): Promise<{ updated: number }>;
  archiveProduct(productId: string): Promise<Product>;
  uploadProductImages(productId: string, files: File[]): Promise<Product>;
  deleteProductImage(productId: string, imageIndex: number): Promise<Product>;
  listCategories(): Promise<StoreCategory[]>;
  createCategory(input: CategoryInput): Promise<StoreCategory>;
  updateCategory(categoryId: string, input: Partial<CategoryInput>): Promise<StoreCategory>;
  deleteCategory(categoryId: string): Promise<{ message: string }>;
  listBanks(): Promise<Bank[]>;

  // Commerce
  listOrders(filters?: OrderFilters): Promise<Paginated<Order>>;
  getOrder(orderId: string): Promise<Order>;
  getOrderStats(): Promise<OrderStats>;
  shipOrder(orderId: string, input: ShipOrderInput): Promise<Order>;
  markOrderInTransit(orderId: string): Promise<Order>;
  markOrderDelivered(orderId: string): Promise<Order>;
  getOrderInvoice(orderId: string): Promise<{ url?: string }>;

  getWallet(): Promise<Wallet>;
  listWalletTransactions(query?: PaginatedQuery & { type?: string; status?: string }): Promise<Paginated<WalletTransaction>>;
  withdrawWallet(amount: number): Promise<WalletTransaction>;

  listCoupons(query?: PaginatedQuery & { isActive?: boolean }): Promise<Paginated<Coupon>>;
  createCoupon(input: CouponInput): Promise<Coupon>;
  updateCoupon(couponId: string, input: Partial<CouponInput>): Promise<Coupon>;
  toggleCoupon(couponId: string): Promise<Coupon>;
  deleteCoupon(couponId: string): Promise<{ message: string }>;

  listSellerReviews(query?: PaginatedQuery): Promise<Paginated<Review>>;
  replyReview(reviewId: string, text: string): Promise<Review>;

  listSellerDisputes(query?: PaginatedQuery): Promise<Paginated<Dispute>>;
  getDispute(disputeId: string): Promise<Dispute>;
  messageDispute(disputeId: string, message: string): Promise<Dispute>;

  listBlog(query?: PaginatedQuery): Promise<Paginated<BlogPost>>;
  getBlog(postId: string): Promise<BlogPost>;
  createBlog(input: BlogInput): Promise<BlogPost>;
  updateBlog(postId: string, input: Partial<BlogInput>): Promise<BlogPost>;
  publishBlog(postId: string): Promise<BlogPost>;
  unpublishBlog(postId: string): Promise<BlogPost>;
  archiveBlog(postId: string): Promise<BlogPost>;

  analyticsOverview(): Promise<AnalyticsOverview>;
  analyticsTrend(period?: string, groupBy?: string): Promise<RevenuePoint[]>;
  analyticsTopProducts(): Promise<TopProductRow[]>;
  analyticsOrderStatus(): Promise<Record<string, number> | { status: string; count: number }[]>;
  analyticsCustomers(): Promise<unknown>;

  improveTitle(input: { title: string }): Promise<AiTextResult>;
  rewriteDescription(input: { title?: string; description: string }): Promise<AiTextResult>;
  generateSeo(input: { title: string; description?: string }): Promise<AiTextResult>;

  getReferrals(): Promise<ReferralSummary>;
  listNotifications(query?: PaginatedQuery): Promise<Paginated<AppNotification>>;
  unreadNotificationCount(): Promise<{ count: number }>;
  markNotificationRead(id: string): Promise<AppNotification>;
  markAllNotificationsRead(): Promise<{ message?: string }>;
  deleteNotification(id: string): Promise<{ message?: string }>;

  listTickets(query?: PaginatedQuery): Promise<Paginated<SupportTicket>>;
  getTicket(ticketId: string): Promise<SupportTicket>;
  createTicket(input: CreateTicketInput): Promise<SupportTicket>;
  replyTicket(ticketId: string, message: string): Promise<SupportTicket>;

  // Storefront / buyer
  setStoreSlug(slug: string | null): void;
  storefrontInfo(slug: string): Promise<StorefrontInfo>;
  storefrontProducts(slug: string, filters?: StorefrontFilters): Promise<Paginated<StorefrontProduct>>;
  storefrontProduct(slug: string, productSlug: string): Promise<StorefrontProduct>;
  storefrontCategories(slug: string): Promise<StoreCategory[]>;
  storefrontFeatured(slug: string): Promise<StorefrontProduct[]>;
  storefrontNewArrivals(slug: string): Promise<StorefrontProduct[]>;
  storefrontBestSellers(slug: string): Promise<StorefrontProduct[]>;
  storefrontReviews(slug: string, productSlug: string, query?: PaginatedQuery): Promise<Paginated<Review>>;
  storefrontBlog(slug: string, query?: PaginatedQuery & { tag?: string }): Promise<Paginated<BlogPost>>;
  storefrontBlogPost(slug: string, postSlug: string): Promise<BlogPost>;
  validateCoupon(slug: string, code: string, subtotal?: number): Promise<CouponValidation>;

  registerBuyer(slug: string, input: BuyerRegisterInput): Promise<RegisterPendingResponse>;
  verifyBuyerOtp(slug: string, input: VerifyOtpInput): Promise<BuyerAuthResponse>;
  resendBuyerOtp(slug: string, email: string): Promise<RegisterPendingResponse>;
  loginBuyer(slug: string, input: SellerLoginInput): Promise<BuyerAuthResponse>;
  googleBuyer(slug: string, input: GoogleAuthInput): Promise<BuyerAuthResponse>;
  forgotBuyerPassword(slug: string, input: ForgotPasswordInput): Promise<{ message: string }>;
  resetBuyerPassword(slug: string, input: ResetPasswordInput): Promise<{ message: string }>;
  logoutBuyer(slug: string): Promise<{ message: string }>;
  getBuyerMe(slug: string): Promise<BuyerAuthResponse>;

  getCart(slug: string): Promise<Cart>;
  addCartItem(slug: string, input: AddCartInput): Promise<Cart>;
  updateCartItem(slug: string, itemId: string, quantity: number): Promise<Cart>;
  removeCartItem(slug: string, itemId: string): Promise<Cart>;
  clearCart(slug: string): Promise<Cart>;
  cartCount(slug: string): Promise<{ count: number }>;

  initiateCheckout(slug: string, input: CheckoutInput): Promise<CheckoutResult>;
  verifyCheckout(slug: string, reference: string): Promise<Order>;
  buyerOrders(slug: string, query?: PaginatedQuery & { deliveryStatus?: string }): Promise<Paginated<Order>>;
  buyerOrder(slug: string, orderId: string): Promise<Order>;
  confirmReceipt(slug: string, orderId: string): Promise<Order>;
  openDispute(slug: string, orderId: string, input: OpenDisputeInput): Promise<Dispute>;
  buyerOrderReceipt(slug: string, orderId: string): Promise<{ url?: string }>;

  createReview(slug: string, input: CreateReviewInput): Promise<Review>;
  toggleWishlist(slug: string, productId: string): Promise<{ wishlisted: boolean }>;
  getWishlist(slug: string): Promise<StorefrontProduct[]>;
  clearWishlist(slug: string): Promise<{ message?: string }>;
  buyerDisputes(slug: string): Promise<Paginated<Dispute> | Dispute[]>;
  buyerReferrals(slug: string): Promise<ReferralSummary>;
}

export type { ApiEnvelope };

import { ApiTransport } from "@/lib/api-client";

let instance: Transport | null = null;

export function getTransport(): Transport {
  if (!instance) {
    instance = new ApiTransport();
  }
  return instance;
}

export function isMockTransportActive(): boolean {
  return false;
}
