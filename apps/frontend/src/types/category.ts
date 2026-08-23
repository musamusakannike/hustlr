export interface StoreCategory {
  id: string;
  storeId: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  order: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInput {
  name: string;
  description?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
}
