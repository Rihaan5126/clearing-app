export type UcasStatus =
  | "confirmed_firm"
  | "confirmed_insurance"
  | "not_confirmed"
  | "self_releasing"
  | "waiting";

export type VacancyStatus = "open" | "closed" | "unclear";

export type ScrapeStatus = "ok" | "manual_fallback";

export interface University {
  id: string;
  name: string;
  clearing_phone: string | null;
  website_url: string | null;
  last_scraped_at: string | null;
  scrape_status: ScrapeStatus;
}

export interface Course {
  id: string;
  university_id: string;
  name: string;
  subject_area: string | null;
  entry_requirements: string | null;
  vacancy_status: VacancyStatus;
  last_seen_at: string | null;
}

export interface GradeEntry {
  subject: string;
  grade: string;
}

export interface Profile {
  id: string;
  user_id: string;
  grades: GradeEntry[];
  top_3_universities: string[];
  backup_courses: string[];
  ucas_status: UcasStatus;
}
