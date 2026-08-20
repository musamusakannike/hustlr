import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-bg-soft flex items-center justify-center">
      <Spinner size="lg" label="Loading…" />
    </div>
  );
}
