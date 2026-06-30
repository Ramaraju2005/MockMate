import { useMemo, useState } from 'react'

const topicOptions = [
  'Arrays',
  'Strings',
  'Linked List',
  'Trees',
  'Graphs',
  'Dynamic Programming',
  'Hashing',
  'Recursion',
]

const difficulties = ['Easy', 'Medium', 'Hard']

export default function CodingInterviewSetup({ onStart, onBack, loading }) {
  const [aiMode, setAiMode] = useState(true)
  const [topics, setTopics] = useState(['Arrays'])
  const [questionCount, setQuestionCount] = useState(3)
  const [difficulty, setDifficulty] = useState('Medium')
  const [timer, setTimer] = useState(20)
  const [error, setError] = useState('')

  const selectedTopicLabel = useMemo(() => {
    if (aiMode) return 'AI will choose the topics for you.'
    if (topics.length === 0) return 'Choose at least one topic.'
    return topics.join(', ')
  }, [aiMode, topics])

  const toggleTopic = (topic) => {
    setTopics((current) => {
      if (current.includes(topic)) {
        return current.filter((item) => item !== topic)
      }
      return [...current, topic]
    })
  }

  const handleStart = async () => {
    setError('')

    if (!questionCount || !timer) {
      setError('Please enter a valid number of questions and timer.')
      return
    }

    if (!aiMode && topics.length === 0) {
      setError('Choose at least one topic for manual mode.')
      return
    }

    await onStart({
      topics: aiMode ? [] : topics,
      questionCount: Number(questionCount),
      difficulty: aiMode ? 'Any' : difficulty,
      timer: Number(timer),
      aiMode,
    })
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Coding Interview MVP</h2>
            <p className="text-slate-600">Configure a coding session with AI-generated problems and live execution.</p>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="rounded-full border border-slate-300 px-5 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Back
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <label className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4">
            <input
              type="checkbox"
              checked={aiMode}
              onChange={() => setAiMode((value) => !value)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600"
            />
            <div>
              <p className="font-semibold text-slate-900">AI Mode</p>
              <p className="text-sm text-slate-600">Let the assistant select topics automatically.</p>
            </div>
          </label>

          <div className="grid gap-6 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Number of Questions</span>
              <input
                type="number"
                min="1"
                max="8"
                value={questionCount}
                onChange={(e) => setQuestionCount(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Difficulty</span>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              >
                {difficulties.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Interview Timer (minutes)</span>
              <input
                type="number"
                min="5"
                max="60"
                value={timer}
                onChange={(e) => setTimer(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3"
              />
            </label>

            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="mb-2 text-sm font-semibold text-slate-700">Selected Topics</p>
              <p className="text-sm text-slate-600">{selectedTopicLabel}</p>
            </div>
          </div>

          {!aiMode && (
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {topicOptions.map((topic) => {
                const checked = topics.includes(topic)
                return (
                  <label key={topic} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleTopic(topic)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span className="text-sm font-medium text-slate-700">{topic}</span>
                  </label>
                )
              })}
            </div>
          )}
        </div>

        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

        <button
          type="button"
          onClick={handleStart}
          disabled={loading}
          className="mt-8 w-full rounded-3xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Generating Questions...' : 'Start Interview'}
        </button>
      </div>
    </div>
  )
}
