import { apiClient } from "./api.client";

export interface IStore {
  _id?: string;
  sellerId?: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  banner?: string;
  favicon?: string;
  contactEmail?: string;
  contactPhone?: string;
  address?: string;
  isLive?: boolean;
  categories?: string[];
  country?: {
    name: string;
    code: string;
    flagEmoji?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export const storeService = {
  /**
   * Fetch current seller's store profile
   */
  async getMyStore(): Promise<IStore | null> {
    try {
      const res = await apiClient.get<ApiResponse<IStore | null>>("/seller/store");
      return res.data.data;
    } catch {
      return null;
    }
  },

  /**
   * Setup or update seller store profile
   */
  async setupStore(payload: Partial<IStore>): Promise<IStore> {
    const res = await apiClient.put<ApiResponse<IStore>>("/seller/store/setup", payload);
    return res.data.data;
  },
};
