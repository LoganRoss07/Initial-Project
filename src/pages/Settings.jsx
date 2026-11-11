import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useAuth } from '../context/AuthContext'
import { logOut } from '../services/auth'
import { getSetting, saveSetting, exportAllData, deleteAllData } from '../db/db'
import { resizeImageToDataUrl } from '../utils/image'
import { toDateString } from '../utils/dates'
import Card from '../components/Card'
import SegmentedControl from '../components/SegmentedControl'
import './Settings.css'

const themeOptions = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

function Settings() {
  const { user } = useAuth()

  const username = useLiveQuery(() => getSetting('username', ''))
  const avatar = useLiveQuery(() => getSetting('avatar', null))
  const savedGoal = useLiveQuery(() => getSetting('weeklyGoal', 4))
  const theme = useLiveQuery(() => getSetting('theme', 'light'))

  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(null)
  const [goalDraft, setGoalDraft] = useState(null)
  const [notice, setNotice] = useState({ text: '', isError: false })

  function show(text, isError = false) {
    setNotice({ text, isError })
    if (!isError) {
      setTimeout(() => {
        setNotice((current) => (current.text === text ? { text: '', isError: false } : current))
      }, 4000)
    }
  }

  if (
    username === undefined ||
    avatar === undefined ||
    savedGoal === undefined ||
    theme === undefined
  ) {
    return <p>Loading...</p>
  }

  const displayName = username || user?.email?.split('@')[0] || 'Athlete'
  const notificationStatus =
    typeof Notification === 'undefined' ? 'not supported here' : Notification.permission

  function toggleEditing() {
    setEditing((open) => !open)
    setDraftName(null)
  }

  async function handleSaveName(event) {
    event.preventDefault()
    const name = (draftName ?? username).trim()
    if (!name) {
      show('Enter a username.', true)
      return
    }
    await saveSetting('username', name)
    setDraftName(null)
    show('Username saved.')
  }

  async function handlePhoto(event) {
    const input = event.target
    const file = input.files?.[0]
    input.value = ''
    if (!file) return

    try {
      const dataUrl = await resizeImageToDataUrl(file)
      await saveSetting('avatar', dataUrl)
      show('Profile photo updated.')
    } catch (err) {
      show(err.message || 'Could not save that photo.', true)
    }
  }

  async function removePhoto() {
    await saveSetting('avatar', null)
    show('Profile photo removed.')
  }

  async function handleSaveGoal(event) {
    event.preventDefault()
    const value = Number(goalDraft ?? savedGoal)
    if (!Number.isInteger(value) || value < 1 || value > 14) {
      show('Choose a whole number of workouts from 1 to 14.', true)
      return
    }
    await saveSetting('weeklyGoal', value)
    setGoalDraft(null)
    show(`Weekly goal set to ${value}.`)
  }

  async function sendTestNotification() {
    if (typeof Notification === 'undefined') {
      show('This browser does not support notifications.', true)
      return
    }

    let permission = Notification.permission
    if (permission === 'default') {
      permission = await Notification.requestPermission()
    }
    if (permission !== 'granted') {
      show('Notifications are blocked. Allow them in your browser settings to try this.', true)
      return
    }

    const options = {
      body: 'Time to train! Open Gym Tracker to start your workout.',
      icon: '/pwa-192x192.png',
    }

    try {
      const registration = await navigator.serviceWorker?.getRegistration()
      if (registration) {
        await registration.showNotification('Gym Tracker', options)
      } else {
        new Notification('Gym Tracker', options)
      }
    } catch {
      show('Could not show a notification on this device.', true)
    }
  }

  async function handleExport() {
    try {
      const data = await exportAllData()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `gym-tracker-data-${toDateString()}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      show('Your data was downloaded.')
    } catch {
      show('Could not export your data. Please try again.', true)
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      'Delete all your workouts, meals and settings from this device? This cannot be undone.'
    )
    if (!confirmed) return

    try {
      await deleteAllData()
      show('All your data was deleted from this device.')
    } catch {
      show('Could not delete your data. Please try again.', true)
    }
  }

  return (
    <div>
      <Card>
        <div className="profile">
          <div className="profile-photo">
            {avatar ? (
              <img src={avatar} alt="Your profile" />
            ) : (
              <span aria-hidden="true">👤</span>
            )}
          </div>
          <div>
            <p className="profile-name">{displayName}</p>
            <p className="profile-email">{user?.email}</p>
            <button
              type="button"
              className="btn btn-secondary"
              aria-expanded={editing}
              onClick={toggleEditing}
            >
              {editing ? 'Close' : 'Edit profile'}
            </button>
          </div>
        </div>

        {editing && (
          <div className="edit-profile">
            <form onSubmit={handleSaveName} noValidate>
              <div className="field">
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  maxLength={30}
                  value={draftName ?? username}
                  onChange={(e) => setDraftName(e.target.value)}
                />
              </div>
              <button type="submit" className="btn btn-full">
                Save username
              </button>
            </form>

            <div className="field photo-field">
              <label htmlFor="photo">Profile photo</label>
              <input id="photo" type="file" accept="image/*" onChange={handlePhoto} />
            </div>
            {avatar && (
              <button type="button" className="btn btn-secondary btn-full" onClick={removePhoto}>
                Remove photo
              </button>
            )}
          </div>
        )}
      </Card>

      <details className="setting">
        <summary>App preferences</summary>
        <div className="setting-body">
          <form onSubmit={handleSaveGoal} noValidate>
            <div className="field">
              <label htmlFor="weekly-goal">Weekly workout goal</label>
              <input
                id="weekly-goal"
                type="number"
                inputMode="numeric"
                min="1"
                max="14"
                value={goalDraft ?? String(savedGoal)}
                onChange={(e) => setGoalDraft(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-full">
              Save goal
            </button>
          </form>

          <p className="setting-label">Theme</p>
          <SegmentedControl
            label="Theme"
            value={theme}
            onChange={(value) => saveSetting('theme', value)}
            options={themeOptions}
          />
          <p className="stat-label">Weights are shown in kilograms (kg).</p>
        </div>
      </details>

      <details className="setting">
        <summary>Notifications</summary>
        <div className="setting-body">
          <p>Permission status: {notificationStatus}</p>
          <button type="button" className="btn btn-secondary btn-full" onClick={sendTestNotification}>
            Send a test notification
          </button>
          <p className="stat-label setting-note">
            Scheduled reminders need a push server, which this version does not have. Today the
            app can show notifications while it is installed or open.
          </p>
        </div>
      </details>

      <details className="setting">
        <summary>Privacy and security</summary>
        <div className="setting-body">
          <p>
            Your workouts, meals and photo are stored only on this device. Only your email address
            and a securely hashed password are held by Firebase for logging in.
          </p>
          <div className="inline-actions">
            <button type="button" className="btn btn-secondary btn-full" onClick={handleExport}>
              Export my data
            </button>
            <button type="button" className="btn btn-danger btn-full" onClick={handleDelete}>
              Delete my data
            </button>
          </div>
          <p className="stat-label setting-note">
            Deleting removes the data on this device. Your login account is separate.
          </p>
        </div>
      </details>

      <button type="button" className="btn btn-secondary btn-full logout" onClick={logOut}>
        Log out
      </button>

      <div className="toast-area" aria-live="polite">
        {notice.text && (
          <p className={notice.isError ? 'toast toast-error' : 'toast'}>{notice.text}</p>
        )}
      </div>
    </div>
  )
}

export default Settings