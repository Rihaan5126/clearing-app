import { describe, expect, it } from "vitest";
import { toTelHref } from "./tel";

describe("toTelHref", () => {
  it("drops the parenthesised UK trunk zero rather than keeping it literally", () => {
    // Verified Warwick Clearing fallback number.
    expect(toTelHref("+44 (0)2476 533 544")).toBe("+442476533544");
  });

  it("strips spaces from a number with no trunk-zero parens", () => {
    // Verified Sheffield Clearing fallback number.
    expect(toTelHref("+44 114 212 9900")).toBe("+441142129900");
  });

  it("strips dashes", () => {
    expect(toTelHref("+44-114-212-9900")).toBe("+441142129900");
  });

  it("keeps a leading plus but drops everything else non-numeric", () => {
    expect(toTelHref("+44 (0)20 7946 0958")).toBe("+442079460958");
  });
});
