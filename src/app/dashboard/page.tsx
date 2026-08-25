import { getOptionalSession } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import DashboardBrowser from "./DashboardBrowser";
import type { CourseWithUniversity } from "@/lib/matching";
import type { Profile, University } from "@/lib/supabase/types";

export default async function DashboardPage() {
  const session = await getOptionalSession();
  const supabase = await createClient();

  const [{ data: universities }, { data: courses }] = await Promise.all([
    supabase.from("universities").select("*").order("name"),
    supabase.from("courses").select("*, university:universities(*)"),
  ]);

  let profile: Profile | null = null;
  if (session) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", session.userId)
      .maybeSingle();
    profile = (data as Profile | null) ?? null;
  }

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-black">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Browse Clearing vacancies
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Every university below is browsable whether you&apos;re signed in or not.
          </p>
        </header>

        <DashboardBrowser
          universities={(universities ?? []) as University[]}
          courses={(courses ?? []) as CourseWithUniversity[]}
          profile={profile}
        />
      </main>
    </div>
  );
}
