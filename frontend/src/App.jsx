import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

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

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">Mock Interview</h1>

        {loading && <p>Checking login status...</p>}

        {!loading && user && (
          <>
            {user.photo && (
              <img
                className="w-20 h-20 rounded-full mx-auto mb-4"
                src={user.photo}
                alt={user.name}
              />
            )}
            <p className="text-lg font-semibold">Welcome, {user.name}</p>
            <p className="text-gray-600 mb-5">{user.email}</p>
            <button
              className="px-5 py-2 rounded bg-gray-800 text-white hover:bg-gray-700"
              onClick={logout}
              type="button"
            >
              Log out
            </button>
          </>
        )}

        {!loading && !user && (
          <>
            <p className="mb-5 text-gray-600">Sign in to start your interview.</p>
            <button
              className="px-5 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={login}
              type="button"
            >
              Continue with Google
            </button>
          </>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  )
}

export default App
