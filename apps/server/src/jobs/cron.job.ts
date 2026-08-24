import { APP_NAME } from "../config/constants.config";
import { autoReleaseEscrow } from "../services/order.service";
import { processSubscriptionExpiry } from "../services/subscription.service";
import { backfillRatings } from "../services/review.service";
import { cleanupStaleCarts } from "../services/cart.service";
import { deactivateExpiredCoupons } from "../services/coupon.service";

function run(name: string, fn: () => Promise<unknown>, ms: number): void {
  const wrapped = async () => {
    try {
      const result = await fn();
      console.log(`[${APP_NAME}] cron ${name}:`, result);
    } catch (error) {
      console.error(`[${APP_NAME}] cron ${name} failed`, error);
    }
  };
  setTimeout(wrapped, 15_000);
  setInterval(wrapped, ms);
}

export function startCronJobs(): void {
  run("escrow-auto-release", autoReleaseEscrow, 60 * 60 * 1000);
  run("subscription-expiry", processSubscriptionExpiry, 6 * 60 * 60 * 1000);
  run("review-backfill", backfillRatings, 24 * 60 * 60 * 1000);
  run("stale-carts", cleanupStaleCarts, 24 * 60 * 60 * 1000);
  run("expired-coupons", deactivateExpiredCoupons, 24 * 60 * 60 * 1000);
}
