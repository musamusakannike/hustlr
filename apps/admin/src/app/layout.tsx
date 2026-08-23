import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hustlr Admin | Platform Operations Console",
  description: "Platform administration and operations console for Hustlr e-commerce.",
  icons: {
    icon: "/nav-icon.webp",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">{children}</body>
    </html>
  );
}
