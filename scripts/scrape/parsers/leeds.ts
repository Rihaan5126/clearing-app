import type { Parser, ScrapedCourse, ScrapeResult } from "../lib/types";
import { extractPhoneNearKeyword } from "../lib/phone";

const PHONE_PATTERN = /\+?44\s?\(?0\)?\d{3}\s?\d{3}\s?\d{4}/;

/**
 * As of 2026-08-10, Leeds explicitly states on leeds.ac.uk/clearing/doc/
 * prepare-for-clearing that they "publish [their] full list of undergraduate
 * Clearing vacancies and details of how to contact the call centre closer to
 * the time" (results day, 2026-08-13) — no phone number is published yet, so
 * there is no verified fallback number for Leeds (unlike Warwick/Sheffield).
 * Do not hardcode a number sourced from third-party aggregators here; it
 * cannot be confirmed against Leeds' own site pre-results-day. RE-VERIFY the
 * course-row selector against live markup once Clearing opens on 2026-08-13.
 */
export const leedsParser: Parser = {
  universityName: "University of Leeds",
  clearingUrl: "https://www.leeds.ac.uk/clearing/courses",
  fallbackPhone: null,
  websiteUrl: "https://www.leeds.ac.uk/clearing",

  async run(page): Promise<ScrapeResult> {
    const bodyText = await page.locator("body").innerText();
    const clearingPhone = extractPhoneNearKeyword(bodyText, PHONE_PATTERN);

    const courses: ScrapedCourse[] = [];
    const candidateContainers = page.locator(
      "[class*='course-list'], [class*='vacanc'], [data-course-list], main table"
    );

    if (await candidateContainers.count()) {
      const rows = candidateContainers.first().locator("tbody tr, li:has(a)");
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
