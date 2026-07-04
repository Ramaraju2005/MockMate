import { useNavigate } from 'react-router-dom'
import { useState } from 'react'

import CodingInterviewReport from './CodingInterviewReport.jsx'
import CodingInterviewRun from './CodingInterviewRun.jsx'
import CodingInterviewSetup from './CodingInterviewSetup.jsx'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function CodingInterviewPage() {
  const navigate = useNavigate()
  const [stage, setStage] = useState('setup')
  const [questions, setQuestions] = useState([])
  const [timerMinutes, setTimerMinutes] = useState(0)
  const [report, setReport] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [error, setError] = useState('')

  const resetFlow = () => {
    setStage('setup')
    setQuestions([])
    setTimerMinutes(0)
    setReport([])
    setError('')
    setLoading(false)
    setSaving(false)
    setSaveStatus('')
  }

  const handleStart = async (settings) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/coding/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(settings),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Unable to generate coding interview questions.')
      }

      setQuestions(data.questions || [])
      setTimerMinutes(settings.timer)
      setStage('run')
    } catch (requestError) {
      setError(requestError.message || 'Unable to start the coding interview.')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = async (sessionResults) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch(`${API_URL}/api/coding/evaluate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ questions, sessionResults }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Unable to evaluate the coding interview.')
      }

      setReport(data.report || [])
      setStage('report')
    } catch (requestError) {
      setError(requestError.message || 'Failed to evaluate the coding session.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!report.length) {
      setSaveStatus('Nothing to save yet.')
      return
    }

    setSaving(true)
    setSaveStatus('')

    try {
      const response = await fetch(`${API_URL}/api/session/coding/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          questions,
          report,
          interviewerName: 'Mock Interviewer',
          intervieweeName: 'Candidate',
          interviewDate: new Date().toISOString(),
          durationSeconds: timerMinutes * 60,
        }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(data.error || 'Unable to save the coding interview.')
      }

      setSaveStatus('Saved to MongoDB successfully.')
    } catch (requestError) {
      setSaveStatus(requestError.message || 'Failed to save the interview.')
    } finally {
      setSaving(false)
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
        <CodingInterviewSetup onStart={handleStart} onBack={goHome} loading={loading} />
      )}

      {stage === 'run' && (
        <CodingInterviewRun
          questions={questions}
          timerMinutes={timerMinutes}
          onComplete={handleComplete}
          onBack={resetFlow}
        />
      )}

      {stage === 'report' && (
        <CodingInterviewReport
          report={report}
          onRestart={resetFlow}
          onSave={handleSave}
          saving={saving}
          saveStatus={saveStatus}
        />
      )}
    </div>
  )
}