# UK Clearing Helper

Browse live UK Clearing vacancies, store your grades and target courses, and
generate a phone script for admissions calls. See
[`clearing-app-spec.md`](../clearing-app-spec.md) for the full build spec.

Currently scaffolded: **Phase 1** (Next.js + Tailwind + Supabase client, DB
schema). Phases 2-6 (scraper, profile form, matching dashboard, call script,
polish) are not yet built.

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Copy `.env.local.example` to `.env.local` and fill in your project URL and
   anon key (Project Settings -> API).
3. Run the migration in `supabase/migrations/0001_init.sql` against your
   project (SQL Editor, or the Supabase CLI).
4. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/app` - routes (App Router)
- `src/lib/supabase` - Supabase client (browser + server) and DB types
- `supabase/migrations` - SQL schema (`universities`, `courses`, `profiles`)

## Notes

- `ucas_status` on `profiles` is a manual toggle set by the user — there is
  no UCAS API integration, and it never gates access to any feature.
- `universities`/`courses` are public-read; writes are expected to come from
  the Phase 2 scraper via the Supabase service role key, not the anon key.
