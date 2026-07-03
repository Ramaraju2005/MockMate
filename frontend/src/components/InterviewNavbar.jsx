import { Copy, LogOut } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function InterviewNavbar({ roomId, onLeave }) {
  return (
    <header className="h-16 border-b bg-white dark:bg-slate-900 flex items-center justify-between px-6 shadow-sm transition-colors">

      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
          M
        </div>

        <div>
          <h1 className="font-bold text-xl text-slate-800">
            MockMate
          </h1>

          <p className="text-xs text-gray-500">
            Live Coding Interview
          </p>
        </div>
      </div>

      <div className="flex items-center gap-6">

        <div className="text-sm">
          <span className="text-gray-500">
            Room:
          </span>

          <span className="ml-2 font-semibold">
            {roomId}
          </span>
        </div>

        <ThemeToggle />

        <button
          onClick={() => navigator.clipboard.writeText(roomId)}
          className="flex items-center gap-2 rounded-lg border px-4 py-2 hover:bg-gray-50 dark:hover:bg-slate-800"
        >
          <Copy size={18}/>
          Copy
        </button>

        <button
          onClick={onLeave}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
        >
          <LogOut size={18}/>
          Leave
        </button>

      </div>

    </header>
  );
}