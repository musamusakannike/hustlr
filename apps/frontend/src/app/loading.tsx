import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="h-screen bg-white flex items-center justify-center">
      <Spinner size="lg" label="Loading…" />
    </div>
  );
}
