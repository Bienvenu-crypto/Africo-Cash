"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext({ theme: "light", toggleTheme: () => {} });

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const saved = localStorage.getItem("siteTheme") || "light";
    setTheme(saved);
    document.documentElement.className = saved === "dark" ? "dark-theme" : "";
  }, []);

  const toggleTheme = (newTheme) => {
    const next = newTheme || (theme === "light" ? "dark" : "light");
    setTheme(next);
    localStorage.setItem("siteTheme", next);
    document.documentElement.className = next === "dark" ? "dark-theme" : "";
    document.cookie = `siteTheme=${next}; path=/; max-age=31536000`;
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
