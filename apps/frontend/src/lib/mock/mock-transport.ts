// @ts-nocheck — unused local mock; live API is the transport.
import type {
  Transport,
  UploadContext,
} from "@/lib/transport";
import { TransportError } from "@/lib/transport";
import type {
  AuthResponse,
  ForgotPasswordInput,
  GoogleAuthInput,
  RegisterPendingResponse,
  ResetPasswordInput,
  SellerLoginInput,
  SellerRegisterInput,
  User,
  VerifyOtpInput,
} from "@/types/auth";
import type { Store, StoreSetupInput } from "@/types/store";
import type {
  TemplateListFilters,
  TemplateTier,
  WebsiteTemplate,
} from "@/types/template";
import type {
  Product,
  ProductFilters,
  ProductInput,
} from "@/types/product";
import type { StoreCategory } from "@/types/category";
import type { Bank, Kyc, KycInput } from "@/types/kyc";
import type {
  PlanName,
  Subscription,
  SubscriptionPlan,
  SubscribeInput,
  PlanEntitlements,
} from "@/types/subscription";
import { mockDb, readMockSession, writeMockSession } from "./db";
import { DEMO_TEMPLATES } from "@/fixtures/templates";
import { DEMO_PLANS } from "@/fixtures/plans";
import { NIGERIAN_BANKS } from "@/fixtures/banks";
import { slugify } from "@/lib/utils";

const LATENCY_MS = 450;
const KYC_APPROVAL_DELAY_MS = 15_000;

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(value), LATENCY_MS)
  );
}

function fail(message: string, status = 400): never {
  throw new TransportError(message, status);
}

function requireSession(): User {
  const session = readMockSession();
  if (!session) fail("Not authenticated. Please log in.", 401);
  return session;
}

function nowIso(): string {
  return new Date().toISOString();
}

function id(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function copy<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

/** Entitlements of the current (or absent) subscription — drives tier gating. */
function currentEntitlements(): PlanEntitlements {
  const planName: PlanName = mockDb.subscription?.planName ?? "free";
  const plan =
    DEMO_PLANS.find((p) => p.name === planName) ?? DEMO_PLANS[0];
  return {
    maxProducts: plan.maxProducts,
    allowCustomDomain: plan.allowCustomDomain,
    allowProTemplates: plan.allowProTemplates,
    allowProPlusTemplates: plan.allowProPlusTemplates,
    allowBlog: plan.allowBlog,
    commissionPercent: plan.commissionPercent,
  };
}

function tierAllowedForPlan(tier: TemplateTier): boolean {
  const ent = currentEntitlements();
  if (tier === "free") return true;
  if (tier === "pro") return ent.allowProTemplates;
  return ent.allowProPlusTemplates;
}

function uniqueSlug(base: string, taken: Set<string>): string {
  let candidate = slugify(base) || "store";
  if (!taken.has(candidate)) return candidate;
  candidate = `${candidate}-${Math.random().toString(36).slice(2, 6)}`;
  return candidate;
}

function recomputeCategoryCounts(): void {
  const counts = new Map<string, number>();
  for (const product of mockDb.products) {
    if (product.status !== "active") continue;
    counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
  }
  for (const category of mockDb.categories) {
    category.productCount = counts.get(category.name) ?? 0;
  }
}

function syncKycApproval(): void {
  if (
    mockDb.kyc.status === "pending" &&
    mockDb.kycApprovalAt !== null &&
    Date.now() >= mockDb.kycApprovalAt
  ) {
    mockDb.kyc.status = "approved";
    mockDb.kyc.reviewedAt = nowIso();
    mockDb.kycApprovalAt = null;
  }
}

function requireApprovedKyc(): void {
  syncKycApproval();
  if (mockDb.kyc.status !== "approved") {
    fail(
      "KYC verification must be approved before you can subscribe and go live.",
      403
    );
  }
}

function activateSubscription(
  plan: SubscriptionPlan,
  billingCycle: "monthly" | "yearly"
): Subscription {
  const start = new Date();
  const end = new Date(start);
  if (billingCycle === "monthly") end.setMonth(end.getMonth() + 1);
  else end.setFullYear(end.getFullYear() + 1);

  const subscription: Subscription = {
    id: id("sub"),
    sellerId: mockDb.seller.id,
    planId: plan.id,
    planName: plan.name,
    billingCycle,
    amount: billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice,
    status: "active",
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    autoRenew: true,
    paymentReference: id("ref"),
    gracePeriodEnd: null,
    cancelledAt: null,
  };
  mockDb.subscription = subscription;
  mockDb.store.isLive = true;
  return subscription;
}

const PLACEHOLDER_IMAGES = [
  "/template-free.png",
  "/template-pro.png",
  "/template-proplus.png",
];

export class MockTransport implements Transport {
  // ── Auth (§1) ────────────────────────────────────────────────

  async registerSeller(
    input: SellerRegisterInput
  ): Promise<RegisterPendingResponse> {
    const email = input.email.toLowerCase().trim();
    const existingVerified =
      email === mockDb.seller.email.toLowerCase() ||
      (mockDb.pendingRegistration?.email.toLowerCase() === email &&
        mockDb.seller.isVerified);
    if (existingVerified) {
      fail("An account with this email already exists. Log in instead.", 409);
    }
    mockDb.pendingRegistration = {
      name: input.name.trim(),
      email,
      password: input.password,
    };
    return delay({
      tempUserId: "temp_reg",
      email,
      requiresOtp: true as const,
    });
  }

  async verifySellerOtp(input: VerifyOtpInput): Promise<AuthResponse> {
    const email = input.email.toLowerCase().trim();
    const pending = mockDb.pendingRegistration;
    const isPending = pending && pending.email.toLowerCase() === email;
    const isDemo = email === mockDb.seller.email.toLowerCase();

    if (!isPending && !isDemo) {
      fail("No pending registration for this email.", 404);
    }
    if (input.otp !== mockDb.mockOtp) {
      fail("Invalid OTP code. Please try again.", 400);
    }

    if (isPending) {
      mockDb.seller = {
        ...mockDb.seller,
        id: id("seller"),
        name: pending.name,
        email: pending.email,
        isVerified: true,
        referralCode: `HUSTLR${Math.random()
          .toString(36)
          .slice(2, 6)
          .toUpperCase()}`,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      mockDb.pendingRegistration = null;
    }

    const user = copy(mockDb.seller);
    writeMockSession(user);
    return delay({ user });
  }

  async resendSellerOtp(
    email: string
  ): Promise<RegisterPendingResponse> {
    const normalized = email.toLowerCase().trim();
    if (
      mockDb.pendingRegistration?.email.toLowerCase() !== normalized &&
      normalized !== mockDb.seller.email.toLowerCase()
    ) {
      fail("No pending registration for this email.", 404);
    }
    return delay({
      tempUserId: "temp_reg",
      email: normalized,
      requiresOtp: true as const,
    });
  }

  async loginSeller(input: SellerLoginInput): Promise<AuthResponse> {
    const email = input.email.toLowerCase().trim();
    if (input.password.length < 6) {
      fail("Invalid email or password.", 401);
    }
    let user: User;
    if (email === mockDb.seller.email.toLowerCase()) {
      if (input.password !== "password123" && mockDb.seller.googleId === null) {
        fail("Invalid email or password. Demo password is password123.", 401);
      }
      user = copy(mockDb.seller);
    } else {
      // Demo convenience: unknown emails get a fresh verified account.
      user = {
        ...copy(mockDb.seller),
        id: id("seller"),
        name: email.split("@")[0].replace(/[._-]/g, " "),
        email,
      };
      mockDb.seller = copy(user);
    }
    writeMockSession(user);
    return delay({ user });
  }

  async googleSeller(_input: GoogleAuthInput): Promise<AuthResponse> {
    void _input;
    const user: User = {
      ...copy(mockDb.seller),
      googleId: "google_demo",
      isVerified: true,
    };
    mockDb.seller = user;
    writeMockSession(user);
    return delay({ user });
  }

  async forgotSellerPassword(
    input: ForgotPasswordInput
  ): Promise<{ message: string }> {
    void input;
    return delay({
      message: "Password reset OTP sent. It expires in 10 minutes.",
    });
  }

  async resetSellerPassword(
    input: ResetPasswordInput
  ): Promise<{ message: string }> {
    if (input.otp !== mockDb.mockOtp) {
      fail("Invalid OTP code. Please try again.", 400);
    }
    return delay({ message: "Password updated. You can now log in." });
  }

  async logoutSeller(): Promise<{ message: string }> {
    writeMockSession(null);
    return delay({ message: "Logged out." });
  }

  async getSellerMe(): Promise<AuthResponse> {
    const user = requireSession();
    return delay({ user: copy(user) });
  }

  // ── Store (§2) ───────────────────────────────────────────────

  async getStore(): Promise<Store> {
    requireSession();
    return delay(copy(mockDb.store));
  }

  async setupStore(input: StoreSetupInput): Promise<Store> {
    requireSession();
    if (input.slug) {
      const normalized = slugify(input.slug);
      if (!normalized) fail("Store URL slug cannot be empty.", 422);
      const takenByOther =
        normalized !== mockDb.store.slug &&
        mockDb.takenSlugs.includes(normalized);
      if (takenByOther) {
        fail("That store URL is already taken. Try another.", 409);
      }
    }
    Object.assign(mockDb.store, input, { updatedAt: nowIso() });
    return delay(copy(mockDb.store));
  }

  async checkSlug(
    slug: string
  ): Promise<{ slug: string; available: boolean; suggestion?: string }> {
    requireSession();
    const normalized = slugify(slug);
    const available =
      normalized.length > 0 &&
      (normalized === mockDb.store.slug ||
        !mockDb.takenSlugs.includes(normalized));
    return delay({
      slug: normalized,
      available,
      suggestion: available ? undefined : uniqueSlug(normalized, new Set(mockDb.takenSlugs)),
    });
  }

  async setStoreTemplate(templateId: string, confirmReplace = false): Promise<Store> {
    requireSession();
    const template = DEMO_TEMPLATES.find((t) => t.id === templateId);
    if (!template) fail("Template not found.", 404);
    if (!tierAllowedForPlan(template.tier)) {
      fail(
        `The "${template.name}" template requires the ${template.tier} plan. Upgrade to unlock it.`,
        403
      );
    }
    const switching = mockDb.store.templateId !== (template.id || template._id);
    const hasCustom = Array.isArray(mockDb.store.customSections) && mockDb.store.customSections.length > 0;
    if (switching && hasCustom && !confirmReplace) {
      fail(`Applying "${template.name}" will replace your current homepage, colors, and layout.`, 409);
    }
    mockDb.store.templateId = template.id || template._id || null;
    mockDb.store.colorScheme = template.defaultColorScheme || mockDb.store.colorScheme;
    mockDb.store.themeSettings = (template.themeSettings || {}) as Store["themeSettings"];
    mockDb.store.customSections = (template.defaultSections || []) as Store["customSections"];
    mockDb.store.updatedAt = nowIso();
    return delay(copy(mockDb.store));
  }

  async listTemplateSections() {
    requireSession();
    return delay([]);
  }

  async uploadAsset(ctx: UploadContext): Promise<{ url: string }> {
    requireSession();
    void ctx.file;
    const url =
      ctx.kind === "store-logo"
        ? "/nav-icon.webp"
        : ctx.kind === "store-banner"
          ? "/hero.png"
          : PLACEHOLDER_IMAGES[
              Math.floor(Math.random() * PLACEHOLDER_IMAGES.length)
            ];
    return delay({ url });
  }

  // ── Templates (§3) ───────────────────────────────────────────

  async listTemplates(
    filters?: TemplateListFilters
  ): Promise<WebsiteTemplate[]> {
    requireSession();
    const eligible = DEMO_TEMPLATES.filter((t) => {
      if (!t.isActive) return false;
      if (filters?.tier && t.tier !== filters.tier) return false;
      if (filters?.category && t.category !== filters.category) return false;
      // Server-side eligibility: sellers only see templates their plan allows,
      // but the dashboard shows locked ones too (with upgrade CTAs), so mock
      // returns everything active; gating is enforced on selection.
      return true;
    });
    return delay(copy(eligible));
  }

  // ── KYC (§4) ─────────────────────────────────────────────────

  async getMyKyc(): Promise<Kyc> {
    requireSession();
    syncKycApproval();
    return delay(copy(mockDb.kyc));
  }

  async upsertKyc(input: KycInput): Promise<Kyc> {
    requireSession();
    if (
      mockDb.kyc.status === "pending" ||
      mockDb.kyc.status === "approved"
    ) {
      fail(
        "Your KYC application is already submitted and can no longer be edited.",
        409
      );
    }
    Object.assign(mockDb.kyc, input, { updatedAt: nowIso() });
    return delay(copy(mockDb.kyc));
  }

  async submitKyc(): Promise<Kyc> {
    requireSession();
    const kyc = mockDb.kyc;
    const bank = kyc.bankDetails;
    const missing: string[] = [];
    if (!kyc.firstName) missing.push("first name");
    if (!kyc.lastName) missing.push("last name");
    if (!kyc.verificationType) missing.push("ID type");
    if (!kyc.documentId) missing.push("document number");
    if (!kyc.idDocumentUrl) missing.push("ID document upload");
    if (!kyc.selfieUrl) missing.push("selfie upload");
    if (!kyc.address) missing.push("address");
    if (!kyc.proofOfAddressUrl) missing.push("proof of address");
    if (!bank?.bankName || !bank?.bankCode) missing.push("bank name");
    if (!bank?.accountNumber || bank.accountNumber.length !== 10)
      missing.push("10-digit account number");
    if (!bank?.accountName) missing.push("account name");
    if (missing.length > 0) {
      fail(`Missing required details: ${missing.join(", ")}.`, 422);
    }

    kyc.status = "pending";
    kyc.submittedAt = nowIso();
    kyc.updatedAt = nowIso();
    kyc.reviewerNote = "";
    kyc.requestedFiles = [];
    mockDb.kycApprovalAt = Date.now() + KYC_APPROVAL_DELAY_MS;
    return delay(copy(kyc));
  }

  // ── Subscriptions (§5) ───────────────────────────────────────

  async listPlans(): Promise<SubscriptionPlan[]> {
    requireSession();
    return delay(copy(DEMO_PLANS.filter((p) => p.isActive)));
  }

  async getCurrentSubscription(): Promise<Subscription | null> {
    requireSession();
    return delay(copy(mockDb.subscription));
  }

  async subscribeFree(): Promise<{
    subscription: Subscription;
    storeIsLive: boolean;
  }> {
    requireSession();
    requireApprovedKyc();
    const plan = DEMO_PLANS[0];
    const start = new Date();
    const subscription: Subscription = {
      id: id("sub"),
      sellerId: mockDb.seller.id,
      planId: plan.id,
      planName: "free",
      billingCycle: "none",
      amount: 0,
      status: "active",
      startDate: start.toISOString(),
      endDate: null,
      autoRenew: false,
      paymentReference: "",
      gracePeriodEnd: null,
      cancelledAt: null,
    };
    mockDb.subscription = subscription;
    mockDb.store.isLive = true;
    return delay({
      subscription: copy(subscription),
      storeIsLive: true,
    });
  }

  async initializeSubscription(input: SubscribeInput): Promise<{
    reference: string;
    authorizationUrl?: string;
  }> {
    requireSession();
    requireApprovedKyc();
    const plan = DEMO_PLANS.find((p) => p.id === input.planId);
    if (!plan || plan.name === "free") fail("Invalid plan selected.", 422);
    mockDb.pendingSubscriptionPlan = {
      planId: input.planId,
      cycle: input.billingCycle,
    };
    return delay({ reference: `SUB-${Date.now()}` });
  }

  async verifySubscription(reference: string): Promise<{
    subscription: Subscription;
    storeIsLive: boolean;
  }> {
    requireSession();
    requireApprovedKyc();
    void reference;
    const intent = mockDb.pendingSubscriptionPlan;
    const plan = DEMO_PLANS.find((p) => p.id === intent?.planId) ?? DEMO_PLANS[1];
    const subscription = activateSubscription(plan, intent?.cycle ?? "monthly");
    mockDb.pendingSubscriptionPlan = null;
    return delay({
      subscription: copy(subscription),
      storeIsLive: mockDb.store.isLive,
    });
  }

  async cancelSubscription(): Promise<Subscription> {
    requireSession();
    const sub = mockDb.subscription;
    if (!sub) fail("No active subscription to cancel.", 404);
    sub.autoRenew = false;
    sub.cancelledAt = nowIso();
    return delay(copy(sub));
  }

  async changePlan(input: SubscribeInput): Promise<{
    reference: string;
    authorizationUrl?: string;
  }> {
    requireSession();
    const plan = DEMO_PLANS.find((p) => p.id === input.planId);
    if (!plan) fail("Invalid plan selected.", 422);
    if (plan.name === "free") {
      // Downgrade takes effect immediately in mock (server: at renewal).
      mockDb.subscription = {
        ...(mockDb.subscription as Subscription),
        planId: plan.id,
        planName: "free",
        billingCycle: "none",
        amount: 0,
        autoRenew: false,
      };
      return delay({ reference: "" });
    }
    mockDb.pendingSubscriptionPlan = {
      planId: input.planId,
      cycle: input.billingCycle,
    };
    return delay({ reference: `SUB-${Date.now()}` });
  }

  // ── Products (§6) ────────────────────────────────────────────

  async listProducts(filters?: ProductFilters): Promise<{
    items: Product[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }> {
    requireSession();
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 10;
    let items = [...mockDb.products];

    if (filters?.status && filters.status !== "all") {
      items = items.filter((p) => p.status === filters.status);
    }
    if (filters?.category) {
      items = items.filter((p) => p.category === filters.category);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    const total = items.length;
    const start = (page - 1) * limit;
    return delay({
      items: copy(items.slice(start, start + limit)),
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    });
  }

  async getProduct(productId: string): Promise<Product> {
    requireSession();
    const product = mockDb.products.find((p) => p.id === productId);
    if (!product) fail("Product not found.", 404);
    return delay(copy(product));
  }

  async createProduct(input: ProductInput): Promise<Product> {
    requireSession();
    const ent = currentEntitlements();
    if (
      ent.maxProducts !== null &&
      mockDb.products.filter((p) => p.status !== "archived").length >=
        ent.maxProducts
    ) {
      fail(
        `Your plan allows up to ${ent.maxProducts} products. Upgrade to add more.`,
        403
      );
    }
    const taken = new Set(mockDb.products.map((p) => p.slug));
    const product: Product = {
      id: id("prod"),
      storeId: mockDb.store.id,
      sellerId: mockDb.seller.id,
      ...copy(input),
      sku: input.sku ?? "",
      slug: uniqueSlug(input.title, taken),
      rating: 0,
      reviewCount: 0,
      orderCount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    mockDb.products.unshift(product);
    this.ensureCategoryExists(product.category);
    recomputeCategoryCounts();
    return delay(copy(product));
  }

  async updateProduct(
    productId: string,
    input: Partial<ProductInput>
  ): Promise<Product> {
    requireSession();
    const product = mockDb.products.find((p) => p.id === productId);
    if (!product) fail("Product not found.", 404);
    Object.assign(product, input, { updatedAt: nowIso() });
    if (input.category) this.ensureCategoryExists(input.category);
    recomputeCategoryCounts();
    return delay(copy(product));
  }

  async setProductStatus(
    productId: string,
    status: ProductInput["status"]
  ): Promise<Product> {
    requireSession();
    const product = mockDb.products.find((p) => p.id === productId);
    if (!product) fail("Product not found.", 404);
    product.status = status;
    product.updatedAt = nowIso();
    recomputeCategoryCounts();
    return delay(copy(product));
  }

  async bulkProductStatus(input: {
    productIds: string[];
    status: ProductInput["status"];
  }): Promise<{ updated: number }> {
    requireSession();
    let updated = 0;
    for (const pid of input.productIds) {
      const product = mockDb.products.find((p) => p.id === pid);
      if (product) {
        product.status = input.status;
        product.updatedAt = nowIso();
        updated += 1;
      }
    }
    recomputeCategoryCounts();
    return delay({ updated });
  }

  async archiveProduct(productId: string): Promise<Product> {
    requireSession();
    const product = mockDb.products.find((p) => p.id === productId);
    if (!product) fail("Product not found.", 404);
    product.status = "archived";
    product.updatedAt = nowIso();
    recomputeCategoryCounts();
    return delay(copy(product));
  }

  // ── Categories (§7) ──────────────────────────────────────────

  async listCategories(): Promise<StoreCategory[]> {
    requireSession();
    recomputeCategoryCounts();
    const sorted = [...mockDb.categories].sort((a, b) => a.order - b.order);
    return delay(copy(sorted));
  }

  async createCategory(input: {
    name: string;
    description?: string;
    image?: string;
    order?: number;
    isActive?: boolean;
  }): Promise<StoreCategory> {
    requireSession();
    const slug = slugify(input.name);
    if (mockDb.categories.some((c) => c.slug === slug)) {
      fail("A category with this name already exists.", 409);
    }
    const category: StoreCategory = {
      id: id("cat"),
      storeId: mockDb.store.id,
      name: input.name.trim(),
      slug,
      image: input.image ?? "",
      description: input.description ?? "",
      order: input.order ?? mockDb.categories.length + 1,
      isActive: input.isActive ?? true,
      productCount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    mockDb.categories.push(category);
    return delay(copy(category));
  }

  async updateCategory(
    categoryId: string,
    input: Partial<{
      name: string;
      description?: string;
      image?: string;
      order?: number;
      isActive?: boolean;
    }>
  ): Promise<StoreCategory> {
    requireSession();
    const category = mockDb.categories.find((c) => c.id === categoryId);
    if (!category) fail("Category not found.", 404);
    if (input.name) {
      const slug = slugify(input.name);
      const conflict = mockDb.categories.some(
        (c) => c.slug === slug && c.id !== categoryId
      );
      if (conflict) fail("A category with this name already exists.", 409);
      const oldName = category.name;
      category.name = input.name.trim();
      category.slug = slug;
      // Keep products attached to the renamed category.
      for (const product of mockDb.products) {
        if (product.category === oldName) product.category = category.name;
      }
    }
    const { name: _n, ...rest } = input;
    void _n;
    Object.assign(category, rest, { updatedAt: nowIso() });
    recomputeCategoryCounts();
    return delay(copy(category));
  }

  async deleteCategory(categoryId: string): Promise<{ message: string }> {
    requireSession();
    const index = mockDb.categories.findIndex((c) => c.id === categoryId);
    if (index === -1) fail("Category not found.", 404);
    mockDb.categories.splice(index, 1);
    recomputeCategoryCounts();
    return delay({ message: "Category deleted." });
  }

  // ── Misc ─────────────────────────────────────────────────────

  async listBanks(): Promise<Bank[]> {
    requireSession();
    return delay(copy(NIGERIAN_BANKS));
  }

  /** Auto-create a store category when a product references a new name (§7). */
  private ensureCategoryExists(name: string): void {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (mockDb.categories.some((c) => c.name === trimmed)) return;
    mockDb.categories.push({
      id: id("cat"),
      storeId: mockDb.store.id,
      name: trimmed,
      slug: slugify(trimmed),
      image: "",
      description: "",
      order: mockDb.categories.length + 1,
      isActive: true,
      productCount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    });
  }
}
