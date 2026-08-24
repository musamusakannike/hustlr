import bcrypt from "bcryptjs";
import { getFirebaseAdmin, isFirebaseConfigured } from "../config/firebase.config";
import { OTP_EXPIRY_MINUTES } from "../config/constants.config";
import { User } from "../models/user.model";
import { BuyerProfile } from "../models/buyer-profile.model";
import { Store } from "../models/store.model";
import { SellerReferral } from "../models/seller-referral.model";
import { BuyerReferral } from "../models/buyer-referral.model";
import { ApiError } from "../utils/api-error.util";
import { sendEmail } from "../utils/email.util";
import { compareOtp, generateOtp, hashOtp, isExpired, otpExpiry } from "../utils/otp.util";
import { uniqueReferralCode } from "../utils/referral-code.util";
import { signToken } from "../utils/jwt.util";
import { getSettings } from "./settings.service";

function publicUser(user: InstanceType<typeof User>) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    avatar: user.avatar,
    referralCode: user.referralCode,
    banned: user.banned,
    createdAt: user.createdAt,
  };
}

function publicBuyer(buyer: InstanceType<typeof BuyerProfile>) {
  return {
    id: buyer._id,
    storeId: buyer.storeId,
    name: buyer.name,
    email: buyer.email,
    isVerified: buyer.isVerified,
    avatar: buyer.avatar,
    referralCode: buyer.referralCode,
    shippingAddresses: buyer.shippingAddresses,
    banned: buyer.banned,
    createdAt: buyer.createdAt,
  };
}

export async function registerSeller(input: {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}) {
  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) throw ApiError.conflict("An account with this email already exists");

  const referralCode = await uniqueReferralCode(async (code) =>
    Boolean(await User.exists({ referralCode: code })),
  );
  const passwordHash = await bcrypt.hash(input.password, 12);
  const otp = generateOtp();
  let referredBy = null;
  if (input.referralCode) {
    const referrer = await User.findOne({ referralCode: input.referralCode.toUpperCase() });
    if (referrer) referredBy = referrer._id;
  }

  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    passwordHash,
    role: "seller",
    isVerified: false,
    referralCode,
    referredBy,
    verificationOtp: await hashOtp(otp),
    verificationOtpExpires: otpExpiry(OTP_EXPIRY_MINUTES),
  });

  if (referredBy) {
    const settings = await getSettings();
    await SellerReferral.create({
      referrerId: referredBy,
      refereeId: user._id,
      status: "pending",
      rewardType: "cash_bonus",
      rewardAmount: settings.defaultSellerReferralRewardAmount,
    });
  }

  await sendEmail({
    to: user.email,
    templateName: "otpVerification",
    data: { name: user.name, otp, context: "seller account" },
  });
  await sendEmail({
    to: user.email,
    templateName: "sellerWelcome",
    data: { name: user.name },
  }).catch(() => undefined);

  return { tempUserId: user._id, requiresOtp: true, email: user.email };
}

export async function verifySellerOtp(email: string, otp: string) {
  const user = await User.findOne({ email: email.toLowerCase(), role: { $in: ["seller", "admin"] } });
  if (!user) throw ApiError.notFound("Account not found");
  if (!user.verificationOtp || isExpired(user.verificationOtpExpires)) {
    throw ApiError.badRequest("OTP expired. Request a new one.");
  }
  const ok = await compareOtp(otp, user.verificationOtp);
  if (!ok) throw ApiError.badRequest("Invalid OTP");
  user.isVerified = true;
  user.verificationOtp = null;
  user.verificationOtpExpires = null;
  await user.save();
  const token = signToken({
    userId: String(user._id),
    email: user.email,
    role: user.role,
    isVerified: true,
    type: "platform",
  });
  return { token, user: publicUser(user) };
}

export async function resendSellerOtp(email: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw ApiError.notFound("Account not found");
  if (user.isVerified) throw ApiError.badRequest("Account is already verified");
  const otp = generateOtp();
  user.verificationOtp = await hashOtp(otp);
  user.verificationOtpExpires = otpExpiry(OTP_EXPIRY_MINUTES);
  await user.save();
  await sendEmail({
    to: user.email,
    templateName: "otpVerification",
    data: { name: user.name, otp, context: "seller account" },
  });
  return { email: user.email };
}

export async function loginSeller(email: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw ApiError.unauthorized("Invalid email or password");
  if (user.banned) throw ApiError.forbidden(user.banReason || "Account is banned");
  if (!user.passwordHash) {
    throw ApiError.badRequest("This account uses Google sign-in. Continue with Google.");
  }
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");
  if (!user.isVerified) throw ApiError.forbidden("Verify your email before logging in");
  const token = signToken({
    userId: String(user._id),
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    type: "platform",
  });
  return { token, user: publicUser(user) };
}

export async function googleSeller(idToken: string, referralCode?: string) {
  if (!isFirebaseConfigured()) {
    throw ApiError.serviceUnavailable("Google sign-in is not configured");
  }
  const decoded = await getFirebaseAdmin().auth().verifyIdToken(idToken);
  if (!decoded.email) throw ApiError.badRequest("Google account has no email");
  let user = await User.findOne({ email: decoded.email.toLowerCase() });
  if (!user) {
    const code = await uniqueReferralCode(async (c) => Boolean(await User.exists({ referralCode: c })));
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({ referralCode: referralCode.toUpperCase() });
      if (referrer) referredBy = referrer._id;
    }
    user = await User.create({
      name: decoded.name || decoded.email.split("@")[0],
      email: decoded.email.toLowerCase(),
      role: "seller",
      isVerified: true,
      googleId: decoded.uid,
      avatar: decoded.picture,
      referralCode: code,
      referredBy,
    });
    if (referredBy) {
      const settings = await getSettings();
      await SellerReferral.create({
        referrerId: referredBy,
        refereeId: user._id,
        status: "pending",
        rewardType: "cash_bonus",
        rewardAmount: settings.defaultSellerReferralRewardAmount,
      });
    }
  } else if (!user.googleId) {
    user.googleId = decoded.uid;
    user.isVerified = true;
    if (decoded.picture && !user.avatar) user.avatar = decoded.picture;
    await user.save();
  }
  if (user.banned) throw ApiError.forbidden(user.banReason || "Account is banned");
  const token = signToken({
    userId: String(user._id),
    email: user.email,
    role: user.role,
    isVerified: true,
    type: "platform",
  });
  return { token, user: publicUser(user) };
}

export async function forgotSellerPassword(email: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return { email };
  if (!user.passwordHash) {
    throw ApiError.badRequest("This account uses Google sign-in and has no password.");
  }
  const otp = generateOtp();
  user.resetPasswordOtp = await hashOtp(otp);
  user.resetPasswordOtpExpires = otpExpiry(OTP_EXPIRY_MINUTES);
  await user.save();
  await sendEmail({
    to: user.email,
    templateName: "passwordResetOtp",
    data: { name: user.name, otp },
  });
  return { email: user.email };
}

export async function resetSellerPassword(email: string, otp: string, password: string) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) throw ApiError.notFound("Account not found");
  if (!user.resetPasswordOtp || isExpired(user.resetPasswordOtpExpires)) {
    throw ApiError.badRequest("OTP expired. Request a new one.");
  }
  const ok = await compareOtp(otp, user.resetPasswordOtp);
  if (!ok) throw ApiError.badRequest("Invalid OTP");
  user.passwordHash = await bcrypt.hash(password, 12);
  user.resetPasswordOtp = null;
  user.resetPasswordOtpExpires = null;
  await user.save();
  return { email: user.email };
}

export async function registerBuyer(
  storeId: string,
  input: { name: string; email: string; password: string; referralCode?: string },
) {
  const store = await Store.findById(storeId);
  if (!store) throw ApiError.notFound("Store not found");
  const existing = await BuyerProfile.findOne({ storeId, email: input.email.toLowerCase() });
  if (existing) throw ApiError.conflict("An account with this email already exists on this store");

  const referralCode = await uniqueReferralCode(async (code) =>
    Boolean(await BuyerProfile.exists({ storeId, referralCode: code })),
  );
  let referredBy = null;
  if (input.referralCode) {
    const referrer = await BuyerProfile.findOne({
      storeId,
      referralCode: input.referralCode.toUpperCase(),
    });
    if (referrer) referredBy = referrer._id;
  }

  const otp = generateOtp();
  const buyer = await BuyerProfile.create({
    storeId,
    email: input.email.toLowerCase(),
    passwordHash: await bcrypt.hash(input.password, 12),
    name: input.name,
    isVerified: false,
    referralCode,
    referredBy,
    verificationOtp: await hashOtp(otp),
    verificationOtpExpires: otpExpiry(OTP_EXPIRY_MINUTES),
  });

  if (referredBy && store.referralEnabled) {
    await BuyerReferral.create({
      storeId,
      referrerId: referredBy,
      refereeId: buyer._id,
      status: "pending",
      referrerRewardAmount: store.referrerRewardAmount,
      refereeDiscountType: "percentage",
      refereeDiscountValue: store.refereeDiscountPercent,
    });
  }

  await sendEmail({
    to: buyer.email,
    templateName: "otpVerification",
    data: { name: buyer.name, otp, context: store.name },
  });
  await sendEmail({
    to: buyer.email,
    templateName: "buyerWelcome",
    data: { name: buyer.name, storeName: store.name },
  }).catch(() => undefined);

  return { tempUserId: buyer._id, requiresOtp: true, email: buyer.email, storeId };
}

export async function verifyBuyerOtp(storeId: string, email: string, otp: string) {
  const buyer = await BuyerProfile.findOne({ storeId, email: email.toLowerCase() });
  if (!buyer) throw ApiError.notFound("Account not found");
  if (!buyer.verificationOtp || isExpired(buyer.verificationOtpExpires)) {
    throw ApiError.badRequest("OTP expired. Request a new one.");
  }
  const ok = await compareOtp(otp, buyer.verificationOtp);
  if (!ok) throw ApiError.badRequest("Invalid OTP");
  buyer.isVerified = true;
  buyer.verificationOtp = null;
  buyer.verificationOtpExpires = null;
  await buyer.save();
  const token = signToken({
    buyerProfileId: String(buyer._id),
    storeId: String(buyer.storeId),
    email: buyer.email,
    name: buyer.name,
    type: "buyer",
  });
  return { token, buyer: publicBuyer(buyer) };
}

export async function resendBuyerOtp(storeId: string, email: string) {
  const buyer = await BuyerProfile.findOne({ storeId, email: email.toLowerCase() });
  if (!buyer) throw ApiError.notFound("Account not found");
  if (buyer.isVerified) throw ApiError.badRequest("Account is already verified");
  const otp = generateOtp();
  buyer.verificationOtp = await hashOtp(otp);
  buyer.verificationOtpExpires = otpExpiry(OTP_EXPIRY_MINUTES);
  await buyer.save();
  const store = await Store.findById(storeId);
  await sendEmail({
    to: buyer.email,
    templateName: "otpVerification",
    data: { name: buyer.name, otp, context: store?.name ?? "store account" },
  });
  return { email: buyer.email };
}

export async function loginBuyer(storeId: string, email: string, password: string) {
  const buyer = await BuyerProfile.findOne({ storeId, email: email.toLowerCase() });
  if (!buyer) throw ApiError.unauthorized("Invalid email or password");
  if (buyer.banned) throw ApiError.forbidden(buyer.banReason || "You are banned from this store");
  if (!buyer.passwordHash) {
    throw ApiError.badRequest("This account uses Google sign-in. Continue with Google.");
  }
  const ok = await bcrypt.compare(password, buyer.passwordHash);
  if (!ok) throw ApiError.unauthorized("Invalid email or password");
  if (!buyer.isVerified) throw ApiError.forbidden("Verify your email before logging in");
  const token = signToken({
    buyerProfileId: String(buyer._id),
    storeId: String(buyer.storeId),
    email: buyer.email,
    name: buyer.name,
    type: "buyer",
  });
  return { token, buyer: publicBuyer(buyer) };
}

export async function googleBuyer(storeId: string, idToken: string, referralCode?: string) {
  if (!isFirebaseConfigured()) {
    throw ApiError.serviceUnavailable("Google sign-in is not configured");
  }
  const decoded = await getFirebaseAdmin().auth().verifyIdToken(idToken);
  if (!decoded.email) throw ApiError.badRequest("Google account has no email");
  let buyer = await BuyerProfile.findOne({ storeId, email: decoded.email.toLowerCase() });
  if (!buyer) {
    const code = await uniqueReferralCode(async (c) =>
      Boolean(await BuyerProfile.exists({ storeId, referralCode: c })),
    );
    const store = await Store.findById(storeId);
    let referredBy = null;
    if (referralCode) {
      const referrer = await BuyerProfile.findOne({
        storeId,
        referralCode: referralCode.toUpperCase(),
      });
      if (referrer) referredBy = referrer._id;
    }
    buyer = await BuyerProfile.create({
      storeId,
      email: decoded.email.toLowerCase(),
      name: decoded.name || decoded.email.split("@")[0],
      googleId: decoded.uid,
      avatar: decoded.picture,
      isVerified: true,
      referralCode: code,
      referredBy,
    });
    if (referredBy && store?.referralEnabled) {
      await BuyerReferral.create({
        storeId,
        referrerId: referredBy,
        refereeId: buyer._id,
        status: "pending",
        referrerRewardAmount: store.referrerRewardAmount,
        refereeDiscountType: "percentage",
        refereeDiscountValue: store.refereeDiscountPercent,
      });
    }
  }
  if (buyer.banned) throw ApiError.forbidden(buyer.banReason || "You are banned from this store");
  const token = signToken({
    buyerProfileId: String(buyer._id),
    storeId: String(buyer.storeId),
    email: buyer.email,
    name: buyer.name,
    type: "buyer",
  });
  return { token, buyer: publicBuyer(buyer) };
}

export async function forgotBuyerPassword(storeId: string, email: string) {
  const buyer = await BuyerProfile.findOne({ storeId, email: email.toLowerCase() });
  if (!buyer) return { email };
  if (!buyer.passwordHash) {
    throw ApiError.badRequest("This account uses Google sign-in and has no password.");
  }
  const otp = generateOtp();
  buyer.resetPasswordOtp = await hashOtp(otp);
  buyer.resetPasswordOtpExpires = otpExpiry(OTP_EXPIRY_MINUTES);
  await buyer.save();
  await sendEmail({
    to: buyer.email,
    templateName: "passwordResetOtp",
    data: { name: buyer.name, otp },
  });
  return { email: buyer.email };
}

export async function resetBuyerPassword(storeId: string, email: string, otp: string, password: string) {
  const buyer = await BuyerProfile.findOne({ storeId, email: email.toLowerCase() });
  if (!buyer) throw ApiError.notFound("Account not found");
  if (!buyer.resetPasswordOtp || isExpired(buyer.resetPasswordOtpExpires)) {
    throw ApiError.badRequest("OTP expired. Request a new one.");
  }
  const ok = await compareOtp(otp, buyer.resetPasswordOtp);
  if (!ok) throw ApiError.badRequest("Invalid OTP");
  buyer.passwordHash = await bcrypt.hash(password, 12);
  buyer.resetPasswordOtp = null;
  buyer.resetPasswordOtpExpires = null;
  await buyer.save();
  return { email: buyer.email };
}
