import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const clashGrotesk = localFont({
  src: "../../public/assets/fonts/ClashGrotesk-Variable.ttf",
  variable: "--font-clash-grotesk",
  display: "swap",
});

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
    <html lang="en" className={clashGrotesk.variable}>
      <body className={`${clashGrotesk.className} antialiased`}>{children}</body>
    </html>
  );
}

