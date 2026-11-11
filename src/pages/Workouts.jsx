import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  getRoutines,
  addRoutine,
  updateRoutine,
  deleteRoutine,
  getAllWorkouts,
} from '../db/db'
import Card from '../components/Card'
import SegmentedControl from '../components/SegmentedControl'
import { formatDate } from '../utils/dates'
import { formatMinutes } from '../utils/progress'
import './Workouts.css'

const views = [
  { value: 'routines', label: 'Routines' },
  { value: 'history', label: 'History' },
]

const blankExercise = () => ({ name: '', sets: '3', reps: '10' })

function RoutineEditor({ routine, onDone }) {
  const [name, setName] = useState(routine?.name ?? '')
  const [muscleGroups, setMuscleGroups] = useState(routine?.muscleGroups ?? '')
  const [exercises, setExercises] = useState(
    routine?.exercises?.length
      ? routine.exercises.map((e) => ({
          name: e.name,
          sets: String(e.sets),
          reps: String(e.reps),
        }))
      : [blankExercise()]
  )
  const [error, setError] = useState('')

  function changeExercise(index, field, value) {
    setExercises((list) =>
      list.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    )
  }

  function removeExercise(index) {
    setExercises((list) => list.filter((_, i) => i !== index))
  }

  async function handleSave(event) {
    event.preventDefault()

    const cleaned = exercises
      .map((e) => ({ name: e.name.trim(), sets: Number(e.sets), reps: Number(e.reps) }))
      .filter((e) => e.name)

    if (!name.trim()) {
      setError('Enter a routine name.')
      return
    }
    if (cleaned.length === 0) {
      setError('Add at least one exercise with a name.')
      return
    }
    const valid = cleaned.every(
      (e) =>
        Number.isInteger(e.sets) &&
        e.sets >= 1 &&
        e.sets <= 20 &&
        Number.isInteger(e.reps) &&
        e.reps >= 1 &&
        e.reps <= 100
    )
    if (!valid) {
      setError('Sets must be 1 to 20 and reps 1 to 100, as whole numbers.')
      return
    }

    const data = {
      name: name.trim(),
      muscleGroups: muscleGroups.trim(),
      exercises: cleaned,
    }

    try {
      if (routine?.id) {
        await updateRoutine(routine.id, data)
      } else {
        await addRoutine(data)
      }
      onDone()
    } catch {
      setError('Could not save the routine. Please try again.')
    }
  }

  return (
    <Card title={routine?.id ? 'Edit routine' : 'New routine'}>
      <form onSubmit={handleSave} noValidate>
        <div className="field">
          <label htmlFor="routine-name">Routine name</label>
          <input
            id="routine-name"
            type="text"
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="routine-groups">Muscle groups (optional)</label>
          <input
            id="routine-groups"
            type="text"
            maxLength={60}
            placeholder="e.g. Chest - Shoulders - Triceps"
            value={muscleGroups}
            onChange={(e) => setMuscleGroups(e.target.value)}
          />
        </div>

        <p className="setting-label">Exercises</p>
        {exercises.map((exercise, index) => (
          <div className="exercise-row" key={index}>
            <div className="field exercise-name">
              <label htmlFor={`ex-${index}-name`}>Exercise {index + 1}</label>
              <input
                id={`ex-${index}-name`}
                type="text"
                maxLength={40}
                value={exercise.name}
                onChange={(e) => changeExercise(index, 'name', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor={`ex-${index}-sets`}>Sets</label>
              <input
                id={`ex-${index}-sets`}
                type="number"
                inputMode="numeric"
                min="1"
                max="20"
                value={exercise.sets}
                onChange={(e) => changeExercise(index, 'sets', e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor={`ex-${index}-reps`}>Reps</label>
              <input
                id={`ex-${index}-reps`}
                type="number"
                inputMode="numeric"
                min="1"
                max="100"
                value={exercise.reps}
                onChange={(e) => changeExercise(index, 'reps', e.target.value)}
              />
            </div>
            <button
              type="button"
              className="btn btn-secondary remove-exercise"
              aria-label={`Remove exercise ${index + 1}`}
              onClick={() => removeExercise(index)}
            >
              ✕
            </button>
          </div>
        ))}

        <button
          type="button"
          className="btn btn-secondary btn-full"
          onClick={() => setExercises((list) => [...list, blankExercise()])}
        >
          Add exercise
        </button>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <div className="editor-actions">
          <button type="submit" className="btn btn-full">
            Save routine
          </button>
          <button type="button" className="btn btn-secondary btn-full" onClick={onDone}>
            Cancel
          </button>
        </div>
      </form>
    </Card>
  )
}

function Workouts() {
  const navigate = useNavigate()
  const [view, setView] = useState('routines')
  const [editing, setEditing] = useState(null)

  const routines = useLiveQuery(() => getRoutines())
  const workouts = useLiveQuery(() => getAllWorkouts())

  if (!routines || !workouts) {
    return <p>Loading...</p>
  }

  if (editing) {
    return <RoutineEditor routine={editing.id ? editing : null} onDone={() => setEditing(null)} />
  }

  function startRoutine(routine) {
    navigate('/workout/active', { state: { routine } })
  }

  async function handleDelete(routine) {
    if (window.confirm(`Delete the routine "${routine.name}"? Past workouts are kept.`)) {
      await deleteRoutine(routine.id)
    }
  }

  return (
    <div>
      <SegmentedControl label="Workouts view" value={view} onChange={setView} options={views} />

      {view === 'routines' && (
        <div className="workouts-section">
          <button type="button" className="btn btn-full" onClick={() => setEditing({})}>
            New routine
          </button>

          {routines.length === 0 && <p>No routines yet. Create your first one above.</p>}

          {routines.map((routine) => (
            <Card key={routine.id} title={routine.name}>
              {routine.muscleGroups && <p className="routine-groups">{routine.muscleGroups}</p>}
              <p className="stat-label">
                {routine.exercises.length} exercise{routine.exercises.length === 1 ? '' : 's'}
              </p>
              <ul className="exercise-list">
                {routine.exercises.map((exercise, index) => (
                  <li key={index}>
                    {exercise.name} - {exercise.sets} x {exercise.reps}
                  </li>
                ))}
              </ul>
              <div className="routine-actions">
                <button type="button" className="btn" onClick={() => startRoutine(routine)}>
                  Start
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(routine)}>
                  Edit
                </button>
                <button type="button" className="btn btn-danger" onClick={() => handleDelete(routine)}>
                  Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {view === 'history' && (
        <div className="workouts-section">
          {workouts.length === 0 && (
            <p>No workouts yet. Start a routine and your history will appear here.</p>
          )}
          {workouts.map((workout) => (
            <Link key={workout.id} to={`/workout/${workout.id}`} className="history-item">
              <span className="history-name">{workout.routineName}</span>
              <span className="stat-label">
                {formatDate(workout.date)} - {formatMinutes(workout.durationMinutes || 0)} -{' '}
                {Math.round(workout.totalVolume || 0)} kg lifted
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Workouts