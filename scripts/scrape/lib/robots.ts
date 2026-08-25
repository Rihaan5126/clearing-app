/**
 * Minimal robots.txt check: only handles a single wildcard (User-agent: *)
 * block and plain-prefix Disallow rules (no wildcard/$ matching, no Allow
 * overrides). Each target site's robots.txt was already reviewed by hand
 * before it was added as a scrape target; this is a runtime safety net in
 * case a site's rules change, not the sole compliance check.
 */
const disallowCache = new Map<string, string[]>();

export async function isAllowedByRobots(targetUrl: string): Promise<boolean> {
  const url = new URL(targetUrl);
  let disallows = disallowCache.get(url.origin);

  if (!disallows) {
    disallows = [];
    try {
      const res = await fetch(`${url.origin}/robots.txt`);
      if (res.ok) {
        disallows = parseWildcardDisallows(await res.text());
      }
    } catch {
      // Unreachable robots.txt: fail open, matching how most crawlers behave
      // for a missing/unreachable file.
    }
    disallowCache.set(url.origin, disallows);
  }

  return !disallows.some((rule) => rule.length > 0 && url.pathname.startsWith(rule));
}

function parseWildcardDisallows(robotsTxt: string): string[] {
  const disallows: string[] = [];
  let inWildcardBlock = false;

  for (const rawLine of robotsTxt.split("\n")) {
    const line = rawLine.trim();
    if (/^user-agent:\s*\*/i.test(line)) {
      inWildcardBlock = true;
      continue;
    }
    if (/^user-agent:/i.test(line)) {
      inWildcardBlock = false;
      continue;
    }
    if (inWildcardBlock) {
      const match = line.match(/^disallow:\s*(.*)$/i);
      if (match) disallows.push(match[1].trim());
    }
  }

  return disallows;
}
