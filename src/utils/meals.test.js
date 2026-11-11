import { describe, it, expect } from 'vitest'
import { calculateDailyTotals } from './meals'

describe('calculateDailyTotals', () => {
  it('adds up calories and macros across meals', () => {
    const meals = [
      { calories: 300, protein: 20, carbs: 30, fat: 10 },
      { calories: 500, protein: 35, carbs: 50, fat: 15 },
    ]
    expect(calculateDailyTotals(meals)).toEqual({
      calories: 800,
      protein: 55,
      carbs: 80,
      fat: 25,
    })
  })

  it('returns zeros when there are no meals', () => {
    expect(calculateDailyTotals([])).toEqual({
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    })
  })

  it('treats missing or invalid values as 0 instead of breaking the total', () => {
    const meals = [
      { calories: 'abc', protein: undefined, carbs: 10, fat: null },
      { calories: 200 },
    ]
    expect(calculateDailyTotals(meals)).toEqual({
      calories: 200,
      protein: 0,
      carbs: 10,
      fat: 0,
    })
  })
})