import React from "react";
import { X, TrendingUp, Clock, Zap, Target } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CategoryStats } from "../types/index.js";
import { formatTime } from "../utils/timeUtils.js";
import { useTheme } from "../contexts/ThemeContext";
interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: CategoryStats;
  categoryName: string;
}
const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  categoryName,
}) => {
  const { isDarkMode } = useTheme();
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-2xl font-bold ${
              isDarkMode ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {categoryName} Statistics
          </h2>
          <button
            onClick={onClose}
            className={`p-1 rounded transition-colors cursor-pointer ${
              isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {stats.totalSessions === 0 ? (
          <div className="text-center py-12">
            <p className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
              No completed sessions yet
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div
                className={`p-4 rounded-lg ${
                  isDarkMode ? "bg-blue-900/20" : "bg-blue-50"
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Target
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-blue-400" : "text-blue-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-blue-200" : "text-blue-800"
                    }`}
                  >
                    Total Sessions
                  </span>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-blue-200" : "text-blue-800"
                  }`}
                >
                  {stats.totalSessions}
                </div>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  isDarkMode ? "bg-green-900/20" : "bg-green-50"
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Clock
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-green-400" : "text-green-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-green-200" : "text-green-800"
                    }`}
                  >
                    Average Time
                  </span>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-green-200" : "text-green-800"
                  }`}
                >
                  {formatTime(stats.average)}
                </div>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  isDarkMode ? "bg-orange-900/20" : "bg-orange-50"
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <Zap
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-orange-400" : "text-orange-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-orange-200" : "text-orange-800"
                    }`}
                  >
                    Best Time
                  </span>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-orange-200" : "text-orange-800"
                  }`}
                >
                  {formatTime(stats.fastest)}
                </div>
              </div>
              <div
                className={`p-4 rounded-lg ${
                  isDarkMode ? "bg-purple-900/20" : "bg-purple-50"
                }`}
              >
                <div className="flex items-center space-x-2 mb-2">
                  <TrendingUp
                    className={`w-5 h-5 ${
                      isDarkMode ? "text-purple-400" : "text-purple-600"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${
                      isDarkMode ? "text-purple-200" : "text-purple-800"
                    }`}
                  >
                    Slowest Time
                  </span>
                </div>
                <div
                  className={`text-2xl font-bold ${
                    isDarkMode ? "text-purple-200" : "text-purple-800"
                  }`}
                >
                  {formatTime(stats.slowest)}
                </div>
              </div>
            </div>
            <div className="mt-8">
              <h3
                className={`text-lg font-semibold mb-4 ${
                  isDarkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                Progress Chart
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.progressData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-20"
                    />
                    <XAxis
                      dataKey="session"
                      className={isDarkMode ? "text-gray-300" : "text-gray-600"}
                    />
                    <YAxis
                      tickFormatter={(value) => formatTime(value)}
                      className={isDarkMode ? "text-gray-300" : "text-gray-600"}
                    />
                    <Tooltip
                      formatter={(value: number) => [
                        formatTime(value),
                        "Duration",
                      ]}
                      labelFormatter={(label) => `Session ${label}`}
                      contentStyle={{
                        backgroundColor: isDarkMode ? "#374151" : "white",
                        border: `1px solid ${
                          isDarkMode ? "#4b5563" : "#e5e7eb"
                        }`,
                        borderRadius: "8px",
                        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                        color: isDarkMode ? "#f3f4f6" : "#374151",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="duration"
                      stroke="#4f46e5"
                      strokeWidth={2}
                      dot={{ fill: "#4f46e5", strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: "#4f46e5", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default StatsModal;
