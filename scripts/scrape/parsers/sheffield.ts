import type { Parser, ScrapedCourse, ScrapeResult } from "../lib/types";
import { extractPhoneNearKeyword } from "../lib/phone";

const PHONE_PATTERN = /\+44\s?114\s?\d{3}\s?\d{4}/;

/**
 * As of 2026-08-10, Sheffield's /clearing page is a pre-results-day landing
 * page with no course listing yet — Sheffield's own copy says vacancies go
 * live "from 8am on Thursday 13 August" at this same URL. This parser looks
 * for a plausible course-listing region and falls back gracefully if the
 * post-results-day markup doesn't match. RE-VERIFY the selector against live
 * markup once Clearing opens on 2026-08-13.
 */
export const sheffieldParser: Parser = {
  universityName: "University of Sheffield",
  clearingUrl: "https://www.sheffield.ac.uk/clearing",
  fallbackPhone: "+44 114 212 9900",
  websiteUrl: "https://www.sheffield.ac.uk/clearing",

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
