import { ArrowRight, BadgeCheck, Sparkles, Target, Users } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Footer from "./Footer.jsx";

const highlights = [
  {
    icon: Users,
    label: "Peer interviews",
  },
  {
    icon: Target,
    label: "Focused practice",
  },
  {
    icon: Sparkles,
    label: "AI-guided sessions",
  },
];

export default function LoginPage() {
  const { login, error } = useAuth();

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] flex-1 flex-col overflow-hidden bg-slate-950 text-white transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.26),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.22),transparent_28%),linear-gradient(135deg,#020617_0%,#0f172a_52%,#111827_100%)]" />

      <main className="relative flex flex-1 items-center justify-center px-6 py-16 sm:px-8 lg:py-20">
        <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <section className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-sky-200 backdrop-blur">
              <BadgeCheck size={16} />
              Designed for serious interview prep
            </div>

            <div className="max-w-2xl space-y-5">
              <h1 className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
                Practice interviews in a space that feels real.
              </h1>

              <p className="max-w-xl text-lg leading-8 text-slate-300">
                Join MockMate to run peer sessions, structured AI interviews, and resume-driven practice with a UI that keeps the focus on performance.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {highlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur"
                  >
                    <Icon size={15} className="text-sky-300" />
                    {item.label}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="relative">
            <div className="absolute -inset-6 rounded-[2rem] bg-white/5 blur-3xl" />
            <div className="relative rounded-[2rem] border border-white/10 bg-white/10 p-8 shadow-[0_30px_100px_rgba(2,6,23,0.45)] backdrop-blur-xl sm:p-10">
              <div className="space-y-3 text-center">
                <span className="inline-flex items-center justify-center rounded-full bg-sky-400/15 px-4 py-2 text-sm font-semibold text-sky-200">
                  Welcome to MockMate
                </span>

                <h2 className="text-3xl font-bold text-white">
                  Continue with Google
                </h2>

                <p className="text-sm leading-7 text-slate-300">
                  Sign in once, then move straight into your dashboard and interview rooms.
                </p>
              </div>

              <button
                onClick={login}
                className="mt-8 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 hover:from-sky-400 hover:to-indigo-500"
              >
                Continue with Google
                <ArrowRight size={18} />
              </button>

              {error && (
                <div className="mt-5 rounded-2xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
                  {error}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}