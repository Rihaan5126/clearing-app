"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/supabase/dal";
import type { GradeEntry, UcasStatus } from "@/lib/supabase/types";

export type SaveProfileState = { error?: string; success?: boolean } | undefined;

const UCAS_STATUSES: UcasStatus[] = [
  "confirmed_firm",
  "confirmed_insurance",
  "not_confirmed",
  "self_releasing",
  "waiting",
];

function parseGrades(raw: string): GradeEntry[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  return parsed
    .filter(
      (g): g is GradeEntry =>
        typeof g === "object" &&
        g !== null &&
        typeof (g as GradeEntry).subject === "string" &&
        typeof (g as GradeEntry).grade === "string"
    )
    .map((g) => ({ subject: g.subject.trim(), grade: g.grade.trim() }))
    .filter((g) => g.subject && g.grade);
}

function parseStringArray(raw: string, max: number): string[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((s): s is string => typeof s === "string")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, max);
}

export async function saveProfile(
  _prevState: SaveProfileState,
  formData: FormData
): Promise<SaveProfileState> {
  const { userId } = await verifySession();

  const grades = parseGrades(String(formData.get("grades_json") ?? "[]"));
  const topUniversities = parseStringArray(String(formData.get("top_universities_json") ?? "[]"), 3);
  const backupCourses = parseStringArray(String(formData.get("backup_courses_json") ?? "[]"), 3);
  const ucasStatusRaw = String(formData.get("ucas_status") ?? "");

  if (!UCAS_STATUSES.includes(ucasStatusRaw as UcasStatus)) {
    return { error: "Choose a valid UCAS status." };
  }
  const ucasStatus = ucasStatusRaw as UcasStatus;

  const supabase = await createClient();
  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: userId,
      grades,
      top_3_universities: topUniversities,
      backup_courses: backupCourses,
      ucas_status: ucasStatus,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/profile");
  return { success: true };
}
