import { useCallback, useEffect, useState } from "react";
import {
  Activity,
  LogOut,
  Search,
  ShieldAlert,
  Users,
  LibraryBig,
  MessageSquareText,
  Megaphone,
  Upload,
  RotateCcw,
  Menu,
  Moon,
  Sun,
  X,
} from "lucide-react";
import {
  adminLogout,
  getAdminOverview,
  getAdminQueries,
  getAdminUsers,
  getUserLogs,
  replyToQuery,
  toggleUserSuspension,
  updateAdminUser,
  deleteAdminUser,
  createAdminUser,
  getUserActivity,
  resetUserProgress,
  bulkImportUsers,
  getAdminAnnouncements,
  publishAnnouncement,
  deactivateAnnouncement,
  deleteAdminQuery,
} from "../../api";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import AdminContentManager from "./AdminContentManager";

/* Must match the key your main app uses for its theme toggle. */
const THEME_KEY = "theme";

const TABS = [
  ["overview", "Overview", Activity],
  ["users", "User management", Users],
  ["queries", "Support center", MessageSquareText],
  ["content", "Courses & technologies", LibraryBig],
  ["announcements", "Class notice", Megaphone],
  ["import", "Bulk import", Upload],
];

const TITLES = {
  overview: "System overview",
  users: "User management",
  queries: "Support center",
  content: "Courses & technologies",
  announcements: "Class notice",
  import: "Bulk import",
};

const EMPTY_USER_FORM = {
  name: "",
  email: "",
  accountType: "student",
  studentId: "",
  className: "",
  password: "",
};

function useTheme() {
  const [theme, setTheme] = useState(() => {
    const attr = document.documentElement.dataset.theme;
    if (attr === "dark" || attr === "light") return attr;
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === "dark" || saved === "light") return saved;
    } catch {
      /* storage unavailable */
    }
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      /* storage unavailable */
    }
  }, [theme]);

  return [theme, () => setTheme((t) => (t === "dark" ? "light" : "dark"))];
}

function StatusPill({ suspended }) {
  return (
    <span className={suspended ? "status-suspended" : "status-active"}>
      {suspended ? "Suspended" : "Active"}
    </span>
  );
}

function Modal({
  onClose,
  labelledBy,
  role = "dialog",
  wide,
  children,
  as = "div",
  onSubmit,
}) {
  const Tag = as;
  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <Tag
        className={`admin-login-modal${wide ? " is-wide" : ""}`}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        onSubmit={onSubmit}
      >
        {children}
      </Tag>
    </div>
  );
}

function UserFields({ values, onChange, passwordLabel, passwordRequired }) {
  return (
    <>
      <label>
        Full name
        <input
          required
          minLength={2}
          maxLength={120}
          value={values.name}
          onChange={(e) => onChange({ name: e.target.value })}
        />
      </label>
      <label>
        Email address
        <input
          required
          type="email"
          maxLength={254}
          value={values.email}
          onChange={(e) => onChange({ email: e.target.value })}
        />
      </label>
      <label>
        Account type
        <select
          value={values.accountType}
          onChange={(e) => onChange({ accountType: e.target.value })}
        >
          <option value="student">Student</option>
          <option value="instructor">Instructor</option>
          <option value="staff">Staff</option>
          <option value="guest">Guest</option>
        </select>
      </label>
      <label>
        Student ID
        <input
          readOnly
          value={String(values.email || "").split("@")[0] || ""}
          className="cursor-not-allowed"
        />
      </label>
      <label>
        Class / section
        <input
          maxLength={120}
          value={values.className}
          onChange={(e) => onChange({ className: e.target.value })}
        />
      </label>
      <label>
        {passwordLabel}
        <input
          type="password"
          minLength={12}
          required={passwordRequired}
          autoComplete="new-password"
          value={values.password}
          onChange={(e) => onChange({ password: e.target.value })}
        />
      </label>
    </>
  );
}

export default function AdminDashboard({ onExit }) {
  const [theme, toggleTheme] = useTheme();
  const [tab, setTab] = useState("overview");
  const [overview, setOverview] = useState({
    totalStudents: 0,
    activeCourses: 0,
    pendingQueries: 0,
    suspendedAccounts: 0,
  });
  const [users, setUsers] = useState([]);
  const [queries, setQueries] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userLimit, setUserLimit] = useState(25);
  const [userTotal, setUserTotal] = useState(0);
  const [userTotalPages, setUserTotalPages] = useState(1);
  const [classFilter, setClassFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedUser, setSelectedUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState("");
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState(EMPTY_USER_FORM);
  const [editUser, setEditUser] = useState(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [activityDrawer, setActivityDrawer] = useState(null);
  const [announcementText, setAnnouncementText] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [importPreview, setImportPreview] = useState([]);
  const [importSummary, setImportSummary] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const data = await getAdminUsers({
        page,
        limit: userLimit,
        search: debouncedSearch,
        className: classFilter,
        accountType: accountFilter,
        status: statusFilter,
        sortBy,
        sortDir,
      });
      setUsers(data.users || (Array.isArray(data) ? data : []));
      setUserTotal(data.total ?? 0);
      setUserPage(data.page ?? page);
      setUserTotalPages(data.totalPages ?? 1);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, [accountFilter, classFilter, debouncedSearch, sortBy, sortDir, statusFilter, userLimit]);

  const refresh = async () => {
    try {
      const [overviewData, queryData] = await Promise.all([
        getAdminOverview(),
        getAdminQueries(),
      ]);
      setOverview(overviewData);
      setQueries(queryData);
      await loadUsers(userPage);
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([
      getAdminOverview(),
      getAdminUsers({ page: 1, limit: 25 }),
      getAdminQueries(),
    ])
      .then(([overviewData, userData, queryData]) => {
        if (!active) return;
        setOverview(overviewData);
        setUsers(userData.users || (Array.isArray(userData) ? userData : []));
        setUserTotal(userData.total ?? 0);
        setUserPage(userData.page ?? 1);
        setUserTotalPages(userData.totalPages ?? 1);
        setQueries(queryData);
      })
      .catch((error) => {
        if (active) toast.error(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    getAdminAnnouncements()
      .then(setAnnouncements)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!activityDrawer && !createUserOpen && !editUser && !deleteUserTarget)
      return undefined;
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        setActivityDrawer(null);
        setCreateUserOpen(false);
        setEditUser(null);
        setDeleteUserTarget(null);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activityDrawer, createUserOpen, editUser, deleteUserTarget]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedSearch(search.trim()), 350);
    return () => window.clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setUserPage(1);
      loadUsers(1);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [debouncedSearch, classFilter, accountFilter, statusFilter, sortBy, sortDir, userLimit, loadUsers]);

  const handleSearch = async (event) => {
    event.preventDefault();
    setUserPage(1);
    setDebouncedSearch(search.trim());
    await loadUsers(1);
  };

  const viewLogs = async (user) => {
    setSelectedUser(user);
    try {
      const data = await getUserLogs(user._id);
      setLogs(data.logs);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const openActivity = async (user) => {
    setActivityDrawer({
      profile: user,
      courses: [],
      timeline: [],
      loading: true,
    });
    try {
      const data = await getUserActivity(user._id);
      setActivityDrawer({ ...data, profile: data.profile, loading: false });
    } catch (error) {
      toast.error(error.message);
      setActivityDrawer(null);
    }
  };

  const resetCourseProgress = async (courseId) => {
    if (!activityDrawer?.profile?._id) return;
    const result = await Swal.fire({
      title: courseId ? "Reset course progress?" : "Reset all progress?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reset progress",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await resetUserProgress(activityDrawer.profile._id, courseId);
      const data = await getUserActivity(activityDrawer.profile._id);
      setActivityDrawer({ ...data, loading: false });
      toast.success(courseId ? "Course progress reset" : "All progress reset");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const publishNotice = async (event) => {
    event.preventDefault();
    if (!announcementText.trim()) return toast.error("Enter an announcement");
    try {
      const notice = await publishAnnouncement(announcementText);
      setAnnouncements((items) => [
        notice,
        ...items.map((item) => ({ ...item, isActive: false })),
      ]);
      setAnnouncementText("");
      toast.success("Notice published");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const clearNotice = async (notice) => {
    try {
      await deactivateAnnouncement(notice._id);
      setAnnouncements((items) =>
        items.map((item) =>
          item._id === notice._id ? { ...item, isActive: false } : item,
        ),
      );
      toast.success("Notice cleared");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleImportFile = async (file) => {
    if (!file) return;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
      setImportPreview(
        rows.map((row, index) => {
          const accountType = String(row.accountType || "student")
            .trim()
            .toLowerCase();
          const email = String(row.email || "")
            .trim()
            .toLowerCase();
          return {
            row: index + 2,
            name: String(row.name || "").trim(),
            email,
            studentId: email.split("@")[0].replace(/[^a-z0-9-]/gi, ""),
            className: String(row.className || "").trim(),
            accountType,
            valid:
              Boolean(String(row.name || "").trim()) &&
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
              ["student", "instructor", "staff", "guest"].includes(accountType),
          };
        }),
      );
      setImportSummary(null);
    } catch {
      toast.error("Could not parse spreadsheet");
    }
  };

  const submitImport = async () => {
    const validRows = importPreview
      .filter((item) => item.valid)
      .map((item) => ({
        name: item.name,
        email: item.email,
        studentId: item.studentId,
        className: item.className,
        accountType: item.accountType,
      }));
    if (!validRows.length) return toast.error("No valid rows to import");
    try {
      const summary = await bulkImportUsers(validRows);
      setImportSummary(summary);
      await refresh();
      toast.success(`Imported ${summary.createdCount} users`);
    } catch (error) {
      toast.error(error.message);
    }
  };

  const downloadTemplate = (format) => {
    const sheet = XLSX.utils.json_to_sheet([
      {
        name: "Example Student",
        email: "student@gmail.com",
        studentId: "2600000",
        className: "BSSE - Evening",
        accountType: "student",
      },
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Users");
    XLSX.writeFile(
      workbook,
      `skillhub-user-template.${format}`,
      format === "csv" ? { bookType: "csv" } : { bookType: "xlsx" },
    );
  };

  const exportRows = (kind, format) => {
    const rows =
      kind === "users"
        ? users.map((user) => ({
            name: user.name,
            email: user.email,
            studentId: user.studentId || "",
            className: user.className || "",
            accountType: user.accountType || "student",
            status: user.isSuspended ? "Suspended" : "Active",
            enrolledCourses: user.courses?.length || 0,
          }))
        : queries.map((query) => ({
            name: query.userId?.name || "Student",
            email: query.userId?.email || "",
            studentId: query.userId?.studentId || "",
            message: query.message,
            status: query.status,
            response: query.adminResponse || "",
            createdAt: query.createdAt,
          }));
    const sheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(
      workbook,
      sheet,
      kind === "users" ? "Users" : "Queries",
    );
    XLSX.writeFile(workbook, `skillhub-${kind}.${format}`, {
      bookType: format,
    });
    toast.success(`${kind === "users" ? "User" : "Query"} export downloaded`);
  };

  const suspend = async (user) => {
    setActionLoadingId(user._id);
    try {
      const data = await toggleUserSuspension(user._id, !user.isSuspended);
      setUsers((items) =>
        items.map((item) =>
          item._id === user._id
            ? { ...item, isSuspended: data.user.isSuspended }
            : item,
        ),
      );
      toast.success(
        data.user.isSuspended
          ? "Student account suspended"
          : "Student account activated",
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setActionLoadingId("");
    }
  };

  const reply = async (query) => {
    const adminResponse = String(replies[query._id] || "").trim();
    if (!adminResponse) return toast.error("Write a response first");
    try {
      const updated = await replyToQuery(query._id, adminResponse);
      setQueries((items) =>
        items.map((item) => (item._id === updated._id ? updated : item)),
      );
      toast.success("Response delivered");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const removeQuery = async (query) => {
    const result = await Swal.fire({
      title: "Delete support query?",
      text: `Remove the query from ${query.userId?.name || "the student"}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete query",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteAdminQuery(query._id);
      setQueries((items) => items.filter((item) => item._id !== query._id));
      toast.success("Support query deleted");
    } catch (error) {
      toast.error(error.message);
    }
  };

  const createUser = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await createAdminUser(createUserForm);
      setUsers((items) => userPage === 1 ? [result.user, ...items].slice(0, userLimit) : items);
      setUserTotal((count) => count + 1);
      setCreateUserOpen(false);
      setCreateUserForm(EMPTY_USER_FORM);
      toast.success(result.message || "User created");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditUser = (user) => {
    setEditUser({
      id: user._id,
      name: user.name || "",
      email: user.email || "",
      accountType: user.accountType || "student",
      studentId: user.studentId || "",
      className: user.className || "",
      isSuspended: Boolean(user.isSuspended),
      password: "",
    });
  };

  const saveEditUser = async (event) => {
    event.preventDefault();
    setLoading(true);
    setActionLoadingId(editUser.id);
    try {
      const result = await updateAdminUser(editUser.id, editUser);
      setUsers((items) =>
        items.map((item) =>
          item._id === editUser.id
            ? { ...item, ...result.user, _id: item._id }
            : item,
        ),
      );
      setEditUser(null);
      toast.success("User updated");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setActionLoadingId("");
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserTarget) return;
    setLoading(true);
    setActionLoadingId(deleteUserTarget._id);
    try {
      await deleteAdminUser(deleteUserTarget._id);
      setUsers((items) =>
        items.filter((item) => item._id !== deleteUserTarget._id),
      );
      setUserTotal((count) => Math.max(0, count - 1));
      if (users.length === 1 && userPage > 1) {
        const previousPage = userPage - 1;
        setUserPage(previousPage);
        await loadUsers(previousPage);
      } else if (users.length === 1) {
        await loadUsers(userPage);
      }
      if (selectedUser?._id === deleteUserTarget._id) setSelectedUser(null);
      setDeleteUserTarget(null);
      toast.success("User permanently deleted");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
      setActionLoadingId("");
    }
  };

  const exit = async () => {
    const result = await Swal.fire({
      title: "Exit the admin portal?",
      text: "Your admin session will be ended.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Exit portal",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await adminLogout();
      toast.success("Exited the admin portal");
    } catch {
      /* local exit remains safe */
    }
    localStorage.removeItem("sh_admin_token");
    onExit();
  };

  const stats = [
    ["Total students", overview.totalStudents, Users],
    ["Active courses", overview.activeCourses, LibraryBig],
    ["Pending queries", overview.pendingQueries, MessageSquareText],
    ["Suspended accounts", overview.suspendedAccounts, ShieldAlert],
  ];

  const pendingQueries = queries.filter((q) => q.status === "pending");
  const validImportCount = importPreview.filter((r) => r.valid).length;
  const completedCourses =
    activityDrawer?.courses?.filter(
      (c) => c.lessonCount > 0 && c.completedLessons >= c.lessonCount,
    ).length || 0;

  return (
    <section className="admin-shell">
      <button
        className="admin-mobile-toggle"
        type="button"
        aria-label={
          sidebarOpen ? "Close admin navigation" : "Open admin navigation"
        }
        aria-expanded={sidebarOpen}
        onClick={() => setSidebarOpen((open) => !open)}
      >
        {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>
      {sidebarOpen && (
        <button
          className="admin-sidebar-scrim"
          type="button"
          aria-label="Close admin navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`admin-sidebar${sidebarOpen ? " is-open" : ""}`}>
        <div className="admin-brand">
          <ShieldAlert size={18} strokeWidth={1.6} />
          <span>Skillhub Admin</span>
        </div>
        <nav aria-label="Admin navigation">
          {TABS.map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              className={tab === id ? "is-active" : ""}
              aria-current={tab === id ? "page" : undefined}
              onClick={() => {
                setTab(id);
                setSidebarOpen(false);
              }}
            >
              <Icon size={18} strokeWidth={1.6} />
              {label}
            </button>
          ))}
        </nav>
        <button className="admin-exit" type="button" onClick={exit}>
          <LogOut size={18} strokeWidth={1.6} />
          Exit portal
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-heading">
          <div>
            <p className="admin-eyebrow">Administration</p>
            <h1>{TITLES[tab]}</h1>
          </div>
          <div className="admin-heading-actions">
            <button
              className="admin-icon-button"
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${
                theme === "dark" ? "light" : "dark"
              } mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? (
                <Sun size={18} strokeWidth={1.6} />
              ) : (
                <Moon size={18} strokeWidth={1.6} />
              )}
            </button>
            <button
              className="admin-icon-button"
              type="button"
              onClick={refresh}
              aria-label="Refresh data"
              title="Refresh data"
            >
              <RotateCcw size={18} strokeWidth={1.6} />
            </button>
          </div>
        </header>

        {/* ---------------- Overview ---------------- */}
        {tab === "overview" && (
          <>
            <div className="admin-stats">
              {stats.map(([label, value, Icon]) => (
                <article key={label}>
                  <Icon strokeWidth={1.6} />
                  <strong className="tabular-nums">{value}</strong>
                  <span>{label}</span>
                </article>
              ))}
            </div>
            <div className="admin-overview-grid">
              <section>
                <h2>Recent users</h2>
                {users.length ? (
                  users.slice(0, 6).map((user) => (
                    <div className="admin-user-row" key={user._id}>
                      <span className="admin-avatar">
                        {user.name?.charAt(0) || "S"}
                      </span>
                      <span>
                        <strong>{user.name}</strong>
                        <small>{user.email}</small>
                      </span>
                      <StatusPill suspended={user.isSuspended} />
                    </div>
                  ))
                ) : (
                  <p className="admin-empty">No users yet.</p>
                )}
              </section>
              <section>
                <h2>Pending queries</h2>
                {pendingQueries.length ? (
                  pendingQueries.slice(0, 6).map((query) => (
                    <div className="admin-query-preview" key={query._id}>
                      <strong>{query.userId?.name || "Student"}</strong>
                      <p>{query.message}</p>
                    </div>
                  ))
                ) : (
                  <p className="admin-empty">You're all caught up.</p>
                )}
              </section>
            </div>
          </>
        )}

        {/* ---------------- Users ---------------- */}
        {tab === "users" && (
          <>
            <div className="admin-user-toolbar">
              <form className="admin-search" onSubmit={handleSearch}>
                <Search size={18} strokeWidth={1.6} />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search name, email, or student ID"
                />
                <button className="button-secondary" type="submit">
                  Search
                </button>
              </form>
              <button
                className="button-primary"
                type="button"
                onClick={() => setCreateUserOpen(true)}
              >
                Add user
              </button>
            </div>
            <div className="admin-export-bar">
              <span>Export users</span>
              <button
                className="button-secondary"
                type="button"
                onClick={() => exportRows("users", "csv")}
              >
                CSV
              </button>
              <button
                className="button-secondary"
                type="button"
                onClick={() => exportRows("users", "xlsx")}
              >
                Excel
              </button>
              <button
                className="button-secondary"
                type="button"
                onClick={() => setTab("import")}
              >
                Import
              </button>
            </div>

            <div className="mb-3 grid gap-2 rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-5">
              <label className="grid gap-1 text-xs text-slate-500">Class<input className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={classFilter} onChange={(event) => setClassFilter(event.target.value)} placeholder="Exact class name" /></label>
              <label className="grid gap-1 text-xs text-slate-500">Account<select className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={accountFilter} onChange={(event) => setAccountFilter(event.target.value)}><option value="">All accounts</option><option value="student">Student</option><option value="instructor">Instructor</option><option value="staff">Staff</option><option value="guest">Guest</option></select></label>
              <label className="grid gap-1 text-xs text-slate-500">Status<select className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">All statuses</option><option value="active">Active</option><option value="suspended">Suspended</option></select></label>
              <label className="grid gap-1 text-xs text-slate-500">Sort<select className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={`${sortBy}:${sortDir}`} onChange={(event) => { const [nextSortBy, nextSortDir] = event.target.value.split(":"); setSortBy(nextSortBy); setSortDir(nextSortDir); }}><option value="createdAt:desc">Newest</option><option value="createdAt:asc">Oldest</option><option value="name:asc">Name A-Z</option><option value="name:desc">Name Z-A</option><option value="studentId:asc">Student ID</option></select></label>
              <label className="grid gap-1 text-xs text-slate-500">Per page<select className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={userLimit} onChange={(event) => setUserLimit(Math.min(100, Number(event.target.value)))}><option value={25}>25</option><option value={50}>50</option><option value={100}>100</option></select></label>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table" style={{ minWidth: 760 }}>
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Student ID</th>
                    <th>Courses</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td data-label="Student">
                        <span className="admin-person">
                          {user.avatar ? (
                            <img src={user.avatar} alt="" />
                          ) : (
                            <span>{user.name?.charAt(0) || "S"}</span>
                          )}
                          <span>
                            <strong>{user.name}</strong>
                            <small>{user.email}</small>
                          </span>
                        </span>
                      </td>
                      <td data-label="Student ID" className="tabular-nums">
                        {user.studentId || "—"}
                      </td>
                      <td data-label="Courses" className="tabular-nums">
                        {user.courses?.length || 0}
                      </td>
                      <td data-label="Status">
                        <StatusPill suspended={user.isSuspended} />
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button
                            type="button"
                            onClick={() => openActivity(user)}
                          >
                            Activity
                          </button>
                          <button type="button" onClick={() => viewLogs(user)}>
                            Logs
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditUser(user)}
                            disabled={actionLoadingId === user._id}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className={
                              user.isSuspended ? "activate" : "suspend"
                            }
                            disabled={actionLoadingId === user._id}
                            onClick={() => suspend(user)}
                          >
                            {user.isSuspended ? "Activate" : "Suspend"}
                          </button>
                          <button
                            type="button"
                            className="delete"
                            disabled={actionLoadingId === user._id}
                            onClick={() => setDeleteUserTarget(user)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!users.length && !loading && (
                    <tr>
                      <td colSpan={5}>
                        <p className="admin-empty" style={{ margin: 0 }}>
                          No users match your search.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-xs text-slate-500">
                {userTotal ? `${(userPage - 1) * userLimit + 1}-${Math.min(userPage * userLimit, userTotal)} of ${userTotal}` : "0 users"}
              </p>
              <div className="flex items-center gap-2">
                <button
                  className="button-secondary"
                  type="button"
                  disabled={loading || userPage <= 1}
                  onClick={() => {
                    const previous = userPage - 1;
                    setUserPage(previous);
                    loadUsers(previous);
                  }}
                >
                  Previous
                </button>
                <span className="min-w-20 text-center text-xs tabular-nums text-slate-500">
                  {userPage} / {userTotalPages}
                </span>
                <button
                  className="button-secondary"
                  type="button"
                  disabled={loading || userPage >= userTotalPages}
                  onClick={() => {
                    const next = userPage + 1;
                    setUserPage(next);
                    loadUsers(next);
                  }}
                >
                  Next
                </button>
              </div>
            </div>

            {selectedUser && (
              <section className="audit-trail">
                <div>
                  <h2>Audit trail · {selectedUser.name}</h2>
                  <button
                    className="admin-icon-button"
                    type="button"
                    onClick={() => setSelectedUser(null)}
                    aria-label="Close audit trail"
                  >
                    <X size={16} />
                  </button>
                </div>
                {logs.length ? (
                  logs.map((log) => (
                    <div className="audit-row" key={log._id}>
                      <span>{log.action}</span>
                      <span>{log.ipAddress || "Unknown IP"}</span>
                      <time className="tabular-nums">
                        {new Date(log.timestamp).toLocaleString()}
                      </time>
                    </div>
                  ))
                ) : (
                  <p className="admin-empty">No activity recorded.</p>
                )}
              </section>
            )}
          </>
        )}

        {tab === "content" && <AdminContentManager />}

        {/* ---------------- Announcements ---------------- */}
        {tab === "announcements" && (
          <section className="admin-announcement-panel">
            <form onSubmit={publishNotice}>
              <label>
                Class notice / announcement
                <textarea
                  maxLength={1000}
                  value={announcementText}
                  onChange={(event) => setAnnouncementText(event.target.value)}
                  placeholder="Type a short notice for the class..."
                />
              </label>
              <button className="button-primary" type="submit">
                Publish notice
              </button>
            </form>
            <div className="admin-announcement-list">
              {announcements.length === 0 && (
                <p className="admin-empty">No notices yet.</p>
              )}
              {announcements.map((notice) => (
                <article key={notice._id}>
                  <div>
                    <span
                      className={
                        notice.isActive ? "status-active" : "status-pending"
                      }
                    >
                      {notice.isActive ? "Live" : "Inactive"}
                    </span>
                    <time className="tabular-nums">
                      {new Date(notice.createdAt).toLocaleString()}
                    </time>
                  </div>
                  <p>{notice.message}</p>
                  {notice.isActive && (
                    <button
                      className="button-secondary"
                      style={{ justifySelf: "start" }}
                      type="button"
                      onClick={() => clearNotice(notice)}
                    >
                      Clear / Hide
                    </button>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ---------------- Bulk import ---------------- */}
        {tab === "import" && (
          <section className="admin-import-panel">
            <header>
              <div>
                <p className="admin-eyebrow">User provisioning</p>
                <h2>Bulk import</h2>
              </div>
              <div className="admin-template-actions">
                <button
                  className="button-secondary"
                  type="button"
                  onClick={() => downloadTemplate("csv")}
                >
                  CSV template
                </button>
                <button
                  className="button-secondary"
                  type="button"
                  onClick={() => downloadTemplate("xlsx")}
                >
                  Excel template
                </button>
              </div>
            </header>

            <label
              className="admin-dropzone"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                handleImportFile(event.dataTransfer.files?.[0]);
              }}
            >
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={(event) => handleImportFile(event.target.files?.[0])}
              />
              <Upload size={22} strokeWidth={1.6} />
              <strong>Drop CSV or Excel file here</strong>
              <span>or choose a .csv, .xlsx, or .xls file</span>
            </label>

            {importPreview.length > 0 && (
              <div className="admin-import-preview">
                <div className="admin-import-preview-head">
                  <strong>Preview</strong>
                  <span className="tabular-nums">
                    {validImportCount} valid ·{" "}
                    {importPreview.length - validImportCount} invalid
                  </span>
                </div>
                <div className="table-wrap">
                  <table className="admin-table" style={{ minWidth: 680 }}>
                    <thead>
                      <tr>
                        <th>Row</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Student ID</th>
                        <th>Class</th>
                        <th>Type</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importPreview.map((row) => (
                        <tr key={row.row}>
                          <td data-label="Row" className="tabular-nums">
                            {row.row}
                          </td>
                          <td data-label="Name">{row.name || "—"}</td>
                          <td data-label="Email">{row.email || "—"}</td>
                          <td data-label="Student ID">
                            {row.studentId || "—"}
                          </td>
                          <td data-label="Class">{row.className || "—"}</td>
                          <td data-label="Type">{row.accountType}</td>
                          <td data-label="Status">
                            <span
                              className={
                                row.valid ? "status-active" : "status-suspended"
                              }
                            >
                              {row.valid ? "Valid" : "Invalid"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button
                  className="button-primary"
                  style={{ justifySelf: "start" }}
                  type="button"
                  onClick={submitImport}
                  disabled={!validImportCount}
                >
                  Import {validImportCount} valid{" "}
                  {validImportCount === 1 ? "row" : "rows"}
                </button>
              </div>
            )}

            {importSummary && (
              <div className="admin-import-summary">
                <strong>Import complete</strong>
                <span className="tabular-nums">
                  {importSummary.createdCount} created ·{" "}
                  {importSummary.skippedCount} skipped ·{" "}
                  {importSummary.failedRows.length} invalid
                </span>
                {importSummary.failedRows.length > 0 && (
                  <ul>
                    {importSummary.failedRows.map((row) => (
                      <li key={`${row.row}-${row.email}`}>
                        Row {row.row}: {row.email || "missing"} — {row.reason}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </section>
        )}

        {/* ---------------- Support queries ---------------- */}
        {tab === "queries" && (
          <>
            <div className="admin-export-bar">
              <span>Export queries</span>
              <button
                className="button-secondary"
                type="button"
                onClick={() => exportRows("queries", "csv")}
              >
                CSV
              </button>
              <button
                className="button-secondary"
                type="button"
                onClick={() => exportRows("queries", "xlsx")}
              >
                Excel
              </button>
            </div>
            {queries.length === 0 && !loading && (
              <p className="admin-empty">No support queries.</p>
            )}
            <div className="admin-query-list">
              {queries.map((query) => (
                <article className="admin-query-card" key={query._id}>
                  <div>
                    <span
                      className={
                        query.status === "resolved"
                          ? "status-active"
                          : "status-pending"
                      }
                    >
                      {query.status}
                    </span>
                    <time className="tabular-nums">
                      {new Date(query.createdAt).toLocaleString()}
                    </time>
                  </div>
                  <h2>
                    {query.userId?.name || "Student"} ·{" "}
                    {query.userId?.studentId || "—"}
                  </h2>
                  <p>{query.message}</p>
                  <textarea
                    value={replies[query._id] ?? query.adminResponse ?? ""}
                    onChange={(event) =>
                      setReplies((items) => ({
                        ...items,
                        [query._id]: event.target.value,
                      }))
                    }
                    placeholder="Write an admin response..."
                  />
                  <button
                    className="button-primary"
                    type="button"
                    onClick={() => reply(query)}
                  >
                    {query.status === "resolved"
                      ? "Update response"
                      : "Send response"}
                  </button>
                  <button
                    className="button-danger"
                    type="button"
                    onClick={() => removeQuery(query)}
                  >
                    Delete query
                  </button>
                </article>
              ))}
            </div>
          </>
        )}

        {/* ---------------- Modals ---------------- */}
        {createUserOpen && (
          <Modal
            as="form"
            wide
            labelledBy="create-user-title"
            onClose={() => setCreateUserOpen(false)}
            onSubmit={createUser}
          >
            <div>
              <p className="admin-eyebrow">Direct provisioning</p>
              <h2 id="create-user-title">Create user</h2>
            </div>
            <UserFields
              values={createUserForm}
              onChange={(patch) =>
                setCreateUserForm((f) => ({ ...f, ...patch }))
              }
              passwordLabel="Optional password"
            />
            <p className="admin-create-note">
              A welcome email is sent automatically when SMTP is configured.
            </p>
            <div className="form-actions">
              <button
                className="button-secondary"
                type="button"
                onClick={() => setCreateUserOpen(false)}
              >
                Cancel
              </button>
              <button
                className="button-primary"
                type="submit"
                disabled={loading}
              >
                Create user
              </button>
            </div>
          </Modal>
        )}

        {editUser && (
          <Modal
            as="form"
            wide
            labelledBy="edit-user-title"
            onClose={() => setEditUser(null)}
            onSubmit={saveEditUser}
          >
            <div>
              <p className="admin-eyebrow">User record</p>
              <h2 id="edit-user-title">Edit user</h2>
            </div>
            <UserFields
              values={editUser}
              onChange={(patch) => setEditUser((u) => ({ ...u, ...patch }))}
              passwordLabel="New password (leave blank to keep unchanged)"
            />
            <label className="manager-check">
              <input
                type="checkbox"
                checked={editUser.isSuspended}
                onChange={(event) =>
                  setEditUser((u) => ({
                    ...u,
                    isSuspended: event.target.checked,
                  }))
                }
              />
              Suspended
            </label>
            <div className="form-actions">
              <button
                className="button-secondary"
                type="button"
                onClick={() => setEditUser(null)}
              >
                Cancel
              </button>
              <button
                className="button-primary"
                type="submit"
                disabled={loading}
              >
                Save changes
              </button>
            </div>
          </Modal>
        )}

        {deleteUserTarget && (
          <Modal
            as="section"
            role="alertdialog"
            labelledBy="delete-user-title"
            onClose={() => setDeleteUserTarget(null)}
          >
            <div>
              <p className="admin-eyebrow">Permanent action</p>
              <h2 id="delete-user-title">Delete {deleteUserTarget.name}?</h2>
            </div>
            <p>
              This permanently removes the user and associated enrollments,
              progress, and activity logs.
            </p>
            <div className="form-actions">
              <button
                className="button-secondary"
                type="button"
                onClick={() => setDeleteUserTarget(null)}
              >
                Cancel
              </button>
              <button
                className="button-danger"
                type="button"
                onClick={confirmDeleteUser}
                disabled={loading}
              >
                Delete permanently
              </button>
            </div>
          </Modal>
        )}

        {/* ---------------- Activity drawer ---------------- */}
        {activityDrawer && (
          <div
            className="activity-drawer-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setActivityDrawer(null);
            }}
          >
            <aside
              className="activity-drawer"
              role="dialog"
              aria-modal="true"
              aria-label="User activity"
            >
              <header>
                <div>
                  <p className="admin-eyebrow">Learning activity</p>
                  <h2>{activityDrawer.profile?.name || "Student"}</h2>
                </div>
                <button
                  className="admin-icon-button"
                  type="button"
                  aria-label="Close activity"
                  onClick={() => setActivityDrawer(null)}
                >
                  <X size={18} />
                </button>
              </header>

              {activityDrawer.loading ? (
                <p className="admin-empty">Loading activity...</p>
              ) : (
                <>
                  <div className="activity-summary">
                    <div>
                      <strong>
                        {activityDrawer.timeline?.filter(
                          (i) => i.action === "login",
                        ).length || 0}
                      </strong>
                      <span>Logins</span>
                    </div>
                    <div>
                      <strong>{activityDrawer.courses?.length || 0}</strong>
                      <span>Courses</span>
                    </div>
                    <div>
                      <strong>{completedCourses}</strong>
                      <span>Completed</span>
                    </div>
                  </div>

                  <section className="activity-section">
                    <div
                      className="activity-timeline-row"
                      style={{ borderBottom: 0 }}
                    >
                      <h2 style={{ margin: 0, fontSize: 15 }}>
                        Course progress
                      </h2>
                      <button
                        className="button-danger"
                        type="button"
                        onClick={() => resetCourseProgress()}
                      >
                        Reset all
                      </button>
                    </div>
                    {activityDrawer.courses?.length ? (
                      activityDrawer.courses.map((course) => (
                        <article
                          className="activity-course"
                          key={course.courseId}
                        >
                          <div>
                            <strong>{course.title}</strong>
                            <span className="tabular-nums">
                              {course.completedLessons} / {course.lessonCount} ·{" "}
                              {course.percentage}%
                            </span>
                          </div>
                          <span className="progress-track">
                            <span
                              className="progress-fill"
                              style={{ width: `${course.percentage}%` }}
                            />
                          </span>
                          <button
                            className="button-secondary"
                            type="button"
                            onClick={() => resetCourseProgress(course.courseId)}
                          >
                            Reset course
                          </button>
                        </article>
                      ))
                    ) : (
                      <p className="admin-empty">
                        No course activity recorded.
                      </p>
                    )}
                  </section>

                  <section className="activity-section">
                    <h2 style={{ margin: 0, fontSize: 15 }}>Recent timeline</h2>
                    {activityDrawer.timeline?.length ? (
                      activityDrawer.timeline.slice(0, 20).map((item) => (
                        <div className="activity-timeline-row" key={item._id}>
                          <span>{item.action}</span>
                          <time className="tabular-nums">
                            {new Date(item.timestamp).toLocaleString()}
                          </time>
                        </div>
                      ))
                    ) : (
                      <p className="admin-empty">No timeline events.</p>
                    )}
                  </section>
                </>
              )}
            </aside>
          </div>
        )}

        {loading && <div className="admin-loading">Loading...</div>}
      </main>
    </section>
  );
}
