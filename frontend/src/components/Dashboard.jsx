import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bot,
  ChevronRight,
  Sparkles,
  Video,
  MessageSquareText,
} from "lucide-react";

import About from "./About.jsx";
import Footer from "./Footer.jsx";

const features = [
  {
    icon: Video,
    title: "Peer Interview Room",
    description:
      "Go straight into the room flow to create or join a live peer video interview.",
    accent: "from-sky-500 to-blue-600",
    action: "/room-selection",
    actionLabel: "Open Video Call",
  },
  {
    icon: MessageSquareText,
    title: "AI Mock Interview",
    description:
      "Start a theory-focused AI mock interview with generated questions, live voice answers, and instant feedback.",
    accent: "from-emerald-500 to-teal-600",
    action: "/interview",
    actionLabel: "Start AI Mock Interview",
  },
  {
    icon: Bot,
    title: "AI Coding Interview",
    description:
      "Start a structured coding interview with setup, live problem solving, and evaluation.",
    accent: "from-violet-500 to-fuchsia-600",
    action: "/coding-interview",
    actionLabel: "Start Coding Interview",
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [history, setHistory] = useState({ peer: [], theory: [], coding: [] });
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSession, setSelectedSession] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || '';

  const fetchHistory = async () => {
    setLoadingHistory(true);
    setHistoryError("");
    try {
      const response = await fetch(`${API_URL}/api/session/history`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to load interview history.");
      }
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      console.error(err);
      setHistoryError(err.message || "Failed to fetch history.");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.24),transparent_28%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_26%),linear-gradient(135deg,#020617_0%,#0f172a_55%,#111827_100%)]" />

      {/* Hero Section */}
      <section className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 sm:px-8 sm:pt-20 lg:pt-24">
        <div className="mx-auto max-w-4xl text-center space-y-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-sky-200 backdrop-blur">
            <Sparkles size={16} />
            MockMate Interview Studio
          </div>

          <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Practice interviews that feel sharp, structured, and real.
          </h1>

          <p className="mx-auto max-w-3xl text-lg leading-8 text-slate-300 sm:text-xl">
            Choose between AI-powered mock interviews, live peer interviews, and
            coding interview practice—all inside one focused workspace built to
            help you improve faster.
          </p>

          <div className="flex flex-wrap justify-center gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
              AI Mock Interviews
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
              Peer Practice
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur">
              Coding Rounds
            </span>
          </div>

          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">
            Choose a mode below
          </p>
        </div>
      </section>

      {/* Key Modes */}
      <section className="relative bg-slate-50 py-20 text-slate-950 dark:bg-slate-900 dark:text-white transition-colors">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-300">
              Key Modes
            </p>

            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              A unified platform for every kind of practice round.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <button
                  key={feature.title}
                  type="button"
                  onClick={() => navigate(feature.action)}
                  className="group text-left rounded-3xl border border-white/70 bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_100px_rgba(15,23,42,0.14)] dark:border-slate-800 dark:bg-slate-800"
                >
                  <div
                    className={`inline-flex rounded-2xl bg-gradient-to-br ${feature.accent} p-4 text-white shadow-lg shadow-slate-950/10`}
                  >
                    <Icon size={26} />
                  </div>

                  <h3 className="mt-6 text-2xl font-semibold text-slate-950 dark:text-white">
                    {feature.title}
                  </h3>

                  <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                    {feature.description}
                  </p>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-600 dark:text-sky-300">
                    {feature.actionLabel}
                    <ChevronRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="relative border-t border-slate-200 dark:border-slate-800 bg-slate-100 py-20 dark:bg-slate-950 transition-colors text-slate-900 dark:text-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-600 dark:text-sky-400">
              Your Performance
            </p>
            <h2 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
              Past Interviews History
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Select an interview type below to browse your past practice sessions and review detailed feedback.
            </p>
          </div>

          {/* History Cards Grid */}
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                id: 'peer',
                title: 'Peer-to-Peer',
                description: 'Collaborative rooms with shared editor, notes, and call feeds.',
                count: history.peer?.length || 0,
                accent: 'from-sky-500/10 to-blue-600/10 hover:from-sky-500/20 hover:to-blue-600/20',
                border: 'border-blue-500/30 dark:border-blue-500/20',
                textAccent: 'text-blue-600 dark:text-blue-400',
              },
              {
                id: 'theory',
                title: 'AI Theory Mock',
                description: 'Q&A mock interviews focused on conceptual and technical answers.',
                count: history.theory?.length || 0,
                accent: 'from-emerald-500/10 to-teal-600/10 hover:from-emerald-500/20 hover:to-teal-600/20',
                border: 'border-emerald-500/30 dark:border-emerald-500/20',
                textAccent: 'text-emerald-600 dark:text-emerald-400',
              },
              {
                id: 'coding',
                title: 'AI Coding Mock',
                description: 'Structured algorithms practice with simulated live compiler evaluations.',
                count: history.coding?.length || 0,
                accent: 'from-violet-500/10 to-fuchsia-600/10 hover:from-violet-500/20 hover:to-fuchsia-600/20',
                border: 'border-violet-500/30 dark:border-violet-500/20',
                textAccent: 'text-violet-600 dark:text-violet-400',
              },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`group relative text-left rounded-3xl border p-6 bg-white dark:bg-slate-900 transition-all duration-300 shadow-md hover:-translate-y-1 hover:shadow-lg ${cat.border} ${selectedCategory === cat.id ? 'ring-2 ring-sky-500 border-transparent bg-slate-50 dark:bg-slate-800' : ''}`}
              >
                <div className={`absolute top-6 right-6 inline-flex rounded-full bg-slate-100 dark:bg-slate-850 px-3 py-1 text-sm font-bold ${cat.textAccent}`}>
                  {cat.count} {cat.count === 1 ? 'Session' : 'Sessions'}
                </div>
                <h3 className="text-xl font-bold mt-2 text-slate-950 dark:text-white">
                  {cat.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400 pr-12">
                  {cat.description}
                </p>
                <div className={`mt-4 inline-flex items-center gap-1.5 text-sm font-semibold ${cat.textAccent}`}>
                  {selectedCategory === cat.id ? 'Hide Sessions' : 'Browse History'}
                  <ChevronRight size={14} className={`transition duration-250 ${selectedCategory === cat.id ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                </div>
              </button>
            ))}
          </div>

          {/* Expandable Session List */}
          {selectedCategory && (
            <div className="mt-8 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-md transition-all">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white mb-4 capitalize">
                {selectedCategory === 'peer' ? 'Peer-to-Peer' : selectedCategory === 'theory' ? 'AI Theory' : 'AI Coding'} Practice History
              </h3>

              {loadingHistory ? (
                <div className="py-8 text-center text-slate-500">Loading history...</div>
              ) : historyError ? (
                <div className="py-8 text-center text-rose-500">{historyError}</div>
              ) : (history[selectedCategory] || []).length === 0 ? (
                <div className="py-8 text-center text-slate-500">
                  No sessions found for this category. Start an interview above to log your first session!
                </div>
              ) : (
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {(history[selectedCategory] || []).map((session) => {
                    let avgScore = null;
                    if (session.report && session.report.length) {
                      const scores = session.report.map(r => r.overallScore ?? r.score).filter(s => typeof s === 'number');
                      if (scores.length) {
                        avgScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
                      }
                    }

                    return (
                      <div key={session._id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {session.interviewType === 'coding' ? 'AI Coding Session' : session.interviewType === 'theory' ? 'AI Theory Session' : `Room: ${session.roomId.slice(0, 8)}...`}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(session.interviewDate).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">
                            {session.interviewType === 'general' || !session.interviewType ? (
                              <span>Code characters: {session.code?.length || 0} | Notes characters: {session.editorText?.length || 0}</span>
                            ) : (
                              <span>Questions answered: {session.questions?.length || 0}</span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          {avgScore !== null && (
                            <div className="rounded-full bg-sky-100 dark:bg-sky-950 px-3 py-1 text-sm font-semibold text-sky-800 dark:text-sky-300">
                              Score: {avgScore}/100
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedSession(session)}
                            className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-4 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 transition"
                          >
                            View Report
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      {/* Session Details Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur p-4 overflow-y-auto">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-150 dark:border-slate-850 overflow-y-auto max-h-[90vh] text-slate-900 dark:text-white">
            
            {/* Modal Header */}
            <div className="mb-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-sky-600 dark:text-sky-400 mb-1">
                  {selectedSession.interviewType === 'coding' ? 'AI Coding Mock' : selectedSession.interviewType === 'theory' ? 'AI Theory Mock' : 'Peer-to-Peer Interview'}
                </span>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {selectedSession.interviewType === 'general' || !selectedSession.interviewType ? `Room Session: ${selectedSession.roomId}` : 'AI Interview Session Report'}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Conducted on {new Date(selectedSession.interviewDate).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 p-2 text-slate-700 dark:text-slate-300 transition"
              >
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="space-y-6">
              {/* Peer-to-Peer Details */}
              {(selectedSession.interviewType === 'general' || !selectedSession.interviewType) && (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">Collaborative Code</h4>
                    {selectedSession.code ? (
                      <pre className="overflow-x-auto rounded-2xl bg-slate-950 p-4 text-xs font-mono text-emerald-400 border border-slate-800 whitespace-pre-wrap max-h-72">
                        {selectedSession.code}
                      </pre>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No code was saved for this session.</p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-1">Shared Notes / Scratchpad</h4>
                    {selectedSession.editorText ? (
                      <pre className="overflow-x-auto rounded-2xl bg-slate-50 dark:bg-slate-950/40 p-4 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap max-h-60 leading-6">
                        {selectedSession.editorText}
                      </pre>
                    ) : (
                      <p className="text-sm text-slate-500 italic">No collaborative notes were saved for this session.</p>
                    )}
                  </div>
                </div>
              )}

              {/* AI Coding Mock Details */}
              {selectedSession.interviewType === 'coding' && (
                <div className="space-y-6">
                  {selectedSession.report && selectedSession.report.map((item, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                          {idx + 1}. {item.question}
                        </h4>
                        <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                          Score: {item.overallScore ?? 'N/A'}/100
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Submitted Code</p>
                          <pre className="mt-1 overflow-x-auto rounded-xl bg-white dark:bg-slate-900 p-3 text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                            {item.code || 'No code submitted.'}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Evaluation Output</p>
                          <pre className="mt-1 overflow-x-auto rounded-xl bg-white dark:bg-slate-900 p-3 text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                            {item.executionResult || 'No execution output.'}
                          </pre>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Optimal Code / Approach</p>
                          <pre className="mt-1 min-h-32 overflow-x-auto rounded-xl bg-white dark:bg-slate-900 p-3 text-xs font-mono text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap leading-5">
                            {item.optimizedSolution || item.optimalSolution || 'No optimized solution available.'}
                          </pre>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Review & Feedback</p>
                          <p className="mt-1 rounded-xl bg-white dark:bg-slate-900 p-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                            {item.codeEvaluation || 'No code review feedback.'}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Communication Review</p>
                          <p className="mt-1 rounded-xl bg-white dark:bg-slate-900 p-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                            {item.conversationEvaluation || 'No communication review feedback.'}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-400">
                        <span className="rounded-full bg-white dark:bg-slate-900 px-3 py-1 border border-slate-200 dark:border-slate-800">Time: {item.timeComplexity || 'N/A'}</span>
                        <span className="rounded-full bg-white dark:bg-slate-900 px-3 py-1 border border-slate-200 dark:border-slate-800">Space: {item.spaceComplexity || 'N/A'}</span>
                        <span className="rounded-full bg-white dark:bg-slate-900 px-3 py-1 border border-slate-200 dark:border-slate-800">Suggestions: {item.improvements || 'Keep practicing.'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* AI Theory Mock Details */}
              {selectedSession.interviewType === 'theory' && (
                <div className="space-y-6">
                  {selectedSession.report && selectedSession.report.map((item, idx) => (
                    <div key={idx} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-4">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <h4 className="text-base font-semibold text-slate-900 dark:text-white">
                          {idx + 1}. {item.question}
                        </h4>
                        <div className="rounded-full bg-blue-100 dark:bg-blue-900/30 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                          Score: {item.overallScore ?? item.score ?? 'N/A'}/100
                        </div>
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Your Answer</p>
                          <p className="mt-1 rounded-xl bg-white dark:bg-slate-900 p-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                            {item.studentAnswer || 'No answer recorded.'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Ideal Answer</p>
                          <p className="mt-1 rounded-xl bg-white dark:bg-slate-900 p-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                            {item.idealAnswer || 'Not available.'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Accuracy Score</p>
                          <p className="mt-1 rounded-xl bg-white dark:bg-slate-900 p-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                            {item.accuracyScore ?? 'N/A'}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-slate-500">Communication Score</p>
                          <p className="mt-1 rounded-xl bg-white dark:bg-slate-900 p-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                            {item.communicationScore ?? 'N/A'}
                          </p>
                        </div>
                        <div className="sm:col-span-2">
                          <p className="text-xs uppercase tracking-wide text-slate-500">Improvement Suggestion</p>
                          <p className="mt-1 rounded-xl bg-white dark:bg-slate-900 p-3 text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 whitespace-pre-wrap">
                            {item.improvementSuggestion || 'Keep practicing.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="mt-8 flex justify-end border-t border-slate-100 dark:border-slate-800 pt-4">
              <button
                type="button"
                onClick={() => setSelectedSession(null)}
                className="rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
              >
                Close Report
              </button>
            </div>

          </div>
        </div>
      )}

      <About />
      <Footer />
    </div>
  );
}