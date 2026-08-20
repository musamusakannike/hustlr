import Image from "next/image";
import Link from "next/link";
import { APP_NAME, LOGO_PATH } from "@/constants/app.constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-bg-soft text-text font-space-grotesk flex flex-col items-center px-4 py-8 sm:py-12">
      <Link
        href="/"
        className="group flex flex-col items-center gap-2 mb-8 sm:mb-12"
      >
        <div className="relative h-12 w-auto group-hover:scale-105 transition-transform">
          <Image
            src={LOGO_PATH}
            alt={`${APP_NAME} Logo`}
            width={180}
            height={120}
            className="w-auto h-12 object-contain"
            priority
          />
        </div>
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </main>
  );
}
