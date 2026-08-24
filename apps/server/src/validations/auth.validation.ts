import Joi from "joi";

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(80).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(72).required(),
  referralCode: Joi.string().optional(),
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
});

export const emailSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const googleSchema = Joi.object({
  idToken: Joi.string().required(),
  referralCode: Joi.string().optional(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
  otp: Joi.string().length(6).required(),
  password: Joi.string().min(8).max(72).required(),
});
