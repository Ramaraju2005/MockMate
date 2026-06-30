import { useState } from 'react'

const subjects = ['OS', 'DBMS', 'OOPS', 'CN', 'Data Structures', 'React', 'Node.js']
const difficulties = ['Easy', 'Medium', 'Hard']

export default function InterviewSetup({ onStart, onBack, loading }) {
  const [subject, setSubject] = useState('OS')
  const [questionCount, setQuestionCount] = useState(5)
  const [difficulty, setDifficulty] = useState('Medium')
  const [timer, setTimer] = useState(10)
  const [error, setError] = useState('')

  const handleStart = async () => {
    setError('')
    if (!subject || !difficulty || !questionCount || !timer) {
      setError('Please complete all interview settings.')
      return
    }

    await onStart({ subject, questionCount: Number(questionCount), difficulty, timer: Number(timer) })
  }

  return (
    <div className="min-h-screen bg-blue-50 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">AI Mock Interview Setup</h2>
            <p className="text-gray-600">Configure your practice session and let AI generate the questions.</p>
          </div>
          <button type="button" onClick={onBack} className="rounded-full border border-slate-300 px-5 py-2 text-sm text-slate-700 hover:bg-slate-50 transition">
            Back
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Subject</span>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
              {subjects.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Number of Questions</span>
            <input type="number" min="1" max="10" value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Difficulty</span>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3">
              {difficulties.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Interview Timer (minutes)</span>
            <input type="number" min="1" max="30" value={timer} onChange={(e) => setTimer(e.target.value)} className="w-full rounded-2xl border border-slate-200 px-4 py-3" />
          </label>
        </div>

        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <button type="button" onClick={handleStart} disabled={loading} className="mt-8 w-full rounded-3xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition disabled:opacity-60">
          {loading ? 'Generating Questions...' : 'Start Interview'}
        </button>
      </div>
    </div>
  )
}
