import Link from "next/link";
import { Button } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
      <p className="text-sm font-medium text-accent">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Page not found</h1>
      <p className="max-w-sm text-sm text-muted">
        That university or page doesn&apos;t exist — it may have been removed, or the link was
        mistyped.
      </p>
      <Button as={Link} href="/dashboard" variant="primary" className="mt-2">
        Browse universities
      </Button>
    </div>
  );
}
