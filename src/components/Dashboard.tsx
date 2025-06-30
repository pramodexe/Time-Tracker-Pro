import React from "react";
import { Link } from "react-router-dom";
import { Timer, FolderOpen, TrendingUp, Clock } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
const Dashboard: React.FC = () => {
  const { isDarkMode } = useTheme();
  return (
    <div
      className={`min-h-screen ${isDarkMode ? "bg-gray-900" : "bg-gray-50"}`}
    >
      <div
        className={`bg-gradient-to-r from-blue-600 to-purple-600 py-20 ${
          isDarkMode ? "text-white" : "text-white"
        }`}
      >
        <div className="container mx-auto px-4 text-center">
          <Timer className="w-16 h-16 mx-auto mb-6 text-blue-100" />
          <h1 className="text-5xl font-bold mb-4">
            Welcome to TimeTracker Pro
          </h1>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Take control of your time and boost your productivity with our
            comprehensive time tracking solution.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/categories"
              className={`flex items-center px-6 py-3 rounded-lg transition-colors font-semibold ${
                isDarkMode
                  ? "bg-gray-900 text-white hover:bg-gray-800"
                  : "bg-white text-blue-600 hover:bg-gray-100"
              }`}
            >
              <FolderOpen className="w-5 h-5 mr-2" />
              View Categories
            </Link>
          </div>
        </div>
      </div>
      <div className={`py-16 ${isDarkMode ? "bg-gray-900" : ""}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2
              className={`text-3xl font-bold mb-4 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Why Choose TimeTracker Pro?
            </h2>
            <p
              className={`max-w-2xl mx-auto ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              Our intuitive time tracking platform helps you understand where
              your time goes and how to optimize it.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div
              className={`text-center p-6 ${
                isDarkMode ? "bg-gray-800 rounded-xl" : ""
              }`}
            >
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FolderOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h3
                className={`text-xl font-semibold mb-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Organize with Categories
              </h3>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                Create custom categories to organize your activities and track
                time across different projects and tasks.
              </p>
            </div>
            <div
              className={`text-center p-6 ${
                isDarkMode ? "bg-gray-800 rounded-xl" : ""
              }`}
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3
                className={`text-xl font-semibold mb-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Real-time Tracking
              </h3>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                Start and stop timers with ease. Track your sessions in
                real-time with pause and resume functionality.
              </p>
            </div>
            <div
              className={`text-center p-6 ${
                isDarkMode ? "bg-gray-800 rounded-xl" : ""
              }`}
            >
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
              <h3
                className={`text-xl font-semibold mb-3 ${
                  isDarkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Insightful Analytics
              </h3>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                View detailed charts and statistics to understand your time
                usage patterns and improve productivity.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className={`py-16 ${isDarkMode ? "bg-gray-800" : "bg-gray-100"}`}>
        <div className="container mx-auto px-4 text-center">
          <h2
            className={`text-3xl font-bold mb-4 ${
              isDarkMode ? "text-white" : "text-gray-900"
            }`}
          >
            Ready to Get Started?
          </h2>
          <p
            className={`mb-8 max-w-xl mx-auto ${
              isDarkMode ? "text-gray-300" : "text-gray-600"
            }`}
          >
            Begin your productivity journey by creating your first category and
            tracking your time effectively.
          </p>
          <Link
            to="/categories"
            className={`inline-flex items-center px-8 py-4 rounded-lg transition-colors font-semibold text-lg ${
              isDarkMode
                ? "bg-blue-700 text-white hover:bg-blue-800"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <FolderOpen className="w-5 h-5 mr-2" />
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
