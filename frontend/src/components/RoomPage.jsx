import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Room, createLocalVideoTrack, createLocalAudioTrack } from 'livekit-client'
import { Copy, LogOut, Mic, MicOff, Video, VideoOff, Users, Sparkles } from 'lucide-react'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function RoomPage() {
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [remoteCount, setRemoteCount] = useState(0)
  const [micMuted, setMicMuted] = useState(false)
  const [camOff, setCamOff] = useState(false)

  const roomRef = useRef(null)
  const localVideoRef = useRef(null)
  const remoteContainerRef = useRef(null)
  const localTracksRef = useRef({ audio: null, video: null })
  const remoteAudioEls = useRef([])

  useEffect(() => {
    const setup = async () => {
      if (!roomId) {
        setError('Room ID is missing.')
        setLoading(false)
        return
      }

      try {
        const tokenRes = await fetch(
          `${API_URL}/api/livekit/token?room=${encodeURIComponent(roomId)}`,
          { credentials: 'include' }
        )

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

        const videoTrack = await createLocalVideoTrack()
        const audioTrack = await createLocalAudioTrack()
        localTracksRef.current = { video: videoTrack, audio: audioTrack }

        const localContainer = localVideoRef.current
        localContainer.innerHTML = ''
        const localEl = videoTrack.attach()
        localEl.style.width = '100%'
        localEl.style.height = '100%'
        localEl.style.objectFit = 'cover'
        localContainer.appendChild(localEl)

        await room.localParticipant.publishTrack(videoTrack)
        await room.localParticipant.publishTrack(audioTrack)

        const handleTrack = (track) => {
          if (track.kind === 'video') {
            const videoEl = track.attach()
            videoEl.style.width = '100%'
            videoEl.style.height = '100%'
            videoEl.style.objectFit = 'cover'
            if (remoteContainerRef.current) {
              remoteContainerRef.current.innerHTML = ''
              remoteContainerRef.current.appendChild(videoEl)
            }
            setRemoteCount(1)
          } else if (track.kind === 'audio') {
            const audioEl = track.attach()
            audioEl.style.display = 'none'
            document.body.appendChild(audioEl)
            remoteAudioEls.current.push(audioEl)
          }
        }

        room.remoteParticipants.forEach((participant) => {
          participant.trackPublications.forEach((publication) => {
            if (publication.track) handleTrack(publication.track)
          })
        })

        room.on('trackSubscribed', (track) => {
          handleTrack(track)
        })

        room.on('trackUnsubscribed', (track) => {
          track.detach().forEach((el) => el.remove())
          if (track.kind === 'video' && remoteContainerRef.current) {
            remoteContainerRef.current.innerHTML = ''
          }
        })

        room.on('participantDisconnected', () => {
          if (remoteContainerRef.current) {
            remoteContainerRef.current.innerHTML = ''
          }
          remoteAudioEls.current.forEach((el) => el.remove())
          remoteAudioEls.current = []
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
      try {
        if (localTracksRef.current.video) {
          localTracksRef.current.video.stop()
          localTracksRef.current.video.detach().forEach((el) => el.remove())
        }
        if (localTracksRef.current.audio) {
          localTracksRef.current.audio.stop()
        }
        if (roomRef.current) {
          roomRef.current.disconnect()
        }
        remoteAudioEls.current.forEach((el) => el.remove())
        remoteAudioEls.current = []
      } catch (err) {
        console.error(err)
      }
    }
  }, [roomId])

  const toggleMic = async () => {
    const audioTrack = localTracksRef.current.audio
    if (!audioTrack) return
    if (micMuted) {
      await audioTrack.unmute()
    } else {
      await audioTrack.mute()
    }
    setMicMuted((prev) => !prev)
  }

  const toggleCam = async () => {
    const videoTrack = localTracksRef.current.video
    if (!videoTrack) return
    if (camOff) {
      await videoTrack.unmute()
    } else {
      await videoTrack.mute()
    }
    setCamOff((prev) => !prev)
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-6 text-white transition-colors sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.16),transparent_26%),linear-gradient(135deg,#020617_0%,#111827_58%,#0f172a_100%)]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-3rem)] max-w-7xl flex-col gap-6">
        <header className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-[0_30px_100px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200">
                <Sparkles size={16} />
                Live interview room
              </div>

              <div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  LiveKit Mock Interview
                </h1>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Run a peer interview with live audio, video, and a focused interface that keeps distractions low.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(roomId)}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                <Copy size={16} />
                Copy Room ID
              </button>
              <button
                type="button"
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-red-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition hover:from-rose-400 hover:to-red-500"
              >
                <LogOut size={16} />
                Leave Room
              </button>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-300">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              <Users size={14} className="text-sky-300" />
              {remoteCount === 0 ? 'Waiting for peer to join' : 'Peer connected'}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              Room ID: {roomId}
            </span>
          </div>
        </header>

        <div className="grid flex-1 gap-6 lg:grid-cols-[1.6fr_0.9fr]">
          <section className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-[0_30px_100px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:p-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Live video</h2>
                <p className="mt-1 text-sm text-slate-300">Keep your camera and microphone ready while your peer joins.</p>
              </div>

              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                {remoteCount === 0 ? 'Waiting for peer' : 'Peer connected'}
              </div>
            </div>

            <div className="mt-5 grid gap-5 lg:grid-cols-2">
              <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/90 p-3 shadow-inner shadow-slate-950/50">
                <div className="mb-3 flex items-center justify-between px-1 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    <Video size={14} className="text-sky-300" />
                    You {camOff ? '(camera off)' : ''}
                  </span>
                  <span>{micMuted ? 'Muted' : 'Mic on'}</span>
                </div>
                <div ref={localVideoRef} className="h-[320px] overflow-hidden rounded-[1.4rem] bg-black sm:h-[360px]" />
              </div>

              <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950/90 p-3 shadow-inner shadow-slate-950/50">
                <div className="mb-3 flex items-center justify-between px-1 text-sm text-slate-300">
                  <span className="inline-flex items-center gap-2">
                    <Users size={14} className="text-sky-300" />
                    Peer
                  </span>
                  <span>{remoteCount === 0 ? 'Waiting' : 'Connected'}</span>
                </div>
                <div ref={remoteContainerRef} className="relative h-[320px] overflow-hidden rounded-[1.4rem] bg-black sm:h-[360px]" />
              </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={toggleMic}
                className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  micMuted
                    ? 'bg-rose-500/15 text-rose-200 hover:bg-rose-500/25'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {micMuted ? <MicOff size={16} /> : <Mic size={16} />}
                {micMuted ? 'Unmute Mic' : 'Mute Mic'}
              </button>

              <button
                type="button"
                onClick={toggleCam}
                className={`inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  camOff
                    ? 'bg-rose-500/15 text-rose-200 hover:bg-rose-500/25'
                    : 'bg-white/5 text-white hover:bg-white/10'
                }`}
              >
                {camOff ? <VideoOff size={16} /> : <Video size={16} />}
                {camOff ? 'Turn On Cam' : 'Turn Off Cam'}
              </button>
            </div>

            {loading && (
              <div className="mt-6 rounded-2xl border border-sky-400/20 bg-sky-500/10 px-4 py-3 text-sm text-sky-100">
                Joining room...
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}
          </section>

          <aside className="space-y-6">
            <div className="rounded-[2rem] border border-white/10 bg-white/10 p-6 shadow-[0_30px_100px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:p-7">
              <h3 className="text-xl font-semibold text-white">Session info</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                Share the room ID with your partner if they have not joined yet. The layout is built to keep the interview view clear and responsive.
              </p>

              <div className="mt-5 rounded-2xl border border-white/10 bg-slate-950/50 p-4 break-all text-sm text-slate-100">
                {roomId}
              </div>

              <div className="mt-5 grid gap-3 text-sm text-slate-300">
                <div className="rounded-2xl bg-white/5 px-4 py-3">Keep your camera centered before the round starts.</div>
                <div className="rounded-2xl bg-white/5 px-4 py-3">Mute between turns to reduce background noise.</div>
                <div className="rounded-2xl bg-white/5 px-4 py-3">Use the room ID to reconnect if the page refreshes.</div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-sky-500/15 to-indigo-500/10 p-6 shadow-[0_30px_100px_rgba(2,6,23,0.25)] backdrop-blur-xl sm:p-7">
              <h3 className="text-xl font-semibold text-white">Status</h3>
              <p className="mt-3 text-sm leading-7 text-slate-300">
                {remoteCount === 0
                  ? 'Your room is open and waiting for another participant.'
                  : 'Both participants are ready. Keep the conversation moving.'}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
