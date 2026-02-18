"use client";
import { createContext, useContext, useState } from "react";
import { useEffect } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [darkMode, setDarkMode] = useState(false);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

useEffect(() => {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    setDarkMode(true);
    document.documentElement.classList.add("dark");
  }
}, []);

const toggleTheme = () => {
  const newMode = !darkMode;
  setDarkMode(newMode);

  if (newMode) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
};
