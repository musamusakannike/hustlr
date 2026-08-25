"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  Check,
  Code2,
  Copy,
  FileCode,
  Layers,
  Layout,
  ShieldCheck,
  Terminal,
} from "lucide-react";

export default function TemplateImportGuidePage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sampleHero = `<section class="py-20 px-6 text-center text-white rounded-3xl my-6 relative overflow-hidden" style="background-image: url('{{backgroundImage}}'); background-size: cover; background-position: center;">
  <div class="absolute inset-0 bg-black/50 backdrop-blur-2xs"></div>
  <div class="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
    <span class="text-xs uppercase font-bold tracking-widest px-3 py-1 rounded-full mb-4" style="background-color: var(--store-accent); color: var(--store-primary);">
      {{badge}}
    </span>
    <h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4">{{heading}}</h1>
    <p class="text-sm sm:text-base opacity-90 mb-8 max-w-xl leading-relaxed">{{subheading}}</p>
    <a href="{{ctaLink}}" class="px-8 py-3.5 rounded-full font-bold text-sm text-white shadow-lg transition-transform hover:scale-105" style="background-color: var(--store-primary);">
      {{ctaText}}
    </a>
  </div>
</section>`;

  const sampleProductsLoop = `<section class="py-12">
  <div class="flex items-center justify-between mb-8 pb-4 border-b" style="borderColor: color-mix(in srgb, var(--store-text) 10%, transparent)">
    <div>
      <h2 class="text-2xl font-bold">{{heading}}</h2>
      <p class="text-xs opacity-70 mt-1">{{subheading}}</p>
    </div>
    <a href="/products" class="text-xs font-bold hover:underline" style="color: var(--store-primary)">View All Collections &rarr;</a>
  </div>

  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
    {{#each products source="featured" limit="8"}}
      <article class="p-3 rounded-2xl border flex flex-col group transition-all hover:shadow-md" style="background-color: var(--store-bg); borderColor: color-mix(in srgb, var(--store-text) 10%, transparent)">
        <a href="{{url}}" class="relative aspect-[4/5] rounded-xl overflow-hidden bg-neutral-100 mb-3 block">
          <img src="{{image}}" alt="{{title}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </a>
        <span class="text-[10px] uppercase tracking-wider opacity-60 mb-1 font-semibold">{{category}}</span>
        <a href="{{url}}" class="text-xs font-bold line-clamp-2 hover:underline mb-2">{{title}}</a>
        <div class="mt-auto pt-1 flex items-baseline justify-between">
          <span class="text-sm font-extrabold" style="color: var(--store-primary)">{{price}}</span>
        </div>
      </article>
    {{/each}}
  </div>
</section>`;

  const sampleLookbook = `<section class="py-12">
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="relative aspect-[3/4] rounded-3xl overflow-hidden group shadow-md">
      <img src="{{tile1Image}}" alt="{{tile1Title}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-white">
        <h3 class="text-xl font-bold mb-1">{{tile1Title}}</h3>
        <p class="text-xs opacity-80 mb-3">{{tile1Subtitle}}</p>
        <a href="{{tile1Link}}" class="text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 hover:underline" style="color: var(--store-accent)">
          Explore &rarr;
        </a>
      </div>
    </div>

    <div class="relative aspect-[3/4] rounded-3xl overflow-hidden group shadow-md">
      <img src="{{tile2Image}}" alt="{{tile2Title}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-white">
        <h3 class="text-xl font-bold mb-1">{{tile2Title}}</h3>
        <p class="text-xs opacity-80 mb-3">{{tile2Subtitle}}</p>
        <a href="{{tile2Link}}" class="text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 hover:underline" style="color: var(--store-accent)">
          Explore &rarr;
        </a>
      </div>
    </div>

    <div class="relative aspect-[3/4] rounded-3xl overflow-hidden group shadow-md">
      <img src="{{tile3Image}}" alt="{{tile3Title}}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-6 flex flex-col justify-end text-white">
        <h3 class="text-xl font-bold mb-1">{{tile3Title}}</h3>
        <p class="text-xs opacity-80 mb-3">{{tile3Subtitle}}</p>
        <a href="{{tile3Link}}" class="text-xs font-bold uppercase tracking-wider inline-flex items-center gap-1 hover:underline" style="color: var(--store-accent)">
          Explore &rarr;
        </a>
      </div>
    </div>
  </div>
</section>`;

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto pb-16">
      {/* Header with Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/templates"
            className="p-2 rounded-xl border border-border hover:bg-neutral-100 text-neutral-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
              Storefront Section Import Guide
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Technical specification for authoring reusable HTML sections with token bindings.
            </p>
          </div>
        </div>

        {/* Subnav links */}
        <div className="flex items-center gap-2 text-xs font-bold">
          <Link
            href="/dashboard/templates"
            className="px-3.5 py-2 rounded-xl border border-border text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Templates Catalogue
          </Link>
          <Link
            href="/dashboard/templates/sections"
            className="px-3.5 py-2 rounded-xl border border-border text-neutral-600 hover:bg-neutral-50 transition-colors"
          >
            Section Library
          </Link>
          <span className="px-3.5 py-2 rounded-xl bg-neutral-900 text-white shadow-xs">
            Import Guide
          </span>
        </div>
      </div>

      {/* Guide Cards */}
      <div className="flex flex-col gap-8 text-sm">
        {/* Section 1: Overview */}
        <div className="p-6 rounded-3xl border border-border bg-white shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Layout className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-neutral-900">1. Architecture Overview</h2>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Hustlr storefronts use a hybrid component architecture. Core commerce views (navigation chrome, cart, checkout, filter logic, and PDP actions) are rendered natively in React to preserve escrow safety and responsiveness. Reusable landing blocks can be created either as native React components or imported HTML sections with dynamic schema bindings.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
              <p className="font-bold text-xs text-neutral-900">Section-Sized Blocks</p>
              <p className="text-[11px] text-neutral-500 mt-1">
                HTML sections represent isolated homepage blocks, not complete HTML documents. No &lt;html&gt;, &lt;head&gt;, or &lt;body&gt; tags.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
              <p className="font-bold text-xs text-neutral-900">Scoped CSS Execution</p>
              <p className="text-[11px] text-neutral-500 mt-1">
                All custom CSS rules are scoped automatically to a unique wrapper class (.hustlr-html-sec-&#123;key&#125;) to prevent style leaks.
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200">
              <p className="font-bold text-xs text-neutral-900">Semantic Theme Tokens</p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Use CSS variables like var(--store-primary) to inherit merchant palette customizations automatically.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Tokens */}
        <div className="p-6 rounded-3xl border border-border bg-white shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Code2 className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-neutral-900">2. Token Syntax & Variables</h2>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Use double curly braces <code className="font-mono text-primary font-bold">&#123;&#123;fieldName&#125;&#125;</code> to bind editable fields. The admin studio automatically detects these tokens and generates the merchant customizer form.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-border rounded-xl overflow-hidden">
              <thead className="bg-neutral-100 text-neutral-700 font-bold border-b border-border">
                <tr>
                  <th className="p-3">Token</th>
                  <th className="p-3">Field Type</th>
                  <th className="p-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="p-3 font-mono text-primary font-bold">&#123;&#123;heading&#125;&#125;</td>
                  <td className="p-3">text</td>
                  <td className="p-3 text-neutral-600">Main section title or badge label</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-primary font-bold">&#123;&#123;subheading&#125;&#125;</td>
                  <td className="p-3">textarea</td>
                  <td className="p-3 text-neutral-600">Multi-line description or supporting copy</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-primary font-bold">&#123;&#123;backgroundImage&#125;&#125;</td>
                  <td className="p-3">image</td>
                  <td className="p-3 text-neutral-600">Image URL uploadable in seller customizer</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-primary font-bold">&#123;&#123;ctaText&#125;&#125; / &#123;&#123;ctaLink&#125;&#125;</td>
                  <td className="p-3">text / url</td>
                  <td className="p-3 text-neutral-600">Call-to-action button label and URL path</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-primary font-bold">&#123;&#123;store.name&#125;&#125;</td>
                  <td className="p-3">global (auto)</td>
                  <td className="p-3 text-neutral-600">Current store name from merchant profile</td>
                </tr>
                <tr>
                  <td className="p-3 font-mono text-primary font-bold">&#123;&#123;store.logo&#125;&#125;</td>
                  <td className="p-3">global (auto)</td>
                  <td className="p-3 text-neutral-600">Merchant brand logo URL</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Loops */}
        <div className="p-6 rounded-3xl border border-border bg-white shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-neutral-900">3. Live Products & Collections Loops</h2>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Render dynamic store inventory using loop blocks. Specify the data source and item limits as attributes.
          </p>

          <div className="p-4 rounded-2xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto relative">
            <button
              type="button"
              onClick={() => copyToClipboard(sampleProductsLoop, "products")}
              className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-[11px] font-sans font-bold text-white flex items-center gap-1"
            >
              {copiedKey === "products" ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedKey === "products" ? "Copied" : "Copy"}
            </button>
            <pre className="text-xs">{sampleProductsLoop}</pre>
          </div>
        </div>

        {/* Section 4: Security & Sanitization */}
        <div className="p-6 rounded-3xl border border-border bg-white shadow-xs flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-neutral-900">4. Security & Sanitization Rules</h2>
          </div>
          <p className="text-xs text-neutral-600 leading-relaxed">
            All HTML and CSS strings are sanitized through a strict server filter before persistence and live compilation:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-600 ml-2">
            <li><strong>Disallowed Tags:</strong> &lt;script&gt;, &lt;iframe&gt;, &lt;object&gt;, &lt;embed&gt;, &lt;form&gt;, &lt;style&gt;, &lt;link&gt;, &lt;meta&gt;.</li>
            <li><strong>Disallowed Attributes:</strong> Inline event listeners (onload, onclick, onerror, onmouseover, etc.).</li>
            <li><strong>URL Protocols:</strong> Only safe protocols (http:, https:, mailto:, tel:) and relative paths are allowed. javascript: URLs are stripped.</li>
            <li><strong>CSS Policies:</strong> @import, expression(), and external url() font injections are forbidden. Use Tailwind or system fonts.</li>
          </ul>
        </div>

        {/* Section 5: Example Snippets */}
        <div className="p-6 rounded-3xl border border-border bg-white shadow-xs flex flex-col gap-6">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-base font-bold text-neutral-900">5. Ready-to-Use Remixed Examples</h2>
          </div>

          {/* Example 1 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-800">Hero Banner with Background Overlay</span>
              <button
                type="button"
                onClick={() => copyToClipboard(sampleHero, "hero")}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                {copiedKey === "hero" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copiedKey === "hero" ? "Copied" : "Copy Code"}
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto">
              <pre className="text-xs">{sampleHero}</pre>
            </div>
          </div>

          {/* Example 2 */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-neutral-800">3-Tile Editorial Lookbook Mosaic</span>
              <button
                type="button"
                onClick={() => copyToClipboard(sampleLookbook, "lookbook")}
                className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
              >
                {copiedKey === "lookbook" ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                {copiedKey === "lookbook" ? "Copied" : "Copy Code"}
              </button>
            </div>
            <div className="p-4 rounded-2xl bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto">
              <pre className="text-xs">{sampleLookbook}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
