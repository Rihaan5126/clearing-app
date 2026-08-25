"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { rankCourses, type CourseWithUniversity, type MatchResult } from "@/lib/matching";
import { toTelHref } from "@/lib/tel";
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
  "h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50";
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
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          No live vacancies right now — Clearing has closed for the current cycle at every
          university we track. Hotline numbers and direct links are still shown below.
        </div>
      )}

      {profile ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Your top picks</h2>

          {profile.top_3_universities.length === 0 ? (
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Add up to 3 target universities on your{" "}
              <Link href="/profile" className={LINK_CLASSES}>
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
            <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Your backup notes
              </h3>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-zinc-700 dark:text-zinc-300">
                {profile.backup_courses.map((note, i) => (
                  <li key={i}>{note}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      ) : (
        <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          <Link href="/login" className={LINK_CLASSES}>
            Sign in
          </Link>{" "}
          and set up your profile to see personalized picks based on your grades and target unis.
        </div>
      )}

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">All universities</h2>
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
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{university.name}</h3>
        {university.clearing_phone && (
          <a href={`tel:${toTelHref(university.clearing_phone)}`} className={`shrink-0 ${LINK_CLASSES}`}>
            Call
          </a>
        )}
      </div>

      {matches.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {matches.slice(0, 5).map((m) => (
            <li key={m.course.id} className="text-sm text-zinc-700 dark:text-zinc-300">
              {m.course.name}
              <span className="text-zinc-500 dark:text-zinc-500"> — {m.course.vacancy_status}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Clearing has closed for the current cycle at {university.name} — no live vacancies right
          now.
        </p>
      )}

      <Link href={`/dashboard/${university.id}`} className={`self-start ${LINK_CLASSES}`}>
        View details &amp; prepare a call script
      </Link>
    </div>
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
    <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{university.name}</h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-500">
            Checked: {formatLastScraped(university.last_scraped_at)}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${
            hasLiveData
              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
              : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400"
          }`}
        >
          {hasLiveData ? "Live vacancy data" : "No live vacancies"}
        </span>
      </div>

      {courses.length > 0 ? (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          {courses.length} course{courses.length === 1 ? "" : "s"} matching your filters
        </p>
      ) : (
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Clearing has closed for the current cycle at {university.name} — no live vacancies right
          now.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4 pt-1">
        {university.clearing_phone && (
          <a href={`tel:${toTelHref(university.clearing_phone)}`} className={LINK_CLASSES}>
            Call {university.clearing_phone}
          </a>
        )}
        <Link href={`/dashboard/${university.id}`} className={LINK_CLASSES}>
          View details &amp; call script
        </Link>
      </div>
    </div>
  );
}
