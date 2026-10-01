export type Cuisine = 'British' | 'Chinese' | 'Indian' | 'Italian' | 'Mexican'

export type RecipeIngredient = {
  /** Product intent (canonical). */
  name: string
  required: boolean
  synonyms?: string[]
}

export type MealRecipe = {
  id: string
  chipLabel: string
  fullName: string
  cuisine: Cuisine
  ingredients: RecipeIngredient[]
  /** Override when Waitrose slug differs from generated URL. */
  methodUrl?: string
}

function normalizeRecipeSlug(fullName: string): string {
  return fullName
    .toLowerCase()
    .normalize('NFKC')
    .replace(/[\u2019\u2018']/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
}

/** Waitrose online recipe method page for a recipe title. */
export function waitroseRecipeMethodUrl(fullName: string): string {
  return `https://www.waitrose.com/ecom/recipe/${normalizeRecipeSlug(fullName)}`
}

function recipeMethodUrl(recipe: MealRecipe): string {
  return recipe.methodUrl ?? waitroseRecipeMethodUrl(recipe.fullName)
}

function normalizeMealLine(value: string): string {
  return value
    .toLowerCase()
    // Normalize curly apostrophes and other apostrophe-like characters.
    .replace(/[\u2019\u2018]/g, "'")
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export const MEAL_RECIPES: MealRecipe[] = [
  // ALL (subset shown when Cuisine=All)
  {
    id: 'spag-bol',
    chipLabel: 'Spaghetti Bolognese',
    fullName: 'Spaghetti Bolognese',
    cuisine: 'Italian',
    ingredients: [
      { name: 'spaghetti', required: true, synonyms: ['spaghetti pasta', 'dry spaghetti pasta'] },
      { name: 'beef mince', required: true, synonyms: ['minced beef', 'lean beef mince'] },
      { name: 'chopped tomatoes', required: true, synonyms: ['tinned chopped tomatoes', 'passata'] },
      { name: 'onion', required: true, synonyms: ['yellow onion', 'brown onion'] },
      { name: 'garlic', required: true, synonyms: ['garlic cloves', 'garlic bulb'] },
      { name: 'tomato puree', required: true, synonyms: ['tomato purée'] },
      { name: 'carrots', required: false, synonyms: ['carrot'] },
      { name: 'italian herbs', required: true, synonyms: ['mixed herbs', 'oregano'] },
      { name: 'parmesan', required: false, synonyms: ['Parmigiano Reggiano'] },
    ],
  },
  {
    id: 'chicken-tikka',
    chipLabel: 'Chicken Tikka',
    fullName: 'Chicken Tikka Masala',
    cuisine: 'Indian',
    ingredients: [
      { name: 'chicken', required: true, synonyms: ['chicken thighs', 'chicken pieces', 'boneless chicken thighs'] },
      { name: 'tikka masala cooking sauce', required: true, synonyms: ['tikka masala sauce'] },
      { name: 'double cream', required: true, synonyms: ['heavy cream'] },
      { name: 'ginger', required: true },
      { name: 'garlic', required: true },
      { name: 'lemon', required: false },
      { name: 'coriander', required: false },
    ],
  },
  {
    id: 'sesame-tofu',
    chipLabel: 'Sesame Tofu',
    fullName: 'Crispy Sesame Tofu & Mushroom Stir Fry',
    cuisine: 'Chinese',
    ingredients: [
      { name: 'tofu', required: true, synonyms: ['firm tofu'] },
      { name: 'sesame oil', required: true, synonyms: ['sesame oil'] },
      { name: 'soy sauce', required: true, synonyms: ['dark soy sauce'] },
      { name: 'mushrooms', required: true },
      { name: 'spring onion', required: true, synonyms: ['salad onions'] },
      { name: 'stir fry sauce', required: true, synonyms: ['stir-fry sauce'] },
      { name: 'black bean stir fry sauce', required: false, synonyms: ['black bean sauce'] },
    ],
  },
  {
    id: 'roast-chicken',
    chipLabel: 'Roast Chicken',
    fullName: 'Perfect Roast Chicken',
    cuisine: 'British',
    ingredients: [
      { name: 'whole chicken', required: true, synonyms: ['roast chicken'] },
      { name: 'lemons', required: true, synonyms: ['lemon'] },
      { name: 'garlic', required: true },
      { name: 'onion', required: true },
      { name: 'fresh herbs', required: true, synonyms: ['thyme', 'bay leaves'] },
      { name: 'black pepper', required: false },
    ],
  },
  {
    id: 'chicken-tacos',
    chipLabel: 'Chicken Tacos',
    fullName: 'Spiced Chicken & Sweetcorn Tacos',
    cuisine: 'Mexican',
    ingredients: [
      { name: 'chicken', required: true, synonyms: ['chicken strips', 'chicken breast'] },
      { name: 'taco shells', required: true, synonyms: ['soft tacos', 'tortillas'] },
      { name: 'salsa', required: true, synonyms: ['chopped tomatoes salsa'] },
      { name: 'onion', required: true },
      { name: 'lettuce', required: true, synonyms: ['leaf lettuce'] },
      { name: 'lime', required: false, synonyms: ['limes'] },
      { name: 'jalapeno', required: false, synonyms: ['jalapenos'] },
    ],
  },
  {
    id: 'chana-dal',
    chipLabel: 'Chana Dal',
    fullName: 'Creamy Chana Dal',
    cuisine: 'Indian',
    ingredients: [
      { name: 'chana dal', required: true, synonyms: ['split chickpeas', 'chick peas'] },
      { name: 'cumin seeds', required: true, synonyms: ['cumin'] },
      { name: 'onion', required: true },
      { name: 'garlic', required: true },
      { name: 'ginger', required: true },
      { name: 'ground turmeric', required: false, synonyms: ['turmeric'] },
      { name: 'coconut milk', required: false, synonyms: ['coconut cream'] },
    ],
  },

  // BRITISH
  {
    id: 'fish-chips',
    chipLabel: 'Fish & Chips',
    fullName: 'Fish & Chips with Tartar Sauce',
    cuisine: 'British',
    ingredients: [
      { name: 'fish fillets', required: true, synonyms: ['cod', 'haddock'] },
      { name: 'potatoes', required: true, synonyms: ['baking potatoes', 'chipping potatoes'] },
      { name: 'batter mix', required: true, synonyms: ['baking powder batter mix'] },
      { name: 'peas', required: false },
      { name: 'tartar sauce', required: false, synonyms: ['tartare sauce'] },
    ],
  },
  {
    id: 'shepherds-pie',
    chipLabel: "Shepherd's Pie",
    fullName: "Shepherd's Pie",
    cuisine: 'British',
    ingredients: [
      { name: 'lamb mince', required: true, synonyms: ['minced lamb'] },
      { name: 'potatoes', required: true, synonyms: ['mashed potatoes'] },
      { name: 'onion', required: true },
      { name: 'carrots', required: true, synonyms: ['carrot'] },
      { name: 'peas', required: true, synonyms: ['frozen peas'] },
      { name: 'stock cubes', required: false, synonyms: ['lamb stock'] },
    ],
  },
  {
    id: 'salmon-veg',
    chipLabel: 'Salmon & veg',
    fullName: 'Salmon with Seasonal Vegetables',
    cuisine: 'British',
    ingredients: [
      { name: 'salmon fillets', required: true, synonyms: ['salmon'] },
      { name: 'broccoli', required: true },
      { name: 'carrots', required: true },
      { name: 'new potatoes', required: true, synonyms: ['potatoes'] },
      { name: 'lemon', required: false },
      { name: 'butter', required: false },
    ],
  },
  {
    id: 'beef-casserole',
    chipLabel: 'Beef casserole',
    fullName: 'Classic Beef Casserole',
    cuisine: 'British',
    ingredients: [
      { name: 'braising steak', required: true, synonyms: ['beef stewing steak', 'stewing beef'] },
      { name: 'onion', required: true },
      { name: 'carrots', required: true },
      { name: 'celery', required: true },
      { name: 'stock cubes', required: true, synonyms: ['beef stock'] },
      { name: 'potatoes', required: false },
    ],
  },
  {
    id: 'cottage-pie',
    chipLabel: 'Cottage Pie',
    fullName: 'Classic Cottage Pie',
    cuisine: 'British',
    ingredients: [
      { name: 'beef mince', required: true, synonyms: ['minced beef'] },
      { name: 'potatoes', required: true, synonyms: ['mashed potatoes'] },
      { name: 'onion', required: true },
      { name: 'carrots', required: true },
      { name: 'peas', required: true },
      { name: 'stock cubes', required: false, synonyms: ['beef stock'] },
    ],
  },
  {
    id: 'vegan-cottage-pie',
    chipLabel: 'Vegan Cottage Pie',
    fullName: 'Vegan Cottage Pie',
    cuisine: 'British',
    ingredients: [
      { name: 'plant mince', required: true, synonyms: ['vegan mince'] },
      { name: 'potatoes', required: true, synonyms: ['mashed potatoes'] },
      { name: 'onion', required: true },
      { name: 'carrots', required: true },
      { name: 'peas', required: true },
      { name: 'cooking stock', required: false, synonyms: ['vegetable stock'] },
    ],
  },
  {
    id: 'roast-beef',
    chipLabel: 'Roast Beef',
    fullName: 'Roast Beef with Pink Peppercorns, Peas & Basil',
    cuisine: 'British',
    ingredients: [
      { name: 'roast beef', required: true, synonyms: ['beef joint'] },
      { name: 'pink peppercorns', required: true, synonyms: ['peppercorns'] },
      { name: 'peas', required: true },
      { name: 'basil', required: false },
    ],
  },

  // CHINESE
  {
    id: 'szechuan-chicken',
    chipLabel: 'Szechuan Chicken',
    fullName: 'Szechuan Chicken with Sesame Cucumbers',
    cuisine: 'Chinese',
    ingredients: [
      { name: 'chicken', required: true, synonyms: ['chicken thigh'] },
      { name: 'szechuan sauce', required: true, synonyms: ['Szechuan sauce'] },
      { name: 'sesame oil', required: false, synonyms: ['sesame seed oil'] },
      { name: 'cucumber', required: true, synonyms: ['cucumbers'] },
      { name: 'garlic', required: true },
      { name: 'ginger', required: false },
    ],
  },
  {
    id: 'five-spice-duck',
    chipLabel: 'Five-Spice Duck',
    fullName: 'Five-Spice Duck with Stir-Fried Cucumber & Cashews',
    cuisine: 'Chinese',
    ingredients: [
      { name: 'duck', required: true, synonyms: ['duck pieces'] },
      { name: 'five spice seasoning', required: true, synonyms: ['five-spice'] },
      { name: 'hoisin sauce', required: false, synonyms: ['chinese sauce'] },
      { name: 'cucumber', required: true },
      { name: 'cashews', required: false },
      { name: 'spring onion', required: false, synonyms: ['salad onions'] },
    ],
  },
  {
    id: 'prawn-noodles',
    chipLabel: 'Prawn Noodles',
    fullName: 'Rice Noodles with Prawns, Dark Soy Sauce & Sesame Fried Egg',
    cuisine: 'Chinese',
    ingredients: [
      { name: 'prawns', required: true },
      { name: 'rice noodles', required: true, synonyms: ['rice noodle'] },
      { name: 'dark soy sauce', required: true, synonyms: ['soy sauce'] },
      { name: 'sesame oil', required: false },
      { name: 'egg', required: false, synonyms: ['eggs'] },
      { name: 'spring onion', required: false, synonyms: ['salad onions'] },
    ],
  },

  // INDIAN
  {
    id: 'butter-chicken',
    chipLabel: 'Butter Chicken',
    fullName: 'Chicken Butter Masala',
    cuisine: 'Indian',
    ingredients: [
      { name: 'chicken', required: true, synonyms: ['chicken pieces'] },
      { name: 'butter masala cooking sauce', required: true, synonyms: ['butter masala sauce'] },
      { name: 'double cream', required: true },
      { name: 'garlic', required: true },
      { name: 'ginger', required: false },
      { name: 'onion', required: false },
    ],
  },
  {
    id: 'tandoori-lamb',
    chipLabel: 'Tandoori Lamb',
    fullName: 'Tandoori Lamb Chops',
    cuisine: 'Indian',
    ingredients: [
      { name: 'lamb', required: true, synonyms: ['lamb chops', 'lamb'] },
      { name: 'tandoori marinade', required: true, synonyms: ['tandoori marinade sauce'] },
      { name: 'lemon', required: false },
      { name: 'onion', required: false },
      { name: 'coriander', required: false },
    ],
  },
  {
    id: 'paneer-korma',
    chipLabel: 'Paneer Korma',
    fullName: 'Paneer Korma',
    cuisine: 'Indian',
    ingredients: [
      { name: 'paneer', required: true },
      { name: 'korma cooking sauce', required: true, synonyms: ['korma sauce'] },
      { name: 'peas', required: true, synonyms: ['frozen peas'] },
      { name: 'garlic', required: false },
      { name: 'ginger', required: false },
    ],
  },
  {
    id: 'sweet-potato-curry',
    chipLabel: 'Sweet Potato Curry',
    fullName: 'Sweet Potato & Pea Curry',
    cuisine: 'Indian',
    ingredients: [
      { name: 'sweet potatoes', required: true, synonyms: ['sweet potato'] },
      { name: 'curry sauce', required: true, synonyms: ['curry paste', 'curry'] },
      { name: 'peas', required: true, synonyms: ['frozen peas'] },
      { name: 'onion', required: true },
      { name: 'garlic', required: false },
      { name: 'ginger', required: false },
    ],
  },

  // ITALIAN
  {
    id: 'prawn-risotto',
    chipLabel: 'Prawn Risotto',
    fullName: 'Creamy Prawn Risotto',
    cuisine: 'Italian',
    ingredients: [
      { name: 'prawns', required: true },
      { name: 'arborio rice', required: true, synonyms: ['risotto rice'] },
      { name: 'stock', required: true, synonyms: ['chicken stock cube', 'vegetable stock'] },
      { name: 'parmesan', required: false, synonyms: ['Parmigiano Reggiano'] },
      { name: 'butter', required: false },
      { name: 'lemon', required: false },
    ],
  },
  {
    id: 'cauliflower-pasta',
    chipLabel: 'Cauliflower Pasta',
    fullName: 'Cauliflower Pasta with Caramelised Cauliflower, Anchovy & Pine Nuts',
    cuisine: 'Italian',
    ingredients: [
      { name: 'cauliflower', required: true },
      { name: 'pasta', required: true, synonyms: ['penne', 'rigatoni', 'pasta'] },
      { name: 'anchovies', required: true, synonyms: ['anchovy fillets'] },
      { name: 'pine nuts', required: false },
      { name: 'garlic', required: false },
      { name: 'parmesan', required: false, synonyms: ['Parmigiano Reggiano'] },
    ],
  },
  {
    id: 'veg-lasagne',
    chipLabel: 'Vegetarian lasagna',
    fullName: 'Vegetarian Lasagna',
    cuisine: 'Italian',
    ingredients: [
      { name: 'lasagne sheets', required: true, synonyms: ['lasagne pasta', 'lasagna sheets'] },
      { name: 'courgette', required: true, synonyms: ['zucchini'] },
      { name: 'aubergine', required: true, synonyms: ['eggplant'] },
      { name: 'spinach', required: true },
      { name: 'chopped tomatoes', required: true, synonyms: ['tinned chopped tomatoes', 'passata'] },
      { name: 'cheese', required: true, synonyms: ['grated cheese', 'mature cheddar', 'mozzarella'] },
      { name: 'olive oil', required: false },
      { name: 'basil', required: false },
    ],
  },
  {
    id: 'mushroom-risotto',
    chipLabel: 'Mushroom Risotto',
    fullName: 'Mushroom Risotto',
    cuisine: 'Italian',
    ingredients: [
      { name: 'arborio rice', required: true, synonyms: ['risotto rice'] },
      { name: 'mushrooms', required: true, synonyms: ['chestnut mushrooms', 'closed cup mushrooms'] },
      { name: 'onion', required: true, synonyms: ['shallot'] },
      { name: 'garlic', required: true },
      { name: 'vegetable stock', required: true, synonyms: ['vegetable stock cubes', 'stock cubes'] },
      { name: 'parmesan', required: true, synonyms: ['Parmigiano Reggiano'] },
      { name: 'butter', required: false },
      { name: 'olive oil', required: false },
    ],
  },
  {
    id: 'spanish-omelette',
    chipLabel: 'Spanish Omelette',
    fullName: 'Spanish Omelette',
    cuisine: 'British',
    ingredients: [
      { name: 'eggs', required: true },
      { name: 'potatoes', required: true, synonyms: ['waxy potatoes', 'new potatoes'] },
      { name: 'onion', required: true },
      { name: 'olive oil', required: true },
      { name: 'salt', required: false, synonyms: ['sea salt', 'table salt'] },
    ],
  },
  {
    id: 'paneer-curry',
    chipLabel: 'Paneer Curry',
    fullName: 'Paneer Curry',
    cuisine: 'Indian',
    ingredients: [
      { name: 'paneer', required: true },
      { name: 'onion', required: true },
      { name: 'garlic', required: true },
      { name: 'ginger', required: true },
      { name: 'chopped tomatoes', required: true, synonyms: ['tinned chopped tomatoes', 'passata'] },
      { name: 'curry paste', required: true, synonyms: ['tikka masala paste', 'curry sauce', 'garam masala'] },
      { name: 'basmati rice', required: false, synonyms: ['rice'] },
      { name: 'coriander', required: false },
    ],
  },
  {
    id: 'chicken-curry',
    chipLabel: 'Chicken Curry',
    fullName: 'Chicken Curry',
    cuisine: 'Indian',
    ingredients: [
      { name: 'chicken', required: true, synonyms: ['chicken breast', 'chicken thighs', 'chicken pieces'] },
      { name: 'onion', required: true },
      { name: 'garlic', required: true },
      { name: 'ginger', required: true },
      { name: 'curry paste', required: true, synonyms: ['curry sauce', 'tikka masala paste'] },
      { name: 'coconut milk', required: false },
      { name: 'basmati rice', required: true, synonyms: ['rice'] },
      { name: 'coriander', required: false },
    ],
  },
  {
    id: 'thai-green-curry',
    chipLabel: 'Thai Green Curry',
    fullName: 'Thai Green Curry',
    cuisine: 'Chinese',
    ingredients: [
      { name: 'thai green curry paste', required: true, synonyms: ['green curry paste'] },
      { name: 'coconut milk', required: true },
      { name: 'chicken', required: true, synonyms: ['chicken breast', 'chicken thighs'] },
      { name: 'jasmine rice', required: true, synonyms: ['rice'] },
      { name: 'peppers', required: false, synonyms: ['sweet peppers', 'bell pepper'] },
      { name: 'lime', required: false },
      { name: 'coriander', required: false },
    ],
  },

  // MEXICAN
  {
    id: 'chicken-fajitas',
    chipLabel: 'Chicken Fajitas',
    fullName: 'Chipotle & Lime Roast Chicken with Quick Pickled Onions (Fajitas)',
    cuisine: 'Mexican',
    ingredients: [
      { name: 'chicken', required: true, synonyms: ['chicken strips'] },
      { name: 'fajita seasoning', required: true, synonyms: ['fajitas seasoning', 'fajita spice mix'] },
      { name: 'peppers', required: true, synonyms: ['bell pepper', 'sweet pepper', 'peppers mix'] },
      { name: 'onion', required: true },
      { name: 'tortillas', required: true, synonyms: ['fajita wraps'] },
      { name: 'lime', required: false },
    ],
  },
  {
    id: 'chipotle-chicken',
    chipLabel: 'Chipotle Chicken',
    fullName: 'Chipotle & Lime Roast Chicken with Quick Pickled Onions',
    cuisine: 'Mexican',
    ingredients: [
      { name: 'chicken', required: true, synonyms: ['whole chicken', 'chicken'] },
      { name: 'chipotle paste', required: true, synonyms: ['chipotle chilli paste'] },
      { name: 'lime', required: false, synonyms: ['limes'] },
      { name: 'onion', required: false },
      { name: 'sour cream', required: false, synonyms: ['creme fraiche'] },
      { name: 'garlic', required: false },
    ],
  },
  {
    id: 'black-bean-burrito',
    chipLabel: 'Black Bean Burrito Bowls',
    fullName: 'Black Bean Burrito Bowls',
    cuisine: 'Mexican',
    ingredients: [
      { name: 'black beans', required: true, synonyms: ['tinned black beans', 'black bean'] },
      { name: 'rice', required: true, synonyms: ['long grain rice', 'basmati rice', 'microwave rice'] },
      { name: 'peppers', required: true, synonyms: ['sweet peppers', 'bell pepper'] },
      { name: 'sweetcorn', required: true, synonyms: ['sweet corn', 'corn'] },
      { name: 'tomatoes', required: true, synonyms: ['cherry tomatoes', 'salsa'] },
      { name: 'avocado', required: true, synonyms: ['avocados'] },
      { name: 'lime', required: true, synonyms: ['limes'] },
      { name: 'coriander', required: false },
      { name: 'sour cream', required: false },
      { name: 'cheddar cheese', required: false, synonyms: ['grated cheese'] },
    ],
  },
  {
    id: 'fish-tacos',
    chipLabel: 'Fish Tacos',
    fullName: 'Fish Tacos',
    cuisine: 'Mexican',
    ingredients: [
      { name: 'white fish fillets', required: true, synonyms: ['cod fillets', 'haddock fillets', 'fish fillets'] },
      { name: 'taco shells', required: true, synonyms: ['soft tacos', 'tortillas'] },
      { name: 'cabbage', required: true, synonyms: ['red cabbage', 'white cabbage'] },
      { name: 'lime', required: true, synonyms: ['limes'] },
      { name: 'salsa', required: true, synonyms: ['tomato salsa'] },
      { name: 'avocado', required: false },
      { name: 'coriander', required: false },
    ],
  },
  {
    id: 'beef-burrito-bowl',
    chipLabel: 'Beef Burrito Bowl',
    fullName: 'Beef Burrito Bowl',
    cuisine: 'Mexican',
    ingredients: [
      { name: 'beef mince', required: true, synonyms: ['minced beef', 'beef strips', 'stir fry beef'] },
      { name: 'rice', required: true, synonyms: ['long grain rice', 'basmati rice', 'microwave rice'] },
      { name: 'black beans', required: true, synonyms: ['tinned black beans', 'black bean'] },
      { name: 'peppers', required: true, synonyms: ['sweet peppers', 'bell pepper'] },
      { name: 'sweetcorn', required: true, synonyms: ['sweet corn', 'corn'] },
      { name: 'tomatoes', required: true, synonyms: ['cherry tomatoes', 'salsa'] },
      { name: 'avocado', required: true, synonyms: ['avocados'] },
      { name: 'lime', required: true, synonyms: ['limes'] },
      { name: 'sour cream', required: false },
      { name: 'cheddar cheese', required: false, synonyms: ['grated cheese'] },
    ],
  },
  {
    id: 'sheet-pan-fajitas',
    chipLabel: 'Sheet Pan Fajitas',
    fullName: 'Sheet Pan Fajitas',
    cuisine: 'Mexican',
    ingredients: [
      { name: 'chicken', required: true, synonyms: ['chicken breast', 'chicken strips', 'chicken thighs'] },
      { name: 'peppers', required: true, synonyms: ['sweet peppers', 'bell pepper'] },
      { name: 'onion', required: true },
      { name: 'fajita seasoning', required: true, synonyms: ['fajitas seasoning', 'fajita spice mix'] },
      { name: 'tortillas', required: true, synonyms: ['fajita wraps', 'soft tortillas'] },
      { name: 'lime', required: false, synonyms: ['limes'] },
      { name: 'salsa', required: false, synonyms: ['tomato salsa'] },
      { name: 'sour cream', required: false },
    ],
  },
  {
    id: 'chicken-burger-fries',
    chipLabel: 'Chicken Burger with Fries',
    fullName: 'Chicken Burger with Fries',
    cuisine: 'British',
    ingredients: [
      { name: 'chicken burger', required: true, synonyms: ['chicken breast', 'breaded chicken', 'chicken fillets'] },
      { name: 'burger buns', required: true, synonyms: ['brioche burger buns', 'sesame burger buns'] },
      { name: 'lettuce', required: true, synonyms: ['iceberg lettuce', 'little gem'] },
      { name: 'tomato', required: true, synonyms: ['tomatoes'] },
      { name: 'mayonnaise', required: false, synonyms: ['burger sauce', 'mayo'] },
      { name: 'oven chips', required: true, synonyms: ['chips', 'fries', 'potato fries'] },
    ],
  },
  {
    id: 'chilli-con-carne',
    chipLabel: 'Chilli Con Carne',
    fullName: 'Chilli Con Carne',
    cuisine: 'Mexican',
    methodUrl: 'https://www.waitrose.com/ecom/recipe/easy-chilli-con-carne-recipe-waitrose',
    ingredients: [
      { name: 'olive oil', required: false },
      { name: 'onion', required: true, synonyms: ['soffritto', 'onion vegetable mix'] },
      { name: 'garlic', required: true, synonyms: ['garlic cloves'] },
      { name: 'beef mince', required: true, synonyms: ['minced beef', 'lean beef mince'] },
      { name: 'oregano', required: true, synonyms: ['dried oregano', 'mixed herbs'] },
      { name: 'chilli powder', required: true, synonyms: ['chilli seasoning', 'chili powder', 'hot chilli powder'] },
      { name: 'worcestershire sauce', required: false, synonyms: ['worcester sauce'] },
      { name: 'tomato puree', required: true, synonyms: ['tomato purée'] },
      { name: 'beef stock', required: true, synonyms: ['beef stock cubes', 'stock cubes', 'beef stock pot'] },
      { name: 'red kidney beans', required: true, synonyms: ['kidney beans', 'tinned kidney beans', 'tinned red kidney beans'] },
      { name: 'chopped tomatoes', required: true, synonyms: ['tinned chopped tomatoes', 'passata'] },
      { name: 'rice', required: false, synonyms: ['long grain rice', 'basmati rice'] },
    ],
  },
  {
    id: 'pad-thai',
    chipLabel: 'Pad Thai',
    fullName: 'Pad Thai',
    cuisine: 'Chinese',
    methodUrl: 'https://www.waitrose.com/ecom/recipe/prawn-pad-thai',
    ingredients: [
      { name: 'rice noodles', required: true, synonyms: ['pad thai noodles', 'rice stick noodles'] },
      { name: 'prawns', required: true, synonyms: ['king prawns', 'raw prawns', 'chicken'] },
      { name: 'pad thai paste', required: true, synonyms: ['pad thai sauce', 'pad thai stir fry sauce'] },
      { name: 'eggs', required: true, synonyms: ['egg'] },
      { name: 'beansprouts', required: true, synonyms: ['bean sprouts'] },
      { name: 'soy sauce', required: true, synonyms: ['dark soy sauce', 'light soy sauce'] },
      { name: 'lime', required: true, synonyms: ['limes'] },
      { name: 'peanuts', required: true, synonyms: ['roasted peanuts', 'chopped peanuts'] },
      { name: 'salad onions', required: true, synonyms: ['spring onion', 'spring onions'] },
      { name: 'red chilli', required: false, synonyms: ['chilli', 'fresh chilli'] },
    ],
  },
  {
    id: 'carbonara',
    chipLabel: 'Carbonara',
    fullName: 'Spaghetti Carbonara',
    cuisine: 'Italian',
    ingredients: [
      { name: 'spaghetti', required: true, synonyms: ['spaghetti pasta', 'pasta'] },
      { name: 'bacon', required: true, synonyms: ['pancetta', 'streaky bacon'] },
      { name: 'eggs', required: true, synonyms: ['egg'] },
      { name: 'parmesan', required: true, synonyms: ['Parmigiano Reggiano'] },
      { name: 'garlic', required: false },
      { name: 'black pepper', required: false },
    ],
  },
  {
    id: 'mac-and-cheese',
    chipLabel: 'Mac and Cheese',
    fullName: 'Mac and Cheese',
    cuisine: 'British',
    ingredients: [
      { name: 'macaroni', required: true, synonyms: ['macaroni pasta', 'pasta'] },
      { name: 'cheddar cheese', required: true, synonyms: ['mature cheddar', 'grated cheese'] },
      { name: 'milk', required: true },
      { name: 'butter', required: true },
      { name: 'flour', required: false, synonyms: ['plain flour'] },
      { name: 'mustard', required: false, synonyms: ['english mustard'] },
    ],
  },
  {
    id: 'chicken-stir-fry',
    chipLabel: 'Chicken Stir Fry',
    fullName: 'Chicken Stir Fry',
    cuisine: 'Chinese',
    ingredients: [
      { name: 'chicken', required: true, synonyms: ['chicken breast', 'chicken strips', 'chicken thighs'] },
      { name: 'stir fry vegetables', required: true, synonyms: ['stir fry mix', 'mixed stir fry vegetables'] },
      { name: 'soy sauce', required: true, synonyms: ['dark soy sauce'] },
      { name: 'garlic', required: true },
      { name: 'ginger', required: false },
      { name: 'noodles', required: false, synonyms: ['egg noodles', 'rice noodles'] },
      { name: 'sesame oil', required: false },
    ],
  },
  {
    id: 'beef-stir-fry',
    chipLabel: 'Beef Stir Fry',
    fullName: 'Beef Stir Fry',
    cuisine: 'Chinese',
    ingredients: [
      { name: 'beef strips', required: true, synonyms: ['stir fry beef', 'beef steak strips'] },
      { name: 'stir fry vegetables', required: true, synonyms: ['stir fry mix', 'mixed stir fry vegetables'] },
      { name: 'soy sauce', required: true, synonyms: ['dark soy sauce'] },
      { name: 'garlic', required: true },
      { name: 'ginger', required: false },
      { name: 'noodles', required: false, synonyms: ['egg noodles', 'rice noodles'] },
    ],
  },
  {
    id: 'vegetable-stir-fry',
    chipLabel: 'Vegetable Stir Fry',
    fullName: 'Vegetable Stir Fry',
    cuisine: 'Chinese',
    ingredients: [
      { name: 'stir fry vegetables', required: true, synonyms: ['stir fry mix', 'mixed stir fry vegetables'] },
      { name: 'tofu', required: false, synonyms: ['firm tofu'] },
      { name: 'soy sauce', required: true, synonyms: ['dark soy sauce'] },
      { name: 'garlic', required: true },
      { name: 'ginger', required: false },
      { name: 'noodles', required: false, synonyms: ['egg noodles', 'rice noodles'] },
      { name: 'sesame oil', required: false },
    ],
  },
  {
    id: 'chicken-caesar-salad',
    chipLabel: 'Chicken Caesar Salad',
    fullName: 'Chicken Caesar Salad',
    cuisine: 'British',
    ingredients: [
      { name: 'chicken', required: true, synonyms: ['chicken breast', 'cooked chicken'] },
      { name: 'lettuce', required: true, synonyms: ['romaine lettuce', 'cos lettuce'] },
      { name: 'caesar dressing', required: true, synonyms: ['caesar salad dressing'] },
      { name: 'parmesan', required: true, synonyms: ['Parmigiano Reggiano'] },
      { name: 'croutons', required: false },
      { name: 'lemon', required: false },
    ],
  },
  {
    id: 'greek-salad',
    chipLabel: 'Greek Salad',
    fullName: 'Greek Salad',
    cuisine: 'British',
    ingredients: [
      { name: 'cucumber', required: true },
      { name: 'tomatoes', required: true, synonyms: ['cherry tomatoes'] },
      { name: 'feta', required: true, synonyms: ['feta cheese'] },
      { name: 'olives', required: true, synonyms: ['kalamata olives', 'black olives'] },
      { name: 'red onion', required: true, synonyms: ['onion'] },
      { name: 'olive oil', required: false },
      { name: 'lemon', required: false },
    ],
  },
  {
    id: 'chicken-biryani',
    chipLabel: 'Chicken Biryani',
    fullName: 'Chicken Biryani',
    cuisine: 'Indian',
    ingredients: [
      { name: 'chicken', required: true, synonyms: ['chicken thighs', 'chicken pieces'] },
      { name: 'basmati rice', required: true, synonyms: ['rice'] },
      { name: 'onion', required: true },
      { name: 'garlic', required: true },
      { name: 'ginger', required: true },
      { name: 'biryani paste', required: true, synonyms: ['biryani sauce', 'curry paste'] },
      { name: 'yoghurt', required: false, synonyms: ['natural yoghurt'] },
      { name: 'coriander', required: false },
    ],
  },
  {
    id: 'vegetable-biryani',
    chipLabel: 'Vegetable Biryani',
    fullName: 'Vegetable Biryani',
    cuisine: 'Indian',
    ingredients: [
      { name: 'basmati rice', required: true, synonyms: ['rice'] },
      { name: 'mixed vegetables', required: true, synonyms: ['frozen mixed vegetables', 'veg mix'] },
      { name: 'onion', required: true },
      { name: 'garlic', required: true },
      { name: 'ginger', required: true },
      { name: 'biryani paste', required: true, synonyms: ['biryani sauce', 'curry paste'] },
      { name: 'yoghurt', required: false, synonyms: ['natural yoghurt'] },
      { name: 'coriander', required: false },
    ],
  },
  {
    id: 'pizza',
    chipLabel: 'Pizza',
    fullName: 'Homemade Pizza',
    cuisine: 'Italian',
    ingredients: [
      { name: 'pizza base', required: true, synonyms: ['pizza dough', 'ready pizza base'] },
      { name: 'passata', required: true, synonyms: ['pizza sauce', 'chopped tomatoes'] },
      { name: 'mozzarella', required: true, synonyms: ['grated mozzarella', 'mozzarella cheese'] },
      { name: 'basil', required: false },
      { name: 'olive oil', required: false },
      { name: 'pepperoni', required: false },
    ],
  },
  {
    id: 'chicken-pasta',
    chipLabel: 'Chicken Pasta',
    fullName: 'Chicken Pasta',
    cuisine: 'Italian',
    ingredients: [
      { name: 'pasta', required: true, synonyms: ['penne', 'fusilli', 'spaghetti'] },
      { name: 'chicken', required: true, synonyms: ['chicken breast', 'chicken thighs'] },
      { name: 'onion', required: true },
      { name: 'garlic', required: true },
      { name: 'chopped tomatoes', required: true, synonyms: ['passata', 'tinned chopped tomatoes'] },
      { name: 'cream', required: false, synonyms: ['double cream', 'single cream'] },
      { name: 'parmesan', required: false },
    ],
  },
  {
    id: 'tomato-pasta',
    chipLabel: 'Tomato Pasta',
    fullName: 'Tomato Pasta',
    cuisine: 'Italian',
    ingredients: [
      { name: 'pasta', required: true, synonyms: ['penne', 'spaghetti', 'fusilli'] },
      { name: 'chopped tomatoes', required: true, synonyms: ['passata', 'tinned chopped tomatoes'] },
      { name: 'onion', required: true },
      { name: 'garlic', required: true },
      { name: 'basil', required: false },
      { name: 'olive oil', required: false },
      { name: 'parmesan', required: false },
    ],
  },
]

export const MEAL_CHIP_ORDER_BY_CUISINE: Record<'All' | Cuisine, string[]> = {
  All: [
    'Spaghetti Bolognese',
    "Shepherd's Pie",
    'Salmon & veg',
    'Vegetarian lasagna',
    'Beef casserole',
    'Chicken Tikka',
  ],
  British: ['Fish & Chips', "Shepherd's Pie", 'Salmon & veg', 'Beef casserole', 'Roast Chicken', 'Cottage Pie'],
  Chinese: ['Szechuan Chicken', 'Sesame Tofu', 'Five-Spice Duck', 'Prawn Noodles'],
  Indian: ['Butter Chicken', 'Tandoori Lamb', 'Paneer Korma', 'Chicken Tikka', 'Chana Dal', 'Sweet Potato Curry'],
  Italian: ['Prawn Risotto', 'Cauliflower Pasta', 'Spaghetti Bolognese', 'Vegetarian lasagna'],
  Mexican: ['Chicken Fajitas', 'Chipotle Chicken', 'Chicken Tacos'],
}

const recipeByChipLabel = new Map<string, MealRecipe>()
for (const r of MEAL_RECIPES) {
  recipeByChipLabel.set(normalizeMealLine(r.chipLabel), r)
  recipeByChipLabel.set(normalizeMealLine(r.fullName), r)
  recipeByChipLabel.set(normalizeMealLine(r.id.replace(/-/g, ' ')), r)
}

export function findMealRecipeForLine(line: string): MealRecipe | null {
  const n = normalizeMealLine(line)
  return recipeByChipLabel.get(n) ?? null
}

export function getMealRecipeById(id: string): MealRecipe | null {
  return MEAL_RECIPES.find((r) => r.id === id) ?? null
}

/** Chip label for an active meal row (stored or inferred from title). */
export function chipLabelForMeal(meal: { title: string; chipLabel?: string }): string | null {
  if (meal.chipLabel) return meal.chipLabel
  const n = normalizeMealLine(meal.title)
  for (const recipe of MEAL_RECIPES) {
    if (normalizeMealLine(recipe.fullName) === n || normalizeMealLine(recipe.chipLabel) === n) {
      return recipe.chipLabel
    }
  }
  return null
}

/** Waitrose recipe method URL for an active meal row (stored or inferred from title). */
export function methodUrlForMeal(meal: { title: string; chipLabel?: string; methodUrl?: string }): string | null {
  if (meal.methodUrl) return meal.methodUrl
  const n = normalizeMealLine(meal.title)
  for (const recipe of MEAL_RECIPES) {
    if (
      normalizeMealLine(recipe.fullName) === n ||
      normalizeMealLine(recipe.chipLabel) === n ||
      (meal.chipLabel && normalizeMealLine(recipe.chipLabel) === normalizeMealLine(meal.chipLabel))
    ) {
      return recipeMethodUrl(recipe)
    }
  }
  return null
}

