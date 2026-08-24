import type { StorefrontSection } from "@/types/storefront";

export const DEFAULT_STOREFRONT_SECTIONS: StorefrontSection[] = [
  {
    id: "sec_hero",
    type: "hero",
    name: "Hero Banner",
    isEnabled: true,
    order: 0,
    data: {
      badge: "THE CURATED MARKETPLACE FOR VERIFIED ESSENTIALS",
      heading: "Your Marketplace, Connected.",
      subheading:
        "Discover verified merchants, authentic collections, and fast escrow-protected checkout with guaranteed satisfaction.",
      primaryCtaText: "Explore Collections",
      primaryCtaLink: "/products",
      secondaryCtaText: "How It Works",
      secondaryCtaLink: "#how-it-works",
      backgroundImage: "",
      overlayOpacity: 45,
      align: "left",
    },
  },
  {
    id: "sec_stats",
    type: "stats",
    name: "Trust & Stats Bar",
    isEnabled: true,
    order: 1,
    data: {
      items: [
        {
          id: "stat_1",
          icon: "Star",
          value: "4.9+",
          label: "Average Rating",
        },
        {
          id: "stat_2",
          icon: "Users",
          value: "500+",
          label: "Verified Merchants",
        },
        {
          id: "stat_3",
          icon: "PackageCheck",
          value: "15,000+",
          label: "Orders Delivered",
        },
        {
          id: "stat_4",
          icon: "ShieldCheck",
          value: "99.9%",
          label: "Escrow Protected",
        },
      ],
    },
  },
  {
    id: "sec_features",
    type: "features",
    name: "Value Proposition Cards",
    isEnabled: true,
    order: 2,
    data: {
      badge: "CURATED EXPERIENCES",
      heading: "Connecting Discerning Buyers to Top Creators",
      subheading:
        "Every vendor is vetted, every transaction is held safely in escrow, and every order is backed by authentic customer reviews.",
      cards: [
        {
          id: "card_1",
          icon: "ShoppingBag",
          title: "Looking for Top Brands?",
          description:
            "Explore thousands of handpicked goods directly from top-rated, vetted indie makers and trusted brands.",
          buttonText: "Shop Collection",
          buttonLink: "/products",
        },
        {
          id: "card_2",
          icon: "ShieldCheck",
          title: "Verified Quality Guarantee",
          description:
            "Every single item meets stringent authenticity guidelines backed by 100% money-back escrow protection.",
          buttonText: "Our Standards",
          buttonLink: "/terms",
        },
        {
          id: "card_3",
          icon: "Sparkles",
          title: "Looking for Opportunities?",
          description:
            "Enjoy exclusive seasonal deals, flash discounts, and curated bundles backed by fast nationwide delivery.",
          buttonText: "Explore Offers",
          buttonLink: "/products",
        },
      ],
    },
  },
  {
    id: "sec_how_it_works",
    type: "how-it-works",
    name: "How It Works (3 Steps)",
    isEnabled: true,
    order: 3,
    data: {
      badge: "HOW IT WORKS",
      heading: "Book Your Perfect Order in 3 Easy Steps",
      subheading:
        "From discovery to unboxing, experience transparent ordering protected by safe escrow guarantees.",
      ctaText: "Start Shopping Now",
      ctaLink: "/products",
      steps: [
        {
          id: "step_1",
          stepNumber: 1,
          title: "Browse & Discover",
          bullets: [
            "Search verified collections by category, brand, and rating",
            "Inspect real customer reviews, photos, and seller ratings",
            "Filter easily by price, delivery speed, and availability",
          ],
        },
        {
          id: "step_2",
          stepNumber: 2,
          title: "Secure Escrow Checkout",
          bullets: [
            "Pay instantly via secure Paystack with card or bank transfer",
            "Your money is safely locked in platform escrow protection",
            "The seller prepares and dispatches your order with tracking",
          ],
        },
        {
          id: "step_3",
          stepNumber: 3,
          title: "Confirm & Release",
          bullets: [
            "Receive your parcel at your doorstep with verified tracking",
            "Inspect your items to ensure total satisfaction and authenticity",
            "Confirm delivery to safely release funds to the seller",
          ],
        },
      ],
    },
  },
  {
    id: "sec_split_story",
    type: "split-story",
    name: "Editorial Story Showcase",
    isEnabled: true,
    order: 4,
    data: {
      badge: "THE MARKETPLACE PROMISE",
      heading: "Connect Merchants & Buyers Like Never Before",
      narrative:
        "We built a new standard of commerce where buyers discover exceptional quality and merchants thrive with confidence. Enjoy zero-risk shopping with verified escrow, rapid nationwide shipping, and transparent customer ratings.",
      bullets: [
        "100% verified merchant credentials & identity verification",
        "Escrow protection holds payment until you confirm satisfaction",
        "Transparent review system with verified buyer badges",
        "Dedicated 7-day hassle-free return window",
      ],
      ctaText: "Explore Products",
      ctaLink: "/products",
      image: "",
      imagePosition: "right",
    },
  },
  {
    id: "sec_featured",
    type: "featured-products",
    name: "Featured Products Rail",
    isEnabled: true,
    order: 5,
    data: {
      badge: "HANDPICKED SELECTIONS",
      heading: "Featured Products",
      subheading: "Top curated items trending in the store right now.",
      limit: 8,
      viewAllLink: "/products",
    },
  },
  {
    id: "sec_new_arrivals",
    type: "new-arrivals",
    name: "New Arrivals Rail",
    isEnabled: true,
    order: 6,
    data: {
      badge: "JUST DROPPED",
      heading: "New Arrivals",
      subheading: "Fresh drops and latest inventory added this week.",
      limit: 8,
      viewAllLink: "/products",
    },
  },
  {
    id: "sec_best_sellers",
    type: "best-sellers",
    name: "Best Sellers Rail",
    isEnabled: true,
    order: 7,
    data: {
      badge: "CUSTOMER FAVORITES",
      heading: "Best Sellers",
      subheading: "Our most sought-after products loved by customers.",
      limit: 8,
      viewAllLink: "/products",
    },
  },
  {
    id: "sec_testimonials",
    type: "testimonials",
    name: "Customer Reviews",
    isEnabled: true,
    order: 8,
    data: {
      badge: "VERIFIED REVIEWS",
      heading: "Loved by Thousands of Buyers",
      subheading:
        "Real experiences from verified shoppers across Nigeria.",
      items: [
        {
          id: "test_1",
          name: "Amara Okonkwo",
          role: "Verified Buyer",
          comment:
            "The escrow protection gave me total peace of mind. The products arrived in Lagos within 48 hours in pristine condition!",
          rating: 5,
        },
        {
          id: "test_2",
          name: "Tunde Bakare",
          role: "Verified Buyer",
          comment:
            "Superb craftsmanship and very responsive seller communication. I will definitely be ordering again.",
          rating: 5,
        },
        {
          id: "test_3",
          name: "Zainab Mohammed",
          role: "Verified Buyer",
          comment:
            "Smooth checkout, authentic products, and the delivery was tracked right to my doorstep. 10/10 service!",
          rating: 5,
        },
      ],
    },
  },
  {
    id: "sec_cta_banner",
    type: "cta-banner",
    name: "Call to Action Banner",
    isEnabled: true,
    order: 9,
    data: {
      badge: "JOIN TODAY",
      heading: "Join the Marketplace Revolution",
      subheading:
        "Experience seamless shopping with verified sellers and peace-of-mind buyer escrow protection today.",
      buttonText: "Start Shopping Now",
      buttonLink: "/products",
      secondaryButtonText: "Explore Collections",
      secondaryButtonLink: "/products",
    },
  },
  {
    id: "sec_newsletter",
    type: "newsletter",
    name: "Newsletter Subscription",
    isEnabled: true,
    order: 10,
    data: {
      badge: "STAY UPDATED",
      heading: "Get 10% Off Your Next Order",
      subheading:
        "Subscribe to receive exclusive drops, merchant spotlights, and secret flash sales.",
      placeholder: "Enter your email address",
      buttonText: "Subscribe",
    },
  },
];

export const COLOR_PALETTE_PRESETS = [
  {
    id: "terracotta-sunset",
    name: "Terracotta Warmth",
    description: "Warm terracotta tones with rich orange and sand accents (inspired by reference design)",
    scheme: {
      primary: "#E05315",
      secondary: "#1F1610",
      accent: "#FFEDE6",
      background: "#FFFBF9",
      text: "#1F1610",
    },
  },
  {
    id: "burgundy-prestige",
    name: "Burgundy Prestige",
    description: "Deep wine red with delicate rose and crisp white accents",
    scheme: {
      primary: "#800A1D",
      secondary: "#0A0E11",
      accent: "#FAD4D8",
      background: "#FFFFFF",
      text: "#0A0E11",
    },
  },
  {
    id: "noir-minimal",
    name: "Noir Luxe",
    description: "Monochrome high-contrast luxury with gold champagne accents",
    scheme: {
      primary: "#18181B",
      secondary: "#09090B",
      accent: "#D4AF37",
      background: "#FAFAFA",
      text: "#09090B",
    },
  },
  {
    id: "emerald-artisan",
    name: "Emerald Artisan",
    description: "Rich botanical greens and warm linen tones for organic & craft brands",
    scheme: {
      primary: "#0F5132",
      secondary: "#0B291B",
      accent: "#D1E7DD",
      background: "#FBFDFB",
      text: "#0B291B",
    },
  },
  {
    id: "cobalt-modern",
    name: "Cobalt Modern",
    description: "Vibrant royal blue and icy neutrals for gadgets & modern marketplace goods",
    scheme: {
      primary: "#1D4ED8",
      secondary: "#0F172A",
      accent: "#DBEAFE",
      background: "#FFFFFF",
      text: "#0F172A",
    },
  },
];
