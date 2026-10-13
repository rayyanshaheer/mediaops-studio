export type ReleaseRecipe = {
  key: string;
  label: string;
  version: number;
  width: number;
  height: number;
  crop: "fill";
  gravity: "auto";
  format: "jpg";
  quality: number;
};

export const RECIPES = [
  { key: "instagram-square", label: "Instagram square", version: 1, width: 1080, height: 1080, crop: "fill", gravity: "auto", format: "jpg", quality: 85 },
  { key: "instagram-portrait", label: "Instagram portrait", version: 1, width: 1080, height: 1350, crop: "fill", gravity: "auto", format: "jpg", quality: 85 },
  { key: "linkedin-landscape", label: "LinkedIn landscape", version: 1, width: 1200, height: 627, crop: "fill", gravity: "auto", format: "jpg", quality: 85 },
  { key: "story-vertical", label: "Story vertical", version: 1, width: 1080, height: 1920, crop: "fill", gravity: "auto", format: "jpg", quality: 85 },
] as const satisfies readonly ReleaseRecipe[];

export type RecipeKey = (typeof RECIPES)[number]["key"];

export function transformationFor(recipe: ReleaseRecipe, logoPublicId?: string | null) {
  const base = `c_${recipe.crop},g_${recipe.gravity},h_${recipe.height},w_${recipe.width}`;
  const overlay = logoPublicId
    ? `/l_${logoPublicId.replaceAll("/", ":")}/c_scale,fl_relative,w_0.16/fl_layer_apply,g_south_east,x_48,y_48`
    : "";
  return `${base}${overlay}/f_${recipe.format},q_${recipe.quality}`;
}

export function recipeFromTransformation(value: string) {
  return RECIPES.find((recipe) => value.includes(`h_${recipe.height}`) && value.includes(`w_${recipe.width}`));
}
