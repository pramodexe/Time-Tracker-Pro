import { Timer } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext.js";
const Footer = () => {
  const { isDarkMode } = useTheme();
  return (
    <footer
      className={`border-t py-6 ${
        isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center space-x-2 mb-4 md:mb-0">
            <Timer className="w-5 h-5 text-blue-600" />
            <span
              className={`font-semibold ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              TimeTracker Pro
            </span>
          </div>
          <div
            className={`text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            © {new Date().getFullYear()} TimeTracker Pro. All rights reserved.
          </div>
          <div
            className={`mt-4 md:mt-0 text-sm ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Track your time efficiently
          </div>
        </div>
      </div>
    </footer>
  );
};
export default Footer;
