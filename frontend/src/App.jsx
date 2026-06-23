import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import LoginPage from './components/LoginPage'
import RoomSelectionPage from './components/RoomSelectionPage'
import RoomPage from './components/RoomPage'

// During development we proxy /api and /auth to the backend via Vite.
// Leave VITE_API_URL empty in dev to use relative paths.
const API_URL = import.meta.env.VITE_API_URL || ''
// const API_URL =
//   "https://8zsgjjtr-3000.inc1.devtunnels.ms";
console.log("API_URL =", API_URL);

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          credentials: 'include',
        })
        

        if (response.status === 401) {
          setUser(null)
          return
        }

        if (!response.ok) {
          throw new Error('Unable to check your login status.')
        }

        const data = await response.json()
        setUser(data.user)
      } catch (requestError) {
        console.error(requestError)
        setError('Could not connect to the backend. Make sure it is running.')
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = () => {
    window.location.href = `${API_URL}/auth/google`
  }

  const [view, setView] = useState('dashboard')
  const [roomId, setRoomId] = useState('')
  const [roomUrl, setRoomUrl] = useState('')

  const logout = async () => {
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Logout failed.')
      }

      setUser(null)
      setView('dashboard')
      setRoomId('')
      setRoomUrl('')
    } catch (requestError) {
      console.error(requestError)
      setError('Could not log out. Please try again.')
    }
  }

  const startPractice = () => setView('room-selection')

  const handleCreateRoom = (newRoomId, newRoomUrl) => {
    setRoomId(newRoomId)
    setRoomUrl(newRoomUrl)
    setView('room')
  }

  const handleJoinRoom = (existingRoomId, existingRoomUrl) => {
    setRoomId(existingRoomId)
    setRoomUrl(existingRoomUrl)
    setView('room')
  }

  const handleBack = () => {
    setView('dashboard')
  }

  const handleLeaveRoom = () => {
    setRoomId('')
    setRoomUrl('')
    setView('dashboard')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-600">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <LoginPage onLogin={login} error={error} />
  }

  if (view === 'room-selection') {
    return (
      <RoomSelectionPage
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoom}
        onBack={handleBack}
      />
    )
  }

  if (view === 'room') {
    return (
      <RoomPage roomId={roomId} roomUrl={roomUrl} onLeave={handleLeaveRoom} />
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} onLogout={logout} />
      <Dashboard user={user} onStartPractice={startPractice} />
    </div>
  )
}

export default App
