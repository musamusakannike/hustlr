export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded"
  | "partially_refunded";

export type DeliveryStatus =
  | "processing"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "confirmed"
  | "disputed"
  | "refunded";

export type EscrowStatus = "locked" | "released" | "disputed" | "refunded";

export interface ShippingAddress {
  id?: string;
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  isDefault?: boolean;
}

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  selectedVariants: Record<string, string>;
  image?: string;
  shippingFee: number;
}

export interface Order {
  id: string;
  buyerProfileId: string;
  storeId: string;
  sellerId: string;
  orderNumber: string;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  subtotal: number;
  shippingTotal: number;
  discountAmount: number;
  couponCode?: string;
  totalAmount: number;
  currency: string;
  paymentStatus: PaymentStatus;
  paymentReference?: string;
  paidAt?: string | null;
  deliveryStatus: DeliveryStatus;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  confirmedAt?: string | null;
  trackingNumber?: string;
  trackingNote?: string;
  commissionPercent: number;
  commissionAmount: number;
  payoutAmount: number;
  escrowStatus: EscrowStatus;
  escrowReleasedAt?: string | null;
  receiptUrl?: string;
  invoiceUrl?: string;
  createdAt: string;
  updatedAt: string;
  buyer?: { id?: string; name?: string; email?: string };
}

export interface OrderFilters {
  deliveryStatus?: DeliveryStatus | "all";
  paymentStatus?: PaymentStatus | "all";
  search?: string;
  page?: number;
  limit?: number;
}

export interface OrderStats {
  totalOrders: number;
  byStatus: Record<string, number>;
  totalRevenue: number;
  averageOrderValue: number;
  ordersToday: number;
  ordersThisWeek: number;
  ordersThisMonth: number;
}

export interface ShipOrderInput {
  trackingNumber: string;
  trackingNote?: string;
}