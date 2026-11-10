import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { addMeal, deleteMeal, getMealsByDate } from '../db/db'
import { searchFood, getProductByBarcode } from '../services/foodApi'
import Card from '../components/Card'
import BarcodeScanner from '../components/BarcodeScanner'
import { toDateString } from '../utils/dates'
import { calculateDailyTotals } from '../utils/meals'
import './Meals.css'

const emptyForm = { name: '', calories: '', protein: '', carbs: '', fat: '' }

function Meals() {
  const [date, setDate] = useState(() => toDateString())
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [searchMessage, setSearchMessage] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [grams, setGrams] = useState('100')

  const [showScanner, setShowScanner] = useState(false)
  const [barcodeInput, setBarcodeInput] = useState('')

  const meals = useLiveQuery(() => getMealsByDate(date), [date])

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  async function handleSearch(event) {
    event.preventDefault()

    if (query.trim().length < 2) {
      setSearchMessage('Type at least 2 characters to search.')
      return
    }

    setSearching(true)
    setSearchMessage('')
    setResults([])
    setSelectedFood(null)

    try {
      const found = await searchFood(query)
      setResults(found)
      if (found.length === 0) {
        setSearchMessage('No foods found. Try another word, or enter the meal by hand below.')
      }
    } catch (err) {
      setSearchMessage(err.message)
    } finally {
      setSearching(false)
    }
  }

  function applyFood(food, gramsValue) {
    const factor = Number(gramsValue) / 100
    if (!(factor > 0)) return

    setForm({
      name: `${food.name} (${Number(gramsValue)} g)`,
      calories: String(Math.round(food.per100g.calories * factor)),
      protein: String(Math.round(food.per100g.protein * factor * 10) / 10),
      carbs: String(Math.round(food.per100g.carbs * factor * 10) / 10),
      fat: String(Math.round(food.per100g.fat * factor * 10) / 10),
    })
    setError('')
  }

  function chooseFood(food) {
    setSelectedFood(food)
    setGrams('100')
    applyFood(food, '100')
  }

  function handleGramsChange(value) {
    setGrams(value)
    if (selectedFood) applyFood(selectedFood, value)
  }

  async function handleBarcode(code) {
    setShowScanner(false)
    setSearching(true)
    setSearchMessage('')
    setResults([])
    setSelectedFood(null)

    try {
      const food = await getProductByBarcode(code)
      if (!food) {
        setSearchMessage(
          'That barcode was not found, or it has no calorie information. Try searching by name or enter the meal by hand.'
        )
      } else {
        setResults([food])
        chooseFood(food)
      }
    } catch (err) {
      setSearchMessage(err.message)
    } finally {
      setSearching(false)
    }
  }

  function handleBarcodeSubmit(event) {
    event.preventDefault()
    const code = barcodeInput.trim()

    if (!/^\d{6,14}$/.test(code)) {
      setSearchMessage('Enter the digits printed under the barcode (6 to 14 numbers).')
      return
    }
    handleBarcode(code)
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const name = form.name.trim()
    const calories = Number(form.calories)
    const protein = Number(form.protein)
    const carbs = Number(form.carbs)
    const fat = Number(form.fat)

    if (!name) {
      setError('Enter a meal name.')
      return
    }
    if (form.calories === '' || !(calories >= 0)) {
      setError('Calories must be a number that is 0 or more.')
      return
    }
    if (![protein, carbs, fat].every((value) => value >= 0)) {
      setError('Protein, carbs and fat must be 0 or more.')
      return
    }

    try {
      await addMeal({ date, name, calories, protein, carbs, fat })
      setForm(emptyForm)
      setSelectedFood(null)
      setError('')
    } catch {
      setError('Could not save your meal. Please try again.')
    }
  }

  async function handleDelete(meal) {
    if (window.confirm(`Delete ${meal.name}?`)) {
      await deleteMeal(meal.id)
    }
  }

  if (!meals) {
    return <p>Loading...</p>
  }

  const totals = calculateDailyTotals(meals)

  return (
    <div>
      <Card title="Daily total">
        <p className="stat-number">{Math.round(totals.calories)} kcal</p>
        <div className="macro-grid">
          <div>
            <p className="stat-label">Protein</p>
            <p className="macro-value">{Math.round(totals.protein)} g</p>
          </div>
          <div>
            <p className="stat-label">Carbs</p>
            <p className="macro-value">{Math.round(totals.carbs)} g</p>
          </div>
          <div>
            <p className="stat-label">Fat</p>
            <p className="macro-value">{Math.round(totals.fat)} g</p>
          </div>
        </div>
      </Card>

      <Card title="Find a food">
        <form onSubmit={handleSearch} noValidate>
          <div className="field">
            <label htmlFor="food-search">Search for a food</label>
            <input
              id="food-search"
              type="search"
              value={query}
              placeholder="e.g. banana, porridge oats"
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-full" disabled={searching}>
            {searching ? 'Searching...' : 'Search'}
          </button>
        </form>

        <div className="barcode-actions">
          <button
            type="button"
            className="btn btn-secondary btn-full"
            aria-expanded={showScanner}
            onClick={() => setShowScanner((open) => !open)}
          >
            {showScanner ? 'Hide scanner' : 'Scan a barcode'}
          </button>
        </div>

        {showScanner && (
          <BarcodeScanner
            onDetected={handleBarcode}
            onClose={() => setShowScanner(false)}
          />
        )}

        <form onSubmit={handleBarcodeSubmit} noValidate className="barcode-form">
          <div className="field">
            <label htmlFor="barcode-number">Or type a barcode number</label>
            <input
              id="barcode-number"
              type="text"
              inputMode="numeric"
              value={barcodeInput}
              placeholder="e.g. 3017620422003"
              onChange={(e) => setBarcodeInput(e.target.value)}
            />
          </div>
          <button type="submit" className="btn btn-secondary btn-full" disabled={searching}>
            Look up barcode
          </button>
        </form>

        {searching && (
          <p role="status" className="food-note">
            Looking up foods. This can take a few seconds.
          </p>
        )}

        {searchMessage && (
          <p role="alert" className="error">
            {searchMessage}
          </p>
        )}

        {results.length > 0 && (
          <ul className="food-results">
            {results.map((food, index) => (
              <li key={`${food.code}-${index}`}>
                <button
                  type="button"
                  className="food-result"
                  aria-pressed={selectedFood === food}
                  onClick={() => chooseFood(food)}
                >
                  <span className="activity-name">{food.name}</span>
                  <span className="activity-meta">
                    {food.brand ? `${food.brand} - ` : ''}
                    {Math.round(food.per100g.calories)} kcal per 100 g
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {selectedFood && (
          <div className="field food-amount">
            <label htmlFor="food-grams">Amount eaten (g)</label>
            <input
              id="food-grams"
              type="number"
              inputMode="decimal"
              min="1"
              step="any"
              value={grams}
              onChange={(e) => handleGramsChange(e.target.value)}
            />
            <p className="food-note">
              The meal form below has been filled in. Check it, then press Add meal.
            </p>
          </div>
        )}

        <p className="food-note">
          Food data from{' '}
          <a href="https://world.openfoodfacts.org" target="_blank" rel="noreferrer">
            Open Food Facts
          </a>
          .
        </p>
      </Card>

      <Card title="Add a meal">
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="meal-date">Date</label>
            <input
              id="meal-date"
              type="date"
              value={date}
              max={toDateString()}
              onChange={(e) => e.target.value && setDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="meal-name">Meal name</label>
            <input
              id="meal-name"
              type="text"
              value={form.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="meal-calories">Calories (kcal)</label>
            <input
              id="meal-calories"
              type="number"
              inputMode="numeric"
              min="0"
              value={form.calories}
              onChange={(e) => handleChange('calories', e.target.value)}
            />
          </div>
          <div className="macro-inputs">
            <div className="field">
              <label htmlFor="meal-protein">Protein (g)</label>
              <input
                id="meal-protein"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={form.protein}
                onChange={(e) => handleChange('protein', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="meal-carbs">Carbs (g)</label>
              <input
                id="meal-carbs"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={form.carbs}
                onChange={(e) => handleChange('carbs', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="meal-fat">Fat (g)</label>
              <input
                id="meal-fat"
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={form.fat}
                onChange={(e) => handleChange('fat', e.target.value)}
              />
            </div>
          </div>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-full">
            Add meal
          </button>
        </form>
      </Card>

      <h2 className="section-title">Meals logged</h2>
      {meals.length === 0 ? (
        <p>No meals logged for this day yet.</p>
      ) : (
        <ul className="activity-list">
          {meals.map((meal) => (
            <li key={meal.id} className="meal-item">
              <div>
                <p className="activity-name">{meal.name}</p>
                <p className="activity-meta">
                  {meal.calories} kcal - P {meal.protein}g - C {meal.carbs}g - F {meal.fat}g
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-small"
                aria-label={`Delete ${meal.name}`}
                onClick={() => handleDelete(meal)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Meals