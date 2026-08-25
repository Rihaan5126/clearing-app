import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  throw new Error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local. " +
      "Get the service role key from the Supabase dashboard (Project Settings > API) " +
      "and add it as SUPABASE_SERVICE_ROLE_KEY. It bypasses RLS, so it must never be " +
      "prefixed with NEXT_PUBLIC_ or committed."
  );
}

export const db = createClient(url, serviceRoleKey, {
  auth: { persistSession: false },
});
