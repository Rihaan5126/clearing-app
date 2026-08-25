const CONTEXT_KEYWORDS = /helpline|hotline|clearing/i;

/**
 * Matches `pattern` only on lines that also mention "helpline"/"hotline"/
 * "clearing" — a bare phone-number regex over a whole page will happily
 * match an unrelated switchboard or department number.
 */
export function extractPhoneNearKeyword(bodyText: string, pattern: RegExp): string | null {
  for (const line of bodyText.split("\n")) {
    if (CONTEXT_KEYWORDS.test(line)) {
      const match = line.match(pattern);
      if (match) return match[0];
    }
  }
  return null;
}
