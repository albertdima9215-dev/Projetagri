import { useEffect, useState } from "react";
import { FaMoon, FaSun } from "react-icons/fa";
import "../css/themeToggle.css";

function ThemeToggle() {
  const [darkMode, setDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      className="floating-theme-btn"
      onClick={() => setDarkMode(!darkMode)}
      aria-label="Changer le thème"
    >
      {darkMode ? <FaSun /> : <FaMoon />}
    </button>
  );
}

export default ThemeToggle;
