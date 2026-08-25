import Link from "next/link";
import { notFound } from "next/navigation";
import { getOptionalSession } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { rankCourses } from "@/lib/matching";
import { toTelHref } from "@/lib/tel";
import CallScriptPanel from "./CallScriptPanel";
import type { CallScript, Course, Profile, University } from "@/lib/supabase/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const LINK_CLASSES = "text-sm font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-50";

function formatLastScraped(value: string | null): string {
  if (!value) return "Not yet checked";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function UniversityDetailPage({
  params,
}: {
  params: Promise<{ universityId: string }>;
}) {
  const { universityId } = await params;
  // A malformed uuid makes PostgREST throw (22P02) rather than return zero
  // rows, so guard before querying.
  if (!UUID_RE.test(universityId)) notFound();

  const session = await getOptionalSession();
  const supabase = await createClient();

  const [{ data: university }, { data: courses }] = await Promise.all([
    supabase.from("universities").select("*").eq("id", universityId).maybeSingle(),
    supabase.from("courses").select("*").eq("university_id", universityId).order("name"),
  ]);

  if (!university) notFound();
  const uni = university as University;
  const courseList = (courses ?? []) as Course[];

  let profile: Profile | null = null;
  let existingScript: CallScript | null = null;
  if (session) {
    const [{ data: profileData }, { data: scriptData }] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", session.userId).maybeSingle(),
      supabase
        .from("call_scripts")
        .select("*")
        .eq("user_id", session.userId)
        .eq("university_id", universityId)
        .maybeSingle(),
    ]);
    profile = (profileData as Profile | null) ?? null;
    existingScript = (scriptData as CallScript | null) ?? null;
  }

  const rankedCourses = rankCourses(
    courseList.map((c) => ({ ...c, university: uni })),
    profile
  );

  return (
    <div className="min-h-screen bg-zinc-50 px-6 py-12 dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-col gap-8">
        <Link href="/dashboard" className={LINK_CLASSES}>
          &larr; All universities
        </Link>

        <header className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {uni.name}
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Checked: {formatLastScraped(uni.last_scraped_at)}
          </p>
          <div className="flex flex-wrap gap-4">
            {uni.clearing_phone ? (
              <a href={`tel:${toTelHref(uni.clearing_phone)}`} className={LINK_CLASSES}>
                Call {uni.clearing_phone}
              </a>
            ) : (
              <span className="text-sm text-zinc-500 dark:text-zinc-500">
                No hotline number on record
              </span>
            )}
            {uni.website_url && (
              <a href={uni.website_url} target="_blank" rel="noreferrer" className={LINK_CLASSES}>
                Visit their Clearing page
              </a>
            )}
          </div>
        </header>

        {courseList.length === 0 ? (
          <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            Clearing has closed for the current cycle at {uni.name} — there&apos;s no live vacancy
            data right now. Call the hotline above or use their own Clearing search tool directly.
          </div>
        ) : (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Courses</h2>
            <ul className="flex flex-col gap-2">
              {rankedCourses.map((r) => (
                <li
                  key={r.course.id}
                  className="flex flex-col gap-1 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      {r.course.name}
                    </span>
                    <span className="shrink-0 text-xs text-zinc-500 dark:text-zinc-500">
                      {r.course.vacancy_status}
                    </span>
                  </div>
                  {r.course.subject_area && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">{r.course.subject_area}</p>
                  )}
                  {r.course.entry_requirements && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                      Entry requirements: {r.course.entry_requirements}
                    </p>
                  )}
                  {profile && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">
                      Grade match: {r.gradeMatch.replace("_", " ")}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        <CallScriptPanel
          universityId={uni.id}
          universityName={uni.name}
          defaultCourseName={existingScript?.course_name ?? courseList[0]?.name ?? ""}
          profile={profile}
          existingScript={existingScript}
          isSignedIn={Boolean(session)}
        />
      </main>
    </div>
  );
}
