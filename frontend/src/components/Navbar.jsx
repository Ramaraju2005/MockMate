import React from "react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, login, logout } = useAuth();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-8 py-4 flex justify-between items-center">
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          MockMate
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <>
              <span className="text-gray-700 dark:text-gray-300 font-medium">
                Welcome, {user.displayName || user.name}
              </span>
              <button
                onClick={logout}
                className="bg-red-500 hover:bg-red-600 px-5 py-2 rounded-lg text-white transition"
              >
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={login}
              className="bg-blue-500 hover:bg-blue-600 px-5 py-2 rounded-lg text-white transition"
            >
              Login
            </button>
          )}
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}