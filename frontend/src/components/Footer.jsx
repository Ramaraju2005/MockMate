import { ArrowRight, Mail, Sparkles } from "lucide-react";

const links = ["Dashboard", "Room Selection", "Mock Interviews", "About"];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-slate-950 text-slate-200">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.16),transparent_26%)]" />

      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.2fr_0.8fr_0.8fr] md:items-start">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-sky-200 backdrop-blur">
              <Sparkles size={16} />
              Practice. Prepare. Perform.
            </div>

            <h2 className="mt-6 text-3xl font-bold tracking-tight text-white">
              MockMate
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">
              A focused interview space for peer practice, AI-guided sessions, and resume-driven mock rounds.
            </p>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Quick links
            </p>

            <div className="mt-5 grid gap-3 text-sm text-slate-300">
              {links.map((link) => (
                <span key={link} className="inline-flex items-center gap-2 transition hover:text-white">
                  <ArrowRight size={14} className="text-sky-400" />
                  {link}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
              Contact
            </p>

            <a
              href="mailto:mockmate@gmail.com"
              className="mt-5 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 transition hover:border-sky-400/40 hover:bg-white/10"
            >
              <Mail size={16} className="text-sky-300" />
              mockmate@gmail.com
            </a>

            <p className="mt-4 text-sm leading-7 text-slate-400">
              Built for interview practice, confidence building, and better preparation habits.
            </p>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-center text-sm text-slate-400">
          © 2026 MockMate. All rights reserved.
        </div>
      </div>
    </footer>
  );
}