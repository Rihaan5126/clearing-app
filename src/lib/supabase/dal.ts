import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./server";

/**
 * getClaims() (not getSession()/getUser()) validates the JWT signature
 * locally against the project's published keys on every call — it's the
 * only server-side check that's safe to trust for auth decisions.
 */
export const verifySession = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;

  if (!userId) redirect("/login");

  return { userId };
});

export const getOptionalSession = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  return userId ? { userId } : null;
});
