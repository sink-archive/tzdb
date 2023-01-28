// source: https://github.com/yellowsink/shelter-plugins/blob/master/plugins/timezones/timezones.js

import type { AccountNoId, TimezoneResponse } from "./types";

export const tzsByOffset = {
  [-9]: ["AKST"],
  [-8]: ["PST"],
  [-7]: ["MST"],
  [-6]: ["CT", "CST"],
  [-5]: ["ET", "EST"],
  [-4]: ["EDT"],
  [-3]: ["AMST", "ART", "BRT", "SRT", "UYT", "WGT"],
  [-2]: ["FNT", "PMDT"],
  [-1]: ["AZOT", "CVT", "EGT"],
  0: ["UTC", "GMT", "WET"],
  1: ["CET", "MET", "WAT"],
  2: ["CAT", "EET", "KALT", "SAST", "WAST"],
  3: ["AST", "EAT", "FET", "IOT", "MSK", "TRT"],
  4: ["RET", "AMT"],
  5: ["MVT", "PKT", "TJT", "TMT", "UZT"],
  5.5: ["IST"],
  7: ["THA", "WIB"],
  8: ["AWST", "CST", "HKT", "MST", "MYT", "SGT", "WST"],
  9: ["JST", "KST"],
  9.5: ["ACST"],
  10: ["AEST", "AET", "VLAT"],
  12: ["NZST"],
} as const;

export type Timezone = (typeof tzKeywords)[0];

export const tzKeywords = Object.values(tzsByOffset).flat();

export const tzOffsetsByKey = Object.fromEntries(
  Object.entries(tzsByOffset).flatMap(([oset, tzs]) =>
    tzs.map((t) => [t, parseFloat(oset)])
  )
) as Record<Timezone, number>;

/* const tzRegex = new RegExp(
  `(${tzKeywords.join("|")})(?:([+-]\\d+)(?::(\\d+))?)?`
);

export const findTimeZone = (txt) => {
  if (!txt) return;
  const match = txt.match(tzRegex);
  if (!match) return;
  const [, keyword, hours, minutes] = match;

  return (
    tzOffsetsByKey[keyword] +
    parseFloat(hours ?? 0) +
    parseFloat(minutes ?? 0) / 60
  );
}; */

export const createTimezoneResponse = (acct: AccountNoId): TimezoneResponse => ({
  origin: acct.origin,
  offset: acct.offset,
  utcOffset: tzOffsetsByKey[acct.origin] + acct.offset
});

export const isValidTimezone = (tz: string): tz is Timezone => tzKeywords.includes(tz as Timezone);