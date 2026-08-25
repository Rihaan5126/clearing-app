import { verifySession } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";
import ProfileForm from "./ProfileForm";
import type { Profile } from "@/lib/supabase/types";

export default async function ProfilePage() {
  const { userId } = await verifySession();
  const supabase = await createClient();

  const [{ data: profile }, { data: universities }] = await Promise.all([
    supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    supabase.from("universities").select("id, name").order("name"),
  ]);

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-black">
      <main className="mx-auto flex w-full max-w-lg flex-col gap-8">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
              Your profile
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Every field below is optional and never restricts what you can browse.
            </p>
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="shrink-0 text-sm text-zinc-500 underline underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Sign out
            </button>
          </form>
        </header>

        <ProfileForm
          universities={universities ?? []}
          initialProfile={(profile as Profile | null) ?? null}
        />
      </main>
    </div>
  );
}
