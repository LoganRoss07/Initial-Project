const BASE_URL = 'https://world.openfoodfacts.org'
const SEARCH_URL = 'https://search.openfoodfacts.org/search'
const FIELDS = 'code,product_name,brands,nutriments'
const searchCache = new Map()

function toNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function toFood(product) {
  const name = (product.product_name || '').trim()
  const nutrients = product.nutriments || {}

  let calories = nutrients['energy-kcal_100g']
  if (calories === undefined && nutrients.energy_100g !== undefined) {
    calories = Number(nutrients.energy_100g) / 4.184
  }

  if (!name || calories === undefined || !Number.isFinite(Number(calories))) {
    return null
  }

  const brands = Array.isArray(product.brands)
    ? product.brands.join(',')
    : product.brands || ''

  return {
    code: product.code,
    name,
    brand: brands.split(',')[0].trim(),
    per100g: {
      calories: toNumber(calories),
      protein: toNumber(nutrients.proteins_100g),
      carbs: toNumber(nutrients.carbohydrates_100g),
      fat: toNumber(nutrients.fat_100g),
    },
  }
}

async function fetchJson(url) {
  let response
  try {
    response = await fetch(url)
  } catch {
    throw new Error('Could not reach the food database. Check your internet connection.')
  }

  if (response.status === 404) return null
  if (response.status === 429) {
    throw new Error('Too many searches. Please wait a minute and try again.')
  }
  if (!response.ok) {
    throw new Error('The food database is busy right now. Please try again shortly.')
  }

  try {
    return await response.json()
  } catch {
    throw new Error('The food database sent a response the app could not read.')
  }
}

async function searchModern(query) {
  const url =
    `${SEARCH_URL}?q=${encodeURIComponent(query)}` +
    `&langs=en&page_size=15&fields=${FIELDS}`
  const data = await fetchJson(url)
  console.log('Search response', data) // TEMPORARY: delete once search works
  return data?.hits || data?.products || []
}

async function searchLegacy(query) {
  const url =
    `${BASE_URL}/cgi/search.pl?search_terms=${encodeURIComponent(query)}` +
    `&search_simple=1&action=process&json=1&page_size=15&fields=${FIELDS}`
  const data = await fetchJson(url)
  return data?.products || []
}

export async function searchFood(text) {
  const query = text.trim().toLowerCase()
  if (query.length < 2) return []
  if (searchCache.has(query)) return searchCache.get(query)

  let products
  try {
    products = await searchModern(query)
  } catch (firstError) {
    try {
      products = await searchLegacy(query)
    } catch {
      throw firstError
    }
  }

  const foods = products.map(toFood).filter(Boolean).slice(0, 10)
  if (foods.length > 0) searchCache.set(query, foods)
  return foods
}

export async function getProductByBarcode(code) {
  const clean = String(code).trim()
  if (!/^\d{6,14}$/.test(clean)) return null

  const data = await fetchJson(
    `${BASE_URL}/api/v2/product/${clean}.json?fields=${FIELDS}`
  )
  if (!data || data.status !== 1 || !data.product) return null
  return toFood({ ...data.product, code: data.product.code || clean })
}