import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import Card from '../components/Card'
import { estimateMinutes } from '../utils/workout'

function Home() {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(null)

  const routines = useLiveQuery(() => db.routines.toArray())
  const lastWorkout = useLiveQuery(
    async () => (await db.workouts.toCollection().last()) ?? null
  )

  if (!routines || lastWorkout === undefined) {
    return <p>Loading...</p>
  }

  if (routines.length === 0) {
    return <p>No routines yet. Create one in the Workouts tab.</p>
  }

  let todayRoutine = routines.find((r) => r.id === selectedId)
  if (!todayRoutine) {
    const lastIndex = lastWorkout
      ? routines.findIndex((r) => r.name === lastWorkout.routineName)
      : -1
    todayRoutine = routines[(lastIndex + 1) % routines.length]
  }

  function startWorkout() {
    navigate('/workout/active', { state: { routine: todayRoutine } })
  }

  return (
    <div>
      <Card>
        <p className="eyebrow">Today's workout</p>
        <h2 className="routine-name">{todayRoutine.name}</h2>
        <p>{todayRoutine.muscleGroups}</p>
        <p>
          {todayRoutine.exercises.length} exercises - Approx.{' '}
          {estimateMinutes(todayRoutine)} minutes
        </p>
        <button className="btn btn-full" onClick={startWorkout}>
          Start workout
        </button>
        <div className="field" style={{ marginTop: 16 }}>
          <label htmlFor="routine-select">Choose a different routine</label>
          <select
            id="routine-select"
            value={todayRoutine.id}
            onChange={(e) => setSelectedId(Number(e.target.value))}
          >
            {routines.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      </Card>
    </div>
  )
}

export default Home