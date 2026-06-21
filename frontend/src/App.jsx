import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Navigation Bar Component
function Navbar({ user, onLogout }) {
  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">MockMate</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm">{user.name}</span>
            {user.photo && (
              <img
                className="w-8 h-8 rounded-full"
                src={user.photo}
                alt={user.name}
              />
            )}
            <button
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              onClick={onLogout}
              type="button"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

// Dashboard Component with 3 boxes
function Dashboard({ user }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user.name}!</h2>
        <p className="text-gray-600 mb-10">Start preparing for your interview</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Box 1: Practice Interview */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition cursor-pointer">
            <div className="text-4xl mb-4">🎤</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Practice Interview</h3>
            <p className="text-gray-600 mb-6">
              Engage in realistic mock interviews with AI-powered feedback to improve your performance.
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Start Practice
            </button>
          </div>

          {/* Box 2: View Results */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition cursor-pointer">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">View Results</h3>
            <p className="text-gray-600 mb-6">
              Track your progress, view detailed analytics, and understand your strengths and weaknesses.
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              View Analytics
            </button>
          </div>

          {/* Box 3: Interview Prep Guide */}
          <div className="bg-white rounded-lg shadow-lg p-8 hover:shadow-xl transition cursor-pointer">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Prep Guide</h3>
            <p className="text-gray-600 mb-6">
              Access curated resources, tips, and common interview questions to prepare effectively.
            </p>
            <button className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Login Page Component
function LoginPage({ onLogin, error }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="p-8 bg-white rounded-lg shadow-lg max-w-md text-center">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">MockMate</h1>
        <p className="text-gray-600 mb-8">Master your interview skills</p>

        <p className="mb-6 text-gray-700">Sign in to start your interview preparation journey.</p>
        <button
          className="w-full px-6 py-3 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
          onClick={onLogin}
          type="button"
        >
          <span>🔐</span>
          Continue with Google
        </button>

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}

// Main App Component
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
    } catch (requestError) {
      console.error(requestError)
      setError('Could not log out. Please try again.')
    }
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

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} onLogout={logout} />
      <Dashboard user={user} />
    </div>
  )
}

export default App
