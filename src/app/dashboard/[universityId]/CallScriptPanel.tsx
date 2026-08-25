"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { saveCallScript } from "./actions";
import { generateCallScript } from "@/lib/callScript";
import type { CallScript, GradeEntry, Profile, UcasStatus } from "@/lib/supabase/types";

const UCAS_STATUS_OPTIONS: { value: UcasStatus; label: string }[] = [
  { value: "not_confirmed", label: "Not confirmed yet" },
  { value: "confirmed_firm", label: "Confirmed – holding my firm place" },
  { value: "confirmed_insurance", label: "Confirmed – holding my insurance place" },
  { value: "self_releasing", label: "Self-releasing (changed my mind)" },
  { value: "waiting", label: "Waiting to hear back" },
];

const INPUT_CLASSES =
  "h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:focus:border-zinc-50";
const LINK_CLASSES = "text-sm font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-50";

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
    <section className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Call script</h2>
        <p className="text-xs text-zinc-500 dark:text-zinc-500">
          Ready to read out when you call. Edit anything, then regenerate or save.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Your name</label>
          <input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Optional"
            className={INPUT_CLASSES}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Course you&apos;re calling about
          </label>
          <input
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className={INPUT_CLASSES}
          />
        </div>
        <div className="flex flex-col gap-1 sm:col-span-2">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Why this university (optional)
          </label>
          <input
            value={whyThisUni}
            onChange={(e) => setWhyThisUni(e.target.value)}
            placeholder="e.g. their labs are excellent"
            className={INPUT_CLASSES}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
            Backup course to ask about (optional)
          </label>
          <input
            value={backupCourseName}
            onChange={(e) => setBackupCourseName(e.target.value)}
            className={INPUT_CLASSES}
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">UCAS status</label>
          <select
            value={ucasStatus}
            onChange={(e) => setUcasStatus(e.target.value as UcasStatus)}
            className={INPUT_CLASSES}
          >
            {UCAS_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Your grades</label>
        <div className="flex flex-col gap-2">
          {grades.map((g, i) => (
            <div key={i} className="flex gap-2">
              <input
                placeholder="Subject"
                value={g.subject}
                onChange={(e) => updateGrade(i, "subject", e.target.value)}
                className={`flex-1 ${INPUT_CLASSES}`}
              />
              <input
                placeholder="Grade"
                value={g.grade}
                onChange={(e) => updateGrade(i, "grade", e.target.value)}
                className={`w-20 ${INPUT_CLASSES}`}
              />
              <button
                type="button"
                onClick={() => setGrades((prev) => prev.filter((_, idx) => idx !== i))}
                aria-label="Remove grade"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-300 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setGrades((prev) => [...prev, { subject: "", grade: "" }])}
          className="self-start text-sm font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-50"
        >
          + Add grade
        </button>
      </div>

      <div className="flex items-center justify-between gap-3">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Script</label>
        <button
          type="button"
          onClick={regenerate}
          className="text-sm font-medium text-zinc-900 underline underline-offset-2 dark:text-zinc-50"
        >
          Regenerate
        </button>
      </div>
      <textarea
        value={scriptText}
        onChange={(e) => setScriptText(e.target.value)}
        rows={8}
        className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:focus:border-zinc-50"
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
            className="flex h-11 w-full items-center justify-center rounded-full bg-zinc-900 px-5 text-sm font-medium text-zinc-50 transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-300"
          >
            {pending ? "Saving…" : "Save script"}
          </button>
        </form>
      ) : (
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          <Link href="/login" className={LINK_CLASSES}>
            Sign in
          </Link>{" "}
          to save this script for next time.
        </p>
      )}
    </section>
  );
}
