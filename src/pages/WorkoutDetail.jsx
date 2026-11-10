import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db, deleteWorkout } from '../db/db'
import Card from '../components/Card'
import { formatDate } from '../utils/dates'

function WorkoutDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const workout = useLiveQuery(
    async () => (await db.workouts.get(Number(id))) ?? null,
    [id]
  )

  if (workout === undefined) {
    return <p>Loading...</p>
  }

  if (workout === null) {
    return (
      <div>
        <p>This workout could not be found.</p>
        <Link to="/">Back to Home</Link>
      </div>
    )
  }

  async function handleDelete() {
    if (window.confirm('Delete this workout? This cannot be undone.')) {
      await deleteWorkout(workout.id)
      navigate('/')
    }
  }

  return (
    <div>
      <Card title={workout.routineName}>
        <p>{formatDate(workout.date)}</p>
        <p>
          {workout.durationMinutes} min - {workout.totalVolume} kg lifted in total
        </p>
      </Card>

      {workout.exercises.map((exercise, index) => (
        <Card key={index} title={exercise.name}>
          <ol className="set-list">
            {exercise.sets.map((set, setIndex) => (
              <li key={setIndex}>
                {set.weight} kg x {set.reps} reps
              </li>
            ))}
          </ol>
        </Card>
      ))}

      <button
        type="button"
        className="btn btn-secondary btn-full"
        onClick={handleDelete}
      >
        Delete workout
      </button>
    </div>
  )
}

export default WorkoutDetail