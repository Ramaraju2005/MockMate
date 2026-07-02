import { useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function RoomSelectionPage({ onCreateRoom, onJoinRoom, onBack }) {
  const [roomIdInput, setRoomIdInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const createRoom = async () => {
    setError('')
    setLoading(true)

    try {
      const response = await fetch(`${API_URL}/api/room`, {
        method: 'POST',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Could not create a room. Please try again.')
      }

      const data = await response.json()
      onCreateRoom(data.roomId, data.roomUrl)
    } catch (requestError) {
      console.error(requestError)
      setError(requestError.message || 'Unable to create a room.')
    } finally {
      setLoading(false)
    }
  }

  const joinRoom = () => {
    if (!roomIdInput.trim()) {
      setError('Enter a room ID to join.')
      return
    }

    onJoinRoom(roomIdInput.trim(), `${window.location.origin}/room/${roomIdInput.trim()}`)
  }

  return (
    <div className="min-h-screen bg-blue-50 px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Start a Mock Interview</h2>
              <p className="text-gray-600">Create a new room or join an existing one with Agora video and audio.</p>
            </div>
            <button
              type="button"
              onClick={onBack}
              className="rounded-full border border-slate-300 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
            >
              Back
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Create Room</h3>
            <p className="text-gray-600 mb-6">
              Generate a new interview room and share the room ID with your friend.
            </p>
            <button
              type="button"
              className="w-full rounded-3xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition"
              onClick={createRoom}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>

          <div className="rounded-3xl bg-white p-8 shadow-xl">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">Join Room</h3>
            <p className="text-gray-600 mb-6">
              Enter the room ID your friend shared to join the same Agora call.
            </p>
            <label className="block text-sm font-medium text-slate-700 mb-2" htmlFor="room-id">
              Room ID
            </label>
            <input
              id="room-id"
              type="text"
              value={roomIdInput}
              onChange={(event) => setRoomIdInput(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none focus:border-blue-500"
              placeholder="Enter room ID"
            />
            <button
              type="button"
              className="mt-6 w-full rounded-3xl bg-slate-900 px-6 py-3 text-white hover:bg-slate-800 transition"
              onClick={joinRoom}
            >
              Join Room
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  )
}
