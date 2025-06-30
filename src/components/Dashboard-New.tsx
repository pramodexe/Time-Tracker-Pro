import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Edit3,
  Trash2,
  Timer,
  Moon,
  Sun,
  Zap,
  Activity,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { categoriesAPI } from "../services/api.js";
import type { Category } from "../types/index.js";
import { formatDate } from "../utils/timeUtils.js";
import { useTheme } from "../contexts/ThemeContext.js";
import CategoryModal from "./CategoryModal.js";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setLoading(false);
    }
  };

  const handleCreateCategory = async (data: {
    name: string;
    description?: string;
  }) => {
    try {
      await categoriesAPI.create(data);
      fetchCategories();
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  const handleEditCategory = async (
    categoryId: number,
    data: { name: string; description?: string }
  ) => {
    try {
      await categoriesAPI.update(categoryId, data);
      fetchCategories();
      setEditingCategory(null);
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  const handleDeleteCategory = async (categoryId: number) => {
    if (
      window.confirm(
        "Are you sure you want to delete this category? All sessions will be deleted too."
      )
    ) {
      try {
        await categoriesAPI.delete(categoryId);
        fetchCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-pattern flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 cyber-grid opacity-30"></div>
        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="loading-spinner w-12 h-12"></div>
          <div className="matrix-text text-lg font-medium">
            Initializing System...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pattern relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 cyber-grid opacity-20"></div>
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-48 h-48 bg-gradient-to-r from-green-500/10 to-cyan-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center space-x-4 animate-fade-in-up">
            <div className="relative">
              <Timer className="w-10 h-10 text-cyan-400 pulse-glow" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full"></div>
            </div>
            <div>
              <h1 className="text-4xl font-bold font-['Orbitron'] holographic">
                ACTIVITY TIMER
              </h1>
              <p className="text-sm text-gray-400 font-['Rajdhani'] tracking-wider uppercase">
                Performance Tracking System
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4 animate-slide-in-right">
            <button
              onClick={toggleDarkMode}
              className="relative group p-3 glass rounded-xl transition-all duration-300 hover:scale-105"
              aria-label="Toggle theme"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {isDarkMode ? (
                <Sun className="w-6 h-6 text-yellow-400 relative z-10" />
              ) : (
                <Moon className="w-6 h-6 text-blue-400 relative z-10" />
              )}
            </button>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="btn-futuristic flex items-center space-x-2 px-6 py-3 relative overflow-hidden group"
            >
              <Plus className="w-5 h-5 relative z-10" />
              <span className="relative z-10 font-['Orbitron']">
                New Category
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card-futuristic p-6 text-center scanner-line">
            <Zap className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <h3 className="text-2xl font-bold font-['Orbitron'] text-yellow-400">
              {categories.length}
            </h3>
            <p className="text-sm text-gray-400 uppercase tracking-wider">
              Active Categories
            </p>
          </div>
          <div className="card-futuristic p-6 text-center scanner-line">
            <Activity className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <h3 className="text-2xl font-bold font-['Orbitron'] text-green-400">
              24/7
            </h3>
            <p className="text-sm text-gray-400 uppercase tracking-wider">
              System Online
            </p>
          </div>
          <div className="card-futuristic p-6 text-center scanner-line">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <h3 className="text-2xl font-bold font-['Orbitron'] text-purple-400">
              ∞
            </h3>
            <p className="text-sm text-gray-400 uppercase tracking-wider">
              Performance Limit
            </p>
          </div>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="relative inline-block">
              <Timer className="w-20 h-20 mx-auto mb-6 text-cyan-400 pulse-glow" />
              <div className="absolute inset-0 bg-cyan-400/20 blur-2xl rounded-full"></div>
            </div>
            <h2 className="text-3xl font-bold font-['Orbitron'] holographic mb-4">
              NO CATEGORIES DETECTED
            </h2>
            <p className="text-gray-400 mb-8 font-['Rajdhani'] text-lg">
              Initialize your first tracking module to begin performance
              analysis
            </p>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="btn-futuristic px-8 py-4 text-lg relative overflow-hidden group flex items-center space-x-2 mx-auto"
            >
              <Sparkles className="w-5 h-5 relative z-10" />
              <span className="relative z-10 font-['Orbitron']">
                Initialize First Category
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fade-in-up">
            {categories.map((category, index) => (
              <div
                key={category.id}
                className="card-futuristic p-6 cursor-pointer group relative overflow-hidden"
                onClick={() => navigate(`/category/${category.id}`)}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-400 to-blue-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold font-['Orbitron'] text-cyan-400 mb-2 group-hover:neon-text transition-all">
                      {category.name.toUpperCase()}
                    </h3>
                    {category.description && (
                      <p className="text-gray-400 text-sm mb-3 font-['Rajdhani']">
                        {category.description}
                      </p>
                    )}
                    <p className="text-gray-500 text-xs font-['Rajdhani'] tracking-wider">
                      INIT: {formatDate(category.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategory(category);
                        setShowCategoryModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-500/10"
                      aria-label="Edit category"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                      aria-label="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-600">
                  <span className="text-sm text-gray-400 font-['Rajdhani'] uppercase tracking-wider">
                    Access Sessions
                  </span>
                  <div className="w-8 h-8 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-lg flex items-center justify-center group-hover:from-cyan-500/40 group-hover:to-blue-500/40 transition-all">
                    <Timer className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>

                {/* Hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </div>
            ))}
          </div>
        )}

        {/* System Info */}
        <div className="mt-16 text-center animate-fade-in-up">
          <div className="card-futuristic p-8 max-w-4xl mx-auto scanner-line">
            <h3 className="text-2xl font-bold font-['Orbitron'] holographic mb-4">
              PERFORMANCE TRACKING SYSTEM
            </h3>
            <p className="text-gray-400 text-lg mb-8 font-['Rajdhani']">
              Advanced temporal measurement protocol for activity optimization.
              Monitor progress across multiple performance vectors with
              precision timing and statistical analysis.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center space-y-3">
                <div className="w-3 h-3 bg-cyan-400 rounded-full pulse-glow"></div>
                <span className="text-sm font-['Orbitron'] text-cyan-400 uppercase tracking-wider">
                  Categories
                </span>
                <span className="text-xs text-gray-500">Activity Modules</span>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="w-3 h-3 bg-green-400 rounded-full pulse-glow"></div>
                <span className="text-sm font-['Orbitron'] text-green-400 uppercase tracking-wider">
                  Sessions
                </span>
                <span className="text-xs text-gray-500">Performance Runs</span>
              </div>
              <div className="flex flex-col items-center space-y-3">
                <div className="w-3 h-3 bg-purple-400 rounded-full pulse-glow"></div>
                <span className="text-sm font-['Orbitron'] text-purple-400 uppercase tracking-wider">
                  Analytics
                </span>
                <span className="text-xs text-gray-500">Data Insights</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showCategoryModal && (
        <CategoryModal
          isOpen={showCategoryModal}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          onSubmit={
            editingCategory
              ? (data: { name: string; description?: string }) =>
                  handleEditCategory(editingCategory.id, data)
              : handleCreateCategory
          }
          initialData={editingCategory}
          title={editingCategory ? "Edit Category" : "Create New Category"}
        />
      )}
    </div>
  );
};

export default Dashboard;
