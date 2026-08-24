export type BlogStatus = "draft" | "published" | "archived";

export interface BlogPost {
  id: string;
  storeId: string;
  sellerId: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage?: string;
  tags: string[];
  status: BlogStatus;
  publishedAt?: string | null;
  metaTitle?: string;
  metaDescription?: string;
  viewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogInput {
  title: string;
  content?: string;
  excerpt?: string;
  coverImage?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
}