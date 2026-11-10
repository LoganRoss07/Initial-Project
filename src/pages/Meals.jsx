import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { addMeal, deleteMeal, getMealsByDate } from '../db/db'
import Card from '../components/Card'
import { toDateString } from '../utils/dates'
import { calculateDailyTotals } from '../utils/meals'
import './Meals.css'

const emptyForm = { name: '', calories: '', protein: '', carbs: '', fat: '' }

function Meals() {
  const [date, setDate] = useState(() => toDateString())
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  const meals = useLiveQuery(() => getMealsByDate(date), [date])

  function handleChange(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
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