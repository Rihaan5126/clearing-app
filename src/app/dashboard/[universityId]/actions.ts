"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { verifySession } from "@/lib/supabase/dal";

export type SaveCallScriptState = { error?: string; success?: boolean } | undefined;

export async function saveCallScript(
  _prevState: SaveCallScriptState,
  formData: FormData
): Promise<SaveCallScriptState> {
  // Defense in depth: the Save button only renders for signed-in users, but
  // verifySession() redirects to /login if this action is ever invoked
  // without a session (e.g. the form is somehow POSTed directly).
  const { userId } = await verifySession();

  const universityId = String(formData.get("university_id") ?? "");
  const courseId = formData.get("course_id") ? String(formData.get("course_id")) : null;
  const courseName = String(formData.get("course_name") ?? "").trim() || null;
  const scriptText = String(formData.get("script_text") ?? "").trim();

  if (!universityId) return { error: "Missing university." };
  if (!scriptText) return { error: "Script can't be empty." };

  const supabase = await createClient();
  const { error } = await supabase.from("call_scripts").upsert(
    {
      user_id: userId,
      university_id: universityId,
      course_id: courseId,
      course_name: courseName,
      script_text: scriptText,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,university_id" }
  );

  if (error) return { error: error.message };

  revalidatePath(`/dashboard/${universityId}`);
  return { success: true };
}
