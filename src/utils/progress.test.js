import { describe, it, expect } from 'vitest'
import {
  getRangeStart,
  summariseWorkouts,
  formatMinutes,
  findPersonalBest,
  getPersonalBests,
  caloriesByDate,
} from './progress'
import { getWeekStart } from './dates'

const workouts = [
  {
    date: '2026-11-01',
    durationMinutes: 50,
    totalVolume: 3000,
    exercises: [
      {
        name: 'Bench Press',
        sets: [
          { weight: 60, reps: 8 },
          { weight: 70, reps: 5 },
        ],
      },
    ],
  },
  {
    date: '2026-11-05',
    durationMinutes: 40,
    totalVolume: 2500,
    exercises: [
      { name: 'Bench Press', sets: [{ weight: 70, reps: 6 }] },
      { name: 'Squat', sets: [{ weight: 100, reps: 5 }] },
    ],
  },
]

describe('summariseWorkouts', () => {
  it('totals the count, minutes and volume', () => {
    expect(summariseWorkouts(workouts)).toEqual({
      count: 2,
      totalMinutes: 90,
      totalVolume: 5500,
    })
  })

  it('returns zeros for no workouts', () => {
    expect(summariseWorkouts([])).toEqual({ count: 0, totalMinutes: 0, totalVolume: 0 })
  })

  it('treats missing fields as 0', () => {
    expect(summariseWorkouts([{}])).toEqual({ count: 1, totalMinutes: 0, totalVolume: 0 })
  })
})

describe('formatMinutes', () => {
  it('shows minutes under an hour', () => {
    expect(formatMinutes(45)).toBe('45 min')
    expect(formatMinutes(0)).toBe('0 min')
  })

  it('shows whole hours', () => {
    expect(formatMinutes(60)).toBe('1 h')
  })

  it('shows hours and minutes', () => {
    expect(formatMinutes(90)).toBe('1 h 30 min')
  })
})

describe('findPersonalBest', () => {
  it('finds the heaviest set, using reps to break a tie', () => {
    expect(findPersonalBest(workouts, 'Bench Press')).toEqual({
      weight: 70,
      reps: 6,
      date: '2026-11-05',
    })
  })

  it('returns null when the exercise was never done', () => {
    expect(findPersonalBest(workouts, 'Deadlift')).toBeNull()
  })

  it('returns null with no workouts', () => {
    expect(findPersonalBest([], 'Squat')).toBeNull()
  })
})

describe('getPersonalBests', () => {
  it('lists each exercise once, sorted by name', () => {
    const result = getPersonalBests(workouts)
    expect(result.map((r) => r.name)).toEqual(['Bench Press', 'Squat'])
    expect(result[1].weight).toBe(100)
  })
})

describe('caloriesByDate', () => {
  it('totals calories per day, sorted by date and rounded', () => {
    const meals = [
      { date: '2026-11-05', calories: 100.4 },
      { date: '2026-11-01', calories: 500 },
      { date: '2026-11-05', calories: 100.4 },
      { date: '2026-11-05', calories: 'abc' },
    ]
    expect(caloriesByDate(meals)).toEqual([
      { date: '2026-11-01', calories: 500 },
      { date: '2026-11-05', calories: 201 },
    ])
  })
})

describe('getRangeStart', () => {
  it('returns null for all time', () => {
    expect(getRangeStart('all')).toBeNull()
  })

  it('returns the first of the month for the month range', () => {
    expect(getRangeStart('month')).toMatch(/^\d{4}-\d{2}-01$/)
  })

  it("returns this week's Monday for the week range", () => {
    expect(getRangeStart('week')).toBe(getWeekStart(new Date()))
  })
})