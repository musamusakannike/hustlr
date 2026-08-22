import type { Metadata } from "next";
import { Rajdhani, Archivo_Black, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth.context";
import { APP_NAME, APP_SLOGAN, APP_TAGLINE, APP_URL } from "@/constants/app.constants";

const rajdhani = Rajdhani({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
});

const archivoBlack = Archivo_Black({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-archivo-black",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME} | ${APP_SLOGAN}`,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_TAGLINE,
  keywords: [
    "Hustlr e-commerce platform",
    "multi tenant e-commerce",
    "create online store Nigeria",
    "Paystack escrow payments",
    "sell online Africa",
    "subdomain ecommerce storefront",
    "custom domain online store",
    "seller dashboard",
    "Hustlr",
  ],
  authors: [{ name: APP_NAME }],
  creator: APP_NAME,
  publisher: APP_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: APP_URL,
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME} | ${APP_SLOGAN}`,
    description: APP_TAGLINE,
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: `${APP_NAME} E-Commerce Platform`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${APP_NAME} | ${APP_SLOGAN}`,
    description: APP_TAGLINE,
    images: ["/hero.png"],
  },
  category: "E-Commerce Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: APP_NAME,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    description: APP_TAGLINE,
    url: APP_URL,
    offers: {
      "@type": "Offer",
      price: "0.00",
      priceCurrency: "NGN",
    },
  };

  return (
    <html
      lang="en"
      className={`${rajdhani.className} ${archivoBlack.variable} ${spaceGrotesk.variable} bg-[#FFFFFF]`}
    >
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
