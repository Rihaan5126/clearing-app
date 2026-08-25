"use client";

import { useActionState, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";
import { saveProfile } from "./actions";
import { Card, SectionLabel, buttonClasses, inputClasses } from "@/components/ui";
import type { GradeEntry, Profile, UcasStatus } from "@/lib/supabase/types";

const UCAS_STATUS_OPTIONS: { value: UcasStatus; label: string }[] = [
  { value: "not_confirmed", label: "Not confirmed yet" },
  { value: "confirmed_firm", label: "Confirmed – holding my firm place" },
  { value: "confirmed_insurance", label: "Confirmed – holding my insurance place" },
  { value: "self_releasing", label: "Self-releasing (changed my mind)" },
  { value: "waiting", label: "Waiting to hear back" },
];

const REMOVE_BUTTON_CLASSES =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-red-300 hover:text-red-600 dark:hover:border-red-900 dark:hover:text-red-400";
const ADD_LINK_CLASSES =
  "inline-flex items-center gap-1 self-start text-sm font-medium text-accent hover:text-accent-hover";

interface UniversityOption {
  id: string;
  name: string;
}

interface ProfileFormProps {
  universities: UniversityOption[];
  initialProfile: Profile | null;
}

export default function ProfileForm({ universities, initialProfile }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState(saveProfile, undefined);

  const [grades, setGrades] = useState<GradeEntry[]>(
    initialProfile?.grades.length ? initialProfile.grades : [{ subject: "", grade: "" }]
  );
  const [topUniversityIds, setTopUniversityIds] = useState<string[]>(
    initialProfile?.top_3_universities ?? []
  );
  const [backupCourses, setBackupCourses] = useState<string[]>(
    initialProfile?.backup_courses.length ? initialProfile.backup_courses : [""]
  );
  const [ucasStatus, setUcasStatus] = useState<UcasStatus>(
    initialProfile?.ucas_status ?? "not_confirmed"
  );
  const [uniQuery, setUniQuery] = useState("");

  const universityById = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of universities) map.set(u.id, u.name);
    return map;
  }, [universities]);

  const filteredUniversities = useMemo(() => {
    const query = uniQuery.trim().toLowerCase();
    return universities
      .filter((u) => !topUniversityIds.includes(u.id))
      .filter((u) => !query || u.name.toLowerCase().includes(query))
      .slice(0, 6);
  }, [universities, uniQuery, topUniversityIds]);

  function updateGrade(index: number, field: keyof GradeEntry, value: string) {
    setGrades((prev) => prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
  }

  function removeGrade(index: number) {
    setGrades((prev) => prev.filter((_, i) => i !== index));
  }

  function addUniversity(id: string) {
    if (topUniversityIds.length >= 3 || topUniversityIds.includes(id)) return;
    setTopUniversityIds((prev) => [...prev, id]);
    setUniQuery("");
  }

  function removeUniversity(id: string) {
    setTopUniversityIds((prev) => prev.filter((u) => u !== id));
  }

  function updateBackupCourse(index: number, value: string) {
    setBackupCourses((prev) => prev.map((c, i) => (i === index ? value : c)));
  }

  function removeBackupCourse(index: number) {
    setBackupCourses((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="grades_json" value={JSON.stringify(grades)} readOnly />
      <input
        type="hidden"
        name="top_universities_json"
        value={JSON.stringify(topUniversityIds)}
        readOnly
      />
      <input
        type="hidden"
        name="backup_courses_json"
        value={JSON.stringify(backupCourses)}
        readOnly
      />

      <Card className="flex flex-col gap-3">
        <SectionLabel>Your grades</SectionLabel>
        <div className="flex flex-col gap-2">
          {grades.map((grade, index) => (
            <div key={index} className="flex gap-2">
              <input
                placeholder="Subject"
                value={grade.subject}
                onChange={(e) => updateGrade(index, "subject", e.target.value)}
                className={`flex-1 ${inputClasses}`}
              />
              <input
                placeholder="Grade"
                value={grade.grade}
                onChange={(e) => updateGrade(index, "grade", e.target.value)}
                className={`w-24 ${inputClasses}`}
              />
              <button
                type="button"
                onClick={() => removeGrade(index)}
                aria-label="Remove grade"
                className={REMOVE_BUTTON_CLASSES}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setGrades((prev) => [...prev, { subject: "", grade: "" }])}
          className={ADD_LINK_CLASSES}
        >
          <Plus className="h-3.5 w-3.5" /> Add grade
        </button>
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionLabel>Top 3 target universities</SectionLabel>

        {topUniversityIds.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {topUniversityIds.map((id) => (
              <li
                key={id}
                className="flex items-center gap-2 rounded-full bg-accent py-1.5 pl-3 pr-2 text-sm text-accent-foreground"
              >
                {universityById.get(id) ?? id}
                <button
                  type="button"
                  onClick={() => removeUniversity(id)}
                  aria-label={`Remove ${universityById.get(id) ?? "university"}`}
                  className="flex h-5 w-5 items-center justify-center rounded-full hover:bg-black/10 dark:hover:bg-white/20"
                >
                  <X className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}

        {topUniversityIds.length < 3 && (
          <div className="relative">
            <input
              placeholder="Search universities…"
              value={uniQuery}
              onChange={(e) => setUniQuery(e.target.value)}
              className={inputClasses}
            />
            {(uniQuery.trim().length > 0 || filteredUniversities.length > 0) && (
              <ul className="mt-1 flex flex-col overflow-hidden rounded-lg border border-border bg-surface">
                {filteredUniversities.length === 0 && (
                  <li className="px-3 py-2 text-sm text-muted">No matches</li>
                )}
                {filteredUniversities.map((u) => (
                  <li key={u.id}>
                    <button
                      type="button"
                      onClick={() => addUniversity(u.id)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-surface-muted"
                    >
                      {u.name}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionLabel>Backup courses you&apos;d be flexible on</SectionLabel>
        <div className="flex flex-col gap-2">
          {backupCourses.map((course, index) => (
            <div key={index} className="flex gap-2">
              <input
                placeholder="e.g. Biology at a different uni"
                value={course}
                onChange={(e) => updateBackupCourse(index, e.target.value)}
                className={`flex-1 ${inputClasses}`}
              />
              <button
                type="button"
                onClick={() => removeBackupCourse(index)}
                aria-label="Remove backup course"
                className={REMOVE_BUTTON_CLASSES}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        {backupCourses.length < 3 && (
          <button
            type="button"
            onClick={() => setBackupCourses((prev) => [...prev, ""])}
            className={ADD_LINK_CLASSES}
          >
            <Plus className="h-3.5 w-3.5" /> Add backup course
          </button>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <SectionLabel>UCAS status</SectionLabel>
        <p className="text-xs text-muted">
          Informational only — this never restricts what you can browse or do here.
        </p>
        <select
          name="ucas_status"
          value={ucasStatus}
          onChange={(e) => setUcasStatus(e.target.value as UcasStatus)}
          className={inputClasses}
        >
          {UCAS_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Card>

      {state?.error && (
        <p className="text-sm text-red-600 dark:text-red-400" role="alert">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
          Saved.
        </p>
      )}

      <button type="submit" disabled={pending} className={buttonClasses("primary", "w-full")}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
