const configuredApiUrl = String(import.meta.env.VITE_API_URL || "")
  .trim()
  .replace(/\/+$/, "");
if (!configuredApiUrl) {
  throw new Error("VITE_API_URL must be set to the Skillhub API origin.");
}
const API_URL = /\/api$/i.test(configuredApiUrl)
  ? configuredApiUrl
  : `${configuredApiUrl}/api`;
const TOKEN_KEY = "sh_token";

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const saveToken = (token) => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = () => localStorage.removeItem(TOKEN_KEY);

export async function api(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };
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

export const apiLogin = (credential) =>
  api("/auth/google", { method: "POST", body: JSON.stringify({ credential }) });
export const logoutUser = () => api("/auth/logout", { method: "POST" });
export const getMe = () => api("/auth/me");
export const updateProfile = (profile) =>
  api("/auth/profile", { method: "PATCH", body: JSON.stringify(profile) });
export const getCourses = () => api("/courses");
export const getProgress = () => api("/progress");
export const migrateLegacyProgress = (data) =>
  api("/progress/migrate", { method: "POST", body: JSON.stringify(data) });
export const saveProgress = (courseId, completedLessons) =>
  api(`/progress/${encodeURIComponent(courseId)}`, {
    method: "PUT",
    body: JSON.stringify({ completedLessons }),
  });
export const saveNote = (courseId, lessonIndex, text) =>
  api(`/progress/${encodeURIComponent(courseId)}/notes/${lessonIndex}`, {
    method: "PUT",
    body: JSON.stringify({ text }),
  });
export const resetProgress = () => api("/progress", { method: "DELETE" });
export const getLeaderboard = () => api("/students/leaderboard");

export async function adminApi(path, options = {}) {
  const headers = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };
  const adminToken = localStorage.getItem("sh_admin_token");
  if (adminToken) headers.Authorization = `Bearer ${adminToken}`;
  const response = await fetch(`${API_URL}/admin${path}`, {
    ...options,
    headers,
    credentials: "include",
  });
  const data = await response.json().catch(() => ({}));
  if (response.status === 401) localStorage.removeItem("sh_admin_token");
  if (!response.ok)
    throw new Error(data.error || `Request failed (${response.status})`);
  return data;
}

export const adminLogin = (adminId, password) =>
  adminApi("/login", {
    method: "POST",
    body: JSON.stringify({ adminId, password }),
  });
export const getAdminOverview = () => adminApi("/overview");
export const getAdminUsers = (search = "") =>
  adminApi(`/users${search ? `?search=${encodeURIComponent(search)}` : ""}`);
export const toggleUserSuspension = (id, isSuspended) =>
  adminApi(`/users/${encodeURIComponent(id)}/suspend`, {
    method: "PATCH",
    body: JSON.stringify({ isSuspended }),
  });
export const getUserLogs = (id) =>
  adminApi(`/users/${encodeURIComponent(id)}/logs`);
export const getAdminQueries = () => adminApi("/queries");
export const replyToQuery = (id, adminResponse) =>
  adminApi(`/queries/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ adminResponse }),
  });
export const adminLogout = () => adminApi("/logout", { method: "POST" });

export const sendQuery = (message) =>
  api("/queries", { method: "POST", body: JSON.stringify({ message }) });
export const getNotifications = () => api("/queries/notifications");
