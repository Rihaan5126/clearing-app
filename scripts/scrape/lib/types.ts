import type { Page } from "playwright";
import type { VacancyStatus } from "../../../src/lib/supabase/types";

export interface ScrapedCourse {
  name: string;
  subjectArea: string | null;
  entryRequirements: string | null;
  vacancyStatus: VacancyStatus;
}

export interface ScrapeResult {
  clearingPhone: string | null;
  courses: ScrapedCourse[];
  /** false when the parser couldn't confidently find a course listing */
  ok: boolean;
}

export interface Parser {
  universityName: string;
  clearingUrl: string;
  /** Verified from the university's own site, used when the parser can't find live data. */
  fallbackPhone: string | null;
  websiteUrl: string;
  run(page: Page): Promise<ScrapeResult>;
}
