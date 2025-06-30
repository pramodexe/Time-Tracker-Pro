import React, { useState, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import type { Session } from "../types/index.js";
interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; notes?: string; tags?: string[] }) => void;
  initialData?: Session | null;
  title: string;
  previousTags?: string[];
}
const SessionModal: React.FC<SessionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title,
  previousTags = [],
}) => {
  const { isDarkMode } = useTheme();
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setNotes(initialData.notes || "");
      setTags(initialData.tags || []);
    } else {
      setName("");
      setNotes("");
      setTags([]);
    }
    setNewTag("");
  }, [initialData, isOpen]);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({
      name: name.trim(),
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
  };
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };
  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
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
              Session Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-4 py-2 rounded border outline-none transition-colors ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
              placeholder="e.g., Speed Solve #1"
              required
              autoFocus
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="notes"
              className={`block mb-1 font-medium ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className={`w-full px-4 py-2 rounded border outline-none transition-colors resize-none ${
                isDarkMode
                  ? "bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
              }`}
              placeholder="Add any notes about this session..."
            />
          </div>
          <div className="mb-6">
            <label
              className={`block mb-1 font-medium ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isDarkMode
                      ? "bg-blue-900 text-blue-200"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    className={`ml-1 p-0.5 rounded-full ${
                      isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-200"
                    }`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                className={`flex-1 px-4 py-2 rounded border outline-none transition-colors ${
                  isDarkMode
                    ? "bg-gray-900 border-gray-700 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-400"
                }`}
                placeholder="Add a tag..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
              />
              <button
                type="button"
                onClick={addTag}
                className={`px-3 py-2 rounded font-medium transition-colors ${
                  isDarkMode
                    ? "bg-blue-700 text-white hover:bg-blue-800"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            {previousTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {previousTags.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (!tags.includes(tag)) setTags([...tags, tag]);
                    }}
                    className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
                      isDarkMode
                        ? "bg-gray-700 text-gray-200 hover:bg-blue-900"
                        : "bg-gray-100 text-gray-700 hover:bg-blue-100"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
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
              {initialData ? "Update" : "Start"} Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default SessionModal;
