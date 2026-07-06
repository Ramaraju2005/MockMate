import Editor from '@monaco-editor/react'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { Group, Panel, Separator } from 'react-resizable-panels'
import { ThemeContext } from '../context/ThemeContext'
import OutputConsole from './OutputConsole'

const API_URL = import.meta.env.VITE_API_URL || ''

const languageOptions = [
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
]

const BOILERPLATES = {
  java: `public class Main {
  public static void main(String[] args) {
    System.out.println("Hello MockMate");
  }
}`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello MockMate" << endl;
    return 0;
}`,
  python: `def main():
    print("Hello MockMate")

if __name__ == "__main__":
    main()`,
}

export default function CodingInterviewRun({ questions, timerMinutes, onComplete, onBack }) {
  const { theme } = useContext(ThemeContext)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [language, setLanguage] = useState('python')
  const [editableCode, setEditableCode] = useState(BOILERPLATES.python)
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
  const [chatHistory, setChatHistory] = useState([
    { role: 'interviewer', text: 'Hello! I am your interviewer today. Please start by reading the question and explaining your initial thoughts before coding.' }
  ])
  const [isGeneratingResponse, setIsGeneratingResponse] = useState(false)

  const recognitionRef = useRef(null)
  const silenceTimeoutRef = useRef(null)
  const chatEndRef = useRef(null)
  const speechCallbackRef = useRef(null)

  const currentQuestion = questions[currentIndex]
  const progress = useMemo(() => ((currentIndex + 1) / questions.length) * 100, [currentIndex, questions.length])

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [chatHistory])

  // Speech recognition and timer
  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Web Speech API is not supported in this browser.')
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript + ' ';
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const currentSpeech = (finalTranscript || interimTranscript).trim()
      if (!currentSpeech) return;

      setTranscript(currentSpeech)

      // Debounce: when candidate stops speaking, call the latest callback via ref
      if (silenceTimeoutRef.current) {
        clearTimeout(silenceTimeoutRef.current)
      }

      silenceTimeoutRef.current = setTimeout(() => {
        if (speechCallbackRef.current) {
          speechCallbackRef.current(currentSpeech)
        }
      }, 2000)
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

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event)
      setError('Speech recognition status update. Try restarting mic.')
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
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
      if (recognition) {
        recognition.shouldRestart = false
        recognition.stop()
      }
    }
  }, [currentIndex, editableCode])

  // Always keep speechCallbackRef pointing at the latest version (avoids stale closure)
  useEffect(() => {
    speechCallbackRef.current = async (speechText) => {
      if (!speechText.trim()) return

      setChatHistory((prev) => [...prev, { role: 'user', text: speechText }])
      setTranscript('')
      setIsGeneratingResponse(true)

      try {
        const response = await fetch(`${API_URL}/api/coding/interviewer-respond`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            question: currentQuestion,
            currentCode: editableCode,
            transcript: speechText,
            history: chatHistory.slice(-6)
          }),
        })

        const data = await response.json()
        if (response.ok && data.response) {
          setChatHistory((prev) => [...prev, { role: 'interviewer', text: data.response }])
        } else {
          console.error('Interviewer respond failed:', data)
        }
      } catch (err) {
        console.error('Failed to get interviewer response:', err)
        setChatHistory((prev) => [...prev, { role: 'interviewer', text: 'Sorry, I missed that. Could you repeat?' }])
      } finally {
        setIsGeneratingResponse(false)
      }
    }
  }, [currentQuestion, editableCode, chatHistory])

  // Load starter templates
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.shouldRestart = false;
    }
    setEditableCode(BOILERPLATES[language] || BOILERPLATES.python)
    setReadOnlyCode('')
  }, [currentQuestion, language])

  // Initialize session results array
  useEffect(() => {
    setSessionResults(
      questions.map(() => ({
        code: '',
        transcript: '',
        conversationHistory: [],
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
      conversationHistory: results[index]?.conversationHistory || [],
      language: results[index]?.language || 'python',
      executionResult: results[index]?.executionResult || '',
      scratchPad: results[index]?.scratchPad || '',
    }))

  const persistCurrentAnswer = (overrides = {}) => {
    // Collect full transcript of chat history for this question
    const fullTranscript = chatHistory
      .filter((msg) => msg.role === 'user')
      .map((msg) => msg.text)
      .join('\n');

    const conversationHistory = chatHistory.map((msg) => ({
      role: msg.role,
      text: msg.text,
    }));

    const next = [...sessionResults]
    next[currentIndex] = {
      ...(next[currentIndex] || {}),
      code: overrides.code ?? editableCode,
      transcript: overrides.transcript ?? fullTranscript,
      conversationHistory: overrides.conversationHistory ?? conversationHistory,
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
      const response = await fetch(`${API_URL}/api/compile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ language, code: editableCode, input: '' }),
      })

      const data = await response.json()

      let out = ''
      if (data.output) {
        out = data.output
      } else if (data.error) {
        out = data.error
      } else {
        out = 'No output'
      }

      setExecutionResult(out)

      setSessionResults((prev) => {
        const next = [...prev]
        next[currentIndex] = {
          ...(next[currentIndex] || {}),
          code: editableCode,
          transcript: chatHistory.filter((msg) => msg.role === 'user').map((msg) => msg.text).join('\n'),
          language,
          executionResult: out,
          scratchPad,
        }
        return next
      })
    } catch (requestError) {
      const errMsg = requestError.message || 'Code execution failed'
      setExecutionResult(`❌ Execution Error:\n${errMsg}`)
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
      setChatHistory([
        { role: 'interviewer', text: `Let's move on to the next question: ${questions[currentIndex + 1]?.title || 'Next challenge'}. Read it and explain your approach.` }
      ])
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
    <div className="h-screen bg-slate-100 dark:bg-slate-900 flex flex-col overflow-hidden transition-colors">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between shadow-sm transition-colors">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Coding Interview Room</h2>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-sm text-slate-500 dark:text-slate-450">Question {currentIndex + 1} of {questions.length}</span>
            <div className="w-24 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-4 py-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
            Time Left: {formatTime(timeLeft)}
          </div>
          <button type="button" onClick={finishSession} className="rounded-xl border border-slate-350 dark:border-slate-600 text-slate-700 dark:text-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition">
            End Session
          </button>
        </div>
      </div>

      {/* Main split view */}
      <Group direction="horizontal" className="flex-1 overflow-hidden min-h-0 p-4 gap-4">
        {/* Left Side: Question description and Interviewer Chat */}
        <Panel defaultSize={40} minSize={30}>
          <div className="flex flex-col h-full gap-4 overflow-hidden">
            {/* Question Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-5 overflow-y-auto max-h-[45%] shrink-0">
              <span className="rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs px-2.5 py-1 font-semibold uppercase tracking-wide">
                {currentQuestion?.difficulty || 'Medium'}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-3">{currentQuestion?.title || 'Loading question...'}</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">{currentQuestion?.problemStatement || currentQuestion?.prompt}</p>
              {currentQuestion?.constraints && <p className="mt-3 text-xs text-slate-650 dark:text-slate-400"><span className="font-semibold">Constraints:</span> {currentQuestion.constraints}</p>}
              {currentQuestion?.examples && <p className="mt-3 text-xs text-slate-655 dark:text-slate-400"><span className="font-semibold">Examples:</span> {currentQuestion.examples}</p>}
            </div>

            {/* Voice & Interviewer Interaction Chat */}
            <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 p-5 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 border-b border-slate-200 dark:border-slate-700 pb-3">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">Interviewer Conversation</h4>
                  <p className="text-xs text-slate-500">Speak your thoughts. The interviewer replies in text.</p>
                </div>
                <button type="button" onClick={toggleListening} className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${isListening ? 'bg-red-650 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>
                  {isListening ? '🎙 Recording...' : '🎙 Turn Mic On'}
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                {chatHistory.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none'}`}>
                      <p className="font-bold text-[10px] uppercase opacity-75 mb-0.5">{msg.role === 'user' ? 'You (Voice)' : 'Interviewer'}</p>
                      <p className="leading-relaxed">{msg.text}</p>
                    </div>
                  </div>
                ))}
                {isGeneratingResponse && (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-tl-none italic animate-pulse">
                      Interviewer is typing...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Speech recognition live preview */}
              {isListening && transcript && (
                <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-150 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-300">
                  <span className="font-bold">Live Transcript:</span> {transcript}
                </div>
              )}
              {error && <div className="mt-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 p-2.5 text-xs text-red-600 dark:text-red-400">{error}</div>}
            </div>
          </div>
        </Panel>

        <Separator className="w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-blue-500 transition cursor-col-resize rounded-full" />

        {/* Right Side: Code Editor and Console */}
        <Panel defaultSize={60} minSize={40}>
          <div className="flex flex-col h-full gap-4 overflow-hidden">
            {/* Editor Panel */}
            <div className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 flex flex-col min-h-0 overflow-hidden shadow-md">
              <div className="border-b border-slate-200 dark:border-slate-700 p-3 flex items-center justify-between bg-white dark:bg-slate-800 transition-colors">
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-1.5 bg-white dark:bg-slate-700 text-slate-850 dark:text-slate-100 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors cursor-pointer text-sm">
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                <div className="flex items-center gap-3">
                  <button type="button" onClick={runCode} disabled={isRunning} className="bg-green-600 hover:bg-green-700 text-white px-5 py-1.5 rounded-lg text-sm font-semibold disabled:opacity-60 transition">
                    {isRunning ? 'Running...' : 'Run Code'}
                  </button>
                  <button type="button" onClick={saveAndAdvance} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-1.5 rounded-lg text-sm font-semibold transition">
                    {currentIndex < questions.length - 1 ? 'Next Question' : 'Submit Interview'}
                  </button>
                </div>
              </div>

              {/* Monaco Editor Container */}
              <div className="flex-1 min-h-0">
                <Editor
                  height="100%"
                  language={language === 'cpp' ? 'cpp' : language}
                  theme={theme === 'dark' ? 'vs-dark' : 'light'}
                  value={editableCode}
                  onChange={(value) => setEditableCode(value || '')}
                  options={{ minimap: { enabled: false }, fontSize: 15, automaticLayout: true, scrollBeyondLastLine: false }}
                />
              </div>
            </div>

            {/* Console Output Panel */}
            <div className="h-56 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-[#1e1e1e] shrink-0 shadow-md">
              <OutputConsole output={executionResult} />
            </div>
          </div>
        </Panel>
      </Group>
    </div>
  )
}
