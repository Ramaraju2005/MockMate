import Editor from '@monaco-editor/react'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { ThemeContext } from '../context/ThemeContext'

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
  const { theme } = useContext(ThemeContext)
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
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcriptText = Array.from(event.results)
        .map((result) => result[0].transcript)
        .join(' ')
        .trim()

      setTranscript((prev) =>
        prev && transcriptText ? `${transcriptText}` : transcriptText
      )
    }

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onend = () => {
      setIsListening(false);

      if (recognitionRef.current?.shouldRestart) {
        recognition.start();
      }
    };

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
      recognitionRef.current = recognitionRef.current || null
      if (recognitionRef.current) {
        recognitionRef.current.shouldRestart = false;
      }
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
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.shouldRestart = false;
      recognitionRef.current.stop();
      return;
    }

    recognitionRef.current.shouldRestart = true;
    recognitionRef.current.start();
  };

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
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
    }

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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 px-6 py-10 transition-colors">
      <div className="mx-auto max-w-7xl rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Coding Interview</h2>
            <p className="text-slate-600 dark:text-slate-400">Solve each prompt, run the code, and explain your approach aloud.</p>
          </div>
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>

        <div className="mb-6 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-6">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">Question {currentIndex + 1} of {questions.length}</p>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{currentQuestion?.title || currentQuestion?.problemTitle || currentQuestion?.prompt || 'Loading question...'}</h3>
              <p className="mt-3 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-350">{currentQuestion?.problemStatement || currentQuestion?.prompt || 'Problem statement will appear here.'}</p>
              {currentQuestion?.constraints && <p className="mt-3 text-sm text-slate-700 dark:text-slate-300"><span className="font-semibold">Constraints:</span> {currentQuestion.constraints}</p>}
              {currentQuestion?.examples && <p className="mt-3 text-sm text-slate-700 dark:text-slate-300"><span className="font-semibold">Examples:</span> {currentQuestion.examples}</p>}
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-400">
                <span className="rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-3 py-1">Topic: {currentQuestion?.topic || 'N/A'}</span>
                <span className="rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-3 py-1">Difficulty: {currentQuestion?.difficulty || 'N/A'}</span>
                <span className="rounded-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 px-3 py-1">Function: {currentQuestion?.functionName || 'solution'}</span>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
              <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">Editable Section</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">Implement only the required function.</p>
                </div>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-3 py-2 text-sm focus:outline-none">
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-750">
                <Editor
                  height="320px"
                  language={language === 'cpp' ? 'cpp' : language === 'javascript' ? 'javascript' : language}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  value={editableCode}
                  onChange={(value) => setEditableCode(value || '')}
                  options={{ minimap: { enabled: false }, fontSize: 14, automaticLayout: true }}
                />
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 p-4">
                <p className="mb-2 text-sm font-semibold text-slate-700 dark:text-slate-350">Read-Only Section</p>
                <pre className="whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-400">{readOnlyCode || 'Driver code will be generated here.'}</pre>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-lg font-semibold text-slate-900 dark:text-white">Notes / Scratch Pad</p>
                <button type="button" onClick={toggleListening} className={`rounded-full px-4 py-2 text-sm font-medium transition ${isListening ? 'bg-red-600 text-white' : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white'}`}>
                  {isListening ? 'Stop Mic' : 'Start Mic'}
                </button>
              </div>
              <textarea value={scratchPad} onChange={(e) => setScratchPad(e.target.value)} rows={5} className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Write your approach, test ideas, or quick notes here..." />
              <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={6} className="mt-4 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Speak or type your explanation here..." />
              {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-300">{error}</div>}
            </div>

            <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-lg font-semibold text-slate-900 dark:text-white">Execution</p>
                <button type="button" onClick={runCode} disabled={isRunning} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700 disabled:opacity-60">
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
              </div>
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4 text-sm text-slate-700 dark:text-slate-350">
                <p className="mb-2 font-semibold">Sample Test Cases</p>
                <p>{currentQuestion?.sampleInput || 'Sample input will be shown here.'}</p>
                <p className="mt-3 font-semibold">Expected Output</p>
                <p>{currentQuestion?.sampleOutput || 'Expected output will be shown here.'}</p>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-950 dark:bg-black p-4 font-mono text-sm text-slate-100">
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
          <button type="button" onClick={finishSession} className="rounded-3xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800">
            End Session
          </button>
        </div>
      </div>
    </div>
  )
}
