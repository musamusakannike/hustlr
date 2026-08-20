import { APP_NAME } from "../config/constants.config";
import { connectDatabase, disconnectDatabase } from "../config/db.config";
import { SubscriptionPlan } from "../models/subscription-plan.model";

const plans = [
  {
    name: "free" as const,
    slug: "free" as const,
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: ["25 products", "Custom subdomain", "Free templates", "Escrow payments"],
    maxProducts: 25,
    allowCustomDomain: false,
    allowProTemplates: false,
    allowProPlusTemplates: false,
    allowBlog: false,
    commissionPercent: 10,
    isActive: true,
  },
  {
    name: "pro" as const,
    slug: "pro" as const,
    monthlyPrice: 15000,
    yearlyPrice: 150000,
    features: ["Unlimited products", "Pro templates", "Blog", "Coupons", "Lower commission"],
    maxProducts: null,
    allowCustomDomain: false,
    allowProTemplates: true,
    allowProPlusTemplates: false,
    allowBlog: true,
    commissionPercent: 7,
    isActive: true,
  },
  {
    name: "pro+" as const,
    slug: "pro-plus" as const,
    monthlyPrice: 35000,
    yearlyPrice: 350000,
    features: ["Everything in Pro", "Custom domain", "All templates", "Lowest commission"],
    maxProducts: null,
    allowCustomDomain: true,
    allowProTemplates: true,
    allowProPlusTemplates: true,
    allowBlog: true,
    commissionPercent: 5,
    isActive: true,
  },
];

async function run(): Promise<void> {
  await connectDatabase();
  for (const plan of plans) {
    await SubscriptionPlan.findOneAndUpdate({ slug: plan.slug }, plan, { upsert: true, new: true });
    console.log(`[${APP_NAME}] upserted plan ${plan.name}`);
  }
  await disconnectDatabase();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
