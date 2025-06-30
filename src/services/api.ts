import axios from "axios";
const API_BASE_URL = "http://localhost:3001/api";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});
export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  getById: (id: number) => api.get(`/categories/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post("/categories", data),
  update: (id: number, data: { name: string; description?: string }) =>
    api.put(`/categories/${id}`, data),
  delete: (id: number) => api.delete(`/categories/${id}`),
  getStats: (id: number) => api.get(`/categories/${id}/stats`),
};
export const sessionsAPI = {
  getAllForCategory: (categoryId: number) =>
    api.get(`/categories/${categoryId}/sessions`),
  getById: (id: number) => api.get(`/sessions/${id}`),
  create: (
    categoryId: number,
    data: { name: string; notes?: string; tags?: string[] }
  ) => api.post(`/categories/${categoryId}/sessions`, data),
  update: (
    id: number,
    data: { name: string; notes?: string; tags?: string[] }
  ) => api.put(`/sessions/${id}`, data),
  delete: (id: number) => api.delete(`/sessions/${id}`),
  startTimer: (id: number) => api.post(`/sessions/${id}/start`),
  stopTimer: (id: number) => api.post(`/sessions/${id}/stop`),
};
export default api;
