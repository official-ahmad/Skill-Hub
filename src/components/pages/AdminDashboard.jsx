import { useEffect, useState } from "react";
import {
  Activity,
  LogOut,
  Search,
  ShieldAlert,
  Users,
  LibraryBig,
  MessageSquareText,
  RotateCcw,
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
} from "../../api";
import toast from "react-hot-toast";
import { createAdminUser } from "../../api";
import AdminContentManager from "./AdminContentManager";

export default function AdminDashboard({ onExit }) {
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [replies, setReplies] = useState({});
  const [loading, setLoading] = useState(true);
  const [createUserOpen, setCreateUserOpen] = useState(false);
  const [createUserForm, setCreateUserForm] = useState({
    name: "",
    email: "",
    accountType: "student",
    studentId: "",
    className: "",
    password: "",
  });
  const [editUser, setEditUser] = useState(null);
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const [overviewData, userData, queryData] = await Promise.all([
        getAdminOverview(),
        getAdminUsers(search),
        getAdminQueries(),
      ]);
      setOverview(overviewData);
      setUsers(userData);
      setQueries(queryData);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([getAdminOverview(), getAdminUsers(), getAdminQueries()])
      .then(([overviewData, userData, queryData]) => {
        if (!active) return;
        setOverview(overviewData);
        setUsers(userData);
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

  const handleSearch = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      setUsers(await getAdminUsers(search));
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
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

  const suspend = async (user) => {
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

  const createUser = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await createAdminUser(createUserForm);
      setUsers((items) => [result.user, ...items]);
      setCreateUserOpen(false);
      setCreateUserForm({
        name: "",
        email: "",
        accountType: "student",
        studentId: "",
        className: "",
        password: "",
      });
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
      await refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteUserTarget) return;
    setLoading(true);
    try {
      await deleteAdminUser(deleteUserTarget._id);
      setUsers((items) =>
        items.filter((item) => item._id !== deleteUserTarget._id),
      );
      if (selectedUser?._id === deleteUserTarget._id) setSelectedUser(null);
      setDeleteUserTarget(null);
      toast.success("User permanently deleted");
      await refresh();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const exit = async () => {
    try {
      await adminLogout();
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

  return (
    <section className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <ShieldAlert size={18} strokeWidth={1.5} />
          <span>Skillhub Admin</span>
        </div>
        <nav aria-label="Admin navigation">
          {[
            ["overview", "Overview", Activity],
            ["users", "User management", Users],
            ["queries", "Support center", MessageSquareText],
            ["content", "Courses & technologies", LibraryBig],
          ].map(([id, label, Icon]) => (
            <button
              key={id}
              className={tab === id ? "is-active" : ""}
              onClick={() => setTab(id)}
            >
              <Icon size={18} strokeWidth={1.5} />
              {label}
            </button>
          ))}
        </nav>
        <button className="admin-exit" onClick={exit}>
          <LogOut size={18} strokeWidth={1.5} />
          Exit portal
        </button>
      </aside>

      <main className="admin-main">
        <header className="admin-heading">
          <div>
            <p className="eyebrow">Administration</p>
            <h1>
              {tab === "overview"
                ? "System overview"
                : tab === "users"
                ? "User management"
                : tab === "content"
                ? "Courses & technologies"
                : "Support center"}
            </h1>
          </div>
          <button
            className="icon-button"
            onClick={refresh}
            aria-label="Refresh data"
          >
            <RotateCcw size={18} strokeWidth={1.5} />
          </button>
        </header>

        {tab === "overview" && (
          <>
            <div className="admin-stats">
              {stats.map(([label, value, Icon]) => (
                <article key={label}>
                  <Icon size={18} strokeWidth={1.5} />
                  <strong className="tabular-nums">{value}</strong>
                  <span>{label}</span>
                </article>
              ))}
            </div>
            <div className="admin-overview-grid">
              <section>
                <h2>Recent users</h2>
                {users.slice(0, 6).map((user) => (
                  <div className="admin-user-row" key={user._id}>
                    <span className="avatar-fallback">
                      {user.name?.charAt(0) || "S"}
                    </span>
                    <span>
                      <strong>{user.name}</strong>
                      <small>{user.email}</small>
                    </span>
                    <em
                      className={
                        user.isSuspended ? "status-suspended" : "status-active"
                      }
                    >
                      {user.isSuspended ? "Suspended" : "Active"}
                    </em>
                  </div>
                ))}
              </section>
              <section>
                <h2>Pending queries</h2>
                {queries
                  .filter((query) => query.status === "pending")
                  .slice(0, 6)
                  .map((query) => (
                    <div className="admin-query-preview" key={query._id}>
                      <strong>{query.userId?.name || "Student"}</strong>
                      <p>{query.message}</p>
                    </div>
                  ))}
              </section>
            </div>
          </>
        )}

        {tab === "users" && (
          <>
            <div className="admin-user-toolbar">
              <form className="admin-search" onSubmit={handleSearch}>
                <Search size={18} strokeWidth={1.5} />
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
            <div className="admin-table-wrap">
              <table className="admin-table">
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
                      <td>
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
                      <td className="tabular-nums">{user.studentId || "—"}</td>
                      <td className="tabular-nums">
                        {user.courses?.length || 0}
                      </td>
                      <td>
                        <span
                          className={
                            user.isSuspended
                              ? "status-suspended"
                              : "status-active"
                          }
                        >
                          {user.isSuspended ? "Suspended" : "Active"}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button onClick={() => viewLogs(user)}>Logs</button>
                          <button onClick={() => openEditUser(user)}>
                            Edit
                          </button>
                          <button
                            className="delete"
                            onClick={() => setDeleteUserTarget(user)}
                          >
                            Delete
                          </button>
                          <button
                            className={
                              user.isSuspended ? "activate" : "suspend"
                            }
                            onClick={() => suspend(user)}
                          >
                            {user.isSuspended ? "Activate" : "Suspend"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedUser && (
              <section className="audit-trail">
                <div>
                  <h2>Audit trail · {selectedUser.name}</h2>
                  <button
                    className="icon-button"
                    onClick={() => setSelectedUser(null)}
                    aria-label="Close audit trail"
                  >
                    ×
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
                  <p className="empty-state">No activity recorded.</p>
                )}
              </section>
            )}
          </>
        )}

        {tab === "content" && <AdminContentManager />}

        {tab === "queries" && (
          <div className="admin-query-list">
            {queries.map((query) => (
              <article className="admin-query-card" key={query._id}>
                <div>
                  <span
                    className={
                      query.status === "resolved"
                        ? "status-active"
                        : "status-suspended"
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
                <button className="button-primary" onClick={() => reply(query)}>
                  {query.status === "resolved"
                    ? "Update response"
                    : "Send response"}
                </button>
              </article>
            ))}
          </div>
        )}
        {createUserOpen && (
          <div
            className="modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget)
                setCreateUserOpen(false);
            }}
          >
            <form
              className="admin-login-modal admin-create-user"
              onSubmit={createUser}
              role="dialog"
              aria-modal="true"
              aria-labelledby="create-user-title"
            >
              <div>
                <p className="eyebrow">Direct provisioning</p>
                <h2 id="create-user-title">Create user</h2>
              </div>
              <label>
                Full name
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  value={createUserForm.name}
                  onChange={(event) =>
                    setCreateUserForm((form) => ({
                      ...form,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Email address
                <input
                  required
                  type="email"
                  maxLength={254}
                  value={createUserForm.email}
                  onChange={(event) =>
                    setCreateUserForm((form) => ({
                      ...form,
                      email: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Account type
                <select
                  value={createUserForm.accountType}
                  onChange={(event) =>
                    setCreateUserForm((form) => ({
                      ...form,
                      accountType: event.target.value,
                    }))
                  }
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
                  maxLength={80}
                  value={createUserForm.studentId}
                  onChange={(event) =>
                    setCreateUserForm((form) => ({
                      ...form,
                      studentId: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Class / section
                <input
                  maxLength={120}
                  value={createUserForm.className}
                  onChange={(event) =>
                    setCreateUserForm((form) => ({
                      ...form,
                      className: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Optional password
                <input
                  type="password"
                  minLength={12}
                  autoComplete="new-password"
                  value={createUserForm.password}
                  onChange={(event) =>
                    setCreateUserForm((form) => ({
                      ...form,
                      password: event.target.value,
                    }))
                  }
                />
              </label>
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
            </form>
          </div>
        )}
        {editUser && (
          <div
            className="modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setEditUser(null);
            }}
          >
            <form
              className="admin-login-modal admin-create-user"
              onSubmit={saveEditUser}
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-user-title"
            >
              <div>
                <p className="eyebrow">User record</p>
                <h2 id="edit-user-title">Edit user</h2>
              </div>
              <label>
                Full name
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  value={editUser.name}
                  onChange={(event) =>
                    setEditUser((user) => ({
                      ...user,
                      name: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Email address
                <input
                  required
                  type="email"
                  maxLength={254}
                  value={editUser.email}
                  onChange={(event) =>
                    setEditUser((user) => ({
                      ...user,
                      email: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Account type
                <select
                  value={editUser.accountType}
                  onChange={(event) =>
                    setEditUser((user) => ({
                      ...user,
                      accountType: event.target.value,
                    }))
                  }
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
                  maxLength={80}
                  value={editUser.studentId}
                  onChange={(event) =>
                    setEditUser((user) => ({
                      ...user,
                      studentId: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                Class / section
                <input
                  maxLength={120}
                  value={editUser.className}
                  onChange={(event) =>
                    setEditUser((user) => ({
                      ...user,
                      className: event.target.value,
                    }))
                  }
                />
              </label>
              <label>
                New password (leave blank to keep unchanged)
                <input
                  type="password"
                  minLength={12}
                  autoComplete="new-password"
                  value={editUser.password}
                  onChange={(event) =>
                    setEditUser((user) => ({
                      ...user,
                      password: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="manager-check">
                <input
                  type="checkbox"
                  checked={editUser.isSuspended}
                  onChange={(event) =>
                    setEditUser((user) => ({
                      ...user,
                      isSuspended: event.target.checked,
                    }))
                  }
                />{" "}
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
            </form>
          </div>
        )}
        {deleteUserTarget && (
          <div
            className="modal-backdrop"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget)
                setDeleteUserTarget(null);
            }}
          >
            <section
              className="admin-login-modal admin-delete-user"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-user-title"
            >
              <div>
                <p className="eyebrow">Permanent action</p>
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
            </section>
          </div>
        )}
        {loading && <div className="admin-loading">Loading...</div>}
      </main>
    </section>
  );
}
