import { describe, it, expect } from "vitest";

const WEDDING_DATE = new Date("2026-07-08T00:00:00+03:00");

function getTimeLeft(now: Date) {
  const diff = WEDDING_DATE.getTime() - now.getTime();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

describe("getTimeLeft", () => {
  it("returns zeros when date has passed", () => {
    const after = new Date("2026-07-09T00:00:00+03:00");
    expect(getTimeLeft(after)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });

  it("returns correct days before the wedding", () => {
    const oneDayBefore = new Date("2026-07-07T00:00:00+03:00");
    const result = getTimeLeft(oneDayBefore);
    expect(result.days).toBe(1);
    expect(result.hours).toBe(0);
    expect(result.minutes).toBe(0);
    expect(result.seconds).toBe(0);
  });

  it("all fields are non-negative integers", () => {
    const before = new Date("2026-01-01T00:00:00+03:00");
    const result = getTimeLeft(before);
    for (const val of Object.values(result)) {
      expect(val).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(val)).toBe(true);
    }
  });
});
