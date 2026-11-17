const API_URL = (import.meta.env.VITE_API_URL || "https://skillhub-api.rentify.software/api").replace(/\/$/, "");
const TOKEN_KEY = "sh_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export async function api(path, options = {}) {
  const headers = { ...(options.body ? { "Content-Type": "application/json" } : {}), ...options.headers };
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) clearToken();
    throw new Error(data.error || `Request failed (${response.status})`);
  }
  return data;
}

export const apiLogin = (credential) => api("/auth/google", { method: "POST", body: JSON.stringify({ credential }) });
export const getMe = () => api("/auth/me");
export const updateProfile = (profile) => api("/auth/profile", { method: "PATCH", body: JSON.stringify(profile) });
export const getCourses = () => api("/courses");
export const getProgress = () => api("/progress");
export const migrateLegacyProgress = (data) => api("/progress/migrate", { method: "POST", body: JSON.stringify(data) });
export const saveProgress = (courseId, completedLessons) => api(`/progress/${encodeURIComponent(courseId)}`, { method: "PUT", body: JSON.stringify({ completedLessons }) });
export const saveNote = (courseId, lessonIndex, text) => api(`/progress/${encodeURIComponent(courseId)}/notes/${lessonIndex}`, { method: "PUT", body: JSON.stringify({ text }) });
export const resetProgress = () => api("/progress", { method: "DELETE" });
export const getLeaderboard = () => api("/progress/leaderboard");
