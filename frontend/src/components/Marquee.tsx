import React from "react";
import { MARQUEE_ITEMS } from "@/constants/app.constants";

export default function Marquee() {
  return (
    <div className="bg-white w-full py-10 px-8 hidden lg:flex gap-8 justify-between border-y border-neutral-200/60 overflow-hidden">
      {MARQUEE_ITEMS.map((item, i) => (
        <span key={i} className="flex items-center justify-center gap-2.5 shrink-0">
          <span className="text-[#800A1D] text-lg font-bold">✦</span>
          <span className="text-[#666666] text-sm font-archivo tracking-wider uppercase font-semibold">
            {item}
          </span>
        </span>
      ))}
    </div>
  );
}
