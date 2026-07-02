import React, { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useContext(ThemeContext);
  const icon = theme === "light" ? "🌙" : "☀️"; // moon for light mode, sun for dark mode
  return (
    <button
      onClick={toggleTheme}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        fontSize: "1.5rem",
      }}
      aria-label="Toggle dark/light theme"
    >
      {icon}
    </button>
  );
};

export default ThemeToggle;
