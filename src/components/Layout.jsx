import { useEffect } from 'react'
import { NavLink, Link, Outlet, useLocation } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { getSetting } from '../db/db'
import Icon from './Icon'
import './Layout.css'

const tabs = [
  { to: '/', label: 'Home', icon: 'home' },
  { to: '/workouts', label: 'Workouts', icon: 'workouts' },
  { to: '/meals', label: 'Meals', icon: 'meals' },
  { to: '/progress', label: 'Progress', icon: 'progress' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
]

const titles = {
  '/': 'Home',
  '/workouts': 'Workouts',
  '/meals': 'Meals',
  '/progress': 'Progress',
  '/settings': 'Settings',
}

function Layout() {
  const { pathname } = useLocation()
  const avatar = useLiveQuery(() => getSetting('avatar', null))
  const theme = useLiveQuery(() => getSetting('theme', 'light'))

  useEffect(() => {
    document.documentElement.dataset.theme = theme === 'dark' ? 'dark' : 'light'
  }, [theme])

  const title = pathname.startsWith('/workout/')
    ? 'Workout'
    : titles[pathname] || ''

  return (
    <div className="app">
      <header className="app-header">
        <div>
          <p className="app-name">Gym Tracker</p>
          <h1 className="page-title">{title}</h1>
        </div>
        <Link to="/settings" className="avatar" aria-label="Open profile and settings">
          {avatar ? <img src={avatar} alt="" className="avatar-img" /> : '👤'}
        </Link>
      </header>

      <main className="app-main">
        <Outlet />
      </main>

      <nav className="bottom-nav" aria-label="Main">
        {tabs.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.to === '/'}
            className={({ isActive }) => (isActive ? 'tab active' : 'tab')}
          >
            <Icon name={tab.icon} />
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default Layout