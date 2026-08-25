import { verifySession } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
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
    <div className="mx-auto w-full max-w-lg flex-1 px-6 py-12">
      <main className="flex flex-col gap-8">
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
          <p className="text-sm text-muted">
            Every field below is optional and never restricts what you can browse.
          </p>
        </header>

        <ProfileForm
          universities={universities ?? []}
          initialProfile={(profile as Profile | null) ?? null}
        />
      </main>
    </div>
  );
}
