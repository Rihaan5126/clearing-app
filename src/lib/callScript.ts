import type { GradeEntry, UcasStatus } from "./supabase/types";

export interface CallScriptInput {
  studentName?: string;
  grades: GradeEntry[];
  ucasStatus: UcasStatus;
  universityName: string;
  courseName: string;
  whyThisUni?: string;
  backupCourseName?: string;
}

function ucasStatusLine(status: UcasStatus): string {
  switch (status) {
    case "confirmed_firm":
      return "I currently hold a confirmed firm place elsewhere but I'm exploring other options.";
    case "confirmed_insurance":
      return "I currently hold a confirmed insurance place elsewhere but I'm exploring other options.";
    case "self_releasing":
      return "I've self-released from my previous offer so I'm applying fresh through Clearing.";
    case "waiting":
      return "I'm still waiting to hear back on my original applications, but wanted to explore this option too.";
    case "not_confirmed":
    default:
      return "I don't have a confirmed place yet and I'm exploring my options through Clearing.";
  }
}

/**
 * Deterministic template, not an LLM call — same input always produces the
 * same script, which matters for "regenerate" to feel predictable and for
 * this to work with zero external API dependency.
 */
export function generateCallScript(input: CallScriptInput): string {
  const name = input.studentName?.trim() || "[Your name]";
  const gradesLine = input.grades.length
    ? input.grades.map((g) => `${g.subject}: ${g.grade}`).join(", ")
    : "[your grades]";

  return [
    `Hi, my name is ${name} and I'm calling about Clearing.`,
    `I achieved ${gradesLine}.`,
    `I'd like to ask about ${input.courseName} at ${input.universityName}${
      input.whyThisUni ? ` — ${input.whyThisUni}` : "."
    }`,
    ucasStatusLine(input.ucasStatus),
    input.backupCourseName
      ? `If that course is full, are there any places on ${input.backupCourseName}?`
      : `If that course is full, do you have any similar courses with places available?`,
    `Could you tell me what the next steps are if there's a place available?`,
  ].join("\n\n");
}
