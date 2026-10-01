import type { RecipeIngredient } from '../data/mealRecipes'
import {
  aliasCanonicalIntent,
  inferCanonicalIntentFromProduct,
  normaliseCustomerInput,
} from './customerIntent'
import type { WaitroseCatalogItem } from './waitroseCatalog'

function norm(value: string): string {
  return normaliseCustomerInput(value)
}

function productHay(product: WaitroseCatalogItem): string {
  return norm(`${product.name} ${product.productType ?? ''} ${product.grouping ?? ''} ${product.popmasType ?? ''}`)
}

type IngredientRule = {
  match: (ingredientNorm: string) => boolean
  suitable: (product: WaitroseCatalogItem) => boolean
}

/** Complete prepared meals / meal kits — never use these as recipe ingredients. */
const READY_MEAL_HINTS = [
  'ready meal',
  'ready-meal',
  'meal kit',
  'meal for one',
  'meal for two',
  'microwave meal',
  'bigham',
  "bigham's",
  'cbigham',
  'cooks ingredients kit',
]

const COMPLETE_DISH_HINTS = [
  'spaghetti bolognese',
  'spag bol',
  'lasagne',
  'lasagna',
  'shepherd',
  'cottage pie',
  'carbonara',
  'macaroni cheese',
  'mac & cheese',
  'curry ready',
  'tikka masala meal',
]

const CANNED_PASTA_HINTS = ['heinz', 'hoops', 'alphabetti', 'canned pasta', 'tinned pasta']

function looksLikeReadyMeal(hay: string): boolean {
  if (READY_MEAL_HINTS.some((h) => hay.includes(h))) return true
  if (COMPLETE_DISH_HINTS.some((h) => hay.includes(h)) && (hay.includes('meal') || hay.includes('bake') || hay.includes('pack'))) {
    return true
  }
  // Named complete dish products (e.g. "CBighams Spaghetti Bolognese")
  if (/\bbolognese\b/.test(hay) && !hay.includes('sauce') && !hay.includes('pasta')) return true
  if (/\bbolognese\b/.test(hay) && (hay.includes('bigham') || hay.includes('ready') || hay.includes('microwave'))) {
    return true
  }
  return false
}

const INGREDIENT_RULES: IngredientRule[] = [
  {
    match: (i) => i === 'spaghetti' || i.includes('spaghetti pasta'),
    suitable: (p) => {
      const hay = productHay(p)
      if (!hay.includes('spaghetti')) return false
      if (looksLikeReadyMeal(hay)) return false
      if (CANNED_PASTA_HINTS.some((h) => hay.includes(h))) return false
      if (hay.includes('in tomato sauce') && hay.includes('tin')) return false
      if (hay.includes('bolognese') && !hay.includes('sauce')) return false
      return hay.includes('pasta') || hay.includes('dried') || hay.includes('free from') || hay.includes('spaghetti')
    },
  },
  {
    match: (i) => i.includes('italian herbs') || i === 'mixed herbs' || i === 'oregano',
    suitable: (p) => {
      const hay = productHay(p)
      if (hay.includes('sausage') || hay.includes('mozzarella') || hay.includes('torinesi')) return false
      if (looksLikeReadyMeal(hay)) return false
      return (
        hay.includes('mixed herb') ||
        hay.includes('dried herb') ||
        hay.includes('italian herb') ||
        hay.includes('oregano')
      )
    },
  },
  {
    match: (i) => i.includes('parmesan') || i.includes('parmigiano'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('torinesi') || hay.includes('breadstick') || hay.includes('sauce') || hay.includes('kiev')) {
        return false
      }
      return hay.includes('parmesan') || hay.includes('parmigiano') || hay.includes('reggiano')
    },
  },
  {
    match: (i) => i.includes('beef mince') || i.includes('minced beef'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('stock') || hay.includes('cube') || hay.includes('gravy') || hay.includes('pie')) return false
      return (hay.includes('beef') || hay.includes('british')) && (hay.includes('mince') || hay.includes('minced'))
    },
  },
  {
    match: (i) => i.includes('chopped tomatoes') || i === 'passata',
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('puree') || hay.includes('purée')) return false
      if (hay.includes('soup') || hay.includes('sauce pasta')) return false
      return (
        (hay.includes('chopped') && hay.includes('tomato')) ||
        hay.includes('passata') ||
        (hay.includes('plum') && hay.includes('tomato'))
      )
    },
  },
  {
    match: (i) => i.includes('tomato puree') || i.includes('tomato purée'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      return hay.includes('puree') || hay.includes('purée') || (hay.includes('tomato') && hay.includes('concentrate'))
    },
  },
  {
    match: (i) => i === 'onion' || i === 'onions' || i.includes('yellow onion') || i.includes('brown onion'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('powder') || hay.includes('ring') || hay.includes('bhaji') || hay.includes('chutney')) return false
      if (hay.includes('spring onion') || hay.includes('salad onion')) return false
      return /\bonions?\b/.test(hay) || hay.includes('shallot')
    },
  },
  {
    match: (i) => i === 'garlic' || i.includes('garlic clove') || i.includes('garlic bulb'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('bread') || hay.includes('sauce') || hay.includes('mayo') || hay.includes('baguette')) return false
      if (hay.includes('mushroom') && hay.includes('garlic')) return false
      return hay.includes('garlic') && (hay.includes('bulb') || hay.includes('clove') || hay.includes('loose') || !hay.includes('butter'))
    },
  },
  {
    match: (i) => i.includes('carrot'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('cake') || hay.includes('juice') || hay.includes('soup')) return false
      return hay.includes('carrot')
    },
  },
  {
    match: (i) => i.includes('black bean'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('sauce') || hay.includes('stir fry') || hay.includes('stir-fry')) return false
      return hay.includes('black') && hay.includes('bean')
    },
  },
  {
    match: (i) => i === 'rice' || i.includes('basmati') || i.includes('jasmine') || i.includes('arborio') || i.includes('risotto rice'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('pudding') || hay.includes('cake') || hay.includes('cracker') || hay.includes('vinegar')) return false
      if (hay.includes('rice drink') || hay.includes('rice milk')) return false
      return hay.includes('rice')
    },
  },
  {
    match: (i) => i.includes('mushroom'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('soup') || hay.includes('sauce') || (hay.includes('risotto') && hay.includes('meal'))) return false
      return hay.includes('mushroom')
    },
  },
  {
    match: (i) => i === 'eggs' || i === 'egg',
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (
        hay.includes('mayonnaise') ||
        hay.includes('noodle') ||
        hay.includes('pasta') ||
        hay.includes('custard') ||
        hay.includes('muffin') ||
        hay.includes('sandwich') ||
        hay.includes('quiche') ||
        hay.includes('scotch')
      ) {
        return false
      }
      return /\bfree range\b/.test(hay) || /\beggs?\b/.test(hay)
    },
  },
  {
    match: (i) => i === 'ginger' || i.includes('fresh ginger'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (!hay.includes('ginger')) return false
      if (
        hay.includes('nut') ||
        hay.includes('biscuit') ||
        hay.includes('cookie') ||
        hay.includes('beer') ||
        hay.includes('ale') ||
        hay.includes('cake') ||
        hay.includes('pudding') ||
        hay.includes('cordial') ||
        hay.includes('wine') ||
        hay.includes('yogurt') ||
        hay.includes('yoghurt') ||
        hay.includes('honey') ||
        hay.includes('ice cream') ||
        hay.includes('tea')
      ) {
        return false
      }
      // Prefer fresh cooking ginger only.
      return hay.includes('root') || hay.includes('fresh') || hay.includes('loose') || hay.includes('crushed ginger') || hay.includes('ground ginger')
    },
  },
  {
    match: (i) => i === 'salt' || i.includes('sea salt') || i.includes('table salt'),
    suitable: (p) => {
      const hay = productHay(p)
      if (
        hay.includes('crisp') ||
        hay.includes('vinegar') ||
        hay.includes('butter') ||
        hay.includes('cheese') ||
        hay.includes('cod') ||
        hay.includes('peanut') ||
        hay.includes('caramel') ||
        hay.includes('chocolate') ||
        hay.includes('cream') ||
        hay.includes('snack')
      ) {
        return false
      }
      return (
        hay.includes('saxa') ||
        hay.includes('maldon') ||
        (hay.includes('sea salt') && (hay.includes('flakes') || hay.includes('grinder') || hay.includes('mill'))) ||
        hay.includes('table salt') ||
        hay.includes('cooking salt') ||
        (hay.includes('salt') && hay.includes('fine') && !hay.includes('wine'))
      )
    },
  },
  {
    match: (i) => i.includes('sour cream'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (
        hay.includes('pringles') ||
        hay.includes('crisp') ||
        hay.includes('snack') ||
        hay.includes('dip') ||
        hay.includes('chive')
      ) {
        return false
      }
      return hay.includes('sour cream') || hay.includes('creme fraiche') || hay.includes('crème fraîche')
    },
  },
  {
    match: (i) => i.includes('cheddar'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (
        hay.includes('crisp') ||
        hay.includes('sandwich') ||
        hay.includes('sauce') ||
        hay.includes('nibble') ||
        hay.includes('snack') ||
        hay.includes('biscuit')
      ) {
        return false
      }
      return hay.includes('cheddar')
    },
  },
  {
    match: (i) => i.includes('potato'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('crisp') || hay.includes('chip') || hay.includes('waffle') || hay.includes('mash ready')) return false
      return hay.includes('potato')
    },
  },
  {
    match: (i) => i.includes('olive oil'),
    suitable: (p) => {
      const hay = productHay(p)
      return hay.includes('olive') && hay.includes('oil')
    },
  },
  {
    match: (i) => i.includes('paneer'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      // Never substitute chicken for paneer.
      if (hay.includes('chicken')) return false
      return hay.includes('paneer')
    },
  },
  {
    match: (i) => i.includes('curry paste') || i.includes('curry sauce'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('ready meal') || (hay.includes('curry') && hay.includes('chicken') && hay.includes('meal'))) {
        return false
      }
      return hay.includes('curry') && (hay.includes('paste') || hay.includes('sauce') || hay.includes('simmer'))
    },
  },
  {
    match: (i) => i.includes('thai green curry paste') || i.includes('green curry paste'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      return hay.includes('green') && hay.includes('curry') && (hay.includes('paste') || hay.includes('sauce'))
    },
  },
  {
    match: (i) => i === 'chicken' || i.includes('chicken breast') || i.includes('chicken thigh'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('stock') || hay.includes('cube') || hay.includes('flavouring')) return false
      if (hay.includes('pie') || hay.includes('sandwich') || hay.includes('soup')) return false
      return hay.includes('chicken') && (hay.includes('breast') || hay.includes('thigh') || hay.includes('fillet') || hay.includes('dice') || hay.includes('pieces') || hay.includes('whole'))
    },
  },
  {
    match: (i) => i.includes('pepper') && !i.includes('black pepper'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('peppercorn') || hay.includes('black pepper') || hay.includes('sauce')) return false
      return hay.includes('pepper') || hay.includes('capsicum')
    },
  },
  {
    match: (i) => i.includes('sweetcorn') || i === 'corn',
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      return hay.includes('sweetcorn') || hay.includes('sweet corn') || (hay.includes('corn') && hay.includes('tin'))
    },
  },
  {
    match: (i) => i === 'avocado' || i.includes('avocado'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('oil') || hay.includes('guacamole dip') && !hay.includes('avocado')) return false
      return hay.includes('avocado')
    },
  },
  {
    match: (i) => i === 'lime' || i.includes('limes'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('cordial') || hay.includes('juice drink') || hay.includes('sorbet')) return false
      return /\blimes?\b/.test(hay)
    },
  },
  {
    match: (i) => i === 'salsa' || i.includes('salsa'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      return hay.includes('salsa')
    },
  },
  {
    match: (i) => i === 'tomatoes' || i === 'tomato' || i.includes('cherry tomato'),
    suitable: (p) => {
      const hay = productHay(p)
      if (looksLikeReadyMeal(hay)) return false
      if (hay.includes('puree') || hay.includes('purée') || hay.includes('ketchup') || hay.includes('soup')) return false
      return hay.includes('tomato')
    },
  },
  {
    match: (i) => i === 'orange juice' || i.includes('orange juice'),
    suitable: (p) => {
      const hay = productHay(p)
      if (!hay.includes('orange') || !hay.includes('juice')) return false
      if (hay.includes('apple') || hay.includes('squash') || hay.includes('cordial')) return false
      if (hay.includes('cheesecake') || hay.includes('dessert') || hay.includes('yogurt') || hay.includes('yoghurt')) {
        return false
      }
      return true
    },
  },
  {
    match: (i) => i === 'semi-skimmed milk' || i.includes('semi skimmed milk'),
    suitable: (p) => {
      const hay = productHay(p)
      if (!hay.includes('milk')) return false
      if (hay.includes('oat') || hay.includes('almond') || hay.includes('coconut') || hay.includes('conditioner')) {
        return false
      }
      return hay.includes('semi') && hay.includes('skimmed')
    },
  },
  {
    match: (i) => i === 'wholemeal bread' || i.includes('wholemeal bread'),
    suitable: (p) => {
      const hay = productHay(p)
      if (hay.includes('flour') || hay.includes('crumb')) return false
      return hay.includes('wholemeal') && (hay.includes('bread') || hay.includes('loaf'))
    },
  },
]

export function ingredientNamesNorm(ingredient: RecipeIngredient): string[] {
  return [ingredient.name, ...(ingredient.synonyms ?? [])].map(norm).filter(Boolean)
}

/** Key tokens from the canonical ingredient name (synonyms are search-only). */
export function ingredientKeyTokens(ingredient: RecipeIngredient): string[] {
  const exclude = new Set([
    'sauce',
    'oil',
    'mix',
    'paste',
    'cooking',
    'masala',
    'seasoning',
    'seasonings',
    'spice',
    'spices',
    'spicy',
    'tinned',
    'fresh',
    'dried',
  ])

  const tokens = norm(ingredient.name)
    .split(' ')
    .filter((t) => t.length >= 3 && !exclude.has(t))

  const seen = new Set<string>()
  const out: string[] = []
  for (const t of tokens) {
    if (seen.has(t)) continue
    seen.add(t)
    out.push(t)
  }
  return out
}

function hasSpecificIngredientRule(ingredient: RecipeIngredient): boolean {
  const names = ingredientNamesNorm(ingredient)
  return INGREDIENT_RULES.some((rule) => names.some((n) => rule.match(n)))
}

/** Whether a POPMAS product is a valid match for a recipe ingredient row. */
export function isRecipeCatalogHit(
  ingredient: RecipeIngredient,
  product: WaitroseCatalogItem,
): boolean {
  if (looksLikeReadyMeal(productHay(product))) return false
  if (!isRecipeProductSuitable(ingredient, product)) return false
  if (hasSpecificIngredientRule(ingredient)) return true
  return productNameMatchesIngredientIntent(product.name, ingredientKeyTokens(ingredient))
}

export function productNameMatchesIngredientIntent(
  productName: string,
  keyTokens: string[],
): boolean {
  const hay = norm(productName)
  if (keyTokens.length === 0) return false
  if (keyTokens.length >= 2) return keyTokens.every((t) => hay.includes(t))
  return keyTokens.some((t) => hay.includes(t))
}

export function isRecipeProductSuitable(
  ingredient: RecipeIngredient,
  product: WaitroseCatalogItem,
): boolean {
  const names = ingredientNamesNorm(ingredient)
  for (const rule of INGREDIENT_RULES) {
    if (names.some((n) => rule.match(n))) {
      return rule.suitable(product)
    }
  }
  // Default: reject ready meals even when no specific rule applies.
  if (looksLikeReadyMeal(productHay(product))) return false
  return true
}

const SWAP_SEARCH_QUERY: Record<string, string> = {
  spaghetti: 'spaghetti pasta',
  'italian herbs': 'mixed herbs',
  parmesan: 'parmigiano reggiano',
  'orange juice': 'orange juice',
  'semi-skimmed milk': 'semi skimmed milk',
  'wholemeal bread': 'wholemeal bread',
  tomatoes: 'tomatoes',
  'black beans': 'black beans',
  'arborio rice': 'risotto rice',
  paneer: 'paneer',
}

/** Best POPMAS search query for swap alternatives from a recipe ingredient intent. */
export function swapSearchQuery(ingredientIntent: string): string {
  const key = norm(ingredientIntent)
  const aliased = aliasCanonicalIntent(key)
  const resolved = aliased ?? key
  return SWAP_SEARCH_QUERY[resolved] ?? SWAP_SEARCH_QUERY[key] ?? resolved
}

/** Infer recipe ingredient intent from a wrongly matched product name (legacy rows). */
export function inferIngredientIntentFromProductName(productName: string): string | null {
  return inferCanonicalIntentFromProduct({ name: productName })
}

export function resolveSwapIngredientIntent(
  ingredientIntent: string | undefined,
  intentQuery: string | undefined,
  productName: string,
): string {
  if (ingredientIntent?.trim()) {
    const normalised = norm(ingredientIntent)
    return aliasCanonicalIntent(normalised) ?? ingredientIntent.trim()
  }
  const inferred = inferIngredientIntentFromProductName(productName)
  if (inferred) return inferred
  if (intentQuery?.trim()) {
    const normalised = norm(intentQuery)
    const aliased = aliasCanonicalIntent(normalised)
    if (aliased) return aliased
    if (normalised !== norm(productName)) return intentQuery.trim()
  }
  return intentQuery?.trim() ?? productName
}

/** Keep swap alternatives in the same ingredient category (e.g. dry spaghetti, not ready meals). */
export function filterSwapAlternatives(
  ingredientIntent: string,
  products: WaitroseCatalogItem[],
): WaitroseCatalogItem[] {
  const resolved = resolveSwapIngredientIntent(ingredientIntent, ingredientIntent, ingredientIntent)
  const ingredient: RecipeIngredient = { name: resolved, required: true }
  return products.filter((product) => isRecipeCatalogHit(ingredient, product))
}
