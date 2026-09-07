import React from "react";
import Image from "next/image";

interface FeatureItem {
  id: string;
  image: string;
  title: string;
  description: string;
}

const FEATURES: FeatureItem[] = [
  {
    id: "modern-layouts",
    image: "/landing/feature1.png",
    title: "Launch in 5 Minutes",
    description:
      "Create your business page and start accepting orders within 5 minutes. It's that simple.",
  },
  {
    id: "tailwind-css",
    image: "/landing/feature2.png",
    title: "Get Paid The Naija Way",
    description:
      "Accept instant online payments via Card, Paystack, Flutterwave, or direct Bank Transfer. No stress.",
  },
  {
    id: "fully-responsive",
    image: "/landing/feature3.png",
    title: "From Order to Doorstep",
    description:
      "Track your orders from click to delivery with real-time updates. Know where your package is every step of the way.",
  },
];

export default function Features() {
  return (
    <section
      aria-label="Features"
      className="w-full bg-bg py-16 sm:py-20 lg:py-24"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12 lg:gap-16">
          {FEATURES.map((feature) => (
            <div key={feature.id} className="flex flex-col items-start">
              <div className="relative w-10 h-10 shrink-0">
                <Image
                  src={feature.image}
                  alt=""
                  width={40}
                  height={40}
                  className="w-10 h-10 object-contain"
                  priority
                />
              </div>

              <h3 className="mt-8 text-lg sm:text-[20px] font-bold text-dark leading-snug tracking-tight">
                {feature.title}
              </h3>

              <p className="mt-3.5 text-sm sm:text-base text-muted leading-relaxed max-w-[320px]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}