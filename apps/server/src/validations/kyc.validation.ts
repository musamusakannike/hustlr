import Joi from "joi";

export const kycUpdateSchema = Joi.object({
  firstName: Joi.string(),
  lastName: Joi.string(),
  otherName: Joi.string().allow(""),
  verificationType: Joi.string().valid("NIN", "Driver's License", "International Passport", "Voter's Card"),
  documentId: Joi.string(),
  idDocumentUrl: Joi.string(),
  selfieUrl: Joi.string(),
  address: Joi.string(),
  proofOfAddressUrl: Joi.string(),
  businessRegistrationUrl: Joi.string().allow(""),
  bankDetails: Joi.object({
    bankName: Joi.string().required(),
    bankCode: Joi.string().required(),
    accountNumber: Joi.string().required(),
    accountName: Joi.string().required(),
  }),
}).min(1);

export const rejectSchema = Joi.object({
  reviewerNote: Joi.string().min(5).required(),
});

export const requestInfoSchema = Joi.object({
  reviewerNote: Joi.string().min(5).required(),
  requestedFiles: Joi.array().items(Joi.string()).min(1).required(),
});
