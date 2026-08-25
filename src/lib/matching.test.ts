import { describe, expect, it } from "vitest";
import { assessGradeMatch, extractGradeLetters, rankCourses } from "./matching";
import type { Profile, University } from "./supabase/types";
import type { CourseWithUniversity } from "./matching";

describe("extractGradeLetters", () => {
  it("extracts plain grade letters", () => {
    expect(extractGradeLetters("AAB")).toEqual(["A", "A", "B"]);
  });

  it("extracts A* as a single unit, not A then *", () => {
    expect(extractGradeLetters("A*AA")).toEqual(["A*", "A", "A"]);
  });

  it("ignores surrounding descriptive text", () => {
    expect(extractGradeLetters("Typical offer: BBB including Maths")).toEqual(["B", "B", "B"]);
  });

  it("is case-insensitive", () => {
    expect(extractGradeLetters("aab")).toEqual(["A", "A", "B"]);
  });

  it("returns an empty array when there are no grade letters", () => {
    expect(extractGradeLetters("Contact admissions for details")).toEqual([]);
  });
});

describe("assessGradeMatch", () => {
  it("returns no_data for null entry requirements", () => {
    expect(assessGradeMatch([{ subject: "Maths", grade: "A" }], null)).toBe("no_data");
  });

  it("returns no_data for blank entry requirements", () => {
    expect(assessGradeMatch([{ subject: "Maths", grade: "A" }], "   ")).toBe("no_data");
  });

  it("returns unclear when the student has no grades yet", () => {
    expect(assessGradeMatch([], "AAB")).toBe("unclear");
  });

  it("returns unclear when requirements text has no parseable grade letters", () => {
    expect(assessGradeMatch([{ subject: "Maths", grade: "A" }], "Contact admissions")).toBe(
      "unclear"
    );
  });

  it("returns possible when the student has fewer subjects than required", () => {
    expect(assessGradeMatch([{ subject: "Maths", grade: "A" }], "AAB")).toBe("possible");
  });

  it("returns meets when every required grade is covered at or above rank", () => {
    const grades = [
      { subject: "Maths", grade: "A" },
      { subject: "Physics", grade: "A" },
      { subject: "Chemistry", grade: "B" },
    ];
    expect(assessGradeMatch(grades, "AAB")).toBe("meets");
  });

  it("returns meets when the student's grades exceed requirements", () => {
    const grades = [
      { subject: "Maths", grade: "A*" },
      { subject: "Physics", grade: "A" },
      { subject: "Chemistry", grade: "A" },
    ];
    expect(assessGradeMatch(grades, "AAB")).toBe("meets");
  });

  it("returns possible when the student's grades fall short", () => {
    const grades = [
      { subject: "Maths", grade: "B" },
      { subject: "Physics", grade: "C" },
      { subject: "Chemistry", grade: "C" },
    ];
    expect(assessGradeMatch(grades, "AAB")).toBe("possible");
  });
});

function makeUniversity(overrides: Partial<University>): University {
  return {
    id: "uni-default",
    name: "Default University",
    clearing_phone: null,
    website_url: null,
    last_scraped_at: null,
    scrape_status: "manual_fallback",
    ...overrides,
  };
}

function makeCourse(overrides: Partial<CourseWithUniversity>): CourseWithUniversity {
  const university = overrides.university ?? makeUniversity({ id: overrides.university_id });
  return {
    id: "course-default",
    university_id: university.id,
    name: "Default Course",
    subject_area: null,
    entry_requirements: null,
    vacancy_status: "unclear",
    last_seen_at: null,
    university,
    ...overrides,
  };
}

function makeProfile(overrides: Partial<Profile>): Profile {
  return {
    id: "profile-1",
    user_id: "user-1",
    grades: [],
    top_3_universities: [],
    backup_courses: [],
    ucas_status: "not_confirmed",
    ...overrides,
  };
}

describe("rankCourses", () => {
  it("sorts top_pick universities before others", () => {
    const uniA = makeUniversity({ id: "uni-a", name: "A" });
    const uniB = makeUniversity({ id: "uni-b", name: "B" });
    const courses = [
      makeCourse({ id: "c-b", university: uniB, university_id: "uni-b" }),
      makeCourse({ id: "c-a", university: uniA, university_id: "uni-a" }),
    ];
    const profile = makeProfile({ top_3_universities: ["uni-a"] });

    const result = rankCourses(courses, profile);

    expect(result[0].course.id).toBe("c-a");
    expect(result[0].tier).toBe("top_pick");
    expect(result[1].tier).toBe("other");
  });

  it("sorts open vacancies before unclear before closed within a tier", () => {
    const uni = makeUniversity({ id: "uni-a" });
    const courses = [
      makeCourse({ id: "closed", university: uni, university_id: "uni-a", vacancy_status: "closed" }),
      makeCourse({ id: "open", university: uni, university_id: "uni-a", vacancy_status: "open" }),
      makeCourse({ id: "unclear", university: uni, university_id: "uni-a", vacancy_status: "unclear" }),
    ];

    const result = rankCourses(courses, null);

    expect(result.map((r) => r.course.id)).toEqual(["open", "unclear", "closed"]);
  });

  it("sorts meets above possible above unclear above no_data when vacancy status ties", () => {
    const uni = makeUniversity({ id: "uni-a" });
    const grades = [
      { subject: "Maths", grade: "A" },
      { subject: "Physics", grade: "A" },
      { subject: "Chemistry", grade: "B" },
    ];
    const profile = makeProfile({ grades });
    const courses = [
      makeCourse({
        id: "no-data",
        university: uni,
        university_id: "uni-a",
        vacancy_status: "open",
        entry_requirements: null,
      }),
      makeCourse({
        id: "meets",
        university: uni,
        university_id: "uni-a",
        vacancy_status: "open",
        entry_requirements: "AAB",
      }),
      makeCourse({
        id: "possible",
        university: uni,
        university_id: "uni-a",
        vacancy_status: "open",
        entry_requirements: "A*A*A*",
      }),
    ];

    const result = rankCourses(courses, profile);

    expect(result.map((r) => r.course.id)).toEqual(["meets", "possible", "no-data"]);
  });

  it("treats a null profile as no personalization (everything tier 'other')", () => {
    const uni = makeUniversity({ id: "uni-a" });
    const courses = [makeCourse({ id: "c1", university: uni, university_id: "uni-a" })];

    const result = rankCourses(courses, null);

    expect(result[0].tier).toBe("other");
    expect(result[0].gradeMatch).toBe("no_data");
  });
});
