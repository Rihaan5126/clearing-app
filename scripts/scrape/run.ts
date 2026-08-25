import { chromium } from "playwright";
import { db } from "./lib/db";
import { isAllowedByRobots } from "./lib/robots";
import type { Parser } from "./lib/types";
import { warwickParser } from "./parsers/warwick";
import { sheffieldParser } from "./parsers/sheffield";
import { leedsParser } from "./parsers/leeds";

// On-demand by design: this runs against whichever university slugs are
// passed on the CLI (i.e. the ones a user actually selected in their
// profile), not a blanket sweep of every seeded university.
const PARSERS: Record<string, Parser> = {
  warwick: warwickParser,
  sheffield: sheffieldParser,
  leeds: leedsParser,
};

const REQUEST_DELAY_MS = 3000;
const USER_AGENT = "ClearingHelperBot/0.1 (+https://github.com/; educational project)";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeOne(browser: import("playwright").Browser, slug: string, parser: Parser) {
  console.log(`\n[${slug}] checking robots.txt...`);
  const allowed = await isAllowedByRobots(parser.clearingUrl);
  if (!allowed) {
    console.warn(`[${slug}] disallowed by robots.txt, skipping: ${parser.clearingUrl}`);
    return;
  }

  const { data: uni, error: findError } = await db
    .from("universities")
    .select("id")
    .eq("name", parser.universityName)
    .single();

  if (findError || !uni) {
    console.error(`[${slug}] no matching row in universities for "${parser.universityName}" — seed it first`, findError);
    return;
  }

  const page = await browser.newPage({ userAgent: USER_AGENT });
  let result;
  try {
    console.log(`[${slug}] navigating to ${parser.clearingUrl}...`);
    await page.goto(parser.clearingUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    result = await parser.run(page);
  } catch (err) {
    console.error(`[${slug}] parse failed, falling back:`, err instanceof Error ? err.message : err);
    result = { clearingPhone: null, courses: [], ok: false };
  } finally {
    await page.close();
  }

  // Only trust a live-extracted phone number when the parser also found a
  // real course listing (i.e. the page is genuinely in its live Clearing
  // state). Otherwise a loose text match can pick up an unrelated number
  // (e.g. a general switchboard line) and silently overwrite a verified
  // one — prefer the hand-verified fallback in that case.
  const clearingPhone = result.ok ? (result.clearingPhone ?? parser.fallbackPhone) : parser.fallbackPhone;
  const scrapeStatus = result.ok ? "ok" : "manual_fallback";

  const { error: updateError } = await db
    .from("universities")
    .update({
      clearing_phone: clearingPhone,
      website_url: parser.websiteUrl,
      last_scraped_at: new Date().toISOString(),
      scrape_status: scrapeStatus,
    })
    .eq("id", uni.id);

  if (updateError) {
    console.error(`[${slug}] failed to update university row:`, updateError);
    return;
  }

  if (result.ok && result.courses.length > 0) {
    await db.from("courses").delete().eq("university_id", uni.id);
    const { error: insertError } = await db.from("courses").insert(
      result.courses.map((c) => ({
        university_id: uni.id,
        name: c.name,
        subject_area: c.subjectArea,
        entry_requirements: c.entryRequirements,
        vacancy_status: c.vacancyStatus,
        last_seen_at: new Date().toISOString(),
      }))
    );
    if (insertError) console.error(`[${slug}] failed to insert courses:`, insertError);
    else console.log(`[${slug}] wrote ${result.courses.length} course(s), phone=${clearingPhone ?? "none"}`);
  } else {
    console.log(`[${slug}] manual_fallback — no course list found yet, phone=${clearingPhone ?? "none"}`);
  }
}

async function main() {
  const requested = process.argv.slice(2);
  const slugs = requested.length > 0 ? requested : Object.keys(PARSERS);

  const unknown = slugs.filter((s) => !(s in PARSERS));
  if (unknown.length > 0) {
    console.error(`Unknown university slug(s): ${unknown.join(", ")}. Known: ${Object.keys(PARSERS).join(", ")}`);
    process.exit(1);
  }

  const browser = await chromium.launch({ headless: true });
  try {
    for (let i = 0; i < slugs.length; i++) {
      await scrapeOne(browser, slugs[i], PARSERS[slugs[i]]);
      if (i < slugs.length - 1) await sleep(REQUEST_DELAY_MS);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
