import { Spinner } from "@/components/ui/Spinner";

export default function MarketingLoading() {
  return (
    <div className="flex-1 flex items-center justify-center py-24 bg-white">
      <Spinner size="lg" label="Loading…" />
    </div>
  );
}
