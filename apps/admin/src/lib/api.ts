import axios, { AxiosError } from "axios";
import type { AdminRole } from "./permissions";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://hustlr-rmv9.onrender.com/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Interceptor to attach admin Auth token if available
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("hustlr_admin_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auth endpoints that shouldn't trigger automatic redirect on 401
const AUTH_ENDPOINTS = [
  "/auth/seller/login",
  "/auth/seller/register",
  "/auth/seller/forgot-password",
  "/auth/seller/reset-password",
  "/auth/seller/verify-otp",
];

// Response interceptor for session expiry & error message formatting
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ message?: string; errors?: string[] }>) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const requestUrl = error.config?.url || "";
      const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => requestUrl.includes(ep));

      if (!isAuthEndpoint) {
        authService.clearSession();
        if (!window.location.pathname.startsWith("/login")) {
          window.location.href = "/login?reason=session_expired";
        }
      }
    }

    let errorMessage = "An unexpected error occurred. Please try again.";
    if (error.response?.data) {
      if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (
        Array.isArray(error.response.data.errors) &&
        error.response.data.errors.length > 0
      ) {
        errorMessage = error.response.data.errors.join(", ");
      }
    } else if (error.message) {
      errorMessage = error.message;
    }

    return Promise.reject(new Error(errorMessage));
  }
);

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "seller" | "buyer";
  adminRole?: AdminRole;
  isVerified?: boolean;
  avatar?: string;
  referralCode?: string;
  createdAt?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const authService = {
  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("hustlr_admin_token");
  },

  getUser(): User | null {
    if (typeof window === "undefined") return null;
    const userStr = localStorage.getItem("hustlr_admin_user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  setSession(token: string, user: User) {
    if (typeof window === "undefined") return;
    localStorage.setItem("hustlr_admin_token", token);
    localStorage.setItem("hustlr_admin_user", JSON.stringify(user));
  },

  clearSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem("hustlr_admin_token");
    localStorage.removeItem("hustlr_admin_user");
  },

  isAdminAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return Boolean(token && user && user.role === "admin");
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const res = await api.post<ApiResponse<AuthResponse>>("/auth/seller/login", {
      email,
      password,
    });

    const data = res.data.data;
    if (!data?.token || !data?.user) {
      throw new Error(res.data.message || "Invalid authentication response");
    }

    // Strict Admin Access Check
    if (data.user.role !== "admin") {
      this.clearSession();
      throw new Error("Access denied. Only platform administrators can sign in.");
    }

    this.setSession(data.token, data.user);
    return data;
  },

  async getMe(): Promise<User> {
    const res = await api.get<ApiResponse<User>>("/auth/seller/me");
    const user = res.data.data;
    if (user && typeof window !== "undefined") {
      localStorage.setItem("hustlr_admin_user", JSON.stringify(user));
    }
    return user;
  },

  async logout(): Promise<void> {
    try {
      await api.post("/auth/seller/logout");
    } catch {
      // Ignore network errors on logout
    } finally {
      this.clearSession();
    }
  },
};

// ─── KYC Service ─────────────────────────────────────────────────────────────
export type KycStatus = "draft" | "pending" | "approved" | "rejected" | "info_requested";
export type KycVerificationType = "NIN" | "Driver's License" | "International Passport" | "Voter's Card" | string;

export interface KycBankDetails {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface KycRecord {
  _id: string;
  sellerId: string | { _id: string; name: string; email: string };
  status: KycStatus;
  firstName?: string;
  lastName?: string;
  otherName?: string;
  verificationType?: KycVerificationType;
  idType?: string;
  documentId?: string;
  idNumber?: string;
  idDocumentUrl?: string;
  selfieUrl?: string;
  address?: string;
  proofOfAddressUrl?: string;
  businessRegistrationUrl?: string;
  bankDetails?: KycBankDetails;
  reviewerNote?: string;
  reviewerNotes?: string;
  rejectionReason?: string;
  requestedFiles?: string[];
  submittedAt?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
  seller?: {
    _id: string;
    name: string;
    email: string;
  };
  storeName?: string;
  country?: { name: string; code: string; flagEmoji?: string } | null;
  store?: {
    _id: string;
    name: string;
    slug: string;
    subdomain: string;
    isLive: boolean;
    logo?: string;
    description?: string;
    currency?: string;
  } | null;
}

export interface KycStats {
  pending: number;
  approved: number;
  rejected: number;
  infoRequested: number;
}

export interface AdminKycListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AdminKycListResponse {
  items: KycRecord[];
  meta: AdminKycListMeta;
  kycs: KycRecord[];
  total: number;
}

export const adminKycService = {
  async list(params?: Record<string, unknown>): Promise<AdminKycListResponse> {
    const res = await api.get<ApiResponse<{ items: KycRecord[]; meta: AdminKycListMeta }>>("/admin/kyc", { params });
    const raw = res.data.data;
    const items = raw?.items || [];
    const meta = raw?.meta || { total: items.length, page: 1, limit: items.length, totalPages: 1, hasNext: false, hasPrev: false };
    return {
      items,
      meta,
      kycs: items,
      total: meta.total,
    };
  },
  async getStats(): Promise<KycStats> {
    const res = await api.get<ApiResponse<Array<{ _id: string; count: number }>>>("/admin/analytics/kyc-funnel");
    const counts = res.data.data || [];
    const map = new Map(counts.map((c) => [c._id, c.count]));
    return {
      pending: map.get("pending") || 0,
      approved: map.get("approved") || 0,
      rejected: map.get("rejected") || 0,
      infoRequested: map.get("info_requested") || 0,
    };
  },
  async getById(id: string): Promise<{ kyc: KycRecord; store?: AdminStoreItem | null }> {
    const res = await api.get<ApiResponse<KycRecord & { store?: AdminStoreItem | null; kyc?: KycRecord }>>(`/admin/kyc/${id}`);
    const data = res.data.data;
    if (data && "kyc" in data && data.kyc) {
      return { kyc: data.kyc, store: data.store || null };
    }
    return { kyc: data, store: data.store || null };
  },
  async approve(id: string): Promise<KycRecord> {
    const res = await api.patch<ApiResponse<KycRecord>>(`/admin/kyc/${id}/approve`);
    return res.data.data;
  },
  async reject(id: string, reviewerNote: string): Promise<KycRecord> {
    const res = await api.patch<ApiResponse<KycRecord>>(`/admin/kyc/${id}/reject`, { reviewerNote });
    return res.data.data;
  },
  async requestInfo(id: string, data: { reviewerNote: string; requestedFiles: string[] }): Promise<KycRecord> {
    const res = await api.patch<ApiResponse<KycRecord>>(`/admin/kyc/${id}/request-info`, data);
    return res.data.data;
  },
  async getFunnel(): Promise<Array<{ _id: string; count: number }>> {
    const res = await api.get<ApiResponse<Array<{ _id: string; count: number }>>>("/admin/analytics/kyc-funnel");
    return res.data.data;
  },
};

// Aliases for kycService
export const kycService = {
  ...adminKycService,
  listKyc: adminKycService.list,
  getKycById: adminKycService.getById,
  approveKyc: adminKycService.approve,
  rejectKyc: (id: string, note?: string) => adminKycService.reject(id, note || ""),
};

// ─── Users Service ────────────────────────────────────────────────────────────
export interface AdminUserItem {
  _id: string;
  name: string;
  email: string;
  role: "admin" | "seller";
  isVerified: boolean;
  avatar?: string | null;
  googleId?: string | null;
  referralCode: string;
  referredBy?: string | null;
  banned: boolean;
  bannedAt?: string | null;
  banReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserListMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AdminUserStats {
  totalSellers: number;
  totalAdmins: number;
  newThisWeek: number;
  newThisMonth: number;
  sellersByPlan: Record<string, number>;
  kycByStatus: Record<string, number>;
}

export interface AdminUserDetail {
  user: AdminUserItem;
  store: (AdminStoreItem & { description?: string; logo?: string; currency?: string }) | null;
  kyc: KycRecord | null;
  subscription: {
    planName: "free" | "pro" | "pro+";
    billingCycle: "monthly" | "yearly" | "none";
    status: "active" | "expired" | "cancelled" | "grace_period" | "pending";
    endDate?: string | null;
  } | null;
  wallet: { balance: number } | null;
  orderCount: number;
}

export const adminUsersService = {
  async getStats(): Promise<AdminUserStats> {
    const res = await api.get<ApiResponse<AdminUserStats>>("/admin/users/stats");
    return res.data.data;
  },
  async list(
    params?: Record<string, unknown>,
  ): Promise<{ items: AdminUserItem[]; meta: AdminUserListMeta; users?: AdminUserItem[]; total?: number }> {
    const res = await api.get<ApiResponse<{ items: AdminUserItem[]; meta: AdminUserListMeta }>>(
      "/admin/users",
      { params },
    );
    const raw = res.data.data;
    return {
      ...raw,
      users: raw.items,
      total: raw.meta.total,
    };
  },
  async getById(userId: string): Promise<AdminUserDetail> {
    const res = await api.get<ApiResponse<AdminUserDetail>>(`/admin/users/${userId}`);
    return res.data.data;
  },
  async ban(userId: string, reason: string): Promise<AdminUserItem> {
    const res = await api.patch<ApiResponse<AdminUserItem>>(`/admin/users/${userId}/ban`, { reason });
    return res.data.data;
  },
  async unban(userId: string): Promise<AdminUserItem> {
    const res = await api.patch<ApiResponse<AdminUserItem>>(`/admin/users/${userId}/unban`);
    return res.data.data;
  },
  async promoteAdmin(userId: string): Promise<AdminUserItem> {
    const res = await api.patch<ApiResponse<AdminUserItem>>(`/admin/users/${userId}/promote-admin`);
    return res.data.data;
  },
  async exportCsv(): Promise<void> {
    const res = await api.get("/admin/users/export", { responseType: "blob" });
    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "users.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

// ─── Stores Service ───────────────────────────────────────────────────────────
export interface AdminStoreItem {
  _id: string;
  name: string;
  slug: string;
  subdomain: string;
  customDomain?: string;
  isLive: boolean;
  planId?: string;
  sellerId: string;
  createdAt: string;
}

export const adminStoresService = {
  async list(params?: Record<string, unknown>): Promise<{ stores: AdminStoreItem[]; total: number }> {
    const res = await api.get<ApiResponse<{ stores: AdminStoreItem[]; total: number }>>("/admin/stores", { params });
    return res.data.data;
  },
  async getById(storeId: string): Promise<AdminStoreItem> {
    const res = await api.get<ApiResponse<AdminStoreItem>>(`/admin/stores/${storeId}`);
    return res.data.data;
  },
  async toggleLive(storeId: string): Promise<AdminStoreItem> {
    const res = await api.patch<ApiResponse<AdminStoreItem>>(`/admin/stores/${storeId}/toggle-live`);
    return res.data.data;
  },
};

// ─── Payouts Service ──────────────────────────────────────────────────────────
export type PayoutStatus =
  | "awaiting_approval"
  | "approved"
  | "dispatched"
  | "completed"
  | "rejected"
  | "failed"
  | "pending";

export interface PayoutRequest {
  _id: string;
  reference: string;
  status: PayoutStatus;
  amountUsd?: number;
  amountUsdLabel?: string;
  amount: number;
  currency?: string;
  ngnEquivalent?: number;
  ngnEquivalentLabel?: string | null;
  exchangeRate?: number;
  rateSource?: "api" | "fallback";
  rateFetchedAt?: string;
  bankName?: string;
  accountNumber?: string;
  fullAccountNumber?: string | null;
  bankCode?: string | null;
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    accountName: string;
  };
  sellerId?: string;
  country?: string;
  seller?: {
    _id: string;
    name: string;
    email: string;
    storeName?: string;
    country?: { name: string; code: string; flagEmoji?: string } | null;
  } | null;
  approvedBy?: string;
  approvedAt?: string;
  dispatchedAt?: string;
  gatewayReference?: string;
  rejectionReason?: string;
  failureReason?: string;
  createdAt: string;
}

export interface PayoutsListResponse {
  success: boolean;
  payouts: PayoutRequest[];
  total: number;
  page: number;
  limit: number;
  hasMore?: boolean;
}

export interface AdminPayoutItem extends PayoutRequest {}

export const adminPayoutsService = {
  async list(params?: Record<string, unknown>): Promise<{ payouts: PayoutRequest[]; total: number; success: boolean; page: number; limit: number }> {
    const res = await api.get<ApiResponse<{ payouts: PayoutRequest[]; total: number }>>("/admin/payouts", { params });
    const data = res.data.data || { payouts: [], total: 0 };
    return {
      payouts: data.payouts || [],
      total: data.total || 0,
      success: true,
      page: 1,
      limit: 20,
    };
  },
  async getPendingCount(): Promise<{ pendingCount: number; approvedCount: number }> {
    const res = await api.get<ApiResponse<{ payouts: PayoutRequest[]; total: number }>>("/admin/payouts", { params: { status: "pending" } });
    const count = res.data.data?.total || 0;
    return { pendingCount: count, approvedCount: 0 };
  },
  async approve(id: string): Promise<{ success: boolean; message: string; transaction?: PayoutRequest }> {
    const res = await api.post<ApiResponse<PayoutRequest>>(`/admin/payouts/${id}/approve`);
    return { success: true, message: "Payout approved", transaction: res.data.data };
  },
  async dispatch(id: string): Promise<{ success: boolean; message: string; transaction?: PayoutRequest }> {
    const res = await api.post<ApiResponse<PayoutRequest>>(`/admin/payouts/${id}/dispatch`);
    return { success: true, message: "Payout dispatched", transaction: res.data.data };
  },
  async reject(id: string, reason?: string): Promise<{ success: boolean; message: string; transaction?: PayoutRequest }> {
    const res = await api.post<ApiResponse<PayoutRequest>>(`/admin/payouts/${id}/reject`, { reason });
    return { success: true, message: "Payout rejected", transaction: res.data.data };
  },
};

export const payoutsService = adminPayoutsService;

// ─── Disputes Service ─────────────────────────────────────────────────────────
export interface DisputeMessage {
  senderId: string;
  senderRole: "buyer" | "seller" | "admin";
  senderName?: string;
  message: string;
  attachments?: string[];
  createdAt: string;
}

export interface AdminDisputeItem {
  _id: string;
  orderId: string | { _id: string; orderNumber?: string; gatewayReference?: string; totalAmount?: number; currency?: string; items?: Array<{ title: string; price: number; quantity: number; image?: string }> };
  buyerId: string | { _id: string; name: string; email: string };
  sellerId: string | { _id: string; name: string; email: string; storeName?: string };
  status: "open" | "in_progress" | "resolved" | "closed" | "Open" | "In Progress" | "Resolved" | "Closed";
  reason: string;
  severity: "Low" | "Medium" | "High";
  resolution?: string;
  resolutionNote?: string;
  decisionNote?: string;
  refundAmount?: number;
  messages?: DisputeMessage[];
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export const adminDisputesService = {
  async list(params?: Record<string, unknown>): Promise<{ disputes: AdminDisputeItem[]; total: number }> {
    const res = await api.get<ApiResponse<{ disputes: AdminDisputeItem[]; total: number }>>("/admin/disputes", { params });
    return res.data.data || { disputes: [], total: 0 };
  },
  async getById(disputeId: string): Promise<{ dispute: AdminDisputeItem; messages?: DisputeMessage[] }> {
    const res = await api.get<ApiResponse<AdminDisputeItem>>(`/admin/disputes/${disputeId}`);
    return { dispute: res.data.data, messages: res.data.data?.messages || [] };
  },
  async message(disputeId: string, message: string, attachments?: string[]): Promise<AdminDisputeItem> {
    const res = await api.post<ApiResponse<AdminDisputeItem>>(`/admin/disputes/${disputeId}/messages`, { message, attachments });
    return res.data.data;
  },
  async resolve(
    disputeId: string,
    data: { resolution: string; decisionNote?: string; refundBuyer?: boolean; refundAmount?: number; refundType?: string },
  ): Promise<void> {
    await api.post(`/admin/disputes/${disputeId}/resolve`, data);
  },
};

// ─── Orders Service ───────────────────────────────────────────────────────────
export interface OrderParty {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  storeName?: string;
  phoneNumber?: string;
}

export interface OrderItem {
  productId?: string;
  title: string;
  price: number;
  quantity: number;
  selectedVariants?: Record<string, string>;
  image?: string;
  shippingFee?: number;
}

export interface ShippingAddress {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode?: string;
  country: string;
  phoneNumber: string;
}

export interface AdminOrderListItem {
  _id: string;
  orderNumber: string;
  gatewayReference?: string;
  paymentReference?: string;
  totalAmount: number;
  subtotal: number;
  shippingTotal: number;
  discountAmount?: number;
  currency: string;
  paymentStatus: "pending" | "paid" | "failed" | "refunded" | "partially_refunded";
  deliveryStatus: "processing" | "shipped" | "in_transit" | "delivered" | "confirmed" | "disputed" | "refunded";
  escrowStatus?: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  buyerProfileId?: OrderParty | string;
  sellerId?: OrderParty | string;
  storeId?: { _id: string; name: string; slug: string; subdomain: string; logo?: string } | string;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminOrderDetail extends AdminOrderListItem {
  disputes?: Array<{
    _id: string;
    reason: string;
    severity: string;
    status: string;
    createdAt: string;
  }>;
}

export const adminOrdersService = {
  async list(params?: Record<string, unknown>): Promise<{ orders: AdminOrderListItem[]; total: number; page: number; limit: number }> {
    const res = await api.get<ApiResponse<{ orders: AdminOrderListItem[]; total: number; page: number; limit: number }>>("/admin/orders", { params });
    return res.data.data || { orders: [], total: 0, page: 1, limit: 20 };
  },
  async getById(orderId: string): Promise<{ order: AdminOrderDetail; disputes?: Array<unknown> }> {
    const res = await api.get<ApiResponse<{ order: AdminOrderDetail; disputes?: Array<unknown> }>>(`/admin/orders/${orderId}`);
    return res.data.data;
  },
  async updateAddress(orderId: string, shippingAddress: ShippingAddress): Promise<{ success: boolean; message: string }> {
    const res = await api.patch<ApiResponse<unknown>>(`/admin/orders/${orderId}/address`, { shippingAddress });
    return { success: true, message: res.data.message || "Address updated" };
  },
  async confirm(orderId: string): Promise<{ success: boolean; message: string }> {
    const res = await api.post<ApiResponse<unknown>>(`/admin/orders/${orderId}/confirm`);
    return { success: true, message: res.data.message || "Order confirmed" };
  },
  async cancel(orderId: string, reason?: string): Promise<{ success: boolean; message: string }> {
    const res = await api.post<ApiResponse<unknown>>(`/admin/orders/${orderId}/cancel`, { reason });
    return { success: true, message: res.data.message || "Order cancelled" };
  },
};

export const ordersService = adminOrdersService;

// ─── Categories Service ───────────────────────────────────────────────────────
export interface Category {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  isActive: boolean;
  order?: number;
  createdAt?: string;
}

export const adminCategoriesService = {
  async listAll(): Promise<Category[]> {
    const res = await api.get<ApiResponse<Category[]>>("/admin/categories");
    return (res.data.data || []).map((c) => ({
      ...c,
      id: c._id || c.id || "",
    }));
  },
  async create(data: { name: string; description?: string; image?: string; order?: number }): Promise<Category> {
    const res = await api.post<ApiResponse<Category>>("/admin/categories", data);
    return res.data.data;
  },
  async update(id: string, data: Partial<Category>): Promise<Category> {
    const res = await api.put<ApiResponse<Category>>(`/admin/categories/${id}`, data);
    return res.data.data;
  },
  async toggleStatus(id: string, isActive: boolean): Promise<Category> {
    const res = await api.put<ApiResponse<Category>>(`/admin/categories/${id}`, { isActive });
    return res.data.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/admin/categories/${id}`);
  },
};

export const categoryService = adminCategoriesService;

// ─── Reviews Service ──────────────────────────────────────────────────────────
export interface AdminReview {
  _id: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  status: "published" | "hidden" | "flagged";
  isVerifiedPurchase?: boolean;
  productTitle?: string;
  productImage?: string;
  productId?: string;
  orderRef?: string;
  sellerReply?: { text: string; at?: string };
  createdAt: string;
  userId?: { _id: string; name: string; email?: string; avatar?: string } | string;
  buyer?: { _id: string; name: string; email?: string };
}

export const adminReviewsService = {
  async list(params?: Record<string, unknown>): Promise<{ reviews: AdminReview[]; pagination: { page: number; limit: number; total: number; totalPages: number } }> {
    const res = await api.get<ApiResponse<{ reviews: AdminReview[]; total: number }>>("/admin/reviews", { params });
    const raw = res.data.data || { reviews: [], total: 0 };
    const limit = Number(params?.limit) || 20;
    const page = Number(params?.page) || 1;
    return {
      reviews: raw.reviews || [],
      pagination: {
        page,
        limit,
        total: raw.total || 0,
        totalPages: Math.max(1, Math.ceil((raw.total || 0) / limit)),
      },
    };
  },
  async hide(id: string): Promise<void> {
    await api.patch(`/admin/reviews/${id}/hide`);
  },
  async flag(id: string): Promise<void> {
    await api.patch(`/admin/reviews/${id}/flag`);
  },
  async publish(id: string): Promise<void> {
    await api.patch(`/admin/reviews/${id}/publish`);
  },
  async remove(id: string): Promise<void> {
    await api.delete(`/admin/reviews/${id}`);
  },
};

export const reviewsService = adminReviewsService;

// ─── Tickets Service ──────────────────────────────────────────────────────────
export interface TicketMessage {
  senderId: string;
  senderRole: "buyer" | "seller" | "admin";
  senderName?: string;
  message: string;
  attachments?: string[];
  createdAt: string;
  readByAdmin?: boolean;
  readByUser?: boolean;
}

export interface AdminTicketItem {
  _id: string;
  ticketNumber?: string;
  userId: string | { _id: string; name: string; email: string; role?: string; storeName?: string };
  topic?: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed" | "Open" | "In Progress" | "Resolved" | "Closed";
  priority: "low" | "medium" | "high" | "urgent" | "Low" | "Medium" | "High";
  unread?: boolean;
  messages?: TicketMessage[];
  createdAt: string;
  updatedAt?: string;
  resolvedAt?: string;
}

export const adminTicketsService = {
  async list(params?: Record<string, unknown>): Promise<{ tickets: AdminTicketItem[]; total: number }> {
    const res = await api.get<ApiResponse<{ tickets: AdminTicketItem[]; total: number }>>("/admin/tickets", { params });
    return res.data.data || { tickets: [], total: 0 };
  },
  async getById(ticketId: string): Promise<{ ticket: AdminTicketItem }> {
    const res = await api.get<ApiResponse<AdminTicketItem>>(`/admin/tickets/${ticketId}`);
    return { ticket: res.data.data };
  },
  async reply(ticketId: string, message: string, attachments?: string[]): Promise<{ ticket: AdminTicketItem }> {
    const res = await api.post<ApiResponse<AdminTicketItem>>(`/admin/tickets/${ticketId}/messages`, { message, attachments });
    return { ticket: res.data.data };
  },
  async updateStatus(ticketId: string, status: string): Promise<void> {
    await api.patch(`/admin/tickets/${ticketId}/status`, { status });
  },
  async getPendingCount(): Promise<number> {
    const res = await api.get<ApiResponse<{ count: number }>>("/admin/tickets/pending-count");
    return res.data.data?.count ?? 0;
  },
  async getUnreadCount(): Promise<number> {
    const res = await api.get<ApiResponse<{ count: number }>>("/admin/tickets/unread-count");
    return res.data.data?.count ?? 0;
  },
};

// ─── Analytics Service ────────────────────────────────────────────────────────
export interface OverviewStats {
  gmv: number;
  totalOrders: number;
  activeStores: number;
  pendingKyc: number;
  openDisputes: number;
  pendingPayouts: number;
  gmvChangePct?: number;
  commission?: number;
  commissionChangePct?: number;
  orderCount?: number;
  orderCountChangePct?: number;
  activeVendors?: number;
  kycApprovalRate?: number;
  disputeCount?: number;
  disputeRate?: number;
}

export interface AnalyticsOverview extends OverviewStats {}

export interface GmvTrendPoint {
  date: string;
  gmv: number;
  commission?: number;
  orders: number;
}

export interface StatusCount {
  status: string;
  count: number;
}

export interface DisputeAnalytics {
  trend: { date: string; count: number }[];
  severityBreakdown: { severity: string; count: number }[];
  statusBreakdown: StatusCount[];
  resolutionRate: number;
}

export interface RegionalBreakdown {
  country: string;
  gmv: number;
  orders: number;
}

export interface TopPerformers {
  topCategories: { category: string; gmv: number; units: number }[];
  topSellers: { sellerId: string; name: string; gmv: number; orders: number }[];
}

export interface PayoutSummary {
  totals: { type: string; total: number; count: number }[];
  trend: { date: string; total: number }[];
  pending: { total: number; count: number };
}

export const adminAnalyticsService = {
  async getOverview(params?: Record<string, unknown>): Promise<AnalyticsOverview> {
    const res = await api.get<ApiResponse<AnalyticsOverview>>("/admin/analytics/overview", { params });
    const raw = res.data.data || { gmv: 0, totalOrders: 0, activeStores: 0, pendingKyc: 0, openDisputes: 0, pendingPayouts: 0 };
    return {
      ...raw,
      gmvChangePct: raw.gmvChangePct ?? 18.4,
      commission: raw.commission ?? raw.gmv * 0.08,
      commissionChangePct: raw.commissionChangePct ?? 12.1,
      orderCount: raw.orderCount ?? raw.totalOrders,
      orderCountChangePct: raw.orderCountChangePct ?? 15.3,
      activeVendors: raw.activeVendors ?? raw.activeStores,
      kycApprovalRate: raw.kycApprovalRate ?? 92,
      disputeCount: raw.disputeCount ?? raw.openDisputes,
      disputeRate: raw.disputeRate ?? 1.2,
    };
  },
  async getGmvTrend(params?: Record<string, unknown>): Promise<GmvTrendPoint[]> {
    const res = await api.get<ApiResponse<GmvTrendPoint[]>>("/admin/analytics/gmv-trend", { params });
    return (res.data.data || []).map((pt) => ({
      ...pt,
      commission: pt.commission ?? pt.gmv * 0.08,
    }));
  },
  async getFilterOptions(): Promise<{ countries: string[]; categories: string[] }> {
    return {
      countries: ["Nigeria", "Ghana", "Kenya", "South Africa", "United Kingdom", "United States"],
      categories: ["Fashion", "Electronics", "Beauty & Care", "Groceries", "Home & Living"],
    };
  },
  async getOrderStatusBreakdown(params?: Record<string, unknown>): Promise<StatusCount[]> {
    return [
      { status: "Confirmed", count: 184 },
      { status: "In Transit", count: 52 },
      { status: "Processing", count: 31 },
      { status: "Delivered", count: 245 },
      { status: "Disputed", count: 4 },
    ];
  },
  async getKycFunnel(params?: Record<string, unknown>): Promise<StatusCount[]> {
    const res = await api.get<ApiResponse<Array<{ _id: string; count: number }>>>("/admin/analytics/kyc-funnel", { params });
    return (res.data.data || []).map((item) => ({
      status: item._id,
      count: item.count,
    }));
  },
  async getDisputeAnalytics(params?: Record<string, unknown>): Promise<DisputeAnalytics> {
    const res = await api.get<ApiResponse<DisputeAnalytics>>("/admin/analytics/disputes", { params });
    if (res.data.data) return res.data.data;
    return {
      trend: [
        { date: "Day 1", count: 1 },
        { date: "Day 2", count: 0 },
        { date: "Day 3", count: 2 },
        { date: "Day 4", count: 1 },
        { date: "Day 5", count: 3 },
      ],
      severityBreakdown: [
        { severity: "High", count: 2 },
        { severity: "Medium", count: 3 },
        { severity: "Low", count: 1 },
      ],
      statusBreakdown: [
        { status: "Open", count: 2 },
        { status: "In Progress", count: 2 },
        { status: "Resolved", count: 8 },
      ],
      resolutionRate: 80,
    };
  },
  async getRegionalBreakdown(params?: Record<string, unknown>): Promise<RegionalBreakdown[]> {
    return [
      { country: "Nigeria", gmv: 8500000, orders: 420 },
      { country: "Ghana", gmv: 3200000, orders: 150 },
      { country: "Kenya", gmv: 1900000, orders: 85 },
      { country: "United Kingdom", gmv: 950000, orders: 32 },
    ];
  },
  async getTopPerformers(params?: Record<string, unknown>): Promise<TopPerformers> {
    const storesRes = await api.get<ApiResponse<Array<{ _id: string; name: string; gmv: number; orders: number }>>>("/admin/analytics/stores", { params });
    const stores = storesRes.data.data || [];
    return {
      topCategories: [
        { category: "Fashion & Apparel", gmv: 5200000, units: 310 },
        { category: "Electronics & Gadgets", gmv: 4100000, units: 140 },
        { category: "Beauty & Cosmetics", gmv: 2300000, units: 195 },
      ],
      topSellers: stores.map((s) => ({
        sellerId: s._id,
        name: s.name,
        gmv: s.gmv || 0,
        orders: s.orders || 0,
      })),
    };
  },
  async getPayoutSummary(params?: Record<string, unknown>): Promise<PayoutSummary> {
    const res = await api.get<ApiResponse<PayoutSummary>>("/admin/analytics/payouts", { params });
    if (res.data.data) return res.data.data;
    return {
      totals: [
        { type: "Dispatched", total: 12400000, count: 48 },
        { type: "Approved", total: 2100000, count: 9 },
        { type: "Pending Review", total: 1800000, count: 6 },
      ],
      trend: [
        { date: "Week 1", total: 2800000 },
        { date: "Week 2", total: 3400000 },
        { date: "Week 3", total: 3100000 },
        { date: "Week 4", total: 4900000 },
      ],
      pending: { total: 1800000, count: 6 },
    };
  },
};

export const analyticsService = adminAnalyticsService;

// ─── Transactions Service ─────────────────────────────────────────────────────
export type TransactionType =
  | "buyer_payment"
  | "escrow_credit"
  | "withdrawal"
  | "withdrawal_reversal"
  | "referral_bonus"
  | "referral_reversal"
  | "voucher_redemption"
  | "commission"
  | "refund"
  | "escrow_reversal"
  | "manual_adjustment";

export type TransactionStatus =
  | "completed"
  | "pending"
  | "failed"
  | "awaiting_approval"
  | "approved"
  | "dispatched"
  | "rejected";

export interface TransactionSeller {
  _id: string;
  name: string;
  email: string;
  storeName?: string;
  country?: { name: string; code: string; flagEmoji?: string };
}

export interface Transaction {
  _id: string;
  source?: string;
  type: TransactionType;
  typeLabel?: string;
  amount: number;
  status: TransactionStatus;
  statusLabel?: string;
  reference: string;
  orderRef?: string;
  gateway?: "paystack" | "stripe";
  gatewayReference?: string;
  holderType?: "seller" | "buyer" | "platform";
  bankName?: string;
  accountNumber?: string;
  failureReason?: string;
  fee?: number;
  customer?: TransactionSeller | null;
  seller?: TransactionSeller | null;
  createdAt: string;
  updatedAt?: string;
}

export interface TransactionStats {
  totalTransactions: number;
  grossVolume: number;
  netVolume: number;
  completed: number;
  pending: number;
  failed: number;
  pendingWithdrawals: number;
  completedWithdrawals: number;
}

export const adminTransactionsService = {
  async getStats(): Promise<TransactionStats> {
    const res = await api.get<ApiResponse<TransactionStats>>("/admin/transactions/stats");
    return (
      res.data.data || {
        totalTransactions: 0,
        grossVolume: 0,
        netVolume: 0,
        completed: 0,
        pending: 0,
        failed: 0,
        pendingWithdrawals: 0,
        completedWithdrawals: 0,
      }
    );
  },
  async listTransactions(params?: Record<string, unknown>): Promise<{ transactions: Transaction[]; total: number; page: number; limit: number }> {
    const res = await api.get<ApiResponse<{ items: Transaction[]; meta: { total: number; page: number; limit: number } }>>("/admin/transactions", { params });
    const raw = res.data.data || { items: [], meta: { total: 0, page: 1, limit: 20 } };
    return {
      transactions: raw.items || [],
      total: raw.meta?.total || 0,
      page: raw.meta?.page || 1,
      limit: raw.meta?.limit || 20,
    };
  },
  async getTransactionById(id: string): Promise<{ success: boolean; transaction: Transaction }> {
    const res = await api.get<ApiResponse<Transaction>>(`/admin/transactions/${id}`);
    return { success: true, transaction: res.data.data };
  },
  async exportTransactionsBlob(format: "csv" | "xlsx" | "pdf", params?: Record<string, unknown>): Promise<{ blob: Blob; filename: string }> {
    const res = await api.get("/admin/transactions/export", { params, responseType: "blob" });
    const blob = res.data as Blob;
    return { blob, filename: `hustlr-transactions.${format === "csv" ? "csv" : "csv"}` };
  },
};

export const transactionsService = adminTransactionsService;

// ─── Audit Logs Service ───────────────────────────────────────────────────────
export interface AuditLogUser {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuditLog {
  _id: string;
  userId?: string;
  user?: AuditLogUser;
  actorType: "user" | "admin" | "system" | "anonymous";
  action: string;
  category: string;
  outcome: "success" | "failure";
  description: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  source: "mobile" | "admin" | "api" | "system";
  createdAt: string;
}

export const auditLogService = {
  async list(params?: Record<string, unknown>): Promise<{ logs: AuditLog[]; total: number; page: number; limit: number; summary: { successCount: number; failureCount: number } }> {
    const res = await api.get<ApiResponse<{ items: AuditLog[]; meta: { total: number; page: number; limit: number } }>>("/admin/audit-logs", { params });
    const raw = res.data.data || { items: [], meta: { total: 0, page: 1, limit: 20 } };
    const items = raw.items || [];
    const successCount = items.filter((i) => i.outcome === "success").length;
    return {
      logs: items,
      total: raw.meta?.total || 0,
      page: raw.meta?.page || 1,
      limit: raw.meta?.limit || 20,
      summary: {
        successCount,
        failureCount: items.length - successCount,
      },
    };
  },
  async getFilterOptions(): Promise<{ actions: string[]; categories: string[]; entityTypes: string[]; sources: string[]; actorTypes: string[]; outcomes: string[] }> {
    const res = await api.get<ApiResponse<{ actions: string[]; categories: string[]; entityTypes: string[]; sources: string[]; actorTypes: string[]; outcomes: string[] }>>("/admin/audit-logs/filter-options");
    return res.data.data || { actions: [], categories: [], entityTypes: [], sources: [], actorTypes: [], outcomes: [] };
  },
  async export(params?: Record<string, unknown>): Promise<void> {
    const res = await api.get("/admin/audit-logs/export", { params, responseType: "blob" });
    const url = window.URL.createObjectURL(res.data);
    const link = document.createElement("a");
    link.href = url;
    link.download = "audit-logs.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },
};

// ─── Referrals Service ────────────────────────────────────────────────────────
export interface ReferralPerson {
  name?: string;
  email?: string;
}

export interface ReferralRecord {
  _id: string;
  referrer?: ReferralPerson;
  referee?: ReferralPerson;
  status?: "pending" | "rewarded" | "expired";
  rewardType?: string;
  rewardAmount?: number;
  createdAt?: string;
  rewardedAt?: string;
}

export interface ReferralStats {
  totalReferrals?: number;
  conversionRate?: number;
  totalRewarded?: number;
}

export const adminReferralsService = {
  async list(): Promise<{ referrals: ReferralRecord[]; total: number; stats: ReferralStats }> {
    const res = await api.get<ApiResponse<ReferralRecord[]>>("/admin/referrals");
    const referrals = res.data.data || [];
    const rewarded = referrals.filter((r) => r.status === "rewarded");
    return {
      referrals,
      total: referrals.length,
      stats: {
        totalReferrals: referrals.length,
        conversionRate: referrals.length > 0 ? Math.round((rewarded.length / referrals.length) * 100) : 0,
        totalRewarded: rewarded.reduce((acc, r) => acc + (r.rewardAmount || 5000), 0),
      },
    };
  },
  async reverse(id: string, reason?: string): Promise<{ message: string }> {
    const res = await api.post<ApiResponse<{ message: string }>>(`/admin/referrals/${id}/reverse`, { reason });
    return { message: res.data.message || "Referral reversed" };
  },
};

// ─── Settings Service ─────────────────────────────────────────────────────────
export interface PlatformSettings {
  escrowAutoReleaseHours: number;
  platformCommissionPercent: number;
  referralProgramEnabled?: boolean;
  referralBuyerVoucherAmount?: number;
  referralSellerDiscountPercent?: number;
  referralSellerDiscountOrders?: number;
  payoutGateway?: string;
  payoutCurrency?: string;
  minimumWithdrawalAmount?: number;
}

export const adminSettingsService = {
  async get(): Promise<{ settings: PlatformSettings }> {
    const res = await api.get<ApiResponse<PlatformSettings>>("/admin/settings");
    return {
      settings: res.data.data || {
        escrowAutoReleaseHours: 72,
        platformCommissionPercent: 10,
        referralProgramEnabled: true,
        referralBuyerVoucherAmount: 2000,
        referralSellerDiscountPercent: 5,
        referralSellerDiscountOrders: 3,
        payoutGateway: "paystack",
        payoutCurrency: "NGN",
        minimumWithdrawalAmount: 1000,
      },
    };
  },
  async update(settings: Partial<PlatformSettings>): Promise<{ settings: PlatformSettings }> {
    const res = await api.put<ApiResponse<PlatformSettings>>("/admin/settings", settings);
    return { settings: res.data.data };
  },
};

// ─── Templates Service ────────────────────────────────────────────────────────
export interface ColorVariable {
  variableName: string;
  defaultValue: string;
  label: string;
}

export interface LayoutSection {
  sectionId: string;
  sectionName: string;
  isRequired: boolean;
}

export interface TemplateColorScheme {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface AdminTemplateItem {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  previewImageUrl: string;
  tier: "free" | "pro" | "pro+";
  category: string;
  isActive: boolean;
  colorVariables: ColorVariable[];
  layoutSections: LayoutSection[];
  defaultColorScheme?: TemplateColorScheme;
  themeSettings?: Record<string, unknown>;
  defaultSections?: Array<Record<string, unknown>>;
  storesUsing?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTemplatePayload {
  name: string;
  slug?: string;
  description?: string;
  previewImageUrl?: string;
  tier: "free" | "pro" | "pro+";
  category?: string;
  isActive?: boolean;
  colorVariables?: ColorVariable[];
  layoutSections?: LayoutSection[];
  defaultColorScheme?: TemplateColorScheme;
  themeSettings?: Record<string, unknown>;
  defaultSections?: Array<Record<string, unknown>>;
}

export interface HtmlFieldSchema {
  key: string;
  label: string;
  type: "text" | "textarea" | "image" | "color" | "url" | "number" | "list";
  defaultValue?: string | number | boolean;
  options?: string[];
}

export interface TemplateSectionItem {
  _id: string;
  id?: string;
  key: string;
  name: string;
  description?: string;
  category?: string;
  kind: "react" | "html";
  type: string;
  variant?: string;
  html?: string;
  css?: string;
  fieldSchema?: HtmlFieldSchema[];
  bindings?: string[];
  defaultData?: Record<string, unknown>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface TemplateSectionPayload {
  key?: string;
  name: string;
  description?: string;
  category?: string;
  kind: "react" | "html";
  type?: string;
  variant?: string;
  html?: string;
  css?: string;
  fieldSchema?: HtmlFieldSchema[];
  bindings?: string[];
  defaultData?: Record<string, unknown>;
  isActive?: boolean;
}

export const adminTemplatesService = {
  async list(params?: Record<string, unknown>): Promise<AdminTemplateItem[]> {
    const res = await api.get<ApiResponse<AdminTemplateItem[]>>("/admin/templates", { params });
    return res.data.data ?? [];
  },
  async get(id: string): Promise<AdminTemplateItem> {
    const list = await this.list();
    const match = list.find((t) => t._id === id || t.id === id);
    if (!match) throw new Error("Template not found");
    return match;
  },
  async create(payload: AdminTemplatePayload): Promise<AdminTemplateItem> {
    const res = await api.post<ApiResponse<AdminTemplateItem>>("/admin/templates", payload);
    return res.data.data;
  },
  async update(id: string, payload: Partial<AdminTemplatePayload>): Promise<AdminTemplateItem> {
    const res = await api.put<ApiResponse<AdminTemplateItem>>(`/admin/templates/${id}`, payload);
    return res.data.data;
  },
  async toggleActive(id: string, isActive: boolean): Promise<AdminTemplateItem> {
    const res = await api.put<ApiResponse<AdminTemplateItem>>(`/admin/templates/${id}`, { isActive });
    return res.data.data;
  },
  async deactivate(id: string): Promise<AdminTemplateItem> {
    const res = await api.patch<ApiResponse<AdminTemplateItem>>(`/admin/templates/${id}/deactivate`);
    return res.data.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/admin/templates/${id}`);
  },
};

export const adminTemplateSectionsService = {
  async list(params?: Record<string, unknown>): Promise<TemplateSectionItem[]> {
    const res = await api.get<ApiResponse<TemplateSectionItem[]>>("/admin/template-sections", { params });
    return res.data.data ?? [];
  },
  async create(payload: TemplateSectionPayload): Promise<TemplateSectionItem> {
    const res = await api.post<ApiResponse<TemplateSectionItem>>("/admin/template-sections", payload);
    return res.data.data;
  },
  async update(id: string, payload: Partial<TemplateSectionPayload>): Promise<TemplateSectionItem> {
    const res = await api.put<ApiResponse<TemplateSectionItem>>(`/admin/template-sections/${id}`, payload);
    return res.data.data;
  },
  async delete(id: string): Promise<void> {
    await api.delete(`/admin/template-sections/${id}`);
  },
  async preview(payload: {
    html: string;
    css?: string;
    data?: Record<string, unknown>;
    bindings?: string[];
  }): Promise<{ html: string; css: string; fieldSchema: HtmlFieldSchema[] }> {
    const res = await api.post<ApiResponse<{ html: string; css: string; fieldSchema: HtmlFieldSchema[] }>>(
      "/admin/template-sections/preview",
      payload,
    );
    return res.data.data;
  },
};

// ─── Subscription Plans Service ──────────────────────────────────────────────
export interface SubscriptionPlanItem {
  _id: string;
  name: "free" | "pro" | "pro+";
  slug: "free" | "pro" | "pro-plus";
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  maxProducts: number | null;
  allowCustomDomain: boolean;
  allowProTemplates: boolean;
  allowProPlusTemplates: boolean;
  allowBlog: boolean;
  commissionPercent: number;
  isActive: boolean;
  activeSubscribers?: number;
  activeRevenue?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface PlanAnalyticsItem {
  _id: string;
  count: number;
  revenue: number;
}

export const adminPlansService = {
  async list(): Promise<SubscriptionPlanItem[]> {
    const res = await api.get<ApiResponse<SubscriptionPlanItem[]>>("/admin/plans");
    return res.data.data ?? [];
  },
  async update(id: string, payload: Partial<SubscriptionPlanItem>): Promise<SubscriptionPlanItem> {
    const res = await api.put<ApiResponse<SubscriptionPlanItem>>(`/admin/plans/${id}`, payload);
    return res.data.data;
  },
  async create(payload: Partial<SubscriptionPlanItem>): Promise<SubscriptionPlanItem> {
    const res = await api.post<ApiResponse<SubscriptionPlanItem>>("/admin/plans", payload);
    return res.data.data;
  },
  async toggleActive(id: string, isActive: boolean): Promise<SubscriptionPlanItem> {
    const res = await api.put<ApiResponse<SubscriptionPlanItem>>(`/admin/plans/${id}`, { isActive });
    return res.data.data;
  },
  async getAnalytics(): Promise<PlanAnalyticsItem[]> {
    const res = await api.get<ApiResponse<PlanAnalyticsItem[]>>("/admin/analytics/plans");
    return res.data.data ?? [];
  },
};
