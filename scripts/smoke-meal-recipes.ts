/**
 * Local smoke test: meal → ingredients → POPMAS matches (no secrets printed).
 * Run: npx vite-node scripts/smoke-meal-recipes.ts
 */
import { resolveMealIngredients } from '../src/lib/resolveMealIngredients'
import { isRecipeCatalogHit } from '../src/lib/recipeIngredientMatch'
import { topCatalogMatches } from '../src/lib/catalogMatch'
import type { WaitroseCatalogItem } from '../src/lib/waitroseCatalog'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv() {
  const text = readFileSync(resolve(process.cwd(), '.env'), 'utf8')
  const env: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#') || !t.includes('=')) continue
    const i = t.indexOf('=')
    env[t.slice(0, i)] = t.slice(i + 1).trim()
  }
  return env
}

async function loadPopmas(): Promise<WaitroseCatalogItem[]> {
  const env = loadEnv()
  const db = createClient(env.VITE_SUPABASE_URL!, env.VITE_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const pageSize = 1000
  const rows: Record<string, unknown>[] = []
  let from = 0
  while (true) {
    const to = from + pageSize - 1
    const { data, error } = await db
      .from('POPMAS')
      .select('"Order", "imageUrl", "Name", "Size", "Price", "Formatted PPU", "Product Type", "Offers", "Range", "Grouping", "Type"')
      .order('Order', { ascending: true })
      .range(from, to)
    if (error) throw error
    const batch = data ?? []
    if (batch.length === 0) break
    rows.push(...batch)
    if (batch.length < pageSize) break
    from += pageSize
  }
  return rows.map((row, idx) => {
    const name = String(row.Name ?? '').trim()
    const size = String(row.Size ?? '').trim()
    return {
      id: `POPMAS-${row.Order ?? idx + 1}`,
      name: size ? `${name} (${size})` : name,
      price: 0,
      unitPrice: '—',
      imageUrl: String(row.imageUrl ?? ''),
      productUrl: '',
      productType: String(row['Product Type'] ?? '') || undefined,
      range: String(row.Range ?? '') || undefined,
      grouping: String(row.Grouping ?? '') || undefined,
      popmasType: String(row.Type ?? '') || undefined,
    }
  })
}

const BANNED_FOR_SPAG = [/orange juice/i, /cereal|weetabix|corn flake/i, /thai green curry/i, /sourdough/i, /\bmilk\b/i, /bigham/i, /ready meal/i]
const BANNED_FOR_BURRITO = [/chicken/i]
const BANNED_FOR_PANEER = [/chicken/i]

async function main() {
  const products = await loadPopmas()
  console.log('POPMAS_SAMPLE', products.length)

  const meals = [
    'Spaghetti Bolognese',
    'Chilli Con Carne',
    'Pad Thai',
    'Beef Burrito Bowl',
    'Sheet Pan Fajitas',
    'Chicken Burger with Fries',
    'Black Bean Burrito Bowls',
    'Mushroom Risotto',
    'Spanish Omelette',
    'Paneer Curry',
  ]

  for (const meal of meals) {
    const resolved = resolveMealIngredients(meal)
    if (resolved.status !== 'resolved') {
      console.log(JSON.stringify({ meal, status: 'FAIL_UNRESOLVED' }))
      continue
    }
    const matched: Array<{ ingredient: string; product: string | null }> = []
    for (const ing of resolved.ingredients) {
      const queries = [...(ing.synonyms ?? []), ing.name].sort((a, b) => b.length - a.length)
      let product: string | null = null
      for (const q of queries) {
        const candidates = topCatalogMatches(q, products, 40)
        const suitable = candidates.filter((h) => isRecipeCatalogHit(ing, h))
        if (suitable[0]) {
          product = suitable[0].name
          break
        }
      }
      matched.push({ ingredient: ing.name, product })
    }

    const productNames = matched.map((m) => m.product).filter(Boolean).join(' | ')
    let banFail = false
    if (meal.includes('Spaghetti')) banFail = BANNED_FOR_SPAG.some((r) => r.test(productNames))
    if (meal.includes('Burrito')) banFail = BANNED_FOR_BURRITO.some((r) => r.test(productNames))
    if (meal.includes('Paneer')) banFail = BANNED_FOR_PANEER.some((r) => r.test(productNames))

    console.log(
      JSON.stringify({
        meal,
        status: banFail ? 'FAIL_BANNED_PRODUCT' : 'OK',
        ingredientCount: resolved.ingredients.length,
        matchedCount: matched.filter((m) => m.product).length,
        rows: matched,
      }),
    )
  }
}

main().catch((err) => {
  console.error('SMOKE_FAIL', err instanceof Error ? err.message : String(err))
  process.exit(1)
})
