import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import Card from '../components/Card'
import { estimateMinutes } from '../utils/workout'
import { getWeekStart, formatDate } from '../utils/dates'

function Home() {
  const navigate = useNavigate()
  const [selectedId, setSelectedId] = useState(null)

  const routines = useLiveQuery(() => db.routines.toArray())
  const lastWorkout = useLiveQuery(
    async () => (await db.workouts.toCollection().last()) ?? null
  )
  const weekCount = useLiveQuery(() =>
    db.workouts.where('date').aboveOrEqual(getWeekStart()).count()
  )
  const recent = useLiveQuery(() =>
    db.workouts.orderBy('id').reverse().limit(3).toArray()
  )

  if (
    !routines ||
    lastWorkout === undefined ||
    weekCount === undefined ||
    !recent
  ) {
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

      <div className="stats">
        <Card>
          <p className="eyebrow">Workouts</p>
          <p className="stat-number">{weekCount}</p>
          <p className="stat-label">This week</p>
        </Card>
        <Link to="/progress" className="stat-link">
          <Card>
            <p className="eyebrow">Progress</p>
            <p className="stat-number">View</p>
            <p className="stat-label">Your improvement</p>
          </Card>
        </Link>
      </div>

      <h2 className="section-title">Recent Activity</h2>
      {recent.length === 0 ? (
        <p>No workouts yet. Start your first one above.</p>
      ) : (
        <ul className="activity-list">
          {recent.map((workout) => (
            <li key={workout.id}>
              <Link to={`/workout/${workout.id}`} className="activity-item">
                <div>
                  <p className="activity-name">{workout.routineName}</p>
                  <p className="activity-meta">
                    {formatDate(workout.date)} - {workout.exercises.length}{' '}
                    exercises - {workout.durationMinutes} min
                  </p>
                </div>
                <span aria-hidden="true">›</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default Home