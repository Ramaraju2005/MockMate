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

      <About />
      <Footer />
    </div>
  );
}