import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash?: string | null;
  role: "seller" | "admin";
  isVerified: boolean;
  googleId?: string | null;
  avatar?: string | null;
  referralCode: string;
  referredBy?: mongoose.Types.ObjectId | null;
  verificationOtp?: string | null;
  verificationOtpExpires?: Date | null;
  resetPasswordOtp?: string | null;
  resetPasswordOtpExpires?: Date | null;
  banned: boolean;
  bannedAt?: Date | null;
  banReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, default: null },
    role: { type: String, enum: ["seller", "admin"], default: "seller", index: true },
    isVerified: { type: Boolean, default: false },
    googleId: { type: String, default: null, index: true },
    avatar: { type: String, default: null },
    referralCode: { type: String, required: true, unique: true },
    referredBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    verificationOtp: { type: String, default: null },
    verificationOtpExpires: { type: Date, default: null },
    resetPasswordOtp: { type: String, default: null },
    resetPasswordOtpExpires: { type: Date, default: null },
    banned: { type: Boolean, default: false, index: true },
    bannedAt: { type: Date, default: null },
    banReason: { type: String, default: null },
  },
  { timestamps: true },
);

userSchema.index({ email: 1, role: 1 });

export const User = mongoose.model<IUser>("User", userSchema);
