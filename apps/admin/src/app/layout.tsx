import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hustlr Admin",
  description: "Platform administration dashboard for Hustlr.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
