import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import InterviewReport from './InterviewReport.jsx'
import InterviewRun from './InterviewRun.jsx'
import InterviewSetup from './InterviewSetup.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function InterviewPage() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('setup')
  const [questions, setQuestions] = useState([])
  const [timerMinutes, setTimerMinutes] = useState(0)
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const resetFlow = () => {
    setStage('setup')
    setQuestions([])
    setTimerMinutes(0)
    setReport([])
    setError('')
    setLoading(false)
  }

  const handleStart = async (settings) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/interview/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Unable to generate interview questions.')
      }

      setQuestions(data.questions || [])
      setTimerMinutes(settings.timer)
      setStage('run')
    } catch (requestError) {
      setError(requestError.message || 'Unable to start the interview.')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (answers) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/interview/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ questions, answers }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Unable to evaluate the interview.')
      }

      setReport(data.report || [])
      setStage('report')
    } catch (requestError) {
      setError(requestError.message || 'Failed to evaluate the interview session.')
    } finally {
      setLoading(false)
    }
  }

  const goHome = () => navigate('/')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {error && (
        <div className="mx-auto max-w-7xl px-6 pt-6 sm:px-8">
          <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        </div>
      )}

      {stage === 'setup' && (
        <InterviewSetup onStart={handleStart} onBack={goHome} loading={loading} />
      )}

      {stage === 'run' && (
        <InterviewRun
          questions={questions}
          timerMinutes={timerMinutes}
          onComplete={handleComplete}
          onBack={resetFlow}
        />
      )}

      {stage === 'report' && (
        <InterviewReport
          report={report}
          onRestart={resetFlow}
        />
      )}
    </div>
  )
}