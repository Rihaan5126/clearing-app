# UK Clearing Helper

Browse UK Clearing vacancies, store your grades and target courses, match
them against what's actually open, and generate a phone script for
admissions calls. See [`clearing-app-spec.md`](../clearing-app-spec.md) for
the full build spec.

Built with Next.js (App Router) + Tailwind + Supabase (Postgres, Auth,
Row Level Security).

## What's here

- **Browse & match** (`/dashboard`, `/dashboard/[universityId]`) — public,
  no sign-in required. Filter by subject area and vacancy status; sign in
  and fill out a profile to see a personalized "top picks" ranking layered
  on top.
- **Profile** (`/profile`) — grades, top 3 target universities (searchable),
  up to 3 backup courses, and a manual UCAS status toggle. Every field is
  optional and never gates access to anything else in the app.
- **Call script generator** — on each university's detail page, generates
  an editable phone script from your grades/status/course, saved per
  university once you're signed in.
- **Scraper** (`scripts/scrape/`) — TypeScript + Playwright, one parser per
  university (Warwick, Sheffield, Leeds so far — see "Scraper" below).
  Respects `robots.txt`, rate-limits requests, and falls back to a verified
  hotline number + `manual_fallback` status when a page can't be parsed
  (e.g. Clearing hasn't opened yet, or has already closed for the cycle).
- **Auth** — Supabase email/password, nothing to do with UCAS. There is no
  UCAS API integration anywhere in this app.

## Setup

1. Create a Supabase project at [supabase.com](https://supabase.com).
2. Copy `.env.local.example` to `.env.local` and fill in your project URL
   and anon key (Project Settings → API), plus a `SUPABASE_SERVICE_ROLE_KEY`
   if you want to run the scraper (server-side only, never exposed to the
   browser).
3. Run the migrations in `supabase/migrations/` against your project, in
   order (SQL Editor, or the Supabase CLI/MCP).
4. Optionally run the seed in `supabase/seed/` to populate the top 15 UK
   universities by QS ranking.
5. Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scraper

```bash
npm run scrape              # all universities with a parser
npm run scrape warwick      # just one
```

Each university gets its own parser under `scripts/scrape/parsers/` —
budget real time per site rather than writing one generic scraper (Clearing
pages vary a lot, and several render vacancies via JS). If a parser can't
find a live course listing, the university falls back to its hotline number
+ a direct link to their own Clearing search tool, flagged
`scrape_status: 'manual_fallback'` — this is the expected, correct state
outside of the ~2-week Clearing window each August, not a bug.

## Testing

```bash
npm run test     # vitest — matching, call script, and phone-number logic
npm run lint
npm run build
```

## Project structure

- `src/app` — routes (App Router)
- `src/components` — shared UI primitives (`ui.tsx`) and the site header
- `src/lib/supabase` — Supabase client (browser + server), DB types, and
  the session helpers (`verifySession`/`getOptionalSession`)
- `src/lib/matching.ts`, `callScript.ts`, `tel.ts` — pure, unit-tested logic
  for grade matching, course ranking, and script generation
- `supabase/migrations` — SQL schema (`universities`, `courses`,
  `profiles`, `call_scripts`), all RLS-protected
- `scripts/scrape` — the Playwright scraper

## Notes

- `ucas_status` on `profiles` is a manual toggle set by the user — there is
  no UCAS API integration, and it never gates access to any feature.
- `universities`/`courses` are public-read; writes are expected to come
  from the scraper via the Supabase service role key, not the anon key.
- RLS on `profiles` and `call_scripts` scopes every policy to
  `auth.uid() = user_id`, with both `USING` and `WITH CHECK` on updates so a
  row's ownership can't be reassigned.
