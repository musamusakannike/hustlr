export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  selectedVariants: Record<string, string>;
  priceSnapshot: number;
  priceChanged?: boolean;
  product?: {
    id: string;
    title: string;
    slug: string;
    images: string[];
    price: number;
    stock: number;
    status: string;
  };
}

export interface Cart {
  id?: string;
  items: CartItem[];
  subtotal: number;
  shippingTotal?: number;
  count: number;
}

export interface AddCartInput {
  productId: string;
  quantity: number;
  selectedVariants?: Record<string, string>;
}

export interface CheckoutInput {
  shippingAddress: {
    fullName: string;
    streetAddress: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phoneNumber: string;
  };
  couponCode?: string;
  saveAddress?: boolean;
}

export interface CheckoutResult {
  order: import("./order").Order;
  authorizationUrl: string;
  reference: string;
}