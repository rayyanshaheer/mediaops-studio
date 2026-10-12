import { RECIPES } from "./recipes";

export type AggregateInput = {
  hasSource: boolean;
  generation: number;
  variants: Array<{ generation: number; recipeKey: string; status: "PENDING" | "READY" | "FAILED" }>;
};

export function aggregateStatus(input: AggregateInput) {
  if (!input.hasSource) return "PROCESSING" as const;
  const current = input.variants.filter((variant) => variant.generation === input.generation);
  if (current.some((variant) => variant.status === "FAILED")) return "FAILED" as const;
  const ready = new Set(current.filter((variant) => variant.status === "READY").map((variant) => variant.recipeKey));
  return RECIPES.every((recipe) => ready.has(recipe.key)) ? "READY" as const : "PROCESSING" as const;
}

export function safePublicIdPart(value: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(value)) throw new Error("Unsafe public ID segment");
  return value;
}

export function byteSavings(source: bigint | number | null, delivered: bigint | number | null) {
  if (!source || !delivered || Number(source) <= 0) return null;
  return Math.max(0, Math.round((1 - Number(delivered) / Number(source)) * 100));
}

export function aggregateByteSavings(source: bigint | number | null, outputs: Array<bigint | number | null>) {
  const comparable = outputs.filter((value): value is bigint | number => value != null);
  if (!source || Number(source) <= 0 || comparable.length === 0) return null;
  const baseline = Number(source) * comparable.length;
  const delivered = comparable.reduce<number>((sum, value) => sum + Number(value), 0);
  return Math.max(0, Math.round((1 - delivered / baseline) * 100));
}
