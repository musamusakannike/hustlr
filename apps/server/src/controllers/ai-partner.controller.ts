import type { Request, Response } from "express";
import { asyncHandler } from "../utils/async-handler.util";
import { sendSuccess, sendCreated } from "../utils/api-response.util";
import * as partner from "../services/ai-partner.service";

export const listThreads = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await partner.listThreads(String(req.user!._id)));
});

export const createThread = asyncHandler(async (req: Request, res: Response) => {
  sendCreated(res, await partner.createThread(String(req.user!._id), req.body.title));
});

export const renameThread = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await partner.renameThread(String(req.user!._id), req.params.threadId, req.body.title));
});

export const deleteThread = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await partner.deleteThread(String(req.user!._id), req.params.threadId));
});

export const listMessages = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await partner.listMessages(String(req.user!._id), req.params.threadId));
});

export const postMessage = asyncHandler(async (req: Request, res: Response) => {
  await partner.postMessage(String(req.user!._id), req.params.threadId, req.body.content, res);
});

export const applyAction = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await partner.applyAction(String(req.user!._id), req.params.actionId));
});

export const dismissAction = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await partner.dismissAction(String(req.user!._id), req.params.actionId));
});
