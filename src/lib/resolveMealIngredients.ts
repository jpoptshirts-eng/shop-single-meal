import {
  findMealRecipeForLine,
  MEAL_RECIPES,
  type MealRecipe,
  type RecipeIngredient,
} from '../data/mealRecipes'
import {
  findWaitroseRecipeReference,
  type WaitroseRecipeReference,
} from '../data/waitroseRecipeReferences'

export type ResolvedMealIngredients = {
  status: 'resolved'
  mealName: string
  recipe: MealRecipe
  ingredients: RecipeIngredient[]
  /** Waitrose recipe page when resolved from the recipe-reference registry. */
  sourceUrl?: string
}

export type UnresolvedMealIngredients = {
  status: 'unresolved'
  mealName: string
  reason: 'no-recipe'
}

export type MealIngredientResolution = ResolvedMealIngredients | UnresolvedMealIngredients

function normalizeMealKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\u2019\u2018']/g, "'")
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function waitroseRefToMealRecipe(ref: WaitroseRecipeReference): MealRecipe {
  return {
    id: ref.id,
    chipLabel: ref.chipLabel,
    fullName: ref.canonicalName,
    cuisine: ref.cuisine,
    ingredients: ref.ingredients,
    methodUrl: ref.sourceUrl,
  }
}

function toResolved(
  recipe: MealRecipe,
  sourceUrl?: string,
): ResolvedMealIngredients {
  return {
    status: 'resolved',
    mealName: recipe.fullName,
    recipe,
    ingredients: recipe.ingredients,
    sourceUrl: sourceUrl ?? recipe.methodUrl,
  }
}

/**
 * Meal title → Waitrose recipe reference → canonical ingredient requirements.
 * POPMAS must not be queried until this returns a resolved ingredient list.
 */
export function resolveMealIngredients(mealName: string): MealIngredientResolution {
  const trimmed = mealName.trim()
  if (!trimmed) {
    return { status: 'unresolved', mealName: '', reason: 'no-recipe' }
  }

  // 1) Preferred: Waitrose recipe-reference registry
  const waitrose = findWaitroseRecipeReference(trimmed)
  if (waitrose && waitrose.ingredients.length > 0) {
    return toResolved(waitroseRefToMealRecipe(waitrose), waitrose.sourceUrl)
  }

  // 2) Existing curated meal recipe templates
  const fromExact = findMealRecipeForLine(trimmed)
  if (fromExact && fromExact.ingredients.length > 0) {
    return toResolved(fromExact)
  }

  // 3) Fuzzy match against local templates
  const key = normalizeMealKey(trimmed)
  for (const recipe of MEAL_RECIPES) {
    const chip = normalizeMealKey(recipe.chipLabel)
    const full = normalizeMealKey(recipe.fullName)
    if (key === chip || key === full) return toResolved(recipe)
    if (key.length >= 8 && (chip.includes(key) || full.includes(key) || key.includes(chip))) {
      if (recipe.ingredients.length > 0) return toResolved(recipe)
    }
  }

  return { status: 'unresolved', mealName: trimmed, reason: 'no-recipe' }
}

/** Explicit recipe-first API name. */
export function resolveMealRecipe(mealName: string): MealIngredientResolution {
  return resolveMealIngredients(mealName)
}

export const UNRESOLVED_MEAL_MESSAGE =
  "We couldn't identify enough ingredients for this meal yet."

export function formatIngredientNeedLabel(ingredientName: string): string {
  return ingredientName
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
