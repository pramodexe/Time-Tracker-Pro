import { Timer, FolderOpen, Moon, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../contexts/ThemeContext.js";
const Header = () => {
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useTheme();
  return (
    <header
      className={`border-b shadow-sm py-4 ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="container mx-auto px-4 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Timer className="w-8 h-8 text-blue-600" />
          <div>
            <h1
              className={`text-2xl font-bold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              TimeTracker Pro
            </h1>
            <p
              className={`text-sm ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Track your activities and improve productivity
            </p>
          </div>
        </div>
        <nav className="flex items-center space-x-3">
          <Link
            to="/"
            className={`px-4 py-2 rounded-lg transition-colors ${
              location.pathname === "/"
                ? "bg-blue-600 text-white"
                : isDarkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Home
          </Link>
          <Link
            to="/categories"
            className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
              location.pathname === "/categories"
                ? "bg-blue-600 text-white"
                : isDarkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FolderOpen className="w-4 h-4 mr-2" />
            Categories
          </Link>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode
                ? "text-gray-300 hover:bg-gray-700"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </nav>
      </div>
    </header>
  );
};
export default Header;
