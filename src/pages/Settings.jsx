import { useAuth } from '../context/AuthContext'
import { logOut } from '../services/auth'
import Card from '../components/Card'

function Settings() {
  const { user } = useAuth()

  return (
    <Card title="Account">
      <p>Signed in as {user?.email}</p>
      <button type="button" className="btn btn-secondary btn-full" onClick={logOut}>
        Log out
      </button>
    </Card>
  )
}

export default Settings