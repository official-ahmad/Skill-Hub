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
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
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
export const getCourse = (courseId) =>
  api(`/courses/${encodeURIComponent(courseId)}`);
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
export const getAdminSession = () => adminApi("/session");
export const createAdminUser = (user) => adminApi("/users", { method: "POST", body: JSON.stringify(user) });
export const createCourse = (course) => adminApi("/courses", { method: "POST", body: JSON.stringify(course) });
export const updateCourse = (id, course) => adminApi(`/courses/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(course) });
export const deleteCourse = (id) => adminApi(`/courses/${encodeURIComponent(id)}`, { method: "DELETE" });
export const getTechnologies = async () => {
  const response = await fetch(`${API_URL}/technologies`);
  const data = await response.json().catch(() => []);
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`);
  return data;
};
export const createTechnology = (technology) => adminApi("/technologies", { method: "POST", body: JSON.stringify(technology) });
export const updateTechnology = (id, technology) => adminApi(`/technologies/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(technology) });
export const deleteTechnology = (id) => adminApi(`/technologies/${encodeURIComponent(id)}`, { method: "DELETE" });
export const getAdminOverview = () => adminApi("/overview");
export const getAdminUsers = (options = {}) => {
  if (typeof options === "string") options = { search: options };
  const params = new URLSearchParams();
  const allowed = ["page", "limit", "search", "className", "accountType", "status", "sortBy", "sortDir"];
  allowed.forEach((key) => {
    if (options[key] !== undefined && options[key] !== "") params.set(key, String(options[key]));
  });
  const query = params.toString();
  return adminApi(`/users${query ? `?${query}` : ""}`);
};
export const toggleUserSuspension = (id, isSuspended) =>
  adminApi(`/users/${encodeURIComponent(id)}/suspend`, {
    method: "PATCH",
    body: JSON.stringify({ isSuspended }),
  });
export const updateAdminUser = (id, user) =>
  adminApi(`/users/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(user),
  });
export const deleteAdminUser = (id) =>
  adminApi(`/users/${encodeURIComponent(id)}`, {
    method: "DELETE",
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
export const getUserProgress = (id) => adminApi(`/users/${encodeURIComponent(id)}/progress`);
export const resetUserProgress = (id, courseId) => adminApi(`/users/${encodeURIComponent(id)}/progress/reset`, { method: "POST", body: JSON.stringify(courseId ? { courseId } : {}) });
export const getUserActivity = (id) => adminApi(`/users/${encodeURIComponent(id)}/activity`);
export const bulkImportUsers = (users) => adminApi("/users/bulk-import", { method: "POST", body: JSON.stringify({ users }) });
export const getActiveAnnouncement = () => api("/announcements/active");
export const getAdminAnnouncements = () => adminApi("/announcements");
export const publishAnnouncement = (message) => adminApi("/announcements", { method: "POST", body: JSON.stringify({ message }) });
export const deactivateAnnouncement = (id) => adminApi(`/announcements/${encodeURIComponent(id)}/deactivate`, { method: "PATCH" });
export const deleteAnnouncement = (id) => adminApi(`/announcements/${encodeURIComponent(id)}`, { method: "DELETE" });
export const deleteAdminQuery = (id) => adminApi(`/queries/${encodeURIComponent(id)}`, { method: "DELETE" });
export const bulkDeleteAdminQueries = (ids) => adminApi("/queries/bulk-delete", { method: "POST", body: JSON.stringify({ ids }) });
export const getCertificates = () => api("/certificates");
export const getCertificateQuiz = (courseId) => api(`/certificates/quiz/${encodeURIComponent(courseId)}`);
export const submitCertificateQuiz = (payload) =>
  api("/certificates/quiz/complete", { method: "POST", body: JSON.stringify(payload) });
export const requestCertificate = (courseId) =>
  api(`/certificates/request/${encodeURIComponent(courseId)}`, { method: "POST" });
export const getAdminCertificateRequests = (status = "pending") =>
  adminApi(`/certificate-requests${status ? `?status=${encodeURIComponent(status)}` : ""}`);
export const approveCertificateRequest = (id) =>
  adminApi(`/certificate-requests/${encodeURIComponent(id)}/approve`, { method: "POST" });
export const rejectCertificateRequest = (id) =>
  adminApi(`/certificate-requests/${encodeURIComponent(id)}/reject`, { method: "POST" });
export const verifyCertificate = (certificateId) =>
  fetch(`${API_URL}/certificates/verify/${encodeURIComponent(certificateId)}`)
    .then(async (response) => {
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Certificate not found");
      return data;
    });
