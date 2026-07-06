import Link from "next/link";
import { Logomark } from "@/components/Brand";

export default function NotFound() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-5 text-center">
      <div className="jyoti-glow pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="relative">
        <Logomark size={48} />
        <h1 className="mt-8 font-display text-5xl text-ink">Page not found</h1>
        <p className="mx-auto mt-4 max-w-sm text-ink-soft">
          That page does not exist. It may have been moved or removed.
        </p>
        <Link href="/" className="btn btn-primary mt-8">
          Go to the homepage
        </Link>
      </div>
    </div>
  );
}
