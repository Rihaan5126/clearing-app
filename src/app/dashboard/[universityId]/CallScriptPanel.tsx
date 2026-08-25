"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { saveCallScript } from "./actions";
import { generateCallScript } from "@/lib/callScript";
import { Card, SectionLabel, buttonClasses, inputClasses, labelClasses, linkClasses } from "@/components/ui";
import type { CallScript, GradeEntry, Profile, UcasStatus } from "@/lib/supabase/types";

const UCAS_STATUS_OPTIONS: { value: UcasStatus; label: string }[] = [
  { value: "not_confirmed", label: "Not confirmed yet" },
  { value: "confirmed_firm", label: "Confirmed – holding my firm place" },
  { value: "confirmed_insurance", label: "Confirmed – holding my insurance place" },
  { value: "self_releasing", label: "Self-releasing (changed my mind)" },
  { value: "waiting", label: "Waiting to hear back" },
];

interface CallScriptPanelProps {
  universityId: string;
  universityName: string;
  defaultCourseName: string;
  profile: Profile | null;
  existingScript: CallScript | null;
  isSignedIn: boolean;
}

export default function CallScriptPanel({
  universityId,
  universityName,
  defaultCourseName,
  profile,
  existingScript,
  isSignedIn,
}: CallScriptPanelProps) {
  const [state, formAction, pending] = useActionState(saveCallScript, undefined);

  const [studentName, setStudentName] = useState("");
  const [grades, setGrades] = useState<GradeEntry[]>(
    profile?.grades.length ? profile.grades : [{ subject: "", grade: "" }]
  );
  const [ucasStatus, setUcasStatus] = useState<UcasStatus>(profile?.ucas_status ?? "not_confirmed");
  const [courseName, setCourseName] = useState(existingScript?.course_name ?? defaultCourseName);
  const [whyThisUni, setWhyThisUni] = useState("");
  const [backupCourseName, setBackupCourseName] = useState(profile?.backup_courses[0] ?? "");

  const [scriptText, setScriptText] = useState(
    () =>
      existingScript?.script_text ??
      generateCallScript({
        grades: profile?.grades ?? [],
        ucasStatus: profile?.ucas_status ?? "not_confirmed",
        universityName,
        courseName: defaultCourseName || "[course name]",
        backupCourseName: profile?.backup_courses[0],
      })
  );

  function regenerate() {
    setScriptText(
      generateCallScript({
        studentName,
        grades: grades.filter((g) => g.subject && g.grade),
        ucasStatus,
        universityName,
        courseName: courseName || "[course name]",
        whyThisUni: whyThisUni || undefined,
        backupCourseName: backupCourseName || undefined,
      })
    );
  }

  function updateGrade(index: number, field: keyof GradeEntry, value: string) {
    setGrades((prev) => prev.map((g, i) => (i === index ? { ...g, [field]: value } : g)));
  }

  return (
    <Card as="section" className="flex flex-col gap-4">
      <div>
        <h2 className="text-sm font-semibold">Call script</h2>
        <p className="text-xs text-muted">
          Ready to read out when you call. Edit anything, then regenerate or save.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className={labelClasses}>Your name</label>
          <input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Optional"
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClasses}>Course you&apos;re calling about</label>
          <input
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className={labelClasses}>Why this university (optional)</label>
          <input
            value={whyThisUni}
            onChange={(e) => setWhyThisUni(e.target.value)}
            placeholder="e.g. their labs are excellent"
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClasses}>Backup course to ask about (optional)</label>
          <input
            value={backupCourseName}
            onChange={(e) => setBackupCourseName(e.target.value)}
            className={inputClasses}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className={labelClasses}>UCAS status</label>
          <select
            value={ucasStatus}
            onChange={(e) => setUcasStatus(e.target.value as UcasStatus)}
            className={inputClasses}
          >
            {UCAS_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <SectionLabel>Your grades</SectionLabel>
        <div className="flex flex-col gap-2">
          {grades.map((g, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="Subject"
                value={g.subject}
                onChange={(e) => updateGrade(i, "subject", e.target.value)}
                className={`flex-1 ${inputClasses}`}
              />
              <input
                placeholder="Grade"
                value={g.grade}
                onChange={(e) => updateGrade(i, "grade", e.target.value)}
                className={`w-20 ${inputClasses}`}
              />
              <button
                type="button"
                onClick={() => setGrades((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label="Remove grade"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-red-300 hover:text-red-600 dark:hover:border-red-900 dark:hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setGrades((prev) => [...prev, { subject: "", grade: "" }])}
          className="self-start text-sm font-medium text-accent hover:text-accent-hover"
        >
          + Add grade
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <SectionLabel>Script</SectionLabel>
        <button
          type="button"
          onClick={regenerate}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Regenerate
        </button>
      </div>
      <textarea
        value={scriptText}
        onChange={(e) => setScriptText(e.target.value)}
        rows={8}
        className={`${inputClasses} h-auto resize-y py-2.5 leading-relaxed`}
      />

      {isSignedIn ? (
        <form action={formAction} className="flex flex-col gap-2">
          <input type="hidden" name="university_id" value={universityId} />
          <input type="hidden" name="course_name" value={courseName} />
          <input type="hidden" name="script_text" value={scriptText} />
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
          <button
            type="submit"
            disabled={pending || !scriptText.trim()}
            className={buttonClasses("primary", "w-full")}
          >
            {pending ? "Saving…" : "Save script"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-muted">
          <Link href="/login" className={linkClasses}>
            Sign in
          </Link>{" "}
          to save this script for next time.
        </p>
      )}
    </Card>
  );
}
