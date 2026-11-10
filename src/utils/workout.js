export function calculateVolume(sets) {
  return sets.reduce(
    (total, set) => total + Number(set.reps) * Number(set.weight),
    0
  )
}

export function calculateDuration(startTime, endTime) {
  return Math.round((endTime - startTime) / 60000)
}

export function estimateMinutes(routine) {
  return routine.exercises.length * 7
}