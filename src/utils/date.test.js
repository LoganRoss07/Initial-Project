import { describe, it, expect } from 'vitest'
import { toDateString, getWeekStart, formatDate } from './dates'

describe('toDateString', () => {
  it('formats a date as YYYY-MM-DD', () => {
    expect(toDateString(new Date(2026, 10, 11))).toBe('2026-11-11')
  })

  it('pads single-digit months and days', () => {
    expect(toDateString(new Date(2026, 0, 5))).toBe('2026-01-05')
  })
})

describe('getWeekStart', () => {
  it('returns the Monday of the same week for a midweek date', () => {
    expect(getWeekStart(new Date(2026, 10, 11))).toBe('2026-11-09')
  })

  it('returns the same day when the date is a Monday', () => {
    expect(getWeekStart(new Date(2026, 10, 9))).toBe('2026-11-09')
  })

  it('treats Sunday as the last day of the week', () => {
    expect(getWeekStart(new Date(2026, 10, 15))).toBe('2026-11-09')
  })

  it('works across a month boundary', () => {
    expect(getWeekStart(new Date(2026, 11, 2))).toBe('2026-11-30')
  })
})

describe('formatDate', () => {
  it('turns a date string into a short readable date', () => {
    expect(formatDate('2026-11-10')).toMatch(/Tue.*10.*Nov/)
  })
})