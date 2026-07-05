import { useState } from 'react'

const subjects = ['OS', 'DBMS', 'OOPS', 'CN', 'Data Structures', 'React', 'Node.js']
const difficulties = ['Easy', 'Medium', 'Hard']

export default function InterviewSetup({ onStart, onBack, loading }) {
  const [selectedSubjects, setSelectedSubjects] = useState(['OS'])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [questionCount, setQuestionCount] = useState(5)
  const [difficulty, setDifficulty] = useState('Medium')
  const [timer, setTimer] = useState(10)
  const [error, setError] = useState('')

  const handleToggleSubject = (item) => {
    setSelectedSubjects((prev) => {
      if (prev.includes(item)) {
        if (prev.length === 1) return prev // Keep at least one subject selected
        return prev.filter((s) => s !== item)
      } else {
        return [...prev, item]
      }
    })
  }

  const handleStart = async () => {
    setError('')
    if (selectedSubjects.length === 0 || !difficulty || !questionCount || !timer) {
      setError('Please complete all interview settings.')
      return
    }

    await onStart({
      subject: selectedSubjects,
      questionCount: Number(questionCount),
      difficulty,
      timer: Number(timer),
    })
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-950 px-6 py-10 transition-colors">
      <div className="mx-auto max-w-4xl rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">AI Mock Interview Setup</h2>
            <p className="text-gray-600 dark:text-slate-400">Configure your practice session and let AI generate the questions.</p>
          </div>
          <button type="button" onClick={onBack} className="rounded-full border border-slate-300 dark:border-slate-700 px-5 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition cursor-pointer">
            Back
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Custom Multiselect Dropdown */}
          <div className="relative block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Subjects</span>
            
            {/* Trigger Button */}
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left cursor-pointer"
            >
              <span className="truncate">
                {selectedSubjects.length === 0 
                  ? 'Select subjects...' 
                  : selectedSubjects.join(', ')}
              </span>
              <svg className="w-5 h-5 ml-2 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <>
                {/* Overlay to close on outside click */}
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setIsDropdownOpen(false)}
                />
                
                <div className="absolute left-0 mt-2 w-full rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl z-20 max-h-60 overflow-y-auto p-2 space-y-1">
                  {subjects.map((item) => {
                    const isChecked = selectedSubjects.includes(item);
                    return (
                      <button
                        key={item}
                        type="button"
                        onClick={() => handleToggleSubject(item)}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-medium transition cursor-pointer ${
                          isChecked 
                            ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300' 
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by button onClick
                          className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 focus:ring-2"
                        />
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* Selected Subject Badges */}
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedSubjects.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-150 dark:border-blue-900/60 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-350"
                >
                  {item}
                  <button
                    type="button"
                    onClick={() => handleToggleSubject(item)}
                    className="ml-0.5 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 transition focus:outline-none cursor-pointer"
                    title={`Remove ${item}`}
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Number of Questions</span>
            <input type="number" min="1" max="10" value={questionCount} onChange={(e) => setQuestionCount(e.target.value)} className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Difficulty</span>
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer">
              {difficulties.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">Interview Timer (minutes)</span>
            <input type="number" min="1" max="30" value={timer} onChange={(e) => setTimer(e.target.value)} className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </label>
        </div>

        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-700 dark:text-red-300">{error}</div>}

        <button type="button" onClick={handleStart} disabled={loading} className="mt-8 w-full rounded-3xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition disabled:opacity-60 cursor-pointer">
          {loading ? 'Generating Questions...' : 'Start Interview'}
        </button>
      </div>
    </div>
  )
}
