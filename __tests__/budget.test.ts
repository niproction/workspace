import { describe, it, expect } from "vitest";
import { calcTotals, calcCategoryTotals } from "@/components/admin/BudgetClient";

const makeItem = (planned: number, actual: number, paid: boolean) => ({
  id: 1,
  categoryId: 1,
  description: "test",
  planned,
  actual,
  paid,
  notes: "",
});

const makeCategory = (items: ReturnType<typeof makeItem>[]) => ({
  id: 1,
  name: "cat",
  sortOrder: 0,
  items,
});

describe("calcCategoryTotals", () => {
  it("sums planned and actual", () => {
    const items = [makeItem(100, 80, false), makeItem(200, 250, true)];
    expect(calcCategoryTotals(items)).toEqual({ planned: 300, actual: 330 });
  });

  it("returns zeros for empty items", () => {
    expect(calcCategoryTotals([])).toEqual({ planned: 0, actual: 0 });
  });
});

describe("calcTotals", () => {
  it("sums across all categories", () => {
    const cats = [
      makeCategory([makeItem(100, 90, true), makeItem(50, 60, false)]),
      makeCategory([makeItem(200, 200, true)]),
    ];
    const result = calcTotals(cats);
    expect(result.planned).toBe(350);
    expect(result.actual).toBe(350);
    expect(result.paid).toBe(290); // 90 + 200
  });

  it("returns zeros for no categories", () => {
    expect(calcTotals([])).toEqual({ planned: 0, actual: 0, paid: 0 });
  });

  it("only counts paid items in paid total", () => {
    const cats = [makeCategory([makeItem(100, 80, false), makeItem(100, 120, true)])];
    expect(calcTotals(cats).paid).toBe(120);
  });
});
