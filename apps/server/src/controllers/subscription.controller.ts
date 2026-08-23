import type { Request, Response } from "express";
import * as subscriptionService from "../services/subscription.service";
import * as adminService from "../services/admin.service";
import { asyncHandler } from "../utils/async-handler.util";
import { sendSuccess } from "../utils/api-response.util";

export const listPlans = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await subscriptionService.listPublicPlans());
});

export const subscribeFree = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await subscriptionService.subscribeFree(String(req.user!._id)), "Free plan activated");
});

export const initializeSubscription = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await subscriptionService.initializePaidSubscription(
      String(req.user!._id),
      req.user!.email,
      req.body.planId,
      req.body.billingCycle,
    ),
  );
});

export const verifySubscription = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await subscriptionService.verifySubscriptionPayment(req.body.reference), "Subscription active");
});

export const cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await subscriptionService.cancelSubscription(String(req.user!._id)), "Auto-renew disabled");
});

export const changePlan = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(
    res,
    await subscriptionService.changePlan(
      String(req.user!._id),
      req.user!.email,
      req.body.planId,
      req.body.billingCycle,
    ),
  );
});

export const currentSubscription = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await subscriptionService.currentSubscription(String(req.user!._id)));
});

export const adminListPlans = asyncHandler(async (_req: Request, res: Response) => {
  sendSuccess(res, await adminService.listPlansAdmin());
});

export const adminUpsertPlan = asyncHandler(async (req: Request, res: Response) => {
  sendSuccess(res, await adminService.upsertPlan(req.params.planId ?? null, req.body), "Plan saved");
});
