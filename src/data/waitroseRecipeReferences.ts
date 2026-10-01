import type { RecipeIngredient } from './mealRecipes'

/**
 * Trusted Waitrose recipe pages used as the recipe-reference layer.
 * POPMAS is only queried AFTER these ingredient requirements exist.
 * Do not live-scrape waitrose.com from the client.
 */
export type WaitroseRecipeReference = {
  id: string
  canonicalName: string
  chipLabel: string
  cuisine: 'British' | 'Chinese' | 'Indian' | 'Italian' | 'Mexican'
  aliases: string[]
  /** Waitrose recipe page URL (attribution / method). */
  sourceUrl: string
  ingredients: RecipeIngredient[]
}

function ing(name: string, required = true, synonyms?: string[]): RecipeIngredient {
  return { name, required, ...(synonyms ? { synonyms } : {}) }
}

/**
 * Normalise a Waitrose recipe line such as
 * "2 x 400g cans red kidney beans, drained and rinsed" → "red kidney beans"
 */
export function normaliseWaitroseIngredientLine(raw: string): string {
  let s = raw
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\u2019\u2018']/g, "'")
    .trim()

  // Drop leading quantities / pack sizes
  s = s
    .replace(/^[\d½¼¾]+\s*[x×]\s*/i, '')
    .replace(/^[\d.,]+\s*(g|kg|ml|l|tsp|tbsp|cups?|cloves?|cans?|tins?|packs?|bunches?)?\s*/i, '')
    .replace(/^[\d.,]+\s*/i, '')

  // Drop preparation / drain notes after comma or parenthesis
  s = s.split(',')[0] ?? s
  s = s.replace(/\([^)]*\)/g, ' ')
  s = s
    .replace(/\b(drained|rinsed|chopped|crushed|minced|sliced|diced|peeled|optional|to serve|to taste)\b/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  return s
}

export const WAITROSE_RECIPE_REFERENCES: WaitroseRecipeReference[] = [
  {
    id: 'chilli-con-carne',
    canonicalName: 'Chilli Con Carne',
    chipLabel: 'Chilli Con Carne',
    cuisine: 'Mexican',
    aliases: ['chilli con carne', 'chili con carne', 'chilli', 'chili', 'easy chilli con carne'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/easy-chilli-con-carne-recipe-waitrose',
    ingredients: [
      ing('olive oil', false),
      ing('onion', true, ['soffritto', 'onion vegetable mix', 'mixed vegetables']),
      ing('garlic', true, ['garlic cloves']),
      ing('beef mince', true, ['minced beef', 'lean beef mince']),
      ing('oregano', true, ['dried oregano', 'mixed herbs']),
      ing('chilli powder', true, ['chilli seasoning', 'chili powder', 'hot chilli powder']),
      ing('worcestershire sauce', false, ['worcester sauce']),
      ing('tomato puree', true, ['tomato purée']),
      ing('beef stock', true, ['beef stock cubes', 'stock cubes', 'beef stock pot']),
      ing('red kidney beans', true, ['kidney beans', 'tinned kidney beans', 'tinned red kidney beans']),
      ing('chopped tomatoes', true, ['tinned chopped tomatoes', 'passata']),
      ing('rice', false, ['long grain rice', 'basmati rice']),
    ],
  },
  {
    id: 'pad-thai',
    canonicalName: 'Pad Thai',
    chipLabel: 'Pad Thai',
    cuisine: 'Chinese',
    aliases: ['pad thai', 'padthai', 'prawn pad thai', 'chicken pad thai'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/prawn-pad-thai',
    ingredients: [
      ing('rice noodles', true, ['pad thai noodles', 'rice stick noodles', 'flat rice noodles']),
      ing('prawns', true, ['king prawns', 'raw prawns', 'chicken']),
      ing('pad thai paste', true, ['pad thai sauce', 'pad thai stir fry sauce']),
      ing('eggs', true, ['egg']),
      ing('beansprouts', true, ['bean sprouts']),
      ing('soy sauce', true, ['dark soy sauce', 'light soy sauce']),
      ing('lime', true, ['limes']),
      ing('peanuts', true, ['roasted peanuts', 'chopped peanuts']),
      ing('salad onions', true, ['spring onion', 'spring onions']),
      ing('red chilli', false, ['chilli', 'fresh chilli', 'red chilli']),
    ],
  },
  {
    id: 'spag-bol',
    canonicalName: 'Spaghetti Bolognese',
    chipLabel: 'Spaghetti Bolognese',
    cuisine: 'Italian',
    aliases: ['spaghetti bolognese', 'spag bol', 'spagbol', 'bolognese'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/spaghetti-bolognese',
    ingredients: [
      ing('spaghetti', true, ['spaghetti pasta']),
      ing('beef mince', true, ['minced beef', 'lean beef mince']),
      ing('onion', true),
      ing('garlic', true),
      ing('carrots', false, ['carrot']),
      ing('chopped tomatoes', true, ['tinned chopped tomatoes', 'passata']),
      ing('tomato puree', true, ['tomato purée']),
      ing('italian herbs', true, ['mixed herbs', 'oregano']),
      ing('parmesan', false, ['Parmigiano Reggiano']),
    ],
  },
  {
    id: 'shepherds-pie',
    canonicalName: "Shepherd's Pie",
    chipLabel: "Shepherd's Pie",
    cuisine: 'British',
    aliases: ["shepherd's pie", 'shepherds pie', 'shepherd pie'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/shepherds-pie',
    ingredients: [
      ing('lamb mince', true, ['minced lamb']),
      ing('potatoes', true, ['mashed potatoes']),
      ing('onion', true),
      ing('carrots', true, ['carrot']),
      ing('peas', true, ['frozen peas']),
      ing('stock cubes', false, ['lamb stock', 'beef stock']),
    ],
  },
  {
    id: 'cottage-pie',
    canonicalName: 'Cottage Pie',
    chipLabel: 'Cottage Pie',
    cuisine: 'British',
    aliases: ['cottage pie', 'classic cottage pie'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/cottage-pie',
    ingredients: [
      ing('beef mince', true, ['minced beef']),
      ing('potatoes', true, ['mashed potatoes']),
      ing('onion', true),
      ing('carrots', true),
      ing('peas', true),
      ing('stock cubes', false, ['beef stock']),
    ],
  },
  {
    id: 'beef-burrito-bowl',
    canonicalName: 'Beef Burrito Bowl',
    chipLabel: 'Beef Burrito Bowl',
    cuisine: 'Mexican',
    aliases: ['beef burrito bowl', 'beef burrito bowls'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/beef-burrito-bowl',
    ingredients: [
      ing('beef mince', true, ['minced beef', 'beef strips']),
      ing('rice', true, ['long grain rice', 'basmati rice']),
      ing('black beans', true, ['tinned black beans']),
      ing('peppers', true, ['sweet peppers']),
      ing('sweetcorn', true, ['sweet corn']),
      ing('tomatoes', true, ['cherry tomatoes', 'salsa']),
      ing('avocado', true, ['avocados']),
      ing('lime', true, ['limes']),
      ing('sour cream', false),
      ing('cheddar cheese', false, ['grated cheese']),
    ],
  },
  {
    id: 'black-bean-burrito',
    canonicalName: 'Black Bean Burrito Bowls',
    chipLabel: 'Black Bean Burrito Bowls',
    cuisine: 'Mexican',
    aliases: ['black bean burrito bowl', 'black bean burrito bowls', 'burrito bowl', 'burrito bowls'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/black-bean-burrito-bowls',
    ingredients: [
      ing('black beans', true, ['tinned black beans']),
      ing('rice', true, ['long grain rice']),
      ing('peppers', true, ['sweet peppers']),
      ing('sweetcorn', true),
      ing('tomatoes', true, ['cherry tomatoes', 'salsa']),
      ing('avocado', true),
      ing('lime', true),
      ing('coriander', false),
      ing('sour cream', false),
      ing('cheddar cheese', false, ['grated cheese']),
    ],
  },
  {
    id: 'sheet-pan-fajitas',
    canonicalName: 'Sheet Pan Fajitas',
    chipLabel: 'Sheet Pan Fajitas',
    cuisine: 'Mexican',
    aliases: ['sheet pan fajitas', 'fajitas', 'fajita'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/chicken-fajitas',
    ingredients: [
      ing('chicken', true, ['chicken breast', 'chicken strips']),
      ing('peppers', true, ['sweet peppers']),
      ing('onion', true),
      ing('fajita seasoning', true, ['fajitas seasoning', 'fajita spice mix']),
      ing('tortillas', true, ['fajita wraps', 'soft tortillas']),
      ing('lime', false),
      ing('salsa', false),
      ing('sour cream', false),
    ],
  },
  {
    id: 'chicken-burger-fries',
    canonicalName: 'Chicken Burger with Fries',
    chipLabel: 'Chicken Burger with Fries',
    cuisine: 'British',
    aliases: ['chicken burger with fries', 'chicken burger with chips', 'chicken burger'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/chicken-burger',
    ingredients: [
      ing('chicken burger', true, ['chicken breast', 'breaded chicken', 'chicken fillets']),
      ing('burger buns', true, ['brioche burger buns']),
      ing('lettuce', true, ['iceberg lettuce']),
      ing('tomato', true, ['tomatoes']),
      ing('mayonnaise', false, ['mayo']),
      ing('oven chips', true, ['chips', 'fries']),
    ],
  },
  {
    id: 'mushroom-risotto',
    canonicalName: 'Mushroom Risotto',
    chipLabel: 'Mushroom Risotto',
    cuisine: 'Italian',
    aliases: ['mushroom risotto', 'risotto'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/mushroom-risotto',
    ingredients: [
      ing('arborio rice', true, ['risotto rice']),
      ing('mushrooms', true, ['chestnut mushrooms']),
      ing('onion', true, ['shallot']),
      ing('garlic', true),
      ing('vegetable stock', true, ['vegetable stock cubes']),
      ing('parmesan', true, ['Parmigiano Reggiano']),
      ing('butter', false),
      ing('olive oil', false),
    ],
  },
  {
    id: 'spanish-omelette',
    canonicalName: 'Spanish Omelette',
    chipLabel: 'Spanish Omelette',
    cuisine: 'British',
    aliases: ['spanish omelette', 'spanish omelet', 'tortilla de patatas'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/spanish-omelette',
    ingredients: [
      ing('eggs', true),
      ing('potatoes', true, ['waxy potatoes', 'new potatoes']),
      ing('onion', true),
      ing('olive oil', true),
      ing('salt', false),
    ],
  },
  {
    id: 'paneer-curry',
    canonicalName: 'Paneer Curry',
    chipLabel: 'Paneer Curry',
    cuisine: 'Indian',
    aliases: ['paneer curry', 'paneer masala', 'paneer'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/paneer-curry',
    ingredients: [
      ing('paneer', true),
      ing('onion', true),
      ing('garlic', true),
      ing('ginger', true),
      ing('chopped tomatoes', true, ['passata']),
      ing('curry paste', true, ['tikka masala paste', 'curry sauce']),
      ing('basmati rice', false, ['rice']),
      ing('coriander', false),
    ],
  },
  {
    id: 'chicken-curry',
    canonicalName: 'Chicken Curry',
    chipLabel: 'Chicken Curry',
    cuisine: 'Indian',
    aliases: ['chicken curry'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/chicken-curry',
    ingredients: [
      ing('chicken', true, ['chicken breast', 'chicken thighs']),
      ing('onion', true),
      ing('garlic', true),
      ing('ginger', true),
      ing('curry paste', true, ['curry sauce']),
      ing('coconut milk', false),
      ing('basmati rice', true, ['rice']),
      ing('coriander', false),
    ],
  },
  {
    id: 'thai-green-curry',
    canonicalName: 'Thai Green Curry',
    chipLabel: 'Thai Green Curry',
    cuisine: 'Chinese',
    aliases: ['thai green curry', 'green thai curry'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/thai-green-curry',
    ingredients: [
      ing('thai green curry paste', true, ['green curry paste']),
      ing('coconut milk', true),
      ing('chicken', true, ['chicken breast', 'chicken thighs']),
      ing('jasmine rice', true, ['rice']),
      ing('peppers', false, ['sweet peppers']),
      ing('lime', false),
      ing('coriander', false),
    ],
  },
  {
    id: 'fish-tacos',
    canonicalName: 'Fish Tacos',
    chipLabel: 'Fish Tacos',
    cuisine: 'Mexican',
    aliases: ['fish tacos', 'fish taco'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/fish-tacos',
    ingredients: [
      ing('white fish fillets', true, ['cod fillets', 'haddock fillets']),
      ing('taco shells', true, ['soft tacos', 'tortillas']),
      ing('cabbage', true, ['red cabbage']),
      ing('lime', true),
      ing('salsa', true, ['tomato salsa']),
      ing('avocado', false),
      ing('coriander', false),
    ],
  },
  {
    id: 'salmon-veg',
    canonicalName: 'Salmon with Seasonal Vegetables',
    chipLabel: 'Salmon & veg',
    cuisine: 'British',
    aliases: ['salmon and vegetables', 'salmon & vegetables', 'salmon & veg', 'salmon and veg'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/salmon-with-vegetables',
    ingredients: [
      ing('salmon fillets', true, ['salmon']),
      ing('broccoli', true),
      ing('carrots', true),
      ing('new potatoes', true, ['potatoes']),
      ing('lemon', false),
      ing('butter', false),
    ],
  },
  {
    id: 'veg-lasagne',
    canonicalName: 'Vegetarian Lasagna',
    chipLabel: 'Vegetarian lasagna',
    cuisine: 'Italian',
    aliases: ['vegetarian lasagne', 'vegetarian lasagna', 'veg lasagne', 'veg lasagna', 'lasagne', 'lasagna'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/vegetarian-lasagne',
    ingredients: [
      ing('lasagne sheets', true, ['lasagna sheets']),
      ing('courgette', true, ['zucchini']),
      ing('aubergine', true, ['eggplant']),
      ing('spinach', true),
      ing('chopped tomatoes', true, ['passata']),
      ing('cheese', true, ['grated cheese', 'mozzarella']),
      ing('olive oil', false),
      ing('basil', false),
    ],
  },
  {
    id: 'beef-casserole',
    canonicalName: 'Classic Beef Casserole',
    chipLabel: 'Beef casserole',
    cuisine: 'British',
    aliases: ['beef casserole', 'classic beef casserole'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/beef-casserole',
    ingredients: [
      ing('braising steak', true, ['stewing beef', 'beef stewing steak']),
      ing('onion', true),
      ing('carrots', true),
      ing('celery', true),
      ing('stock cubes', true, ['beef stock']),
      ing('potatoes', false),
    ],
  },
  {
    id: 'chicken-tikka',
    canonicalName: 'Chicken Tikka Masala',
    chipLabel: 'Chicken Tikka',
    cuisine: 'Indian',
    aliases: ['chicken tikka masala', 'chicken tikka'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/chicken-tikka-masala',
    ingredients: [
      ing('chicken', true, ['chicken thighs', 'chicken pieces']),
      ing('tikka masala cooking sauce', true, ['tikka masala sauce']),
      ing('double cream', true),
      ing('ginger', true),
      ing('garlic', true),
      ing('lemon', false),
      ing('coriander', false),
    ],
  },
  {
    id: 'carbonara',
    canonicalName: 'Spaghetti Carbonara',
    chipLabel: 'Carbonara',
    cuisine: 'Italian',
    aliases: ['carbonara', 'spaghetti carbonara'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/spaghetti-carbonara',
    ingredients: [
      ing('spaghetti', true, ['pasta']),
      ing('bacon', true, ['pancetta', 'streaky bacon']),
      ing('eggs', true),
      ing('parmesan', true),
      ing('garlic', false),
      ing('black pepper', false),
    ],
  },
  {
    id: 'mac-and-cheese',
    canonicalName: 'Mac and Cheese',
    chipLabel: 'Mac and Cheese',
    cuisine: 'British',
    aliases: ['mac and cheese', 'macaroni cheese', 'mac & cheese'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/macaroni-cheese',
    ingredients: [
      ing('macaroni', true, ['macaroni pasta', 'pasta']),
      ing('cheddar cheese', true, ['mature cheddar']),
      ing('milk', true),
      ing('butter', true),
      ing('flour', false, ['plain flour']),
      ing('mustard', false),
    ],
  },
  {
    id: 'chicken-stir-fry',
    canonicalName: 'Chicken Stir Fry',
    chipLabel: 'Chicken Stir Fry',
    cuisine: 'Chinese',
    aliases: ['chicken stir fry', 'chicken stir-fry'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/chicken-stir-fry',
    ingredients: [
      ing('chicken', true, ['chicken breast', 'chicken strips']),
      ing('stir fry vegetables', true, ['stir fry mix']),
      ing('soy sauce', true),
      ing('garlic', true),
      ing('ginger', false),
      ing('noodles', false, ['egg noodles']),
      ing('sesame oil', false),
    ],
  },
  {
    id: 'vegetable-stir-fry',
    canonicalName: 'Vegetable Stir Fry',
    chipLabel: 'Vegetable Stir Fry',
    cuisine: 'Chinese',
    aliases: ['vegetable stir fry', 'veg stir fry', 'stir fry', 'stir-fry'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/vegetable-stir-fry',
    ingredients: [
      ing('stir fry vegetables', true, ['stir fry mix']),
      ing('tofu', false, ['firm tofu']),
      ing('soy sauce', true),
      ing('garlic', true),
      ing('ginger', false),
      ing('noodles', false),
      ing('sesame oil', false),
    ],
  },
  {
    id: 'chicken-biryani',
    canonicalName: 'Chicken Biryani',
    chipLabel: 'Chicken Biryani',
    cuisine: 'Indian',
    aliases: ['chicken biryani', 'biryani'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/chicken-biryani',
    ingredients: [
      ing('chicken', true, ['chicken thighs']),
      ing('basmati rice', true, ['rice']),
      ing('onion', true),
      ing('garlic', true),
      ing('ginger', true),
      ing('biryani paste', true, ['biryani sauce', 'curry paste']),
      ing('yoghurt', false, ['natural yoghurt']),
      ing('coriander', false),
    ],
  },
  {
    id: 'chana-dal',
    canonicalName: 'Creamy Chana Dal',
    chipLabel: 'Chana Dal',
    cuisine: 'Indian',
    aliases: ['chana dal', 'dal', 'dhal', 'dahl'],
    sourceUrl: 'https://www.waitrose.com/ecom/recipe/creamy-chana-dal',
    ingredients: [
      ing('chana dal', true, ['split chickpeas', 'chick peas']),
      ing('cumin seeds', true, ['cumin']),
      ing('onion', true),
      ing('garlic', true),
      ing('ginger', true),
      ing('ground turmeric', false, ['turmeric']),
      ing('coconut milk', false),
    ],
  },
]

function normalizeKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\u2019\u2018']/g, "'")
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const byAlias = new Map<string, WaitroseRecipeReference>()
for (const ref of WAITROSE_RECIPE_REFERENCES) {
  byAlias.set(normalizeKey(ref.canonicalName), ref)
  byAlias.set(normalizeKey(ref.chipLabel), ref)
  byAlias.set(normalizeKey(ref.id.replace(/-/g, ' ')), ref)
  for (const alias of ref.aliases) {
    byAlias.set(normalizeKey(alias), ref)
  }
}

/** Look up a Waitrose recipe reference by meal title / alias. */
export function findWaitroseRecipeReference(mealName: string): WaitroseRecipeReference | null {
  const key = normalizeKey(mealName)
  if (!key) return null
  const exact = byAlias.get(key)
  if (exact) return exact

  // Fuzzy: longer titles containing a known alias / vice versa
  for (const ref of WAITROSE_RECIPE_REFERENCES) {
    const canon = normalizeKey(ref.canonicalName)
    const chip = normalizeKey(ref.chipLabel)
    if (key.length >= 6 && (canon.includes(key) || key.includes(canon) || chip.includes(key) || key.includes(chip))) {
      return ref
    }
    for (const alias of ref.aliases) {
      const a = normalizeKey(alias)
      if (a.length >= 5 && (key === a || key.includes(a) || a.includes(key))) return ref
    }
  }
  return null
}
