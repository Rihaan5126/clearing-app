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
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-12">
      <main className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Browse Clearing vacancies</h1>
          <p className="text-sm text-muted">
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
