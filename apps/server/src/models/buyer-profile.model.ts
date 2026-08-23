import mongoose, { Document, Schema } from "mongoose";

export interface IShippingAddress {
  _id?: mongoose.Types.ObjectId;
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  isDefault: boolean;
}

export interface IBuyerProfile extends Document {
  storeId: mongoose.Types.ObjectId;
  email: string;
  passwordHash?: string | null;
  name: string;
  googleId?: string | null;
  avatar?: string | null;
  isVerified: boolean;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId | null;
  shippingAddresses: IShippingAddress[];
  banned: boolean;
  bannedAt?: Date | null;
  banReason?: string | null;
  verificationOtp?: string | null;
  verificationOtpExpires?: Date | null;
  resetPasswordOtp?: string | null;
  resetPasswordOtpExpires?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const shippingAddressSchema = new Schema<IShippingAddress>(
  {
    fullName: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    zipCode: { type: String, required: true },
    country: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const buyerProfileSchema = new Schema<IBuyerProfile>(
  {
    storeId: { type: Schema.Types.ObjectId, ref: "Store", required: true, index: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    name: { type: String, required: true, trim: true },
    googleId: { type: String, default: null },
    avatar: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    referralCode: { type: String, required: true },
    referredBy: { type: Schema.Types.ObjectId, ref: "BuyerProfile", default: null },
    shippingAddresses: { type: [shippingAddressSchema], default: [] },
    banned: { type: Boolean, default: false },
    bannedAt: { type: Date, default: null },
    banReason: { type: String, default: null },
    verificationOtp: { type: String, default: null },
    verificationOtpExpires: { type: Date, default: null },
    resetPasswordOtp: { type: String, default: null },
    resetPasswordOtpExpires: { type: Date, default: null },
  },
  { timestamps: true },
);

buyerProfileSchema.index({ storeId: 1, email: 1 }, { unique: true });
buyerProfileSchema.index({ storeId: 1, referralCode: 1 }, { unique: true });

export const BuyerProfile = mongoose.model<IBuyerProfile>("BuyerProfile", buyerProfileSchema);
