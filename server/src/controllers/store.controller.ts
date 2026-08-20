import type { Request, Response } from "express";
import * as storeService from "../services/store.service";
import { asyncHandler } from "../utils/async-handler.util";
import { sendSuccess } from "../utils/api-response.util";
import { uploadFile } from "../utils/upload.util";
import { getSellerStore } from "../services/store-helper.service";

export const setupStore = asyncHandler(async (req: Request, res: Response) => {
  const store = await storeService.setupStore(String(req.user!._id), req.user!.email, req.body);
  sendSuccess(res, store, "Store saved");
});

export const getStore = asyncHandler(async (req: Request, res: Response) => {
  const store = await storeService.getMyStore(String(req.user!._id));
  sendSuccess(res, store);
});

export const listTemplates = asyncHandler(async (req: Request, res: Response) => {
  const templates = await storeService.listEligibleTemplates(
    String(req.user!._id),
    req.query.tier as string | undefined,
  );
  sendSuccess(res, templates);
});

export const setTemplate = asyncHandler(async (req: Request, res: Response) => {
  const store = await storeService.setStoreTemplate(String(req.user!._id), req.body.templateId);
  sendSuccess(res, store, "Template updated");
});

export const setDomain = asyncHandler(async (req: Request, res: Response) => {
  const data = await storeService.setCustomDomain(String(req.user!._id), req.body.domain);
  sendSuccess(res, data, "Custom domain saved");
});

export const verifyDomain = asyncHandler(async (req: Request, res: Response) => {
  const data = await storeService.verifyDomain(String(req.user!._id));
  sendSuccess(res, data, data.verified ? "Domain verified" : "Domain not verified yet");
});

export const removeDomain = asyncHandler(async (req: Request, res: Response) => {
  const store = await storeService.removeCustomDomain(String(req.user!._id));
  sendSuccess(res, store, "Custom domain removed");
});

export const uploadStoreAsset = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ success: false, message: "No file uploaded" });
    return;
  }
  const store = await getSellerStore(String(req.user!._id));
  const kind = (req.query.kind as string) || "logo";
  const url = await uploadFile(req.file, `stores/${store._id}/${kind}`);
  sendSuccess(res, { url });
});
