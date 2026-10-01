import { findMealRecipeForLine } from '../data/mealRecipes'
import { isLikelyMealLine, getShopListLinesFromUserInput } from './parseShopList'

/** Internal classification labels — not shown in the UI. */
export type MealInputKind =
  | 'single_meal'
  | 'multiple_meals'
  | 'ingredient_list'
  | 'unclear'

export type ClassifiedMealInput = {
  kind: MealInputKind
  /** Lines that should become meal titles (or ingredients when kind is ingredient_list). */
  lines: string[]
}

const DAY_PREFIX =
  /^(monday|tuesday|wednesday|thursday|friday|saturday|sunday|mon|tue|wed|thu|fri|sat|sun)\s*[–—\-:]\s*/iu

const QUANTITY_PREFIX =
  /^(\d+([.,]\d+)?\s*(g|kg|ml|l|oz|lb|tbsp|tsp|cups?|x)?|\d+\s*x\s*)/iu

/** Strong dish-structure signals (not exhaustive recipe titles). */
const DISH_STRUCTURE_SIGNALS = [
  'bowl',
  'burrito',
  'fajita',
  'taco',
  'burger',
  'fries',
  'chips',
  'curry',
  'risotto',
  'pasta',
  'lasagne',
  'lasagna',
  'casserole',
  'pie',
  'omelette',
  'omelet',
  'noodle',
  'noodles',
  'stir fry',
  'stir-fry',
  'salad',
  'soup',
  'stew',
  'roast',
  'pizza',
  'sandwich',
  'wrap',
  'kebab',
  'biryani',
  'paella',
  'ramen',
  'dhal',
  'dahl',
  'dal',
  'chilli',
  'chili',
  'bolognese',
  'carbonara',
  'pad thai',
  'padthai',
  'masala',
  'tikka',
  'korma',
  'mac and cheese',
  'macaroni',
  'sheet pan',
  'traybake',
  'tray bake',
  'with fries',
  'with chips',
  'with rice',
  'with vegetables',
  'with veg',
]

const PANTRY_WORDS = new Set([
  'onion',
  'onions',
  'carrot',
  'carrots',
  'garlic',
  'tomato',
  'tomatoes',
  'mince',
  'beef',
  'chicken',
  'pasta',
  'spaghetti',
  'rice',
  'parmesan',
  'cheese',
  'butter',
  'oil',
  'stock',
  'herbs',
  'pepper',
  'salt',
  'lemon',
  'cream',
  'milk',
  'flour',
  'potato',
  'potatoes',
  'celery',
  'mushroom',
  'mushrooms',
  'paneer',
  'olive',
])

function stripInvisibleAndTrim(text: string): string {
  return text
    .replace(/[\u200B-\u200D\uFEFF\u00AD\u200E\u200F\u202A-\u202E\u2060]/g, '')
    .replace(/\u00A0/g, ' ')
    .trim()
}

function stripDayPrefix(line: string): string {
  return stripInvisibleAndTrim(line.replace(DAY_PREFIX, ''))
}

/** Split a single segment on commas / semicolons / " and " without breaking "Salmon & veg". */
function splitConjunctions(segment: string): string[] {
  const raw = stripInvisibleAndTrim(segment)
  if (!raw) return []
  return raw
    .split(/\s*(?:,|;|\band\b)\s*/iu)
    .map((s) => stripInvisibleAndTrim(s))
    .filter((s) => s.length > 0)
}

/**
 * Expand free text into candidate lines for meal / ingredient classification.
 * Supports newlines, commas, semicolons, "and", and day-prefixed meal lists.
 */
export function extractCandidateLines(text: string): string[] {
  const raw = stripInvisibleAndTrim(text)
  if (!raw) return []

  const newlineParts = raw
    .split(/\n+/u)
    .map((line) => stripDayPrefix(line))
    .filter(Boolean)

  const expanded: string[] = []
  for (const part of newlineParts) {
    const pieces = splitConjunctions(part)
    if (pieces.length > 1) {
      expanded.push(...pieces)
    } else {
      expanded.push(part)
    }
  }

  // Deduplicate while preserving order
  const seen = new Set<string>()
  const out: string[] = []
  for (const line of expanded) {
    const key = line.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(line)
  }
  return out
}

function hasDishStructure(line: string): boolean {
  const lower = line.toLowerCase()
  if (DISH_STRUCTURE_SIGNALS.some((s) => lower.includes(s))) return true
  // "X with Y" dish phrasing (e.g. chicken burger with fries)
  if (/\bwith\b/.test(lower) && lower.split(/\s+/).filter(Boolean).length >= 3) return true
  return false
}

export function looksLikeIngredientLine(line: string): boolean {
  const t = stripInvisibleAndTrim(line)
  if (!t) return false
  // Meal / recipe titles are never ingredients — check before pantry heuristics.
  if (looksLikeMealLine(t)) return false
  if (QUANTITY_PREFIX.test(t)) return true
  if (hasDishStructure(t)) return false

  const words = t
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)

  // Single grocery noun / short pantry phrase only.
  if (words.length === 1 && PANTRY_WORDS.has(words[0])) return true
  if (words.length <= 3 && words.every((w) => PANTRY_WORDS.has(w) || /^\d/.test(w))) return true

  return false
}

export function looksLikeMealLine(line: string): boolean {
  const t = stripInvisibleAndTrim(line)
  if (!t) return false
  if (findMealRecipeForLine(t)) return true
  if (isLikelyMealLine(t)) return true
  if (hasDishStructure(t) && !QUANTITY_PREFIX.test(t)) return true
  return false
}

/**
 * Classify free-text (typed, pasted, or OCR) for Shop Single Meal generation.
 *
 * Shop Single Meal always creates exactly ONE meal per Create meal action.
 * Multiple recognised meal titles collapse to the first title only.
 *
 * Priority:
 * 1. one or more recognised meal titles → single meal (first title)
 * 2. ingredient list → one meal built from those ingredients
 * 3. unresolved / unclear
 */
export function classifyMealInput(text: string): ClassifiedMealInput {
  const safe = getShopListLinesFromUserInput(text)
  const candidates =
    safe.length > 0 ? extractCandidateLines(safe.join('\n')) : extractCandidateLines(text)

  if (candidates.length === 0) {
    return { kind: 'unclear', lines: [] }
  }

  const mealLines = candidates.filter(looksLikeMealLine)
  const ingredientLines = candidates.filter(looksLikeIngredientLine)

  // One or more meal titles → always a single meal (first title wins)
  if (mealLines.length >= 1) {
    return { kind: 'single_meal', lines: [mealLines[0]] }
  }

  // Single candidate line that is not clearly an ingredient → treat as meal title
  if (candidates.length === 1) {
    if (!looksLikeIngredientLine(candidates[0])) {
      return { kind: 'single_meal', lines: candidates }
    }
    return { kind: 'ingredient_list', lines: candidates }
  }

  // Ingredient-dominated list with no meal titles → one meal from ingredients
  if (ingredientLines.length >= 1) {
    return { kind: 'ingredient_list', lines: candidates }
  }

  // Multi-line phrase-like text without quantities → first line as one meal
  if (
    candidates.length >= 2 &&
    candidates.every((c) => c.split(/\s+/).filter(Boolean).length >= 2 && !QUANTITY_PREFIX.test(c))
  ) {
    return { kind: 'single_meal', lines: [candidates[0]] }
  }

  return { kind: 'unclear', lines: candidates }
}

/** Force any classification into a single-meal creation payload. */
export function coerceToSingleMealInput(classified: ClassifiedMealInput): ClassifiedMealInput {
  if (classified.kind === 'unclear' || classified.lines.length === 0) {
    return classified
  }
  if (classified.kind === 'ingredient_list') {
    return classified
  }
  // multiple_meals / single_meal → exactly one title
  return { kind: 'single_meal', lines: [classified.lines[0]] }
}

/**
 * Best-effort meal title from an ingredient list.
 * `Homemade meal` is ONLY appropriate for genuine ingredient lists
 * where no recipe title can be inferred — never for named dishes.
 */
export function inferMealTitleFromIngredients(lines: string[]): string {
  const hay = lines.join(' ').toLowerCase()
  if (/spaghetti|bolognese|mince/.test(hay) && /tomato|onion|garlic|pasta|spaghetti/.test(hay)) {
    return 'Spaghetti Bolognese'
  }
  if (/kidney\s*bean|chill?i/.test(hay) && /mince|beef|tomato/.test(hay)) {
    return 'Chilli Con Carne'
  }
  if (/pad\s*thai|rice\s*noodle/.test(hay) && /beansprout|peanut|tamarind/.test(hay)) {
    return 'Pad Thai'
  }
  if (/shepherd/.test(hay) || (/lamb/.test(hay) && /potato|pea/.test(hay))) {
    return "Shepherd's Pie"
  }
  if (/cottage/.test(hay) || (/beef/.test(hay) && /mince/.test(hay) && /potato/.test(hay))) {
    return 'Cottage Pie'
  }
  if (/salmon/.test(hay)) return 'Salmon with vegetables'
  if (/chicken/.test(hay) && /tikka|curry|masala/.test(hay)) return 'Chicken Tikka Masala'
  if (/lasagn[ae]/.test(hay)) return 'Vegetarian Lasagna'
  if (/casserole|stew|braising/.test(hay)) return 'Beef casserole'
  if (/carbonara|pancetta/.test(hay)) return 'Spaghetti Carbonara'
  if (/macaroni|mac\s*and\s*cheese/.test(hay)) return 'Mac and Cheese'
  return 'Homemade meal'
}
