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
  seller?: {
    _id: string;
    name: string;
    email: string;
  };
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
  ): Promise<{ items: AdminUserItem[]; meta: AdminUserListMeta }> {
    const res = await api.get<ApiResponse<{ items: AdminUserItem[]; meta: AdminUserListMeta }>>(
      "/admin/users",
      { params },
    );
    return res.data.data;
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
export interface AdminPayoutItem {
  _id: string;
  sellerId: string;
  amount: number;
  currency: string;
  status: "pending" | "approved" | "dispatched" | "rejected";
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    accountName: string;
  };
  createdAt: string;
}

export const adminPayoutsService = {
  async list(params?: Record<string, unknown>): Promise<{ payouts: AdminPayoutItem[]; total: number }> {
    const res = await api.get<ApiResponse<{ payouts: AdminPayoutItem[]; total: number }>>("/admin/payouts", { params });
    return res.data.data;
  },
  async approve(id: string): Promise<void> {
    await api.post(`/admin/payouts/${id}/approve`);
  },
  async dispatch(id: string): Promise<void> {
    await api.post(`/admin/payouts/${id}/dispatch`);
  },
  async reject(id: string, reason?: string): Promise<void> {
    await api.post(`/admin/payouts/${id}/reject`, { reason });
  },
};

// ─── Disputes Service ─────────────────────────────────────────────────────────
export interface AdminDisputeItem {
  _id: string;
  orderId: string;
  buyerId: string;
  sellerId: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  reason: string;
  severity?: "Low" | "Medium" | "High";
  resolution?: string;
  createdAt: string;
}

export const adminDisputesService = {
  async list(params?: Record<string, unknown>): Promise<{ disputes: AdminDisputeItem[]; total: number }> {
    const res = await api.get<ApiResponse<{ disputes: AdminDisputeItem[]; total: number }>>("/admin/disputes", { params });
    return res.data.data;
  },
  async getById(disputeId: string): Promise<AdminDisputeItem> {
    const res = await api.get<ApiResponse<AdminDisputeItem>>(`/admin/disputes/${disputeId}`);
    return res.data.data;
  },
  async resolve(disputeId: string, resolution: string, refundBuyer?: boolean): Promise<void> {
    await api.post(`/admin/disputes/${disputeId}/resolve`, { resolution, refundBuyer });
  },
};

// ─── Tickets Service ──────────────────────────────────────────────────────────
export interface AdminTicketItem {
  _id: string;
  userId: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  unread?: boolean;
  createdAt: string;
}

export const adminTicketsService = {
  async list(params?: Record<string, unknown>): Promise<{ tickets: AdminTicketItem[]; total: number }> {
    const res = await api.get<ApiResponse<{ tickets: AdminTicketItem[]; total: number }>>("/admin/tickets", { params });
    return res.data.data;
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
}

export const adminAnalyticsService = {
  async getOverview(): Promise<OverviewStats> {
    const res = await api.get<ApiResponse<OverviewStats>>("/admin/analytics/overview");
    return res.data.data;
  },
  async getGmvTrend(params?: Record<string, unknown>): Promise<Array<{ date: string; gmv: number; orders: number }>> {
    const res = await api.get<ApiResponse<Array<{ date: string; gmv: number; orders: number }>>>("/admin/analytics/gmv-trend", { params });
    return res.data.data;
  },
};
