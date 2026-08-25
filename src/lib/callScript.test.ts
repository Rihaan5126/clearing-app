import { describe, expect, it } from "vitest";
import { generateCallScript, type CallScriptInput } from "./callScript";
import type { UcasStatus } from "./supabase/types";

function baseInput(overrides: Partial<CallScriptInput> = {}): CallScriptInput {
  return {
    grades: [
      { subject: "Maths", grade: "A" },
      { subject: "Physics", grade: "B" },
    ],
    ucasStatus: "not_confirmed",
    universityName: "University of Warwick",
    courseName: "Physics BSc",
    ...overrides,
  };
}

describe("generateCallScript", () => {
  it("uses a placeholder when no student name is given", () => {
    const script = generateCallScript(baseInput());
    expect(script).toContain("my name is [Your name]");
  });

  it("uses the trimmed student name when given", () => {
    const script = generateCallScript(baseInput({ studentName: "  Alex  " }));
    expect(script).toContain("my name is Alex");
  });

  it("formats multiple grades as subject: grade pairs", () => {
    const script = generateCallScript(baseInput());
    expect(script).toContain("Maths: A, Physics: B");
  });

  it("falls back to a placeholder when there are no grades yet", () => {
    const script = generateCallScript(baseInput({ grades: [] }));
    expect(script).toContain("I achieved [your grades].");
  });

  it("asks about a named backup course when one is given", () => {
    const script = generateCallScript(baseInput({ backupCourseName: "Mathematics BSc" }));
    expect(script).toContain("are there any places on Mathematics BSc?");
  });

  it("falls back to a generic fallback ask when no backup course is given", () => {
    const script = generateCallScript(baseInput());
    expect(script).toContain("do you have any similar courses with places available?");
  });

  it("includes the whyThisUni line when given", () => {
    const script = generateCallScript(baseInput({ whyThisUni: "your labs are excellent" }));
    expect(script).toContain("Physics BSc at University of Warwick — your labs are excellent");
  });

  it("produces one distinct line per UcasStatus value", () => {
    const statuses: UcasStatus[] = [
      "confirmed_firm",
      "confirmed_insurance",
      "not_confirmed",
      "self_releasing",
      "waiting",
    ];
    const lines = statuses.map((ucasStatus) => generateCallScript(baseInput({ ucasStatus })));
    expect(new Set(lines).size).toBe(statuses.length);
  });

  it("is deterministic for identical input", () => {
    const input = baseInput({ studentName: "Alex", backupCourseName: "Mathematics BSc" });
    expect(generateCallScript(input)).toBe(generateCallScript(input));
  });
});
