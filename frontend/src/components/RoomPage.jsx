import { useEffect, useRef, useState } from 'react'
import { Room, createLocalVideoTrack, createLocalAudioTrack } from 'livekit-client'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function RoomPage({ roomId, roomUrl, onLeave }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [remoteCount, setRemoteCount] = useState(0)

  const roomRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteContainerRef = useRef(null)
  const localTracksRef = useRef({ audio: null, video: null })

  useEffect(() => {
    const setup = async () => {
      if (!roomId) {
        setError('Room ID is missing.')
        setLoading(false)
        return
      }

      try {
        const tokenRes = await fetch(`${API_URL}/api/livekit/token?room=${encodeURIComponent(roomId)}`, {
          credentials: 'include',
        })

        if (!tokenRes.ok) {
          const err = await tokenRes.json().catch(() => ({}))
          throw new Error(err?.error || 'Failed to fetch LiveKit token.')
        }

        const { token, url } = await tokenRes.json()
        if (!token) throw new Error('Invalid token from server.')

        const livekitUrl = url || window.location.origin
        const room = new Room()
        await room.connect(livekitUrl, token)
        roomRef.current = room

        // create local tracks
        const videoTrack = await createLocalVideoTrack()
        const audioTrack = await createLocalAudioTrack()
        localTracksRef.current = { video: videoTrack, audio: audioTrack }

        // attach local video
        const localContainer = localVideoRef.current
        localContainer.innerHTML = ''
        const el = videoTrack.attach()
        el.style.width = '100%'
        el.style.height = '100%'
        localContainer.appendChild(el)

        // publish
        await room.localParticipant.publishTrack(videoTrack)
        await room.localParticipant.publishTrack(audioTrack)

        // handle remote tracks
        const handleTrack = (track) => {
          if (track.kind !== 'video') return

          const videoEl = track.attach()
          videoEl.style.width = '100%'
          videoEl.style.height = '100%'

          if (remoteContainerRef.current) {
            remoteContainerRef.current.innerHTML = ''
            remoteContainerRef.current.appendChild(videoEl)
          }

          setRemoteCount(1)
        }

        // new participants joining later
        room.on('trackSubscribed', (track, publication, participant) => {
          handleTrack(track)
        })

        // participants already in room
        room.remoteParticipants.forEach((participant) => {
          participant.trackPublications.forEach((publication) => {
            if (publication.track) {
              handleTrack(publication.track)
            }
          })
        })

        // participant leaves
        room.on('participantDisconnected', () => {
          if (remoteContainerRef.current) {
            remoteContainerRef.current.innerHTML = ''
          }
          setRemoteCount(0)
        })
      } catch (e) {
        console.error(e)
        setError(e.message || 'Unable to join room')
      } finally {
        setLoading(false)
      }
    }

    setup()

    return () => {
      const cleanup = async () => {
        try {
          if (localTracksRef.current.video) {
            localTracksRef.current.video.stop()
            localTracksRef.current.video.detach()
          }
          if (localTracksRef.current.audio) {
            localTracksRef.current.audio.stop()
          }
          if (roomRef.current) {
            roomRef.current.disconnect()
          }
        } catch (err) {
          console.error(err)
        }
      }
      cleanup()
    }
  }, [roomId])

  return (
    <div className="min-h-screen bg-blue-50 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="rounded-3xl bg-white p-8 shadow-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">LiveKit Mock Interview</h2>
              <p className="text-gray-600">Live audio and video with your peer in this room.</p>
            </div>
            <button
              type="button"
              onClick={onLeave}
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-slate-700 hover:bg-slate-50 transition"
            >
              Leave Room
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-sm uppercase tracking-wide text-blue-700 mb-2">Room ID</p>
            <p className="break-all text-blue-900">{roomId}</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">Live Video</h3>
                <p className="text-gray-600">Connected to room: {roomId}</p>
              </div>
              <div className="text-sm text-gray-500">
                {remoteCount === 0 ? 'Waiting for peer to join...' : 'Peer connected'}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="rounded-3xl bg-black p-2">
                <p className="mb-2 text-sm text-white/80">You</p>
                <div ref={localVideoRef} className="h-72 rounded-2xl bg-black" />
              </div>
              <div className="rounded-3xl bg-black p-2">
                <p className="mb-2 text-sm text-white/80">Peer</p>
                <div ref={remoteContainerRef} className="h-72 rounded-2xl bg-black relative" />
              </div>
            </div>

            {loading && (
              <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">Joining room...</div>
            )}
            {error && (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="rounded-3xl bg-white p-6 shadow-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Session info</h3>
            <p className="text-gray-600 mb-4">
              Copy and share this room ID with your peer if they aren’t already in the room.
            </p>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 mb-4 break-all">
              {roomId}
            </div>
            <button
              type="button"
              className="w-full rounded-3xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition"
              onClick={() => navigator.clipboard.writeText(roomId)}
            >
              Copy Room ID
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
