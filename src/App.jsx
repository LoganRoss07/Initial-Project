import { lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Home from './pages/Home'
import Workouts from './pages/Workouts'

const Meals = lazy(() => import('./pages/Meals'))
const Progress = lazy(() => import('./pages/Progress'))
const Settings = lazy(() => import('./pages/Settings'))
const ActiveWorkout = lazy(() => import('./pages/ActiveWorkout'))
const WorkoutDetail = lazy(() => import('./pages/WorkoutDetail'))

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/workouts" element={<Workouts />} />
          <Route path="/meals" element={<Meals />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/workout/active" element={<ActiveWorkout />} />
          <Route path="/workout/:id" element={<WorkoutDetail />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App