import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import {
  ResponsiveContainer,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Line,
} from "recharts";
import type { Category } from "../types/index.js";

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; description?: string }) => void;
  initialData?: Category | null;
  title: string;
  stats?: Array<{ date: string; progress: number }>;
}

const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  stats,
}) => {
  const { isDarkMode } = useTheme();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setDescription(initialData.description || "");
    } else {
      setName("");
      setDescription("");
    }
  }, [initialData, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-lg p-6 w-full max-w-md ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h2
            className={`text-xl font-bold ${
              isDarkMode ? "text-gray-100" : "text-gray-900"
            }`}
          >
            {title}
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

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="name"
              className={`block mb-1 font-medium ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 rounded border outline-none transition-colors focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"
              }`}
              placeholder="e.g., Rubik's Cube, Typing Practice"
              required
              autoFocus
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="description"
              className={`block mb-1 font-medium ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`w-full px-4 py-2 rounded border outline-none transition-colors resize-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-blue-500"
              }`}
              placeholder="Add a description for this category..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded font-medium transition-colors ${
                isDarkMode
                  ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded font-medium transition-colors ${
                isDarkMode
                  ? "bg-blue-700 text-white hover:bg-blue-800"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {initialData ? "Update" : "Create"}
            </button>
          </div>
        </form>

        {stats && stats.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Progress
            </h3>
            <div className="h-40">
              <ResponsiveContainer>
                <LineChart data={stats}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="stroke-gray-200"
                  />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(date) =>
                      new Date(date).toLocaleDateString()
                    }
                    className="text-gray-700 dark:text-gray-300"
                  />
                  <YAxis
                    className="text-gray-700 dark:text-gray-300"
                    domain={[0, "dataMax"]}
                  />
                  <Tooltip formatter={(value) => [value, "Progress"]} />
                  <Line
                    type="monotone"
                    dataKey="progress"
                    stroke="#4f46e5"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryModal;
