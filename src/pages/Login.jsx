import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { logIn, signUp } from '../services/auth'
import Card from '../components/Card'
import './Login.css'

function Login() {
  const { user, loading } = useAuth()
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (loading) {
    return <p className="login-loading">Loading...</p>
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  const isSignUp = mode === 'signup'

  async function handleSubmit(event) {
    event.preventDefault()
    const cleanEmail = email.trim()

    if (!cleanEmail) {
      setError('Enter your email address.')
      return
    }
    if (!password) {
      setError('Enter your password.')
      return
    }
    if (isSignUp && password.length < 6) {
      setError('Choose a password with at least 6 characters.')
      return
    }

    setBusy(true)
    setError('')
    try {
      if (isSignUp) {
        await signUp(cleanEmail, password)
      } else {
        await logIn(cleanEmail, password)
      }
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  function switchMode() {
    setMode(isSignUp ? 'login' : 'signup')
    setError('')
  }

  return (
    <main className="login">
      <h1 className="login-title">Gym Tracker</h1>
      <p className="login-sub">Track your workouts, meals and progress.</p>

      <Card title={isSignUp ? 'Create an account' : 'Log in'}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="show-password">
            <input
              id="show-password"
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
            />
            <label htmlFor="show-password">Show password</label>
          </div>

          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="btn btn-full" disabled={busy}>
            {busy ? 'Please wait...' : isSignUp ? 'Create account' : 'Log in'}
          </button>
        </form>

        <button type="button" className="btn btn-secondary btn-full switch-mode" onClick={switchMode}>
          {isSignUp ? 'I already have an account' : 'Create a new account'}
        </button>
      </Card>

      <p className="food-note">
        Your workouts and meals are stored on this device. Only your email address and
        a securely hashed password are held by Firebase.
      </p>
    </main>
  )
}

export default Login