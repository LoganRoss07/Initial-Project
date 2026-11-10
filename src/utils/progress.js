import { toDateString, getWeekStart } from './dates'

export function getRangeStart(range) {
  const today = new Date()
  if (range === 'week') return getWeekStart(today)
  if (range === 'month') {
    return toDateString(new Date(today.getFullYear(), today.getMonth(), 1))
  }
  return null
}

export function summariseWorkouts(workouts) {
  return workouts.reduce(
    (summary, workout) => ({
      count: summary.count + 1,
      totalMinutes: summary.totalMinutes + (workout.durationMinutes || 0),
      totalVolume: summary.totalVolume + (workout.totalVolume || 0),
    }),
    { count: 0, totalMinutes: 0, totalVolume: 0 }
  )
}

export function formatMinutes(minutes) {
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

export function findPersonalBest(workouts, exerciseName) {
  let best = null
  for (const workout of workouts) {
    for (const exercise of workout.exercises) {
      if (exercise.name !== exerciseName) continue
      for (const set of exercise.sets) {
        const isBetter =
          !best ||
          set.weight > best.weight ||
          (set.weight === best.weight && set.reps > best.reps)
        if (isBetter) {
          best = { weight: set.weight, reps: set.reps, date: workout.date }
        }
      }
    }
  }
  return best
}

export function getPersonalBests(workouts) {
  const names = [
    ...new Set(workouts.flatMap((w) => w.exercises.map((e) => e.name))),
  ]
  return names
    .sort()
    .map((name) => ({ name, ...findPersonalBest(workouts, name) }))
}

export function caloriesByDate(meals) {
  const totals = {}
  for (const meal of meals) {
    totals[meal.date] = (totals[meal.date] || 0) + (Number(meal.calories) || 0)
  }
  return Object.keys(totals)
    .sort()
    .map((date) => ({ date, calories: Math.round(totals[date]) }))
}