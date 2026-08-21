# Hustlr Frontend Rules & Standards

## 1. Framework & Styling
* **Next.js 16 (App Router)** with **React 19** and **Tailwind CSS v4**.
* Use `'use client'` explicitly on interactive components (modals, dropdowns, hooks). Keep layout and static content as Server Components where appropriate.
* Use Tailwind CSS v4 utility classes and avoid ad-hoc inline styles. Follow existing theme colors (`primary`, `primary-hover`, `primary-light`, `dark`, `text`).

## 2. Component Organization (`frontend/src/`)
* `src/app/`: Next.js pages and layouts (`layout.tsx`, `page.tsx`, `globals.css`).
* `src/components/`: Modular, single-responsibility UI components (`Navbar.tsx`, `Hero.tsx`, `StartStoreModal.tsx`, etc.).
* `src/constants/`: Centralized constants (`app.constants.ts`), navigation links, logos, pricing plans, and FAQs.
* `public/`: Static assets (images, svgs, icons). Always use Next.js `<Image />` component with `width`/`height` or `fill`.

## 3. Mobile Responsiveness & Polish
* Ensure all components work across all screen sizes (mobile `< 640px`, tablet `640px - 1024px`, desktop `> 1024px`).
* Test navigation drawers, sticky headers, modals, and CTA button visibility across breakpoints.
* Always check for console errors or Hydration warnings when updating frontend code.
