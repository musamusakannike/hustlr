import MarketingHeader from "@/components/layout/MarketingHeader";
import MarketingFooter from "@/components/layout/MarketingFooter";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-white text-text">
      <MarketingHeader />
      <main className="flex-1 flex flex-col">{children}</main>
      <MarketingFooter />
    </div>
  );
}
