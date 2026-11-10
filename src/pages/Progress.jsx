import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { db, getSetting } from '../db/db'
import Card from '../components/Card'
import SegmentedControl from '../components/SegmentedControl'
import { getWeekStart, formatDate } from '../utils/dates'
import {
  getRangeStart,
  summariseWorkouts,
  formatMinutes,
  getPersonalBests,
  caloriesByDate,
} from '../utils/progress'
import './Progress.css'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

const ranges = [
  { value: 'week', label: 'This week' },
  { value: 'month', label: 'This month' },
  { value: 'all', label: 'All time' },
]

function ChartCard({ title, labels, values, unit, emptyText }) {
  if (values.length === 0) {
    return (
      <Card title={title}>
        <p>{emptyText}</p>
      </Card>
    )
  }

  const data = {
    labels,
    datasets: [
      {
        data: values,
        borderColor: '#2563eb',
        backgroundColor: '#2563eb',
        tension: 0.3,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true } },
  }

  return (
    <Card title={title}>
      <div className="chart-box">
        <Line
          data={data}
          options={options}
          role="img"
          aria-label={`${title}: line chart with ${values.length} data points. The values are in the table below the chart.`}
        />
      </div>
      <details className="chart-table">
        <summary>View as a table</summary>
        <table>
          <thead>
            <tr>
              <th scope="col">Date</th>
              <th scope="col">{unit}</th>
            </tr>
          </thead>
          <tbody>
            {labels.map((label, index) => (
              <tr key={index}>
                <td>{label}</td>
                <td>{values[index]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </Card>
  )
}

function Progress() {
  const [range, setRange] = useState('week')

  const allWorkouts = useLiveQuery(() => db.workouts.orderBy('date').toArray())
  const allMeals = useLiveQuery(() => db.meals.orderBy('date').toArray())
  const savedGoal = useLiveQuery(() => getSetting('weeklyGoal', 4))

  if (!allWorkouts || !allMeals || savedGoal === undefined) {
    return <p>Loading...</p>
  }

  const start = getRangeStart(range)
  const inRange = (item) => !start || item.date >= start
  const workouts = allWorkouts.filter(inRange)
  const meals = allMeals.filter(inRange)

  const summary = summariseWorkouts(workouts)
  const personalBests = getPersonalBests(allWorkouts)
  const calorieDays = caloriesByDate(meals)

  const goal = Number(savedGoal) > 0 ? Number(savedGoal) : 4
  const weekCount = allWorkouts.filter((w) => w.date >= getWeekStart()).length
  const goalPercent = Math.min(100, Math.round((weekCount / goal) * 100))

  return (
    <div>
      <SegmentedControl
        label="Time range"
        value={range}
        onChange={setRange}
        options={ranges}
      />

      <Card title="Workout Summary">
        <div className="summary-grid">
          <div>
            <p className="summary-number">{summary.count}</p>
            <p className="stat-label">Workouts</p>
          </div>
          <div>
            <p className="summary-number">{formatMinutes(summary.totalMinutes)}</p>
            <p className="stat-label">Total time</p>
          </div>
          <div>
            <p className="summary-number">{summary.totalVolume.toLocaleString()}</p>
            <p className="stat-label">kg lifted</p>
          </div>
        </div>
      </Card>

      <Card title="Goal Progress">
        <p className="goal-text">
          {weekCount} of {goal} workouts this week
        </p>
        <div
          className="progress-bar"
          role="progressbar"
          aria-label="Weekly workout goal"
          aria-valuemin={0}
          aria-valuemax={goal}
          aria-valuenow={Math.min(weekCount, goal)}
        >
          <div className="progress-fill" style={{ width: `${goalPercent}%` }} />
        </div>
        <p className="stat-label">
          {weekCount >= goal
            ? 'Goal reached. Great work!'
            : `${goal - weekCount} more to reach your weekly goal`}
        </p>
      </Card>

      <ChartCard
        title="Weight lifted per workout"
        labels={workouts.map((w) => formatDate(w.date))}
        values={workouts.map((w) => w.totalVolume)}
        unit="kg lifted"
        emptyText="Log a workout to see your progress here."
      />

      <ChartCard
        title="Calories per day"
        labels={calorieDays.map((d) => formatDate(d.date))}
        values={calorieDays.map((d) => d.calories)}
        unit="kcal"
        emptyText="Log some meals to see your calories here."
      />

      <Card title="Personal bests (all time)">
        {personalBests.length === 0 ? (
          <p>Your heaviest sets will appear here once you log a workout.</p>
        ) : (
          <ul className="best-list">
            {personalBests.map((best) => (
              <li key={best.name}>
                <span>{best.name}</span>
                <span className="best-value">
                  {best.weight > 0
                    ? `${best.weight} kg x ${best.reps}`
                    : `${best.reps} reps (bodyweight)`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default Progress