import { APP_NAME } from "../config/constants.config";
import { connectDatabase, disconnectDatabase } from "../config/db.config";
import { Store } from "../models/store.model";
import { Product } from "../models/product.model";
import { StoreCategory } from "../models/store-category.model";
import { slugify, uniqueSlug } from "../utils/slug.util";
import { refreshCategoryCounts } from "../services/product.service";

interface SampleProduct {
  title: string;
  category: "Casual" | "Formal" | "Party" | "Gym";
  description: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  images: string[];
  tags: string[];
  isFeatured?: boolean;
}

const sampleProducts: SampleProduct[] = [
  // Casual
  {
    title: "Classic Oversized Cotton Graphic T-Shirt",
    category: "Casual",
    description: "Ultra-comfortable 100% heavyweight cotton oversized t-shirt designed for everyday streetwear and casual lounging.",
    price: 18500,
    compareAtPrice: 22000,
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["casual", "streetwear", "t-shirt", "cotton", "summer"],
    isFeatured: true,
  },
  {
    title: "Relaxed Fit Denim Jeans",
    category: "Casual",
    description: "Premium washed indigo denim with a relaxed straight-leg cut, offering timeless style and durable all-day comfort.",
    price: 34000,
    compareAtPrice: 40000,
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["casual", "denim", "jeans", "streetwear", "pants"],
  },
  {
    title: "Minimalist Fleece Pullover Hoodie",
    category: "Casual",
    description: "Cozy brushed fleece hoodie with ribbed cuffs and hem, featuring a kangaroo pocket and clean, modern silhouette.",
    price: 28000,
    compareAtPrice: 32500,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["casual", "hoodie", "fleece", "outerwear", "winter"],
  },

  // Formal
  {
    title: "Tailored Slim-Fit Charcoal Blazer",
    category: "Formal",
    description: "Impeccably tailored two-button blazer crafted from a breathable wool blend with notch lapels and structured shoulders.",
    price: 75000,
    compareAtPrice: 90000,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["formal", "blazer", "suit", "business", "office"],
    isFeatured: true,
  },
  {
    title: "Crisp Oxford Cotton Dress Shirt",
    category: "Formal",
    description: "Sharp button-down Oxford dress shirt with a spread collar and wrinkle-resistant finish, suitable for boardroom and formal events.",
    price: 24500,
    compareAtPrice: 29000,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["formal", "shirt", "oxford", "business", "smart"],
  },
  {
    title: "Pleated High-Waisted Trousers",
    category: "Formal",
    description: "Contemporary tailored trousers with double front pleats and tapered ankles for a refined corporate wardrobe.",
    price: 38000,
    compareAtPrice: 45000,
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["formal", "trousers", "pants", "tailored", "elegance"],
  },

  // Party
  {
    title: "Emerald Satin Cocktail Slip Dress",
    category: "Party",
    description: "Sleek bias-cut satin midi dress with cowl neckline and adjustable straps, perfect for evening parties and galas.",
    price: 46000,
    compareAtPrice: 55000,
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["party", "dress", "satin", "evening", "glamour"],
    isFeatured: true,
  },
  {
    title: "Metallic Sequin Bomber Jacket",
    category: "Party",
    description: "Statement party outerwear covered in micro sequins that catch the club lights, complete with soft interior lining.",
    price: 52000,
    compareAtPrice: 65000,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["party", "jacket", "sequin", "nightlife", "trendy"],
  },

  // Gym
  {
    title: "Seamless High-Performance Workout Leggings",
    category: "Gym",
    description: "Squat-proof, high-waisted compressive leggings with moisture-wicking technology and side slip phone pockets.",
    price: 22000,
    compareAtPrice: 26000,
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["gym", "fitness", "activewear", "leggings", "workout"],
    isFeatured: true,
  },
  {
    title: "Dry-Fit Breathable Training Athletic Tee",
    category: "Gym",
    description: "Lightweight quick-drying athletic shirt designed to keep you cool and dry through intense gym workouts and runs.",
    price: 16500,
    compareAtPrice: 19500,
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&w=800&q=80",
    ],
    tags: ["gym", "workout", "activewear", "running", "dry-fit"],
  },
];

const categoryData: Record<string, { image: string; description: string }> = {
  Casual: {
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
    description: "Everyday relaxed clothing and streetwear essentials.",
  },
  Formal: {
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80",
    description: "Tailored blazers, dress shirts, and elegant corporate attire.",
  },
  Party: {
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80",
    description: "Glittering evening dresses, cocktail wear, and nightlife outfits.",
  },
  Gym: {
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?auto=format&fit=crop&w=800&q=80",
    description: "High-performance sportswear, activewear, and athletic essentials.",
  },
};

async function run(): Promise<void> {
  await connectDatabase();

  const storeSlug = "test-store";
  const store = await Store.findOne({ slug: storeSlug });

  if (!store) {
    console.error(`[${APP_NAME}] Store with slug "${storeSlug}" not found in database!`);
    await disconnectDatabase();
    process.exit(1);
  }

  console.log(`[${APP_NAME}] Found store "${store.name}" (ID: ${store._id}, Seller: ${store.sellerId})`);

  // 1. Ensure categories exist
  const uniqueCategories = Array.from(new Set(sampleProducts.map((p) => p.category)));
  for (let i = 0; i < uniqueCategories.length; i++) {
    const catName = uniqueCategories[i];
    const catSlug = slugify(catName);
    const meta = categoryData[catName] || { image: "", description: "" };

    await StoreCategory.findOneAndUpdate(
      { storeId: store._id, slug: catSlug },
      {
        storeId: store._id,
        name: catName,
        slug: catSlug,
        image: meta.image,
        description: meta.description,
        order: i,
        isActive: true,
      },
      { upsert: true, new: true },
    );
    console.log(`[${APP_NAME}] Ensured category "${catName}"`);
  }

  // 2. Add products
  let createdCount = 0;
  for (const item of sampleProducts) {
    const slug = await uniqueSlug(item.title, async (s) =>
      Boolean(await Product.exists({ storeId: store._id, slug: s })),
    );

    const product = await Product.create({
      storeId: store._id,
      sellerId: store.sellerId,
      title: item.title,
      slug,
      description: item.description,
      category: item.category,
      price: item.price,
      compareAtPrice: item.compareAtPrice ?? null,
      sku: `SKU-${slugify(item.category).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
      stock: item.stock,
      images: item.images,
      hasVariants: false,
      variants: [],
      variantCombinations: [],
      status: "active",
      isFeatured: Boolean(item.isFeatured),
      tags: item.tags,
      shippingFee: 1500,
      estimatedDeliveryDays: "2-4 business days",
    });

    createdCount++;
    console.log(`[${APP_NAME}] Added product (${createdCount}/${sampleProducts.length}): "${product.title}" [${product.category}] - Price: ${product.price}`);
  }

  // 3. Refresh store category counts
  await refreshCategoryCounts(String(store._id));
  console.log(`[${APP_NAME}] Refreshed category product counts`);

  console.log(`\n Successfully added ${createdCount} fashion products across ${uniqueCategories.length} categories to "${store.name}"!`);
  await disconnectDatabase();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
