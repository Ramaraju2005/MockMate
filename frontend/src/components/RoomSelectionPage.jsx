import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronRight, Clock3, PlusCircle, Sparkles, Users, Video } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

const benefits = [
  {
    icon: Video,
    title: "Live interview flow",
    description: "Practice in a space built around peer-to-peer video and audio sessions.",
  },
  {
    icon: Users,
    title: "Partner friendly",
    description: "Share a room ID quickly and jump into the same session without friction.",
  },
  {
    icon: Sparkles,
    title: "Polished practice",
    description: "Keep the focus on communication, coding, and confidence instead of setup.",
  },
];

export default function RoomSelectionPage() {
  const navigate = useNavigate();
  const [roomIdInput, setRoomIdInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const createRoom = async () => {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/room`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to create room.");
      }

      const data = await response.json();
      navigate(`/room/${data.roomId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = () => {
    setError("");

    const id = roomIdInput.trim();

    if (!id) {
      setError("Please enter a Room ID.");
      return;
    }

    navigate(`/room/${id}`);
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.06),transparent_26%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.20),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_26%),linear-gradient(135deg,#020617_0%,#111827_56%,#0f172a_100%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8 sm:px-8 lg:py-10">
        <button
          onClick={() => navigate("/")}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-100 backdrop-blur transition hover:bg-white/90 dark:hover:bg-white/10"
        >
          <ArrowLeft size={16} />
          Back to dashboard
        </button>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-16">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 dark:border-sky-400/20 bg-sky-500/10 dark:bg-sky-400/10 px-4 py-2 text-sm font-medium text-sky-700 dark:text-sky-200 backdrop-blur">
              <Sparkles size={16} />
              Peer interview rooms
            </div>

            <div className="space-y-5">
              <h1 className="max-w-2xl text-5xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
                Create or join a room with a layout that keeps the interview focused.
              </h1>

              <p className="max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
                Spin up a private room instantly, or enter an existing Room ID and continue a live practice session with your partner.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {benefits.map((item) => {
                const Icon = item.icon;

                return (
                  <article
                    key={item.title}
                    className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 p-5 backdrop-blur"
                  >
                    <Icon size={20} className="text-sky-600 dark:text-sky-300" />
                    <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.description}</p>
                  </article>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-slate-600 dark:text-slate-300">
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-2 backdrop-blur">
                <Clock3 size={14} className="text-sky-600 dark:text-sky-300" />
                Setup in seconds
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 px-4 py-2 backdrop-blur">
                <Users size={14} className="text-sky-600 dark:text-sky-300" />
                Built for two people
              </span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white dark:bg-white/10 p-8 shadow-[0_30px_100px_rgba(15,23,42,0.06)] dark:shadow-[0_30px_100px_rgba(2,6,23,0.45)] backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 p-4 text-white shadow-lg shadow-sky-500/20">
                  <PlusCircle size={28} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create a room</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Generate a fresh interview space and share it with your partner.</p>
                </div>
              </div>

              <button
                onClick={createRoom}
                disabled={loading}
                className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-sky-500/25 transition hover:-translate-y-0.5 hover:from-sky-400 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? "Creating Room..." : "Create Room"}
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="rounded-[2rem] border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/70 p-8 shadow-[0_30px_100px_rgba(15,23,42,0.05)] dark:shadow-[0_30px_100px_rgba(2,6,23,0.35)] backdrop-blur-xl">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/15 p-4 text-emerald-600 dark:text-emerald-300">
                  <Users size={28} />
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Join a room</h2>
                  <p className="text-sm text-slate-600 dark:text-slate-300">Enter an existing Room ID to get into the live session immediately.</p>
                </div>
              </div>

              <input
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="Enter Room ID"
                className="mt-6 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-5 py-4 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none transition focus:border-sky-500 dark:focus:border-sky-400 focus:bg-white dark:focus:bg-white/10"
              />

              <button
                onClick={joinRoom}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-6 py-4 text-base font-semibold text-slate-700 dark:text-white transition hover:bg-slate-100 dark:hover:bg-white/10"
              >
                Join Room
              </button>
            </div>

            {error && (
              <div className="rounded-2xl border border-rose-400/30 bg-rose-500/10 px-5 py-4 text-sm text-rose-600 dark:text-rose-200">
                {error}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}