import Editor from '@monaco-editor/react'
import { useEffect, useMemo, useRef, useState } from 'react'

const languageOptions = [
  { label: 'Python', value: 'python' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'C', value: 'c' },
]

const defaultCodeByLanguage = {
  python: 'def solve():\n    pass\n',
  javascript: 'function solve() {\n  // write your solution\n}\n',
  java: 'class Solution {\n  public int solve(int x) {\n    return x;\n  }\n}\n',
  cpp: '#include <iostream>\nusing namespace std;\n\nclass Solution {\npublic:\n  int solve(int x) {\n    return x;\n  }\n};\n',
  c: 'int solve(int x) {\n  return x;\n}\n',
}

export default function CodingInterviewRun({ questions, timerMinutes, onComplete, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [language, setLanguage] = useState('python')
  const [editableCode, setEditableCode] = useState(defaultCodeByLanguage.python)
  const [readOnlyCode, setReadOnlyCode] = useState('')
  const [loadingTemplate, setLoadingTemplate] = useState(false)
  const [scratchPad, setScratchPad] = useState('')
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60)
  const [executionResult, setExecutionResult] = useState('')
  const [sessionResults, setSessionResults] = useState([])
  const [isRunning, setIsRunning] = useState(false)
  const [error, setError] = useState('')
  const recognitionRef = useRef(null)

  const currentQuestion = questions[currentIndex]
  const progress = useMemo(() => ((currentIndex + 1) / questions.length) * 100, [currentIndex, questions.length])

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Web Speech API is not supported in this browser.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let interim = ''
      let finalText = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const text = result[0].transcript
        if (result.isFinal) {
          finalText += `${text} `
        } else {
          interim += text
        }
      }
      setTranscript((prev) => `${prev}${finalText}${interim}`.trim())
    }

    recognition.onerror = () => {
      setError('Speech recognition failed. Please try again.')
      setIsListening(false)
    }

    recognitionRef.current = recognition

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId)
          finishSession()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timerId)
      recognition?.stop()
    }
  }, [])

  useEffect(() => {
    const loadTemplate = async () => {
      if (!currentQuestion) return
      setLoadingTemplate(true)
      try {
        const response = await fetch('/api/coding/template', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: currentQuestion, language }),
        })
        const data = await response.json()
        if (response.ok && data.editableSection && data.readOnlySection) {
          setEditableCode(data.editableSection)
          setReadOnlyCode(data.readOnlySection)
        } else {
          setEditableCode(defaultCodeByLanguage[language] || defaultCodeByLanguage.python)
          setReadOnlyCode('')
        }
      } catch (requestError) {
        setEditableCode(defaultCodeByLanguage[language] || defaultCodeByLanguage.python)
        setReadOnlyCode('')
      } finally {
        setLoadingTemplate(false)
      }
    }

    loadTemplate()
  }, [currentQuestion, language])

  useEffect(() => {
    setSessionResults(
      questions.map(() => ({
        code: '',
        transcript: '',
        language: 'python',
        executionResult: '',
        scratchPad: '',
      }))
    )
  }, [questions])

  const buildPayload = (results = sessionResults) =>
    questions.map((question, index) => ({
      question: question?.title || question?.prompt || `Question ${index + 1}`,
      code: results[index]?.code || '',
      transcript: results[index]?.transcript || '',
      language: results[index]?.language || 'python',
      executionResult: results[index]?.executionResult || '',
      scratchPad: results[index]?.scratchPad || '',
    }))

  const persistCurrentAnswer = (overrides = {}) => {
    const next = [...sessionResults]
    next[currentIndex] = {
      ...(next[currentIndex] || {}),
      code: overrides.code ?? editableCode,
      transcript: overrides.transcript ?? transcript,
      language: overrides.language ?? language,
      executionResult: overrides.executionResult ?? executionResult,
      scratchPad: overrides.scratchPad ?? scratchPad,
    }
    setSessionResults(next)
    return next
  }

  const finishSession = () => {
    const currentResults = persistCurrentAnswer()
    onComplete(buildPayload(currentResults))
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
      return
    }
    setTranscript('')
    recognitionRef.current.start()
    setIsListening(true)
  }

  const runCode = async () => {
    setIsRunning(true)
    setError('')
    setExecutionResult('Running...')

    try {
      const response = await fetch('/api/coding/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ language, editableCode, question: currentQuestion, readOnlyCode }),
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Execution failed')
      setExecutionResult(data.output || 'No output')
      setSessionResults((prev) => {
        const next = [...prev]
        next[currentIndex] = {
          ...(next[currentIndex] || {}),
          code: editableCode,
          transcript,
          language,
          executionResult: data.output || 'No output',
          scratchPad,
        }
        return next
      })
    } catch (requestError) {
      setError(requestError.message || 'Code execution failed')
      setExecutionResult('')
    } finally {
      setIsRunning(false)
    }
  }

  const saveAndAdvance = () => {
    const currentResults = persistCurrentAnswer()

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setTranscript('')
      setExecutionResult('')
      setError('')
    } else {
      onComplete(buildPayload(currentResults))
    }
  }

  const formatTime = (value) => {
    const minutes = Math.floor(value / 60)
    const seconds = value % 60
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-slate-100 px-6 py-10">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900">Coding Interview</h2>
            <p className="text-slate-600">Solve each prompt, run the code, and explain your approach aloud.</p>
          </div>
          <div className="rounded-full bg-blue-100 px-4 py-2 text-sm font-semibold text-blue-700">
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>

        <div className="mb-6 h-2 rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">Question {currentIndex + 1} of {questions.length}</p>
              <h3 className="text-xl font-semibold text-slate-900">{currentQuestion?.title || currentQuestion?.problemTitle || currentQuestion?.prompt || 'Loading question...'}</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700">{currentQuestion?.problemStatement || currentQuestion?.prompt || 'Problem statement will appear here.'}</p>
              {currentQuestion?.constraints && <p className="mt-3 text-sm text-slate-700"><span className="font-semibold">Constraints:</span> {currentQuestion.constraints}</p>}
              {currentQuestion?.examples && <p className="mt-3 text-sm text-slate-700"><span className="font-semibold">Examples:</span> {currentQuestion.examples}</p>}
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="rounded-full bg-white px-3 py-1">Topic: {currentQuestion?.topic || 'N/A'}</span>
                <span className="rounded-full bg-white px-3 py-1">Difficulty: {currentQuestion?.difficulty || 'N/A'}</span>
                <span className="rounded-full bg-white px-3 py-1">Function: {currentQuestion?.functionName || 'solution'}</span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900">Editable Section</p>
                  <p className="text-sm text-slate-600">Implement only the required function.</p>
                </div>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm">
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200">
                <Editor
                  height="320px"
                  language={language === 'cpp' ? 'cpp' : language === 'javascript' ? 'javascript' : language}
                  theme="vs-dark"
                  value={editableCode}
                  onChange={(value) => setEditableCode(value || '')}
                  options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-700">Read-Only Section</p>
                <pre className="whitespace-pre-wrap text-sm text-slate-700">{readOnlyCode || 'Driver code will be generated here.'}</pre>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-lg font-semibold text-slate-900">Notes / Scratch Pad</p>
                <button type="button" onClick={toggleListening} className={`rounded-full px-4 py-2 text-sm font-medium transition ${isListening ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
                  {isListening ? 'Stop Mic' : 'Start Mic'}
                </button>
              </div>
              <textarea value={scratchPad} onChange={(e) => setScratchPad(e.target.value)} rows={5} className="w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Write your approach, test ideas, or quick notes here..." />
              <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={6} className="mt-4 w-full rounded-2xl border border-slate-200 px-4 py-3" placeholder="Speak or type your explanation here..." />
              {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-lg font-semibold text-slate-900">Execution</p>
                <button type="button" onClick={runCode} disabled={isRunning} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60">
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                <p className="mb-2 font-semibold">Sample Test Cases</p>
                <p>{currentQuestion?.sampleInput || 'Sample input will be shown here.'}</p>
                <p className="mt-3 font-semibold">Expected Output</p>
                <p>{currentQuestion?.sampleOutput || 'Expected output will be shown here.'}</p>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-950 p-4 font-mono text-sm text-slate-100">
                <p className="mb-2 text-xs uppercase tracking-wide text-slate-400">Output</p>
                <pre className="whitespace-pre-wrap">{executionResult || 'Run your code to see the output.'}</pre>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button type="button" onClick={saveAndAdvance} className="rounded-3xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700">
            {currentIndex < questions.length - 1 ? 'Next Question' : 'Submit Session'}
          </button>
          <button type="button" onClick={finishSession} className="rounded-3xl border border-slate-300 px-6 py-3 text-slate-700 transition hover:bg-slate-50">
            End Session
          </button>
        </div>
      </div>
    </div>
  )
}
