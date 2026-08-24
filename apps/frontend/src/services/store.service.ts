import { getTransport } from "@/lib/transport";
import type { Store } from "@/types/store";

const transport = getTransport();

export type IStore = Partial<Store> & {
  name: string;
  slug: string;
  categories?: string[];
  country?: { name: string; code: string; flagEmoji?: string };
};

export const storeService = {
  async getMyStore(): Promise<IStore | null> {
    try {
      return await transport.getStore();
    } catch {
      return null;
    }
  },

  setupStore(payload: Partial<IStore>): Promise<IStore> {
    return transport.setupStore(payload);
  },
};
