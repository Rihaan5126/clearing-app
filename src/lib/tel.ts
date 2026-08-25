/**
 * Converts a human-formatted phone number (as stored, e.g. from the DB) into
 * a dial-able `tel:` href. UK numbers are stored in international format
 * with the trunk code in parens, e.g. "+44 (0)2476 533 544" — when dialing
 * internationally you drop that leading 0, so "(0)" is stripped entirely
 * rather than kept as a literal 0. Everything else that isn't a digit or a
 * leading "+" (spaces, remaining parens, dashes) is also stripped.
 */
export function toTelHref(phone: string): string {
  const withoutTrunkZero = phone.replace(/\(0\)/g, "");
  return withoutTrunkZero.replace(/[^\d+]/g, "");
}
