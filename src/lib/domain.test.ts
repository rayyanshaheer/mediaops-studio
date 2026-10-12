import { describe, expect, it } from "vitest";
import { aggregateByteSavings, aggregateStatus, byteSavings, safePublicIdPart } from "./domain";
import { RECIPES, transformationFor } from "./recipes";

describe("release domain", () => {
  it("requires every current-generation recipe", () => {
    const variants = RECIPES.map((recipe) => ({ generation: 2, recipeKey: recipe.key, status: "READY" as const }));
    expect(aggregateStatus({ hasSource: true, generation: 2, variants })).toBe("READY");
    expect(aggregateStatus({ hasSource: true, generation: 2, variants: variants.slice(1) })).toBe("PROCESSING");
  });
  it("does not let a stale generation complete a release", () => {
    const variants = RECIPES.map((recipe) => ({ generation: 1, recipeKey: recipe.key, status: "READY" as const }));
    expect(aggregateStatus({ hasSource: true, generation: 2, variants })).toBe("PROCESSING");
  });
  it("gives failures priority", () => {
    expect(aggregateStatus({ hasSource: true, generation: 1, variants: [{ generation: 1, recipeKey: "instagram-square", status: "FAILED" }] })).toBe("FAILED");
  });
  it("guards public IDs and calculates savings", () => {
    expect(safePublicIdPart("safe_id-2")).toBe("safe_id-2");
    expect(() => safePublicIdPart("../unsafe")).toThrow();
    expect(byteSavings(1000, 250)).toBe(75);
    expect(byteSavings(0, 2)).toBeNull();
  });
  it("keeps fixed downloads explicit jpgs", () => {
    for (const recipe of RECIPES) expect(transformationFor(recipe)).toContain(`/f_jpg,q_85`);
  });
  it("calculates comparable package savings", () => {
    expect(aggregateByteSavings(1000, [200, 300, null])).toBe(75);
    expect(aggregateByteSavings(0, [200])).toBeNull();
    expect(aggregateByteSavings(1000, [])).toBeNull();
  });
});
