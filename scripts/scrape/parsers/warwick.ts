import type { Parser, ScrapedCourse, ScrapeResult } from "../lib/types";
import { extractPhoneNearKeyword } from "../lib/phone";

const PHONE_PATTERN = /\+44\s?\(0\)\d{4}\s?\d{3}\s?\d{3}/;

/**
 * As of 2026-08-10 (3 days before A-level results day, when Clearing
 * vacancies go live), Warwick's "Courses in Clearing" tab renders an empty
 * state — there is no real course markup to build selectors against yet.
 * This parser extracts the hotline number (already visible pre-results-day)
 * and searches the tabpanel for a plausible repeating course-row pattern.
 * If results day markup doesn't match, it falls back gracefully rather than
 * emit guessed data. RE-VERIFY the row selector against live markup once
 * Clearing opens on 2026-08-13.
 */
export const warwickParser: Parser = {
  universityName: "University of Warwick",
  clearingUrl: "https://warwick.ac.uk/study/results/clearing/",
  fallbackPhone: "+44 (0)2476 533 544",
  websiteUrl: "https://warwick.ac.uk/study/results/clearing",

  async run(page): Promise<ScrapeResult> {
    const bodyText = await page.locator("body").innerText();
    const clearingPhone = extractPhoneNearKeyword(bodyText, PHONE_PATTERN);

    const tabpanel = page.getByRole("tabpanel", { name: "Courses in Clearing" });
    const courses: ScrapedCourse[] = [];

    if (await tabpanel.count()) {
      const rows = tabpanel.locator("table tbody tr, li:has(a), [role='listitem']");
      const rowCount = await rows.count();

      for (let i = 0; i < rowCount; i++) {
        const rowText = (await rows.nth(i).innerText()).trim();
        if (!rowText || rowText.length > 200) continue;

        const vacancyStatus = /\bfull\b|\bclosed\b/i.test(rowText)
          ? "closed"
          : /\bopen\b|places available/i.test(rowText)
            ? "open"
            : "unclear";

        courses.push({
          name: rowText.split("\n")[0].trim(),
          subjectArea: null,
          entryRequirements: null,
          vacancyStatus,
        });
      }
    }

    return { clearingPhone, courses, ok: courses.length > 0 };
  },
};
