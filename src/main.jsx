import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { getRoutines, addMeal, getMealsByDate } from './db/db'
import { toDateString } from './utils/dates'

async function testDb() {
  console.log('Routines:', await getRoutines())
  await addMeal({ date: toDateString(), name: 'Test meal', calories: 500, protein: 30, carbs: 50, fat: 15 })
  console.log('Meals today:', await getMealsByDate(toDateString()))
}
testDb()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
