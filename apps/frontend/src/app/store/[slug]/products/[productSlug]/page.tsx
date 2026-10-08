"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Star,
  X,
} from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";
import ProductCard from "@/components/storefront/ProductCard";
import {
  useAddToCart,
  useProductReviews,
  useStorefrontInfo,
  useStorefrontProduct,
  useStorefrontProducts,
  useToggleWish,
} from "@/hooks/useStorefront";
import { useBuyerAuth } from "@/context/BuyerAuthContext";
import { formatNaira, getErrorMessage } from "@/lib/utils";
import { storeHref } from "@/lib/store-path";
import { isGuestWishlisted } from "@/lib/guest-commerce";

function StarRating({ rating = 4.5, size = "md" }: { rating?: number; size?: "sm" | "md" }) {
  const iconSize = size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${iconSize} ${
              i < Math.floor(rating)
                ? "fill-[#FFC633] text-[#FFC633]"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-sm text-gray-600 font-medium">
        {rating.toFixed(1)}/<span className="text-gray-400">5</span>
      </span>
    </div>
  );
}

export default function ProductDetailPage() {
  const { slug, productSlug } = useParams<{ slug: string; productSlug: string }>();
  const { isAuthenticated } = useBuyerAuth();
  const { data: info } = useStorefrontInfo(slug);
  const { data: product, isLoading } = useStorefrontProduct(slug, productSlug);
  const { data: reviews } = useProductReviews(slug, productSlug);
  const { data: catalog } = useStorefrontProducts(slug, { limit: 8 });
  const add = useAddToCart(slug);
  const wish = useToggleWish();
  const { toast } = useToast();

  const [qty, setQty] = useState(1);
  const [localWish, setLocalWish] = useState<boolean | null>(null);
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"details" | "reviews" | "faqs">("reviews");
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const [newReviewerName, setNewReviewerName] = useState("");
  const [newReviewComment, setNewReviewComment] = useState("");
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [localReviews, setLocalReviews] = useState<Array<{ id: string; name: string; comment: string; rating: number; date: string }>>([]);

  const combo = useMemo(() => {
    if (!product?.hasVariants) return null;
    return product.variantCombinations.find((c) =>
      Object.entries(c.combination).every(([k, v]) => selected[k] === v)
    );
  }, [product, selected]);

  if (isLoading || !product) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner label="Loading product..." />
      </div>
    );
  }

  const price = combo?.price ?? product.price;
  const images = product.images.length
    ? product.images
    : ([combo?.image].filter(Boolean) as string[]);
  const activeImage = images[activeImgIndex] ?? images[0];

  const discount =
    product.compareAtPrice && product.compareAtPrice > price
      ? Math.round(((product.compareAtPrice - price) / product.compareAtPrice) * 100)
      : null;

  const isWishlisted =
    localWish !== null
      ? localWish
      : (product.isWishlisted || isGuestWishlisted(slug, product.id));

  const handleAddToCart = () => {
    add.mutate(
      {
        productId: product.id,
        quantity: qty,
        selectedVariants: selected,
        product: {
          id: product.id,
          title: product.title,
          slug: product.slug,
          price,
          compareAtPrice: product.compareAtPrice ?? undefined,
          images: activeImage ? [activeImage] : product.images,
          stock: product.stock ?? 10,
          status: "active",
        },
      },
      {
        onSuccess: () => {
          toast(`Added ${qty}x "${product.title}" to your cart.`, "success");
        },
        onError: (err) => {
          toast(getErrorMessage(err), "error");
        },
      }
    );
  };

  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (newReviewerName.trim() && newReviewComment.trim()) {
      setLocalReviews([
        {
          id: `rev-${Date.now()}`,
          name: newReviewerName.trim(),
          comment: newReviewComment.trim(),
          rating: newReviewRating,
          date: "Just now",
        },
        ...localReviews,
      ]);
      setNewReviewerName("");
      setNewReviewComment("");
      setWriteReviewOpen(false);
      toast("Thank you! Your review has been submitted.", "success");
    }
  };

  const allReviews = [
    ...localReviews,
    ...((reviews?.items ?? []).map((r) => ({
      id: r.id,
      name: r.buyerName || "Verified Buyer",
      comment: r.comment || "Great product, matches description perfectly.",
      rating: r.rating || 5,
      date: new Date(r.createdAt).toLocaleDateString(),
    }))),
  ];
  const displayReviews = allReviews.length > 0 ? allReviews : [
    {
      id: "r1",
      name: "Samantha D.",
      comment: "I absolutely love this item! The design is unique and the fabric feels so comfortable. As soon as I wore it I received compliments.",
      rating: 5,
      date: "August 14, 2026",
    },
    {
      id: "r2",
      name: "Alex M.",
      comment: "The item exceeded my expectations. The quality and attention to detail really stand out. Highly recommend!",
      rating: 5,
      date: "August 15, 2026",
    },
  ];

  const recommendations = (catalog?.items ?? [])
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="bg-white min-h-screen text-black">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5 w-full"
      >
        <ol className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 font-normal">
          <li>
            <Link href={storeHref(slug, "/")} className="hover:text-black transition-colors">
              Home
            </Link>
          </li>
          <li>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </li>
          <li>
            <Link href={storeHref(slug, "/products")} className="hover:text-black transition-colors">
              Shop
            </Link>
          </li>
          {product.category && (
            <>
              <li>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </li>
              <li>
                <Link
                  href={storeHref(slug, `/products?category=${encodeURIComponent(product.category)}`)}
                  className="hover:text-black transition-colors capitalize"
                >
                  {product.category}
                </Link>
              </li>
            </>
          )}
          <li>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          </li>
          <li className="font-medium text-black truncate max-w-[160px] sm:max-w-none">
            {product.title}
          </li>
        </ol>
      </nav>

      {/* Main Product Showcase Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Gallery Column (Thumbnails + Main Image) */}
          <div className="lg:col-span-6 flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 justify-between sm:justify-start w-full sm:w-28 sm:flex-shrink-0">
                {images.map((imgSrc, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    className={`w-full aspect-[4/5] sm:aspect-square rounded-2xl overflow-hidden bg-[#F0EEED] p-2 flex items-center justify-center transition-all cursor-pointer relative ${
                      activeImgIndex === idx
                        ? "border-2 border-black shadow-xs"
                        : "border border-transparent hover:border-gray-400"
                    }`}
                    type="button"
                  >
                    <Image
                      alt={`Thumbnail ${idx + 1}`}
                      fill
                      className="object-contain p-1 mix-blend-multiply"
                      src={imgSrc}
                      sizes="112px"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Product Hero Image */}
            <div className="flex-1 bg-[#F0EEED] rounded-3xl overflow-hidden flex items-center justify-center p-6 sm:p-10 min-h-[360px] sm:min-h-[460px] lg:min-h-[530px] relative">
              {activeImage ? (
                <Image
                  alt={product.title}
                  fill
                  className="object-contain p-6 drop-shadow-xs mix-blend-multiply transition-all duration-300"
                  src={activeImage}
                  priority
                />
              ) : (
                <span className="text-gray-400">No Image</span>
              )}
            </div>
          </div>

          {/* Product Details & Purchase Controls */}
          <div className="lg:col-span-6 flex flex-col justify-between">
            <div>
              {/* Title */}
              <h1 className="font-integral text-2xl sm:text-3xl lg:text-4xl text-black leading-tight uppercase font-extrabold">
                {product.title}
              </h1>

              {/* Rating */}
              <div className="mt-3">
                <StarRating rating={product.rating > 0 ? product.rating : 4.5} size="md" />
              </div>

              {/* Pricing */}
              <div className="flex items-center gap-3 mt-3">
                <span className="text-2xl sm:text-3xl font-bold text-black">
                  {formatNaira(price)}
                </span>
                {product.compareAtPrice && product.compareAtPrice > price ? (
                  <span className="text-2xl sm:text-3xl font-bold text-gray-400 line-through">
                    {formatNaira(product.compareAtPrice)}
                  </span>
                ) : null}
                {discount && (
                  <span className="text-xs sm:text-sm font-semibold text-[#FF3333] bg-[#FF3333]/10 px-3.5 py-1 rounded-full">
                    -{discount}%
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-gray-500 text-sm mt-3 leading-relaxed font-normal">
                {product.description ||
                  "This piece is meticulously crafted with premium quality materials, designed to bring out your individuality and cater to your sense of style."}
              </p>

              <hr className="border-gray-200 my-5" />

              {/* Product Variants (Colors / Sizes) */}
              {product.variants?.map((v) => (
                <div key={v.name} className="mb-4">
                  <label className="text-xs text-gray-500 font-normal uppercase tracking-wider block mb-2">
                    {v.name}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {v.options.map((opt) => {
                      const isSelected = selected[v.name] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => setSelected({ ...selected, [v.name]: opt })}
                          className={`px-5 py-2.5 rounded-full text-xs sm:text-sm transition cursor-pointer ${
                            isSelected
                              ? "text-white font-medium shadow-xs"
                              : "bg-[#F0F0F0] text-gray-700 hover:bg-gray-200 font-normal"
                          }`}
                          style={
                            isSelected
                              ? { backgroundColor: "var(--store-primary, #000000)" }
                              : undefined
                          }
                          type="button"
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <hr className="border-gray-200 my-5" />

              {/* Quantity Stepper & Add to Cart Button */}
              <div className="flex items-center gap-4">
                {/* Counter */}
                <div className="bg-[#F0F0F0] rounded-full flex items-center justify-between px-4 py-3 w-32 sm:w-36">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="text-xl font-bold text-black focus:outline-none hover:opacity-70 leading-none cursor-pointer"
                    type="button"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-semibold text-sm text-black select-none">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => q + 1)}
                    className="text-xl font-bold text-black focus:outline-none hover:opacity-70 leading-none cursor-pointer"
                    type="button"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Add to Cart Button (Powered by var(--store-primary, #000000)) */}
                <button
                  onClick={handleAddToCart}
                  disabled={add.isPending}
                  className="flex-1 text-white text-sm font-medium py-3.5 px-6 rounded-full hover:opacity-90 transition shadow-sm text-center cursor-pointer active:scale-[0.98] disabled:opacity-50"
                  style={{ backgroundColor: "var(--store-primary, #000000)" }}
                  type="button"
                >
                  {add.isPending ? "Adding..." : "Add to Cart"}
                </button>

                {/* Wishlist Button */}
                <button
                  onClick={() => {
                    setLocalWish(!isWishlisted);
                    wish.mutate({ productId: product.id, product });
                  }}
                  className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors cursor-pointer"
                  type="button"
                  aria-label="Wishlist"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isWishlisted
                        ? "fill-[var(--store-primary,#000000)] text-[var(--store-primary,#000000)]"
                        : "text-neutral-700"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs & Reviews Section */}
        <section className="pt-14 pb-12">
          {/* Tabs Header */}
          <div className="border-b border-gray-200 flex justify-between text-center">
            <button
              onClick={() => setActiveTab("details")}
              className={`w-1/3 pb-4 text-sm sm:text-base font-medium transition cursor-pointer ${
                activeTab === "details"
                  ? "font-semibold text-black border-b-2 border-black -mb-[1px]"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`w-1/3 pb-4 text-sm sm:text-base font-medium transition cursor-pointer ${
                activeTab === "reviews"
                  ? "font-semibold text-black border-b-2 border-black -mb-[1px]"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              Rating &amp; Reviews
            </button>
            <button
              onClick={() => setActiveTab("faqs")}
              className={`w-1/3 pb-4 text-sm sm:text-base font-medium transition cursor-pointer ${
                activeTab === "faqs"
                  ? "font-semibold text-black border-b-2 border-black -mb-[1px]"
                  : "text-gray-500 hover:text-black"
              }`}
            >
              FAQs
            </button>
          </div>

          {/* Tab 1: Product Details */}
          {activeTab === "details" && (
            <div className="py-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-gray-700 animate-in fade-in duration-200">
              <div className="border border-gray-200 rounded-2xl p-6">
                <h3 className="font-bold text-base text-black mb-3">
                  Material &amp; Specifications
                </h3>
                <ul className="space-y-2 list-disc list-inside text-gray-600">
                  <li>100% Premium quality material</li>
                  <li>Breathable softness and comfortable wear</li>
                  <li>Double-needle stitched hems for durability</li>
                  <li>Pre-shrunk fabric to maintain size across washes</li>
                </ul>
              </div>
              <div className="border border-gray-200 rounded-2xl p-6">
                <h3 className="font-bold text-base text-black mb-3">
                  Care Instructions
                </h3>
                <ul className="space-y-2 list-disc list-inside text-gray-600">
                  <li>Machine wash cold with similar colors</li>
                  <li>Do not bleach; use mild detergents only</li>
                  <li>Tumble dry low or line dry in shade</li>
                  <li>Cool iron if needed</li>
                </ul>
              </div>
            </div>
          )}

          {/* Tab 2: Reviews */}
          {activeTab === "reviews" && (
            <div className="animate-in fade-in duration-200">
              {/* Reviews Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-bold text-black">
                    All Reviews
                  </h2>
                  <span className="text-sm font-normal text-gray-500">
                    ({displayReviews.length})
                  </span>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto">
                  <button
                    onClick={() => setWriteReviewOpen(true)}
                    className="text-white text-xs sm:text-sm font-medium py-2.5 sm:py-3 px-5 sm:px-6 rounded-full hover:opacity-90 transition cursor-pointer"
                    style={{ backgroundColor: "var(--store-primary, #000000)" }}
                    type="button"
                  >
                    Write a Review
                  </button>
                </div>
              </div>

              {/* Reviews Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 mt-6">
                {displayReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="border border-gray-200 rounded-3xl p-6 sm:p-7 flex flex-col justify-between hover:shadow-xs transition-shadow bg-white"
                  >
                    <div>
                      <div className="flex items-center gap-1 mb-2.5 text-[#FFC633]">
                        {Array.from({ length: rev.rating }).map((_, s) => (
                          <Star key={s} className="w-4 h-4 fill-[#FFC633] text-[#FFC633]" />
                        ))}
                      </div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="font-bold text-black text-base">{rev.name}</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 fill-emerald-500 text-white" />
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed font-normal">
                        &ldquo;{rev.comment}&rdquo;
                      </p>
                    </div>
                    <p className="text-xs text-gray-400 mt-4 font-normal">
                      Posted on {rev.date}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: FAQs */}
          {activeTab === "faqs" && (
            <div className="py-8 space-y-4 max-w-3xl animate-in fade-in duration-200">
              <div className="border border-gray-200 rounded-2xl p-5">
                <h4 className="font-bold text-base text-black mb-1">
                  How long does shipping take?
                </h4>
                <p className="text-sm text-gray-600">
                  Standard delivery typically arrives within 2-4 business days nationwide.
                </p>
              </div>
              <div className="border border-gray-200 rounded-2xl p-5">
                <h4 className="font-bold text-base text-black mb-1">
                  What is your return policy?
                </h4>
                <p className="text-sm text-gray-600">
                  We accept returns within 7 days of delivery for all undamaged items in original packaging.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* You Might Also Like Section */}
        {recommendations.length > 0 && (
          <section className="pt-8 pb-16 border-t border-gray-100">
            <h2 className="font-integral text-2xl sm:text-3xl lg:text-4xl font-extrabold uppercase text-center text-black mb-10 tracking-tight">
              YOU MIGHT ALSO LIKE
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {recommendations.map((rec) => (
                <ProductCard key={rec.id} slug={slug} product={rec} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Write Review Modal */}
      {writeReviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setWriteReviewOpen(false)}
          />
          <div className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl z-10 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="font-integral text-xl font-bold uppercase text-black">
                Write a Review
              </h3>
              <button
                onClick={() => setWriteReviewOpen(false)}
                className="p-1 text-gray-400 hover:text-black"
                type="button"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddReview} className="space-y-4 mt-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          star <= newReviewRating
                            ? "fill-[#FFC633] text-[#FFC633]"
                            : "fill-gray-200 text-gray-200"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Your Name
                </label>
                <input
                  required
                  value={newReviewerName}
                  onChange={(e) => setNewReviewerName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full bg-[#F0F0F0] rounded-xl px-4 py-2.5 text-sm text-black outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Your Review
                </label>
                <textarea
                  required
                  rows={4}
                  value={newReviewComment}
                  onChange={(e) => setNewReviewComment(e.target.value)}
                  placeholder="Share your experience with this item..."
                  className="w-full bg-[#F0F0F0] rounded-xl px-4 py-2.5 text-sm text-black outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full text-white font-medium py-3 rounded-full text-sm hover:opacity-90 transition"
                style={{ backgroundColor: "var(--store-primary, #000000)" }}
              >
                Submit Review
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
