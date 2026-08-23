import bcrypt from "bcryptjs";
import { APP_NAME } from "../config/constants.config";
import { connectDatabase, disconnectDatabase } from "../config/db.config";
import { User } from "../models/user.model";
import { uniqueReferralCode } from "../utils/referral-code.util";

async function run(): Promise<void> {
  await connectDatabase();
  const email = (process.env.ADMIN_EMAIL ?? `admin@${APP_NAME.toLowerCase()}.online`).toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "Admin1234!";
  const existing = await User.findOne({ email });
  if (existing) {
    existing.role = "admin";
    existing.isVerified = true;
    if (!existing.passwordHash) existing.passwordHash = await bcrypt.hash(password, 12);
    await existing.save();
    console.log(`[${APP_NAME}] Admin already existed; ensured role=admin for ${email}`);
  } else {
    await User.create({
      name: "Platform Admin",
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role: "admin",
      isVerified: true,
      referralCode: await uniqueReferralCode(async (c) => Boolean(await User.exists({ referralCode: c }))),
    });
    console.log(`[${APP_NAME}] Admin created: ${email} / ${password}`);
  }
  await disconnectDatabase();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
