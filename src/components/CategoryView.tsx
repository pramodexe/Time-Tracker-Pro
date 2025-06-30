import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Play,
  Square,
  Plus,
  Edit3,
  Trash2,
  ArrowLeft,
  BarChart2,
  Clock,
  Clipboard,
  Pause,
} from "lucide-react";
import { categoriesAPI, sessionsAPI } from "../services/api.js";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type {
  Category,
  Session,
  TimerState,
  CategoryStats,
} from "../types/index.js";
import { formatTime } from "../utils/timeUtils.js";
import { useTheme } from "../contexts/ThemeContext.js";
import SessionModal from "./SessionModal.js";
import StatsModal from "./StatsModal.js";
import CategoryModal from "./CategoryModal.js";

const CategoryView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [category, setCategory] = useState<Category | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    duration: 0,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [pausedDuration, setPausedDuration] = useState(0);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingSession, setEditingSession] = useState<Session | null>(null);
  const [stats, setStats] = useState<CategoryStats | null>(null);

  useEffect(() => {
    if (id) {
      fetchCategoryData();
      fetchSessions();
      fetchStats();
    }
  }, [id]);

  useEffect(() => {
    let interval: number;
    if (timerState.isRunning && timerState.startedAt && !isPaused) {
      interval = setInterval(() => {
        setTimerState((prev) => ({
          ...prev,
          duration: Date.now() - prev.startedAt!.getTime() + pausedDuration,
        }));
      }, 10);
    }
    return () => clearInterval(interval);
  }, [timerState.isRunning, timerState.startedAt, isPaused, pausedDuration]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === " " && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (timerState.isRunning && !isPaused) {
          pauseTimer();
        } else if (isPaused) {
          resumeTimer();
        } else if (activeSessionId) {
          startTimer(activeSessionId);
        }
      }
      if (e.key === "s" && (e.ctrlKey || e.metaKey) && timerState.isRunning) {
        e.preventDefault();
        stopTimer();
      }
      if (e.key === "n" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setShowSessionModal(true);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [timerState.isRunning, isPaused, activeSessionId]);

  const fetchCategoryData = async () => {
    try {
      const response = await categoriesAPI.getById(Number(id));
      setCategory(response.data);
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await sessionsAPI.getAllForCategory(Number(id));
      setSessions(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await categoriesAPI.getStats(Number(id));
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const startTimer = async (sessionId: number) => {
    try {
      await sessionsAPI.startTimer(sessionId);
      setTimerState({
        isRunning: true,
        startedAt: new Date(),
        duration: 0,
      });
      setIsPaused(false);
      setPausedDuration(0);
      setActiveSessionId(sessionId);
    } catch (error) {
      console.error("Error starting timer:", error);
    }
  };

  const pauseTimer = () => {
    if (!timerState.isRunning || !activeSessionId) return;

    // Store the current duration when pausing
    setPausedDuration(timerState.duration);
    setIsPaused(true);
  };

  const resumeTimer = () => {
    if (!isPaused || !activeSessionId) return;

    setIsPaused(false);
  };

  const stopTimer = async () => {
    if (!activeSessionId) return;

    try {
      await sessionsAPI.stopTimer(activeSessionId);
      setTimerState({
        isRunning: false,
        duration: 0,
      });
      setIsPaused(false);
      setPausedDuration(0);
      setActiveSessionId(null);
      fetchSessions();
      fetchStats();
    } catch (error) {
      console.error("Error stopping timer:", error);
    }
  };

  const handleCreateSession = async (data: {
    name: string;
    notes?: string;
    tags?: string[];
  }) => {
    try {
      // Debug: Log timezone info
      console.log("Creating session at:", new Date());
      console.log(
        "Timezone:",
        Intl.DateTimeFormat().resolvedOptions().timeZone
      );
      console.log("Timezone offset (minutes):", new Date().getTimezoneOffset());

      const response = await sessionsAPI.create(Number(id), data);
      fetchSessions();
      setShowSessionModal(false);

      // Just set the active session ID without starting the timer
      if (response.data && response.data.id) {
        setActiveSessionId(response.data.id);
      } else {
        // Fallback if we don't get an ID back - fetch sessions and set the newest one as active
        const sessionsResponse = await sessionsAPI.getAllForCategory(
          Number(id)
        );
        if (sessionsResponse.data && sessionsResponse.data.length > 0) {
          // Sort by creation date and get the newest session
          const newestSession = sessionsResponse.data.sort(
            (a: Session, b: Session) =>
              new Date(b.created_at).getTime() -
              new Date(a.created_at).getTime()
          )[0];
          setActiveSessionId(newestSession.id);
        }
      }
    } catch (error) {
      console.error("Error creating session:", error);
    }
  };

  const handleEditSession = async (
    sessionId: number,
    data: { name: string; notes?: string; tags?: string[] }
  ) => {
    try {
      await sessionsAPI.update(sessionId, data);
      fetchSessions();
      setEditingSession(null);
      setShowSessionModal(false);
    } catch (error) {
      console.error("Error updating session:", error);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      try {
        await sessionsAPI.delete(sessionId);
        fetchSessions();
        fetchStats();
      } catch (error) {
        console.error("Error deleting session:", error);
      }
    }
  };

  const handleEditCategory = async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      await categoriesAPI.update(Number(id), data);
      fetchCategoryData();
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  // Get unique tags from all sessions
  const getPreviousTags = () => {
    const allTags = sessions.flatMap((session) => session.tags || []);
    return [...new Set(allTags)].sort();
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-50"
        }`}
      >
        <div className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div
          className={`rounded-xl shadow-sm border p-6 mb-8 ${
            isDarkMode
              ? "bg-gray-800 border-gray-700"
              : "bg-white border-gray-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate("/categories")}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                }`}
                aria-label="Go back to categories"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-3xl font-bold">{category?.name}</h1>
                {category?.description && (
                  <p
                    className={`mt-1 ${
                      isDarkMode ? "text-gray-300" : "text-gray-600"
                    }`}
                  >
                    {category.description}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCategoryModal(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                  isDarkMode
                    ? "bg-gray-600 text-white hover:bg-gray-500"
                    : "bg-gray-600 text-white hover:bg-gray-700"
                }`}
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Category</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview Section */}
        {stats && (
          <div className="mb-10">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Overview Statistics</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div
                className={`rounded-xl p-6 shadow-sm border text-center transform hover:scale-105 transition-transform ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <h3 className="text-3xl font-bold text-blue-600">
                  {stats.totalSessions}
                </h3>
                <p
                  className={`text-sm font-medium mt-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Total Sessions
                </p>
              </div>
              <div
                className={`rounded-xl p-6 shadow-sm border text-center transform hover:scale-105 transition-transform ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <h3 className="text-3xl font-bold text-green-600">
                  {formatTime(stats.average)}
                </h3>
                <p
                  className={`text-sm font-medium mt-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Average Time
                </p>
              </div>
              <div
                className={`rounded-xl p-6 shadow-sm border text-center transform hover:scale-105 transition-transform ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <h3 className="text-3xl font-bold text-orange-600">
                  {formatTime(stats.fastest)}
                </h3>
                <p
                  className={`text-sm font-medium mt-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Best Time
                </p>
              </div>
              <div
                className={`rounded-xl p-6 shadow-sm border text-center transform hover:scale-105 transition-transform ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <h3 className="text-3xl font-bold text-purple-600">
                  {formatTime(stats.slowest)}
                </h3>
                <p
                  className={`text-sm font-medium mt-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Slowest Time
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Progress Chart Section */}
        <div className="mb-10">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-xl font-semibold">Progress Chart</h2>
          </div>
          <div
            className={`rounded-xl shadow-sm border p-6 ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between mb-6">
              <p className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                Session duration over time
              </p>
              <div className="flex items-center text-sm">
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mr-1"></span>
                <span
                  className={isDarkMode ? "text-gray-300" : "text-gray-600"}
                >
                  Session Duration
                </span>
              </div>
            </div>

            {stats && stats.progressData.length > 1 ? (
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
            ) : (
              <div
                className={`flex flex-col items-center justify-center h-48 rounded-lg ${
                  isDarkMode ? "bg-gray-700" : "bg-gray-50"
                }`}
              >
                <BarChart2
                  className={`w-12 h-12 mb-3 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                />
                <p
                  className={`mb-2 font-medium ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  {stats && stats.progressData.length === 1
                    ? "Complete one more session to see your progress"
                    : "No session data yet"}
                </p>
                <p
                  className={`text-sm text-center max-w-sm ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  {stats && stats.progressData.length === 1
                    ? "Your progress chart will appear after completing at least 2 sessions"
                    : "Start tracking sessions to see your progress over time displayed here"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Timer Section - Moved between Progress Chart and Session Records */}
        <div className="mb-10">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">Timer</h2>
          </div>

          {activeSessionId ? (
            <div
              className={`rounded-xl shadow-sm border-l-4 ${
                timerState.isRunning ? "border-green-500" : "border-blue-500"
              } border p-6 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3
                      className={`text-lg font-semibold ${
                        isPaused
                          ? "text-orange-700"
                          : timerState.isRunning
                          ? "text-green-700"
                          : "text-blue-700"
                      }`}
                    >
                      {isPaused
                        ? "Paused"
                        : timerState.isRunning
                        ? "Running"
                        : "Ready to Start"}
                    </h3>
                  </div>
                  {timerState.isRunning ? (
                    <p
                      className={`text-4xl font-mono font-bold ${
                        isPaused ? "text-orange-600" : "text-green-600"
                      } mt-4`}
                    >
                      {formatTime(
                        isPaused ? pausedDuration : timerState.duration
                      )}
                    </p>
                  ) : (
                    <p className="text-lg text-blue-600 mt-2">
                      Session ready. Click Start to begin timing.
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {timerState.isRunning && !isPaused && (
                    <button
                      onClick={pauseTimer}
                      className="flex items-center space-x-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                      <Pause className="w-5 h-5" />
                      <span>Pause</span>
                    </button>
                  )}

                  {isPaused && (
                    <button
                      onClick={resumeTimer}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Play className="w-5 h-5" />
                      <span>Resume</span>
                    </button>
                  )}

                  {timerState.isRunning ? (
                    <button
                      onClick={stopTimer}
                      className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Square className="w-5 h-5" />
                      <span>Stop</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => startTimer(activeSessionId)}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Play className="w-5 h-5" />
                      <span>Start</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div
              className={`rounded-xl shadow-sm border-l-4 border-gray-300 border p-6 ${
                isDarkMode
                  ? "bg-gray-800 border-gray-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <div className="flex flex-col items-center justify-center py-6">
                <div
                  className={`mb-3 ${
                    isDarkMode ? "text-gray-500" : "text-gray-400"
                  }`}
                >
                  <Clock className="w-12 h-12" />
                </div>
                <h3
                  className={`text-xl font-medium mb-2 ${
                    isDarkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  No Active Session
                </h3>
                <p
                  className={`text-center max-w-md ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  Create a new session to start tracking your time.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sessions List Section */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Clipboard className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold">Session Records</h2>
            </div>
            <button
              onClick={() => setShowSessionModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>New Session</span>
            </button>
          </div>

          <div
            className={`rounded-xl shadow-sm border overflow-hidden ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            {sessions.length === 0 ? (
              <div className="text-center py-16">
                <p
                  className={`mb-6 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                >
                  No sessions yet
                </p>
                <button
                  onClick={() => setShowSessionModal(true)}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create your first session
                </button>
              </div>
            ) : (
              <>
                {/* Table Header */}
                <div
                  className={`grid grid-cols-13 gap-4 p-4 border-b font-medium text-sm ${
                    isDarkMode
                      ? "bg-gray-700 border-gray-600 text-gray-300"
                      : "bg-gray-50 border-gray-200 text-gray-700"
                  }`}
                >
                  <div className="col-span-1">#</div>
                  <div className="col-span-2">Session Name</div>
                  <div className="col-span-2">Date & Time</div>
                  <div className="col-span-2">Duration</div>
                  <div className="col-span-3">Notes</div>
                  <div className="col-span-2">Tags</div>
                  <div className="col-span-1">Actions</div>
                </div>

                {/* Table Rows */}
                <div
                  className={`divide-y ${
                    isDarkMode ? "divide-gray-700" : "divide-gray-100"
                  }`}
                >
                  {sessions
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .map((session, index) => (
                      <div
                        key={session.id}
                        className={`grid grid-cols-13 gap-4 p-5 transition-colors min-h-[4.5rem] ${
                          isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="col-span-1">
                          <span
                            className={`font-semibold ${
                              isDarkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          >
                            {sessions.length - index}
                          </span>
                        </div>

                        <div className="col-span-2">
                          <h3
                            className={`font-medium ${
                              isDarkMode ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {session.name}
                          </h3>
                        </div>

                        <div className="col-span-2">
                          <div className="flex flex-col">
                            <span
                              className={`font-medium ${
                                isDarkMode ? "text-gray-200" : "text-gray-700"
                              }`}
                            >
                              {new Date(session.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  timeZone:
                                    Intl.DateTimeFormat().resolvedOptions()
                                      .timeZone,
                                }
                              )}
                            </span>
                            <span
                              className={`text-sm ${
                                isDarkMode ? "text-gray-400" : "text-gray-600"
                              }`}
                            >
                              {new Date(session.created_at).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                  second: "2-digit",
                                  timeZone:
                                    Intl.DateTimeFormat().resolvedOptions()
                                      .timeZone,
                                }
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-2">
                          {session.duration ? (
                            <span className="font-mono text-blue-600 font-semibold">
                              {formatTime(session.duration)}
                            </span>
                          ) : (
                            <span
                              className={
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              }
                            >
                              -
                            </span>
                          )}
                        </div>

                        <div className="col-span-3">
                          {session.notes ? (
                            <p
                              className={`text-sm line-clamp-2 hover:line-clamp-none transition-all duration-300 ${
                                isDarkMode ? "text-gray-300" : "text-gray-600"
                              }`}
                            >
                              {session.notes}
                            </p>
                          ) : (
                            <span
                              className={
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              }
                            >
                              -
                            </span>
                          )}
                        </div>

                        <div className="col-span-2">
                          {session.tags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {session.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    isDarkMode
                                      ? "bg-blue-900 text-blue-200"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span
                              className={
                                isDarkMode ? "text-gray-500" : "text-gray-400"
                              }
                            >
                              -
                            </span>
                          )}
                        </div>

                        <div className="col-span-1">
                          <div className="flex items-center space-x-1">
                            {/* Only show stop button if this is the active session */}
                            {session.id === activeSessionId && (
                              <button
                                onClick={stopTimer}
                                className={`p-1.5 text-red-600 hover:text-red-700 rounded-full transition-colors cursor-pointer ${
                                  isDarkMode
                                    ? "hover:bg-red-900/20"
                                    : "hover:bg-red-50"
                                }`}
                                aria-label="Stop timer"
                              >
                                <Square className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setEditingSession(session);
                                setShowSessionModal(true);
                              }}
                              className={`p-1.5 hover:text-blue-600 rounded-full transition-colors cursor-pointer ${
                                isDarkMode
                                  ? "text-gray-500 hover:bg-blue-900/20"
                                  : "text-gray-400 hover:bg-blue-50"
                              }`}
                              aria-label="Edit session"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteSession(session.id)}
                              className={`p-1.5 hover:text-red-600 rounded-full transition-colors cursor-pointer ${
                                isDarkMode
                                  ? "text-gray-500 hover:bg-red-900/20"
                                  : "text-gray-400 hover:bg-red-50"
                              }`}
                              aria-label="Delete session"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showSessionModal && (
        <SessionModal
          isOpen={showSessionModal}
          onClose={() => {
            setShowSessionModal(false);
            setEditingSession(null);
          }}
          onSubmit={
            editingSession
              ? (data: { name: string; notes?: string; tags?: string[] }) =>
                  handleEditSession(editingSession.id, data)
              : handleCreateSession
          }
          initialData={editingSession}
          title={editingSession ? "Edit Session" : "Create New Session"}
          previousTags={getPreviousTags()} // Pass unique tags to SessionModal
        />
      )}

      {showStatsModal && stats && (
        <StatsModal
          isOpen={showStatsModal}
          onClose={() => setShowStatsModal(false)}
          stats={stats}
          categoryName={category?.name || ""}
        />
      )}

      {showCategoryModal && category && (
        <CategoryModal
          isOpen={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
          onSubmit={handleEditCategory}
          initialData={category}
          title="Edit Category"
        />
      )}
    </div>
  );
};

export default CategoryView;
