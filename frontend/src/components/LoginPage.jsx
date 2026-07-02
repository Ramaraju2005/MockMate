import { ArrowRight } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import Footer from "./Footer";

export default function LoginPage() {
  const { login, error } = useAuth();

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">

      {/* Login Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-20">

        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-10 w-full max-w-md text-center">

          <h2 className="text-4xl font-bold text-blue-600">
            Welcome to
          </h2>

          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mt-2">
            MockMate
          </h1>

          <p className="mt-6 text-gray-600 dark:text-gray-300">
            Sign in with Google to start your mock interview journey.
          </p>

          <button
            onClick={login}
            className="mt-10 w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-semibold transition"
          >
            Continue with Google
            <ArrowRight size={18} />
          </button>

          {error && (
            <p className="mt-5 text-red-600 text-sm">
              {error}
            </p>
          )}
        </div>
      </main>
      <Footer />

    </div>
  );
}