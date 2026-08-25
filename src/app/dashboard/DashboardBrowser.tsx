"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Info, Phone } from "lucide-react";
import { rankCourses, type CourseWithUniversity, type MatchResult } from "@/lib/matching";
import { toTelHref } from "@/lib/tel";
import { Badge, Card, linkClasses } from "@/components/ui";
import type { Profile, University, VacancyStatus } from "@/lib/supabase/types";

interface DashboardBrowserProps {
  universities: University[];
  courses: CourseWithUniversity[];
  profile: Profile | null;
}

const VACANCY_FILTERS: { value: VacancyStatus | "all"; label: string }[] = [
  { value: "all", label: "Any vacancy status" },
  { value: "open", label: "Open" },
  { value: "unclear", label: "Unclear" },
  { value: "closed", label: "Closed" },
];

const SELECT_CLASSES =
  "h-10 rounded-lg border border-border bg-surface px-3 text-sm outline-none transition-colors focus:border-accent";

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

export default function DashboardBrowser({ universities, courses, profile }: DashboardBrowserProps) {
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [vacancyFilter, setVacancyFilter] = useState<VacancyStatus | "all">("all");

  const subjectAreas = useMemo(() => {
    const set = new Set<string>();
    for (const c of courses) if (c.subject_area) set.add(c.subject_area);
    return Array.from(set).sort();
  }, [courses]);

  const filteredCourses = useMemo(
    () =>
      courses.filter(
        (c) =>
          (subjectFilter === "all" || c.subject_area === subjectFilter) &&
          (vacancyFilter === "all" || c.vacancy_status === vacancyFilter)
      ),
    [courses, subjectFilter, vacancyFilter]
  );

  const ranked = useMemo(() => rankCourses(filteredCourses, profile), [filteredCourses, profile]);
  const topPicksByUniversity = useMemo(() => {
    const map = new Map<string, MatchResult[]>();
    for (const r of ranked) {
      if (r.tier !== "top_pick") continue;
      const list = map.get(r.university.id) ?? [];
      list.push(r);
      map.set(r.university.id, list);
    }
    return map;
  }, [ranked]);

  const universityById = useMemo(() => {
    const map = new Map<string, University>();
    for (const u of universities) map.set(u.id, u);
    return map;
  }, [universities]);

  const coursesByUniversity = useMemo(() => {
    const map = new Map<string, CourseWithUniversity[]>();
    for (const c of filteredCourses) {
      const list = map.get(c.university_id) ?? [];
      list.push(c);
      map.set(c.university_id, list);
    }
    return map;
  }, [filteredCourses]);

  return (
    <div className="flex flex-col gap-10">
      {courses.length === 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            No live vacancies right now — Clearing has closed for the current cycle at every
            university we track. Hotline numbers and direct links are still shown below.
          </span>
        </div>
      )}

      {profile ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Your top picks</h2>

          {profile.top_3_universities.length === 0 ? (
            <p className="text-sm text-muted">
              Add up to 3 target universities on your{" "}
              <Link href="/profile" className={linkClasses}>
                profile
              </Link>{" "}
              to see them ranked here.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {profile.top_3_universities.map((uniId) => {
                const uni = universityById.get(uniId);
                if (!uni) return null;
                return (
                  <TopPickCard
                    key={uniId}
                    university={uni}
                    matches={topPicksByUniversity.get(uniId) ?? []}
                  />
                );
              })}
            </div>
          )}

          {profile.backup_courses.length > 0 && (
            <Card>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Your backup notes
              </h3>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {profile.backup_courses.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </Card>
          )}
        </section>
      ) : (
        <Card className="text-sm text-muted">
          <Link href="/login" className={linkClasses}>
            Sign in
          </Link>{" "}
          and set up your profile to see personalized picks based on your grades and target unis.
        </Card>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold">All universities</h2>
          <div className="flex flex-wrap gap-2">
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className={SELECT_CLASSES}
            >
              <option value="all">All subjects</option>
              {subjectAreas.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={vacancyFilter}
              onChange={(e) => setVacancyFilter(e.target.value as VacancyStatus | "all")}
              className={SELECT_CLASSES}
            >
              {VACANCY_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {universities.map((uni) => (
            <UniversityCard
              key={uni.id}
              university={uni}
              courses={coursesByUniversity.get(uni.id) ?? []}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

function TopPickCard({ university, matches }: { university: University; matches: MatchResult[] }) {
  return (
    <Card className="flex flex-col gap-2 border-accent/30">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium">{university.name}</h3>
        {university.clearing_phone && (
          <a
            href={`tel:${toTelHref(university.clearing_phone)}`}
            className={`inline-flex shrink-0 items-center gap-1 ${linkClasses}`}
          >
            <Phone className="h-3.5 w-3.5" /> Call
          </a>
        )}
      </div>

      {matches.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {matches.slice(0, 5).map((m) => (
            <li key={m.course.id} className="text-sm">
              {m.course.name}
              <span className="text-muted"> — {m.course.vacancy_status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">
          Clearing has closed for the current cycle at {university.name} — no live vacancies right
          now.
        </p>
      )}

      <Link
        href={`/dashboard/${university.id}`}
        className={`inline-flex items-center gap-1 self-start ${linkClasses}`}
      >
        View details &amp; prepare a call script <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </Card>
  );
}

function UniversityCard({
  university,
  courses,
}: {
  university: University;
  courses: CourseWithUniversity[];
}) {
  const hasLiveData = university.scrape_status === "ok" && courses.length > 0;

  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">{university.name}</h3>
          <p className="text-xs text-muted">
            Checked: {formatLastScraped(university.last_scraped_at)}
          </p>
        </div>
        <Badge tone={hasLiveData ? "success" : "neutral"}>
          {hasLiveData ? "Live vacancy data" : "No live vacancies"}
        </Badge>
      </div>

      {courses.length > 0 ? (
        <p className="text-xs text-muted">
          {courses.length} course{courses.length === 1 ? "" : "s"} matching your filters
        </p>
      ) : (
        <p className="text-xs text-muted">
          Clearing has closed for the current cycle at {university.name} — no live vacancies right
          now.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 pt-1">
        {university.clearing_phone && (
          <a
            href={`tel:${toTelHref(university.clearing_phone)}`}
            className={`inline-flex items-center gap-1 ${linkClasses}`}
          >
            <Phone className="h-3.5 w-3.5" /> {university.clearing_phone}
          </a>
        )}
        <Link
          href={`/dashboard/${university.id}`}
          className={`inline-flex items-center gap-1 ${linkClasses}`}
        >
          View details &amp; call script <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}
