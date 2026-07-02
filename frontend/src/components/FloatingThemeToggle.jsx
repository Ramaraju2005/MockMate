import React from "react";
import ThemeToggle from "./ThemeToggle";

const FloatingThemeToggle = () => (
  <div style={{ position: "fixed", bottom: "1rem", right: "1rem" }}>
    <ThemeToggle />
  </div>
);

export default FloatingThemeToggle;
