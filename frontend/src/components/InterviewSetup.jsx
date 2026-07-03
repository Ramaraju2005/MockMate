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
    <div className="min-h-screen bg-blue-50 dark:bg-slate-950 px-6 py-10 transition-colors">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">AI Mock Interview Setup</h2>
            <p className="text-gray-600 dark:text-slate-400">Configure your practice session and let AI generate the questions.</p>
          </div>
          <button type="button" onClick={onBack} className="rounded-full border border-slate-300 dark:border-slate-700 px-5 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
            Back
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Subject</span>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {subjects.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Number of Questions</span>
            <input type="number" min="1" max="10" value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Difficulty</span>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
              {difficulties.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Interview Timer (minutes)</span>
            <input type="number" min="1" max="30" value={timer} onChange={(e) => setTimer(e.target.value)} className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
        </div>

        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-300">{error}</div>}

        <button type="button" onClick={handleStart} disabled={loading} className="mt-8 w-full rounded-3xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition disabled:opacity-60">
          {loading ? 'Generating Questions...' : 'Start Interview'}
        </button>
      </div>
    </div>
  )
}
