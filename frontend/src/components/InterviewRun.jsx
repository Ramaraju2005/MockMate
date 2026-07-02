import { useEffect, useMemo, useRef, useState } from 'react'

export default function InterviewRun({ questions, timerMinutes, onComplete, onBack }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState([])
  const [transcript, setTranscript] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [timeLeft, setTimeLeft] = useState(timerMinutes * 60)
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
          handleFinish()
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

  const handleFinish = async () => {
    const finalAnswers = [...answers]
    if (transcript.trim()) {
      finalAnswers[currentIndex] = transcript.trim()
    }

    onComplete(finalAnswers)
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

  const saveAnswerAndAdvance = () => {
    const currentAnswer = transcript.trim()
    const updated = [...answers]
    updated[currentIndex] = currentAnswer
    setAnswers(updated)

    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setTranscript('')
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
    <div className="min-h-screen bg-blue-50 px-6 py-10">
      <div className="mx-auto max-w-5xl rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Live Interview</h2>
            <p className="text-gray-600">Answer one question at a time. Your voice will be transcribed automatically.</p>
          </div>
          <div className="rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
            Time Left: {formatTime(timeLeft)}
          </div>
        </div>

        <div className="mb-4 h-2 rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-blue-700">Question {currentIndex + 1} of {questions.length}</p>
          <h3 className="text-xl font-semibold text-gray-900">{currentQuestion}</h3>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-lg font-semibold text-gray-900">Your answer</p>
            <button type="button" onClick={toggleListening} className={`rounded-full px-4 py-2 text-sm font-medium transition ${isListening ? 'bg-red-600 text-white' : 'bg-slate-900 text-white'}`}>
              {isListening ? 'Stop Mic' : 'Start Mic'}
            </button>
          </div>

          <textarea value={transcript} onChange={(e) => setTranscript(e.target.value)} rows={8} className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-800" placeholder="Speak or type your answer here..." />

          {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" onClick={saveAnswerAndAdvance} className="rounded-3xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 transition">
            {currentIndex < questions.length - 1 ? 'Next Question' : 'End Session'}
          </button>
          <button type="button" onClick={onBack} className="rounded-3xl border border-slate-300 px-6 py-3 text-slate-700 hover:bg-slate-50 transition">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
