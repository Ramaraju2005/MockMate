import { useEffect, useState } from 'react'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('http://localhost:5000/api/message')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => {
        console.error('Error fetching message:', err)
        setMessage('Failed to load message from backend.')
      })
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-gray-800">
      <div className="p-8 bg-white rounded-lg shadow-md max-w-md text-center">
        <h1 className="text-3xl font-bold text-blue-600 mb-4">MERN Stack Boilerplate</h1>
        <p className="text-lg font-medium text-green-600 mb-2">Backend connection status:</p>
        <div className="px-4 py-2 bg-gray-50 rounded border border-gray-200 font-mono text-sm">
          {message}
        </div>
      </div>
    </div>
  )
}

export default App
