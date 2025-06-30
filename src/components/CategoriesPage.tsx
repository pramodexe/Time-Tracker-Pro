import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit3, Trash2, Timer } from "lucide-react";
import { categoriesAPI } from "../services/api.js";
import type { Category } from "../types/index.js";
import { formatDate } from "../utils/timeUtils.js";
import CategoryModal from "./CategoryModal.js";
import { useTheme } from "../contexts/ThemeContext";

const CategoriesPage: React.FC = () => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
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
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDarkMode ? "bg-gray-900" : "bg-gray-100"
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
              <div>
                <h1 className="text-3xl font-bold">Categories</h1>
                <p
                  className={`mt-1 ${
                    isDarkMode ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  Manage your time tracking categories
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowCategoryModal(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
                  isDarkMode
                    ? "bg-blue-700 text-white hover:bg-blue-800"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>New Category</span>
              </button>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div
            className={`rounded-xl shadow-sm border p-16 text-center ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <Timer
              className={`w-16 h-16 mx-auto mb-4 ${
                isDarkMode ? "text-gray-500" : "text-gray-400"
              }`}
            />
            <h3
              className={`text-xl font-semibold mb-2 ${
                isDarkMode ? "text-gray-200" : "text-gray-700"
              }`}
            >
              No categories yet
            </h3>
            <p
              className={`mb-6 max-w-md mx-auto ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Create your first category to start tracking time for your
              activities.
            </p>
            <button
              onClick={() => setShowCategoryModal(true)}
              className={`px-6 py-3 rounded-lg transition-colors cursor-pointer ${
                isDarkMode
                  ? "bg-blue-700 text-white hover:bg-blue-800"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              Create First Category
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`p-6 shadow-sm border rounded-xl cursor-pointer hover:shadow-md transition-all group transform hover:scale-105 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
                onClick={() => navigate(`/category/${category.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3
                      className={`text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors ${
                        isDarkMode ? "text-white" : "text-blue-600"
                      }`}
                    >
                      {category.name}
                    </h3>
                    {category.description && (
                      <p
                        className={`text-sm mb-3 ${
                          isDarkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        {category.description}
                      </p>
                    )}
                    <p
                      className={`text-xs ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Created: {formatDate(category.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingCategory(category);
                        setShowCategoryModal(true);
                      }}
                      className={`p-2 transition-colors rounded-lg cursor-pointer ${
                        isDarkMode
                          ? "text-gray-400 hover:text-blue-400 hover:bg-gray-900"
                          : "text-gray-400 hover:text-blue-600 hover:bg-gray-100"
                      }`}
                      aria-label="Edit category"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                      className={`p-2 transition-colors rounded-lg cursor-pointer ${
                        isDarkMode
                          ? "text-gray-400 hover:text-red-400 hover:bg-gray-900"
                          : "text-gray-400 hover:text-red-600 hover:bg-gray-100"
                      }`}
                      aria-label="Delete category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div
                  className={`flex items-center justify-between pt-4 border-t ${
                    isDarkMode ? "border-gray-700" : "border-gray-200"
                  }`}
                >
                  <span
                    className={`text-sm ${
                      isDarkMode ? "text-gray-400" : "text-gray-600"
                    }`}
                  >
                    View Sessions
                  </span>
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center group-hover:bg-blue-900 transition-all ${
                      isDarkMode ? "bg-gray-900" : "bg-gray-100"
                    }`}
                  >
                    <Timer className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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

export default CategoriesPage;
