import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Info, Phone } from "lucide-react";
import { getOptionalSession } from "@/lib/supabase/dal";
import { createClient } from "@/lib/supabase/server";
import { rankCourses } from "@/lib/matching";
import { toTelHref } from "@/lib/tel";
import CallScriptPanel from "./CallScriptPanel";
import { Badge, Card, linkClasses } from "@/components/ui";
import type { CallScript, Course, Profile, University } from "@/lib/supabase/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-12">
      <main className="flex flex-col gap-8">
        <Link href="/dashboard" className={`inline-flex items-center gap-1 self-start ${linkClasses}`}>
          <ArrowLeft className="h-3.5 w-3.5" /> All universities
        </Link>

        <header className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{uni.name}</h1>
            <Badge tone={uni.scrape_status === "ok" && courseList.length > 0 ? "success" : "neutral"}>
              {uni.scrape_status === "ok" && courseList.length > 0
                ? "Live vacancy data"
                : "No live vacancies"}
            </Badge>
          </div>
          <p className="text-xs text-muted">Checked: {formatLastScraped(uni.last_scraped_at)}</p>
          <div className="flex flex-wrap gap-5">
            {uni.clearing_phone ? (
              <a
                href={`tel:${toTelHref(uni.clearing_phone)}`}
                className={`inline-flex items-center gap-1.5 ${linkClasses}`}
              >
                <Phone className="h-3.5 w-3.5" /> {uni.clearing_phone}
              </a>
            ) : (
              <span className="text-sm text-muted">No hotline number on record</span>
            )}
            {uni.website_url && (
              <a
                href={uni.website_url}
                target="_blank"
                rel="noreferrer"
                className={`inline-flex items-center gap-1.5 ${linkClasses}`}
              >
                Visit their Clearing page <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        </header>

        {courseList.length === 0 ? (
          <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              Clearing has closed for the current cycle at {uni.name} — there&apos;s no live
              vacancy data right now. Call the hotline above or use their own Clearing search tool
              directly.
            </span>
          </div>
        ) : (
          <section className="flex flex-col gap-3">
            <h2 className="text-sm font-semibold">Courses</h2>
            <ul className="flex flex-col gap-2">
              {rankedCourses.map((r) => (
                <Card as="li" key={r.course.id} className="flex flex-col gap-1">
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-sm font-medium">{r.course.name}</span>
                    <span className="shrink-0 text-xs text-muted">{r.course.vacancy_status}</span>
                  </div>
                  {r.course.subject_area && (
                    <p className="text-xs text-muted">{r.course.subject_area}</p>
                  )}
                  {r.course.entry_requirements && (
                    <p className="text-xs text-muted">
                      Entry requirements: {r.course.entry_requirements}
                    </p>
                  )}
                  {profile && (
                    <p className="text-xs text-muted">
                      Grade match: {r.gradeMatch.replace("_", " ")}
                    </p>
                  )}
                </Card>
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
