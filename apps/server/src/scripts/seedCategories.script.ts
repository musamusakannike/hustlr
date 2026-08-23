import { APP_NAME } from "../config/constants.config";
import { connectDatabase, disconnectDatabase } from "../config/db.config";
import { GlobalCategory } from "../models/global-category.model";
import { slugify } from "../utils/slug.util";

const names = [
  "Fashion",
  "Electronics",
  "Food & Groceries",
  "Beauty",
  "Home & Living",
  "Art",
  "Sports",
  "Books",
  "Health",
  "General",
];

async function run(): Promise<void> {
  await connectDatabase();
  for (const name of names) {
    await GlobalCategory.findOneAndUpdate(
      { slug: slugify(name) },
      { name, slug: slugify(name), isActive: true },
      { upsert: true },
    );
  }
  console.log(`[${APP_NAME}] seeded ${names.length} global categories`);
  await disconnectDatabase();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
