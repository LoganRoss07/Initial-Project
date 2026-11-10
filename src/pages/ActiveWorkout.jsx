import { useState, useEffect } from 'react'
import { useLocation, useNavigate, Navigate } from 'react-router-dom'
import Card from '../components/Card'
import { saveWorkout } from '../db/db'
import { toDateString } from '../utils/dates'
import { calculateVolume, calculateDuration } from '../utils/workout'
import './ActiveWorkout.css'

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

function ActiveWorkout() {
  const location = useLocation()
  const routine = location.state?.routine

  if (!routine) {
    return <Navigate to="/" replace />
  }

  return <WorkoutSession routine={routine} />
}

function WorkoutSession({ routine }) {
  const navigate = useNavigate()
  const [startTime] = useState(() => Date.now())
  const [now, setNow] = useState(() => Date.now())
  const [error, setError] = useState('')
  const [exercises, setExercises] = useState(() =>
    routine.exercises.map((exercise) => ({
      name: exercise.name,
      sets: Array.from({ length: exercise.sets }, () => ({
        reps: String(exercise.reps),
        weight: '',
        done: false,
      })),
    }))
  )

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const elapsedSeconds = Math.floor((now - startTime) / 1000)

  function updateSet(exerciseIndex, setIndex, field, value) {
    setExercises((current) =>
      current.map((exercise, i) =>
        i !== exerciseIndex
          ? exercise
          : {
              ...exercise,
              sets: exercise.sets.map((set, j) =>
                j !== setIndex ? set : { ...set, [field]: value }
              ),
            }
      )
    )
  }

  function addSet(exerciseIndex) {
    setExercises((current) =>
      current.map((exercise, i) => {
        if (i !== exerciseIndex) return exercise
        const last = exercise.sets[exercise.sets.length - 1]
        return {
          ...exercise,
          sets: [
            ...exercise.sets,
            { reps: last ? last.reps : '', weight: last ? last.weight : '', done: false },
          ],
        }
      })
    )
  }

  async function finishWorkout() {
    const completed = exercises
      .map((exercise) => ({
        name: exercise.name,
        sets: exercise.sets
          .filter((set) => set.done)
          .map((set) => ({ reps: Number(set.reps), weight: Number(set.weight) })),
      }))
      .filter((exercise) => exercise.sets.length > 0)

    if (completed.length === 0) {
      setError('Tick at least one completed set before finishing.')
      return
    }

    const allSets = completed.flatMap((exercise) => exercise.sets)
    const hasInvalidSet = allSets.some(
      (set) => !(set.reps > 0) || !(set.weight >= 0)
    )
    if (hasInvalidSet) {
      setError('Each ticked set needs reps above 0 and a weight of 0 or more.')
      return
    }

    const endTime = Date.now()
    try {
      await saveWorkout({
        date: toDateString(),
        routineName: routine.name,
        startTime,
        endTime,
        durationMinutes: Math.max(1, calculateDuration(startTime, endTime)),
        exercises: completed,
        totalVolume: calculateVolume(allSets),
      })
      navigate('/')
    } catch {
      setError('Could not save your workout. Please try again.')
    }
  }

  function cancelWorkout() {
    if (window.confirm('Discard this workout? Nothing will be saved.')) {
      navigate('/')
    }
  }

  return (
    <div>
      <Card>
        <p className="eyebrow">{routine.name}</p>
        <p className="timer" role="timer" aria-label="Workout time">
          {formatTime(elapsedSeconds)}
        </p>
      </Card>

      {exercises.map((exercise, exerciseIndex) => (
        <Card key={exerciseIndex} title={exercise.name}>
          <div className="set-row set-head" aria-hidden="true">
            <span>Set</span>
            <span>kg</span>
            <span>Reps</span>
            <span>Done</span>
          </div>

          {exercise.sets.map((set, setIndex) => (
            <div className="set-row" key={setIndex}>
              <span>{setIndex + 1}</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                value={set.weight}
                aria-label={`${exercise.name} set ${setIndex + 1} weight in kilograms`}
                onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', e.target.value)}
              />
              <input
                type="number"
                inputMode="numeric"
                min="1"
                value={set.reps}
                aria-label={`${exercise.name} set ${setIndex + 1} reps`}
                onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', e.target.value)}
              />
              <input
                type="checkbox"
                checked={set.done}
                aria-label={`${exercise.name} set ${setIndex + 1} done`}
                onChange={(e) => updateSet(exerciseIndex, setIndex, 'done', e.target.checked)}
              />
            </div>
          ))}

          <button
            type="button"
            className="btn btn-secondary btn-full"
            onClick={() => addSet(exerciseIndex)}
          >
            Add set
          </button>
        </Card>
      ))}

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <div className="actions">
        <button type="button" className="btn btn-full" onClick={finishWorkout}>
          Finish workout
        </button>
        <button type="button" className="btn btn-secondary btn-full" onClick={cancelWorkout}>
          Cancel workout
        </button>
      </div>
    </div>
  )
}

export default ActiveWorkout