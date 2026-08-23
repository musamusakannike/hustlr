import Hero from "@/components/Hero";
import Marquee from "@/components/Marquee";
import Features from "@/components/Features";
import Ecosystem from "@/components/Ecosystem";
import WhoWeAre from "@/components/WhoWeAre";
import WhatWeDo from "@/components/WhatWeDo";
import StoreTemplates from "@/components/StoreTemplates";
import Pricing from "@/components/Pricing";
import FAQ from "@/components/FAQ";
import CTA from "@/components/CTA";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col bg-bg-soft">
      <Hero />
      <Marquee />
      <Features />
      <Ecosystem />
      <WhoWeAre />
      <WhatWeDo />
      <StoreTemplates />
      <Pricing />
      <FAQ />
      <CTA />
    </div>
  );
}
