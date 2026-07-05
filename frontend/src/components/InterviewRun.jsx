import { useEffect, useMemo, useRef, useState } from 'react'

export default function InterviewRun({
  questions,
  timerMinutes,
  onComplete,
  onBack,
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [transcript, setTranscript] = useState('')
  const [finalTranscript, setFinalTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60)
  const [error, setError] = useState('')
  const [isTtsEnabled, setIsTtsEnabled] = useState(true)
  const [isSpeaking, setIsSpeaking] = useState(false)

  const recognitionRef = useRef(null)
  const shouldStartListeningRef = useRef(false)
  const isListeningRef = useRef(false)

  useEffect(() => {
    isListeningRef.current = isListening
  }, [isListening])

  const currentQuestion = questions[currentIndex]

  const progress = useMemo(
    () => ((currentIndex + 1) / questions.length) * 100,
    [currentIndex, questions.length]
  )

  const startListening = () => {
    if (!recognitionRef.current) return

    shouldStartListeningRef.current = true

    if (isListeningRef.current) return

    setTranscript('')
    setFinalTranscript('')
    setError('')

    try {
      recognitionRef.current.start()
      setIsListening(true)
    } catch (e) {
      console.warn('Speech recognition start failed:', e)
    }
  }

  const speakQuestion = (text) => {
    if (!('speechSynthesis' in window)) return

    window.speechSynthesis.cancel()

    // Stop microphone so we don't transcribe the AI speaking the question
    shouldStartListeningRef.current = false
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop()
    }

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 1.0

    utterance.onstart = () => {
      setIsSpeaking(true)
    }
    utterance.onend = () => {
      setIsSpeaking(false)
      // Auto-start mic when the AI finishes speaking
      startListening()
    }
    utterance.onerror = () => {
      setIsSpeaking(false)
    }

    window.speechSynthesis.speak(utterance)
  }

  const cancelSpeech = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }

  useEffect(() => {
    if (
      !('webkitSpeechRecognition' in window) &&
      !('SpeechRecognition' in window)
    ) {
      setError('Web Speech API is not supported in this browser.')
      return
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition

    const recognition = new SpeechRecognition()

    recognition.lang = 'en-US'
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event) => {
      let finalText = ''
      let interimText = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]

        if (result.isFinal) {
          finalText += result[0].transcript + ' '
        } else {
          interimText += result[0].transcript
        }
      }

      setFinalTranscript((prevFinal) => {
        const updatedFinal = prevFinal + finalText
        setTranscript((updatedFinal + interimText).trim())
        return updatedFinal
      })
    }

    recognition.onerror = () => {
      setError('Speech recognition failed. Please try again.')
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
      if (shouldStartListeningRef.current) {
        try {
          recognition.start()
          setIsListening(true)
        } catch (e) {
          console.warn('Speech recognition start failed onend:', e)
        }
      }
    }

    recognitionRef.current = recognition

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId)
          handleFinish()
          return 0
        }

        return prev - 1
      })
    }, 1000)

    return () => {
      clearInterval(timerId)
      recognition.stop()
    }
  }, [])

  useEffect(() => {
    if (isTtsEnabled) {
      if (currentQuestion) {
        speakQuestion(currentQuestion)
      }
    } else {
      cancelSpeech()
      startListening()
    }
    return () => {
      cancelSpeech()
    }
  }, [currentQuestion, isTtsEnabled])

  const handleFinish = () => {
    const finalAnswers = [...answers]

    finalAnswers[currentIndex] = finalTranscript.trim()

    cancelSpeech()
    shouldStartListeningRef.current = false
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
    onComplete(finalAnswers)
  }

  const toggleListening = () => {
    if (!recognitionRef.current) return

    if (isListening) {
      shouldStartListeningRef.current = false
      recognitionRef.current.stop()
      return
    }

    cancelSpeech()
    startListening()
  }

  const saveAnswerAndAdvance = () => {
    const updated = [...answers]

    updated[currentIndex] = finalTranscript.trim()

    setAnswers(updated)

    cancelSpeech()

    shouldStartListeningRef.current = false
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop()
    }

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setTranscript('')
      setFinalTranscript('')
    } else {
      onComplete(updated)
    }
  }

  const formatTime = (value) => {
    const minutes = Math.floor(value / 60)
    const seconds = value % 60

    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-blue-50 dark:bg-slate-950 px-6 py-10 transition-colors">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white dark:bg-slate-900 p-8 shadow-xl border border-slate-100 dark:border-slate-800 transition-colors">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
              Live Interview
            </h2>
            <p className="text-gray-600 dark:text-slate-400">
              Answer one question at a time. Your voice will be transcribed
              automatically.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setIsTtsEnabled((prev) => !prev)}
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium border transition-all ${
                isTtsEnabled
                  ? 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900 text-blue-700 dark:text-blue-300'
                  : 'bg-slate-50 border-slate-200 dark:bg-slate-800/40 dark:border-slate-700 text-slate-500 dark:text-slate-400'
              }`}
            >
              {isTtsEnabled ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072M17.657 6.343a8 8 0 010 11.314M9.75 8.683l-3.328 3.329a.75.75 0 01-.53.22H4.25a.75.75 0 01-.75-.75V12.52a.75.75 0 01.75-.75h1.642a.75.75 0 01.53.22L9.75 15.317V8.683z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L19.5 12m0 0l2.25 2.25M19.5 12l2.25-2.25M19.5 12l-2.25 2.25m-10.5-6L3.422 11.58a.75.75 0 00-.53.22H1.25a.75.75 0 00-.75.75v3.422c0 .414.336.75.75.75h1.642a.75.75 0 00.53-.22L9 18.25V5.75z" />
                </svg>
              )}
              <span>{isTtsEnabled ? 'Auto-Read On' : 'Auto-Read Off'}</span>
            </button>

            <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-350">
              Time Left: {formatTime(timeLeft)}
            </div>
          </div>
        </div>

        <div className="mb-4 h-2 rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-2 rounded-full bg-blue-600 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-850 bg-slate-50 dark:bg-slate-950/50 p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-400">
                Question {currentIndex + 1} of {questions.length}
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                {currentQuestion}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => speakQuestion(currentQuestion)}
              className={`flex-shrink-0 rounded-full p-3 transition-all ${
                isSpeaking
                  ? 'bg-blue-600 text-white animate-pulse shadow-lg'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
              title="Read Question Aloud"
            >
              {isSpeaking ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/30 p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900 dark:text-white">
              Your Answer
            </p>

            <button
              type="button"
              onClick={toggleListening}
              className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                isListening
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white'
              }`}
            >
              {isListening ? 'Stop Mic' : 'Start Mic'}
            </button>
          </div>

          <textarea
            value={transcript}
            onChange={(e) => {
              setTranscript(e.target.value)
              setFinalTranscript(e.target.value)
            }}
            rows={8}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Speak or type your answer here..."
          />

          {error && (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={saveAnswerAndAdvance}
            className="rounded-3xl bg-blue-600 px-6 py-3 text-white transition hover:bg-blue-700"
          >
            {currentIndex < questions.length - 1
              ? 'Next Question'
              : 'End Session'}
          </button>

          <button
            type="button"
            onClick={onBack}
            className="rounded-3xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}