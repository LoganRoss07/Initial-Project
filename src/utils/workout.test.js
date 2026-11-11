import { describe, it, expect } from 'vitest'
import { calculateVolume, calculateDuration, estimateMinutes } from './workout'

describe('calculateVolume', () => {
  it('adds reps x weight for every set', () => {
    const sets = [
      { reps: 8, weight: 60 },
      { reps: 8, weight: 60 },
      { reps: 6, weight: 65 },
    ]
    expect(calculateVolume(sets)).toBe(1350)
  })

  it('returns 0 when there are no sets', () => {
    expect(calculateVolume([])).toBe(0)
  })

  it('handles numbers that arrive as text from form inputs', () => {
    expect(calculateVolume([{ reps: '10', weight: '20' }])).toBe(200)
  })

  it('counts a bodyweight set (weight 0) as 0 volume', () => {
    expect(calculateVolume([{ reps: 12, weight: 0 }])).toBe(0)
  })
})

describe('calculateDuration', () => {
  it('returns whole minutes between two times', () => {
    expect(calculateDuration(0, 45 * 60000)).toBe(45)
  })

  it('rounds to the nearest minute', () => {
    expect(calculateDuration(0, 89000)).toBe(1)
    expect(calculateDuration(0, 90000)).toBe(2)
  })
})

describe('estimateMinutes', () => {
  it('estimates 7 minutes per exercise', () => {
    expect(estimateMinutes({ exercises: [{}, {}, {}] })).toBe(21)
  })

  it('returns 0 for a routine with no exercises', () => {
    expect(estimateMinutes({ exercises: [] })).toBe(0)
  })
})