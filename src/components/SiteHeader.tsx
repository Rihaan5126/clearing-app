import Link from "next/link";
import { PhoneCall } from "lucide-react";
import { getOptionalSession } from "@/lib/supabase/dal";
import { signOut } from "@/app/login/actions";
import { linkClasses } from "./ui";

export default async function SiteHeader() {
  const session = await getOptionalSession();

  return (
    <header className="border-b border-border bg-surface/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <PhoneCall className="h-4 w-4" strokeWidth={2.25} />
          </span>
          Clearing Helper
        </Link>

        <nav className="flex items-center gap-5">
          <Link href="/dashboard" className={linkClasses}>
            Browse
          </Link>
          {session ? (
            <>
              <Link href="/profile" className={linkClasses}>
                Profile
              </Link>
              <form action={signOut}>
                <button type="submit" className="text-sm font-medium text-muted hover:text-foreground">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <Link href="/login" className={linkClasses}>
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
