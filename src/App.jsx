import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Workouts from './pages/Workouts'
import Meals from './pages/Meals'
import Progress from './pages/Progress'
import Settings from './pages/Settings'
import Login from './pages/Login'
import ActiveWorkout from './pages/ActiveWorkout'
import WorkoutDetail from './pages/WorkoutDetail'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/workouts" element={<Workouts />} />
        <Route path="/meals" element={<Meals />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/workout/active" element={<ActiveWorkout />} />
        <Route path="/workout/:id" element={<WorkoutDetail />} />
      </Route>
    </Routes>
  )
}

export default App