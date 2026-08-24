export interface Review {
  id: string;
  productId: string;
  storeId: string;
  buyerProfileId: string;
  orderId: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: "published" | "hidden" | "flagged";
  productTitle: string;
  productImage?: string;
  variantInfo?: Record<string, string>;
  sellerReply?: { text: string; repliedAt: string } | null;
  createdAt: string;
  buyerName?: string;
}

export interface CreateReviewInput {
  orderId: string;
  productId: string;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
}