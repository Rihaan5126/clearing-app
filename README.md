# UK Clearing Helper

Browse live UK Clearing vacancies, store your grades and target courses, and
generate a phone script for admissions calls.

Live at [clearing-app-theta.vercel.app](https://clearing-app-theta.vercel.app/).

## What it does

- **Browse live vacancies** — every tracked university in one place, with
  vacancy status and subject filters.
- **Save your grades and target courses** — add your results, top 3 target
  universities, and backup courses; matched against what's actually open.
- **Generate a call script** — a short script covering who you are, your
  grades, and a fallback ask if the course is full, editable and saved per
  university.
- No UCAS login required — access is never gated on UCAS status.

See [`clearing-app-spec.md`](./clearing-app-spec.md) for the full build spec.

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Copy `.env.local.example` to `.env.local` and fill in your project URL and
   anon key (Project Settings -> API).
3. Run the migrations in `supabase/migrations` against your project (SQL
   Editor, or the Supabase CLI).
4. Install dependencies and start the dev server:

   ```
   npm install
   npm run dev
   ```

   Open <http://localhost:3000>.

## Project structure

- `src/app` - routes (App Router): dashboard, profile, login
- `src/lib/supabase` - Supabase client (browser + server) and DB types
- `scripts/scrape` - scraper that populates live vacancy data
- `supabase/migrations` - SQL schema (`universities`, `courses`, `profiles`)

## Notes

- `ucas_status` on `profiles` is a manual toggle set by the user — there is
  no UCAS API integration, and it never gates access to any feature.
- `universities`/`courses` are public-read; writes come from the scraper via
  the Supabase service role key, not the anon key.
