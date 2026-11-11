import Dexie from 'dexie'

const defaultRoutines = [
  {
    name: 'Push Day',
    muscleGroups: 'Chest - Shoulders - Triceps',
    exercises: [
      { name: 'Bench Press', sets: 4, reps: 8 },
      { name: 'Incline Dumbbell Press', sets: 3, reps: 10 },
      { name: 'Overhead Press', sets: 3, reps: 8 },
      { name: 'Lateral Raise', sets: 3, reps: 12 },
      { name: 'Chest Fly', sets: 3, reps: 12 },
      { name: 'Tricep Pushdown', sets: 3, reps: 12 },
      { name: 'Overhead Tricep Extension', sets: 3, reps: 12 },
    ],
  },
  {
    name: 'Pull Day',
    muscleGroups: 'Back - Biceps',
    exercises: [
      { name: 'Deadlift', sets: 3, reps: 5 },
      { name: 'Pull-up', sets: 3, reps: 8 },
      { name: 'Barbell Row', sets: 3, reps: 8 },
      { name: 'Lat Pulldown', sets: 3, reps: 10 },
      { name: 'Seated Cable Row', sets: 3, reps: 12 },
      { name: 'Face Pull', sets: 3, reps: 15 },
      { name: 'Bicep Curl', sets: 3, reps: 12 },
    ],
  },
  {
    name: 'Leg Day',
    muscleGroups: 'Quads - Hamstrings - Calves',
    exercises: [
      { name: 'Squat', sets: 4, reps: 8 },
      { name: 'Romanian Deadlift', sets: 3, reps: 10 },
      { name: 'Leg Press', sets: 3, reps: 12 },
      { name: 'Leg Curl', sets: 3, reps: 12 },
      { name: 'Walking Lunge', sets: 3, reps: 12 },
      { name: 'Calf Raise', sets: 4, reps: 15 },
    ],
  },
]

function createDatabase(name) {
  const database = new Dexie(name)

  database.version(1).stores({
    routines: '++id, name',
    workouts: '++id, date',
    meals: '++id, date',
    settings: 'key',
  })

  database.on('populate', () => {
    database.routines.bulkAdd(defaultRoutines)
  })

  return database
}

// The current database. Other files always see the latest one.
export let db = createDatabase('GymTrackerDB-guest')

export function openDatabaseForUser(uid) {
  const name = `GymTrackerDB-${uid}`
  if (db.name === name) return
  db.close()
  db = createDatabase(name)
}

// Routines
export const getRoutines = () => db.routines.toArray()
export const addRoutine = (routine) => db.routines.add(routine)
export const updateRoutine = (id, changes) => db.routines.update(id, changes)
export const deleteRoutine = (id) => db.routines.delete(id)

// Workouts (completed sessions)
export const saveWorkout = (workout) => db.workouts.add(workout)
export const getWorkout = (id) => db.workouts.get(id)
export const getAllWorkouts = () => db.workouts.orderBy('date').reverse().toArray()
export const getWorkoutsSince = (date) =>
  db.workouts.where('date').aboveOrEqual(date).toArray()
export const deleteWorkout = (id) => db.workouts.delete(id)

// Meals
export const addMeal = (meal) => db.meals.add(meal)
export const getMealsByDate = (date) => db.meals.where('date').equals(date).toArray()
export const deleteMeal = (id) => db.meals.delete(id)

// Settings (key and value pairs)
export async function getSetting(key, fallback) {
  const row = await db.settings.get(key)
  return row ? row.value : fallback
}
export const saveSetting = (key, value) => db.settings.put({ key, value })