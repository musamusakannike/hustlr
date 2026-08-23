import type {
  ApiEnvelope,
  Paginated,
} from "@/types/common";
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
import type {
  TemplateListFilters,
  WebsiteTemplate,
} from "@/types/template";
import type {
  BulkStatusInput,
  Product,
  ProductFilters,
  ProductInput,
} from "@/types/product";
import type {
  CategoryInput,
  StoreCategory,
} from "@/types/category";
import type {
  Bank,
  Kyc,
  KycInput,
} from "@/types/kyc";
import type {
  InitializeSubscriptionResult,
  Subscription,
  SubscriptionPlan,
  SubscribeInput,
  VerifySubscriptionResult,
} from "@/types/subscription";

/** Error thrown by every transport for non-2xx outcomes. */
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

/**
 * Single seam between the UI and the data source. UI -> hook -> service ->
 * Transport. Swapping MockTransport for ApiTransport requires zero changes
 * above this line (architecture decision 2).
 */
export interface Transport {
  // ── Auth (§1) ────────────────────────────────────────────────
  registerSeller(input: SellerRegisterInput): Promise<RegisterPendingResponse>;
  verifySellerOtp(input: VerifyOtpInput): Promise<AuthResponse>;
  resendSellerOtp(email: string): Promise<RegisterPendingResponse>;
  loginSeller(input: SellerLoginInput): Promise<AuthResponse>;
  googleSeller(input: GoogleAuthInput): Promise<AuthResponse>;
  forgotSellerPassword(input: ForgotPasswordInput): Promise<{ message: string }>;
  resetSellerPassword(input: ResetPasswordInput): Promise<{ message: string }>;
  logoutSeller(): Promise<{ message: string }>;
  getSellerMe(): Promise<AuthResponse>;

  // ── Store (§2) ───────────────────────────────────────────────
  getStore(): Promise<Store>;
  setupStore(input: StoreSetupInput): Promise<Store>;
  checkSlug(slug: string): Promise<SlugCheckResult>;
  setStoreTemplate(templateId: string): Promise<Store>;
  uploadAsset(ctx: UploadContext): Promise<UploadResult>;

  // ── Templates (§3) ───────────────────────────────────────────
  listTemplates(filters?: TemplateListFilters): Promise<WebsiteTemplate[]>;

  // ── KYC (§4) ─────────────────────────────────────────────────
  getMyKyc(): Promise<Kyc>;
  upsertKyc(input: KycInput): Promise<Kyc>;
  submitKyc(): Promise<Kyc>;

  // ── Subscriptions (§5) ───────────────────────────────────────
  listPlans(): Promise<SubscriptionPlan[]>;
  getCurrentSubscription(): Promise<Subscription | null>;
  subscribeFree(): Promise<VerifySubscriptionResult>;
  initializeSubscription(
    input: SubscribeInput
  ): Promise<InitializeSubscriptionResult>;
  verifySubscription(reference: string): Promise<VerifySubscriptionResult>;
  cancelSubscription(): Promise<Subscription>;
  changePlan(input: SubscribeInput): Promise<InitializeSubscriptionResult>;

  // ── Products (§6) ────────────────────────────────────────────
  listProducts(filters?: ProductFilters): Promise<Paginated<Product>>;
  getProduct(productId: string): Promise<Product>;
  createProduct(input: ProductInput): Promise<Product>;
  updateProduct(productId: string, input: Partial<ProductInput>): Promise<Product>;
  setProductStatus(productId: string, status: ProductInput["status"]): Promise<Product>;
  bulkProductStatus(input: BulkStatusInput): Promise<{ updated: number }>;
  archiveProduct(productId: string): Promise<Product>;

  // ── Categories (§7) ──────────────────────────────────────────
  listCategories(): Promise<StoreCategory[]>;
  createCategory(input: CategoryInput): Promise<StoreCategory>;
  updateCategory(categoryId: string, input: Partial<CategoryInput>): Promise<StoreCategory>;
  deleteCategory(categoryId: string): Promise<{ message: string }>;

  // ── Misc ─────────────────────────────────────────────────────
  listBanks(): Promise<Bank[]>;
}

export type { ApiEnvelope };

// Factory is appended at the module tail (after the interface) — see below.
import { MockTransport } from "@/lib/mock/mock-transport";
import { ApiTransport } from "@/lib/api-client";

const TRANSPORT_MODE = process.env.NEXT_PUBLIC_TRANSPORT ?? "mock";

let instance: Transport | null = null;

/** Returns the singleton transport for the configured mode. */
export function getTransport(): Transport {
  if (!instance) {
    instance = TRANSPORT_MODE === "api" ? new ApiTransport() : new MockTransport();
  }
  return instance;
}

export function isMockTransportActive(): boolean {
  return TRANSPORT_MODE !== "api";
}
