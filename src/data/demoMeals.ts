/** Seed meals matching the Shop by Meals desktop reference (prototype state). */

export type DemoIngredient = {
  id: string
  name: string
  needText: string
  price: number
  unitPrice: string
  qty: number
  selected: boolean
  image: string
  matched: boolean
}

export type DemoMeal = {
  id: string
  title: string
  serves: string
  removed: boolean
  expanded: boolean
  calories: string
  tags: string[]
  preparationTime: string
  rating: number
  ratingCount: number
  servings: number
  allergenStatus?: 'none' | 'update'
  ingredients: DemoIngredient[]
}

const placeholderIngredients = (mealId: string, count: number): DemoIngredient[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `${mealId}-ing-${index + 1}`,
    name: 'Lorem ipsum dolor sit amet consectetur.',
    needText: 'You need: 1 x 200g of...',
    price: 1,
    unitPrice: '80p per 100g',
    qty: 1,
    selected: true,
    image: '🛒',
    matched: true,
  }))

export const DEMO_FOLDER_NAME = 'FOLDER NAME'

export const DEMO_MEALS: DemoMeal[] = [
  {
    id: 'demo-meal-1',
    title: 'Lorem ipsum dolor sit amet consectetur.',
    serves: 'Serves 4',
    removed: false,
    expanded: false,
    calories: '175 Kcal',
    tags: ['Vegan', 'Vegetarian'],
    preparationTime: '35 mins',
    rating: 5,
    ratingCount: 1,
    servings: 4,
    allergenStatus: 'none',
    ingredients: placeholderIngredients('demo-meal-1', 5),
  },
  {
    id: 'demo-meal-2',
    title: 'Lorem ipsum dolor sit amet consectetur.',
    serves: 'Serves 4',
    removed: false,
    expanded: false,
    calories: '175 Kcal',
    tags: [],
    preparationTime: '35 mins',
    rating: 5,
    ratingCount: 1,
    servings: 4,
    allergenStatus: 'none',
    ingredients: placeholderIngredients('demo-meal-2', 9),
  },
  {
    id: 'demo-meal-3',
    title: 'Lorem ipsum dolor sit amet consectetur.',
    serves: 'Serves 4',
    removed: false,
    expanded: false,
    calories: '175 Kcal',
    tags: [],
    preparationTime: '35 mins',
    rating: 5,
    ratingCount: 1,
    servings: 4,
    allergenStatus: 'update',
    ingredients: placeholderIngredients('demo-meal-3', 9),
  },
]

/** Fixed inspiration chips from the Shop by Meals desktop reference. */
export const SHOP_BY_MEALS_INSPIRATION_CHIPS = [
  'Spaghetti Bolognese',
  "Shepherd's Pie",
  'Salmon & veg',
  'Vegetarian lasagna',
  'Beef casserole',
] as const
