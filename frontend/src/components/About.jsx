import { Bot, FileText, Target, Users } from "lucide-react";

const pillars = [
  {
    icon: Users,
    title: "Peer Interviews",
    description:
      "Run realistic live sessions with a partner and build confidence through back-and-forth practice.",
    tone: "from-sky-500 to-blue-600",
  },
  {
    icon: Bot,
    title: "AI Interview Practice",
    description:
      "Use structured AI interviews to rehearse technical and behavioral questions whenever you want.",
    tone: "from-violet-500 to-fuchsia-600",
  },
  {
    icon: FileText,
    title: "Resume Guided Questions",
    description:
      "Turn your own experience into interview prompts that feel tailored and relevant.",
    tone: "from-emerald-500 to-teal-600",
  },
  {
    icon: Target,
    title: "Interview Readiness",
    description:
      "Strengthen communication, timing, and clarity so you show up composed on interview day.",
    tone: "from-amber-500 to-orange-600",
  },
];

export default function About() {
  return (
    <section id="about" className="relative overflow-hidden bg-slate-50 py-24 transition-colors dark:bg-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(37,99,235,0.10),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.10),transparent_32%)]" />

      <div className="relative mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center rounded-full border border-blue-200 bg-white/80 px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-800/80 dark:text-blue-300">
            Built for focused practice
          </span>

          <h2 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-5xl">
            About MockMate
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-300">
            MockMate helps students and job seekers rehearse interviews in a space that feels close to the real thing.
            Whether you prefer a peer, an AI interviewer, or resume-driven questions, the experience stays structured,
            calm, and practical.
          </p>
        </div>

        <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;

            return (
              <article
                key={pillar.title}
                className="group rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-[0_32px_100px_rgba(15,23,42,0.14)] dark:border-slate-800 dark:bg-slate-800/90"
              >
                <div className={`inline-flex rounded-2xl bg-gradient-to-br ${pillar.tone} p-4 text-white shadow-lg shadow-slate-950/10`}>
                  <Icon size={28} />
                </div>

                <h3 className="mt-6 text-xl font-semibold text-slate-950 dark:text-white">
                  {pillar.title}
                </h3>

                <p className="mt-4 text-sm leading-7 text-slate-600 dark:text-slate-300">
                  {pillar.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}