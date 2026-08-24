import type { ShippingAddress } from "./order";

export interface Buyer {
  id: string;
  storeId: string;
  email: string;
  name: string;
  googleId?: string | null;
  avatar?: string | null;
  isVerified: boolean;
  referralCode: string;
  shippingAddresses: ShippingAddress[];
  banned: boolean;
  createdAt?: string;
}

export interface BuyerAuthResponse {
  user: Buyer;
  token?: string;
}

export interface BuyerRegisterInput {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}