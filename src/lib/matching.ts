import type { Course, GradeEntry, Profile, University } from "./supabase/types";

export type GradeMatchLevel = "meets" | "possible" | "unclear" | "no_data";

// Only matches a grade-letter run when it isn't itself sandwiched inside a
// longer word — otherwise "Contact admissions" reads as grades C, A, D, A
// (stray A-E letters inside ordinary words), which is wrong.
const GRADE_RUN_RE = /(?<![A-Za-z])(?:A\*|[A-E])+(?![A-Za-z])/g;
const GRADE_TOKEN_RE = /A\*|[A-E]/g;
const GRADE_RANK: Record<string, number> = { "A*": 6, A: 5, B: 4, C: 3, D: 2, E: 1 };

/** Extracts A-level-style grade letters (A*, A-E) from free text, in order. */
export function extractGradeLetters(text: string): string[] {
  const runs = text.toUpperCase().match(GRADE_RUN_RE) ?? [];
  return runs.flatMap((run) => run.match(GRADE_TOKEN_RE) ?? []);
}

/**
 * A deliberately simple heuristic, not real UCAS tariff-point matching:
 * compares how many grade letters the student has against how many the
 * entry requirements text seems to ask for, best-grades-first. Good enough
 * to sort a list, not a guarantee of eligibility.
 */
export function assessGradeMatch(
  studentGrades: GradeEntry[],
  entryRequirements: string | null
): GradeMatchLevel {
  if (!entryRequirements?.trim()) return "no_data";

  const required = extractGradeLetters(entryRequirements);
  if (required.length === 0 || studentGrades.length === 0) return "unclear";

  const rank = (letter: string) => GRADE_RANK[letter] ?? 0;
  const studentLetters = studentGrades
    .map((g) => extractGradeLetters(g.grade)[0])
    .filter((l): l is string => Boolean(l))
    .sort((a, b) => rank(b) - rank(a));
  const requiredSorted = [...required].sort((a, b) => rank(b) - rank(a));

  if (studentLetters.length < requiredSorted.length) return "possible";

  const meets = requiredSorted.every((req, i) => rank(studentLetters[i]) >= rank(req));
  return meets ? "meets" : "possible";
}

export interface CourseWithUniversity extends Course {
  university: University;
}

export interface MatchResult {
  course: Course;
  university: University;
  tier: "top_pick" | "other";
  gradeMatch: GradeMatchLevel;
}

const VACANCY_RANK: Record<Course["vacancy_status"], number> = { open: 2, unclear: 1, closed: 0 };
const GRADE_MATCH_RANK: Record<GradeMatchLevel, number> = {
  meets: 3,
  possible: 2,
  unclear: 1,
  no_data: 0,
};

/**
 * Ranks courses for a profile: the student's top 3 target universities
 * first, then everything else; within each tier, open vacancies before
 * unclear before closed, then by grade match strength. `backup_courses`
 * is free-text notes (not structured references) and is intentionally
 * never matched here — render it as a separate literal list instead.
 */
export function rankCourses(
  courses: CourseWithUniversity[],
  profile: Profile | null
): MatchResult[] {
  const topIds = new Set(profile?.top_3_universities ?? []);
  const grades = profile?.grades ?? [];

  return courses
    .map(
      (c): MatchResult => ({
        course: c,
        university: c.university,
        tier: topIds.has(c.university_id) ? "top_pick" : "other",
        gradeMatch: assessGradeMatch(grades, c.entry_requirements),
      })
    )
    .sort((a, b) => {
      if (a.tier !== b.tier) return a.tier === "top_pick" ? -1 : 1;
      const vacancyDiff = VACANCY_RANK[b.course.vacancy_status] - VACANCY_RANK[a.course.vacancy_status];
      if (vacancyDiff !== 0) return vacancyDiff;
      return GRADE_MATCH_RANK[b.gradeMatch] - GRADE_MATCH_RANK[a.gradeMatch];
    });
}
