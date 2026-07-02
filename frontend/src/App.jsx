import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import LoginPage from './components/LoginPage'
import RoomSelectionPage from './components/RoomSelectionPage'
import RoomPage from './components/RoomPage'
import InterviewSetup from './components/InterviewSetup'
import InterviewRun from './components/InterviewRun'
import InterviewReport from './components/InterviewReport'
import CodingInterviewSetup from './components/CodingInterviewSetup'
import CodingInterviewRun from './components/CodingInterviewRun'
import CodingInterviewReport from './components/CodingInterviewReport'

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
  const [interviewConfig, setInterviewConfig] = useState(null)
  const [questions, setQuestions] = useState([])
  const [report, setReport] = useState([])
  const [codingInterviewConfig, setCodingInterviewConfig] = useState(null)
  const [codingQuestions, setCodingQuestions] = useState([])
  const [codingReport, setCodingReport] = useState([])
  const [loadingInterview, setLoadingInterview] = useState(false)

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

  const startInterview = async (config) => {
    setLoadingInterview(true)
    setInterviewConfig(config)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/interview/generate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: config.subject,
          difficulty: config.difficulty,
          questionCount: config.questionCount,
        }),
      })

      if (!response.ok) {
        throw new Error('Unable to generate interview questions.')
      }

      const data = await response.json()
      setQuestions(data.questions || [])
      setView('interview-run')
    } catch (requestError) {
      console.error(requestError)
      setError(requestError.message || 'Could not start the interview.')
    } finally {
      setLoadingInterview(false)
    }
  }

  const finishInterview = async (answers) => {
    setLoadingInterview(true)
    try {
      const response = await fetch(`${API_URL}/api/interview/evaluate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, answers }),
      })

      if (!response.ok) {
        throw new Error('Unable to evaluate the interview.')
      }

      const data = await response.json()
      setReport(data.report || [])
      setView('interview-report')
    } catch (requestError) {
      console.error(requestError)
      setError(requestError.message || 'Could not evaluate the interview.')
    } finally {
      setLoadingInterview(false)
    }
  }

  const startCodingInterview = async (config) => {
    setLoadingInterview(true)
    setCodingInterviewConfig(config)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/coding/generate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topics: config.topics || [],
          difficulty: config.difficulty,
          questionCount: config.questionCount,
          aiMode: config.aiMode,
        }),
      })

      if (!response.ok) {
        throw new Error('Unable to generate coding interview questions.')
      }

      const data = await response.json()
      setCodingQuestions(data.questions || [])
      setView('coding-interview-run')
    } catch (requestError) {
      console.error(requestError)
      setError(requestError.message || 'Could not start the coding interview.')
    } finally {
      setLoadingInterview(false)
    }
  }

  const finishCodingInterview = async (sessionResults) => {
    setLoadingInterview(true)
    try {
      const response = await fetch(`${API_URL}/api/coding/evaluate`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions: codingQuestions, sessionResults }),
      })

      if (!response.ok) {
        throw new Error('Unable to evaluate the coding interview.')
      }

      const data = await response.json()
      setCodingReport(data.report || [])
      setView('coding-interview-report')
    } catch (requestError) {
      console.error(requestError)
      setError(requestError.message || 'Could not evaluate the coding interview.')
    } finally {
      setLoadingInterview(false)
    }
  }

  const restartInterview = () => {
    setQuestions([])
    setReport([])
    setInterviewConfig(null)
    setView('dashboard')
  }

  const restartCodingInterview = () => {
    setCodingQuestions([])
    setCodingReport([])
    setCodingInterviewConfig(null)
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

  if (view === 'interview-setup') {
    return (
      <InterviewSetup
        onStart={startInterview}
        onBack={handleBack}
        loading={loadingInterview}
      />
    )
  }

  if (view === 'interview-run') {
    return (
      <InterviewRun
        questions={questions}
        timerMinutes={interviewConfig?.timer || 10}
        onComplete={finishInterview}
        onBack={() => setView('dashboard')}
      />
    )
  }

  if (view === 'interview-report') {
    return <InterviewReport report={report} onRestart={restartInterview} />
  }

  if (view === 'coding-interview-setup') {
    return (
      <CodingInterviewSetup
        onStart={startCodingInterview}
        onBack={handleBack}
        loading={loadingInterview}
      />
    )
  }

  if (view === 'coding-interview-run') {
    return (
      <CodingInterviewRun
        questions={codingQuestions}
        timerMinutes={codingInterviewConfig?.timer || 20}
        onComplete={finishCodingInterview}
        onBack={() => setView('dashboard')}
      />
    )
  }

  if (view === 'coding-interview-report') {
    return <CodingInterviewReport report={codingReport} onRestart={restartCodingInterview} />
  }

  if (view === 'room') {
    return (
      <RoomPage roomId={roomId} roomUrl={roomUrl} onLeave={handleLeaveRoom} />
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar user={user} onLogout={logout} />
      <Dashboard
        user={user}
        onStartPractice={startPractice}
        onStartInterview={() => setView('interview-setup')}
        onStartCodingInterview={() => setView('coding-interview-setup')}
      />
    </div>
  )
}

export default App
