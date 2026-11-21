import { useEffect, useRef, useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Moon, Sun, Shield, X } from "lucide-react";
import toast from "react-hot-toast";
import { adminLogin, apiLogin } from "../../api";

/* Decorative weekly grid shown on the left. Purely visual (aria-hidden). */
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const BLOCKS = [
  { day: 0, row: 0, span: 2, label: "C++ Basics", tone: "base" },
  { day: 1, row: 1, span: 1, label: "Python", tone: "base" },
  { day: 2, row: 0, span: 1, label: "Git & GitHub", tone: "base" },
  { day: 2, row: 2, span: 2, label: "Practice Lab", tone: "mark" },
  { day: 3, row: 1, span: 2, label: "Data Structures", tone: "base" },
  { day: 4, row: 0, span: 1, label: "SQL", tone: "base" },
  { day: 4, row: 3, span: 1, label: "Web Dev", tone: "base" },
];

const STYLES = `
@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Instrument+Sans:wght@400;500;600&display=swap");

.sh-login {
  --bg: #eef1f6;
  --panel: #ffffff;
  --ink: #101828;
  --muted: #5b6577;
  --line: #d5dbe6;
  --accent: #2745e8;
  --accent-ink: #ffffff;
  --mark: #ffd84d;
  --mark-ink: #101828;
  --block: #e1e7f2;
  font-family: "Instrument Sans", system-ui, sans-serif;
  background: var(--bg);
  color: var(--ink);
}
.sh-login[data-theme="dark"] {
  --bg: #0e1118;
  --panel: #151a24;
  --ink: #edf0f7;
  --muted: #8e98ad;
  --line: #262d3b;
  --accent: #8aa0ff;
  --accent-ink: #0e1118;
  --block: #1c2332;
}
.sh-display {
  font-family: "Bricolage Grotesque", "Instrument Sans", sans-serif;
  letter-spacing: -0.025em;
}
.sh-focus:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}
.sh-block {
  animation: sh-in 520ms cubic-bezier(0.2, 0.7, 0.2, 1) both;
}
@keyframes sh-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: none; }
}
@media (prefers-reduced-motion: reduce) {
  .sh-block { animation: none; }
}
`;

function Timetable() {
  return (
    <div aria-hidden="true" className="select-none">
      <div className="grid grid-cols-5 gap-2 mb-2">
        {DAYS.map((d) => (
          <div key={d} className="text-xs" style={{ color: "var(--muted)" }}>
            {d}
          </div>
        ))}
      </div>
      <div
        className="grid grid-cols-5 gap-2"
        style={{ gridTemplateRows: "repeat(4, 3.25rem)" }}
      >
        {BLOCKS.map((b, i) => (
          <div
            key={i}
            className="sh-block rounded-md px-2.5 py-2 text-[11px] leading-tight font-medium overflow-hidden"
            style={{
              gridColumn: b.day + 1,
              gridRow: `${b.row + 1} / span ${b.span}`,
              background: b.tone === "mark" ? "var(--mark)" : "var(--block)",
              color: b.tone === "mark" ? "var(--mark-ink)" : "var(--ink)",
              animationDelay: `${120 + i * 70}ms`,
            }}
          >
            {b.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Login({ onLoginSuccess, theme, onToggleTheme }) {
  const [error, setError] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);
  const adminIdRef = useRef(null);
  const googleBoxRef = useRef(null);
  const [googleWidth, setGoogleWidth] = useState(300);

  // Google's button needs a pixel width, so fit it to the card on small screens.
  useEffect(() => {
    const el = googleBoxRef.current;
    if (!el || typeof ResizeObserver === "undefined") return undefined;
    const update = () =>
      setGoogleWidth(Math.max(200, Math.min(400, Math.floor(el.clientWidth))));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleGoogleLogin = async (response) => {
    try {
      setError("");
      if (!response.credential)
        throw new Error(
          "Google did not return an ID token. Check the configured OAuth client ID.",
        );
      const result = await apiLogin(response.credential);
      onLoginSuccess(result.token, result.user);
      toast.success("Signed in successfully");
    } catch (loginError) {
      setError(loginError.message || "Sign-in failed. Try again.");
      toast.error(loginError.message || "Sign-in failed. Try again.");
    }
  };

  const handleAdminLogin = async (event) => {
    event.preventDefault();
    setAdminLoading(true);
    setAdminError("");
    try {
      const result = await adminLogin(adminId, adminPassword);
      localStorage.setItem("sh_admin_token", result.token);
      window.dispatchEvent(
        new CustomEvent("skillhub-admin-login", { detail: result.admin }),
      );
      setAdminOpen(false);
      setAdminPassword("");
      toast.success("Admin portal opened");
    } catch (adminLoginError) {
      setAdminError(adminLoginError.message || "Admin sign-in failed.");
      toast.error(adminLoginError.message || "Admin sign-in failed.");
    } finally {
      setAdminLoading(false);
    }
  };

  // Close the admin dialog with Escape and focus the first field when it opens.
  useEffect(() => {
    if (!adminOpen) return undefined;
    adminIdRef.current?.focus();
    const onKey = (e) => {
      if (e.key === "Escape") setAdminOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [adminOpen]);

  const isLight = theme === "light";

  return (
    <div
      className="sh-login min-h-screen flex flex-col"
      data-theme={isLight ? "light" : "dark"}
    >
      <style>{STYLES}</style>

      {/* Top bar */}
      <header className="flex items-center justify-between px-5 sm:px-8 py-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src="/images.jpg"
            alt=""
            className="w-8 h-8 rounded-lg object-cover"
            style={{ border: "1px solid var(--line)" }}
          />
          <span className="sh-display text-base font-bold">SkillHub</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAdminOpen(true)}
            className="sh-focus flex items-center gap-1.5 text-sm font-medium rounded-lg px-3 py-2 transition-colors"
            style={{ border: "1px solid var(--line)", color: "var(--ink)" }}
          >
            <Shield size={15} strokeWidth={1.75} />
            Admin
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={
              isLight ? "Switch to dark theme" : "Switch to light theme"
            }
            className="sh-focus p-2 rounded-lg transition-colors"
            style={{ border: "1px solid var(--line)", color: "var(--muted)" }}
          >
            {isLight ? (
              <Moon size={16} strokeWidth={1.75} />
            ) : (
              <Sun size={16} strokeWidth={1.75} />
            )}
          </button>
        </div>
      </header>

      {/* Main split */}
      <main className="flex-1 grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-0 px-5 sm:px-8 pb-10 items-center">
        {/* Left: headline + timetable */}
        <section className="lg:pr-16 xl:pr-24 max-w-2xl w-full mx-auto lg:mx-0 lg:ml-auto order-2 lg:order-1">
          <h1 className="sh-display text-3xl sm:text-4xl lg:text-5xl font-bold leading-[1.08] max-w-[18ch]">
            Learn to code, one course at a time.
          </h1>
          <p
            className="mt-4 text-[15px] leading-relaxed max-w-[46ch]"
            style={{ color: "var(--muted)" }}
          >
            Open your programming courses, track your progress and read updates
            from your instructors.
          </p>
          <div className="mt-10 hidden sm:block">
            <Timetable />
          </div>
        </section>

        {/* Right: sign in */}
        <section className="w-full max-w-sm mx-auto lg:mx-0 lg:mr-auto order-1 lg:order-2">
          <div
            className="rounded-2xl p-7 sm:p-8"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
            }}
          >
            <h2 className="sh-display text-2xl font-bold">Sign in</h2>
            <p className="mt-1.5 text-sm" style={{ color: "var(--muted)" }}>
              Use the Google account your administrator added.
            </p>

            <div ref={googleBoxRef} className="mt-6 flex justify-center w-full">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Google sign-in failed. Try again.")}
                text="continue_with"
                shape="rectangular"
                theme={isLight ? "outline" : "filled_black"}
                size="large"
                width={String(googleWidth)}
              />
            </div>

            {error && (
              <p
                role="alert"
                className="mt-4 text-sm rounded-lg px-3 py-2.5"
                style={{
                  color: "#d92d20",
                  background: "rgba(217,45,32,0.08)",
                  border: "1px solid rgba(217,45,32,0.25)",
                }}
              >
                {error}
              </p>
            )}

            <p
              className="mt-6 text-xs leading-relaxed"
              style={{ color: "var(--muted)" }}
            >
              Can't sign in? Your account may not be added yet. Ask your class
              representative or an administrator.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        className="px-5 sm:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs"
        style={{ color: "var(--muted)", borderTop: "1px solid var(--line)" }}
      >
        <span>SkillHub for Air University BSSE</span>
        <a
          href="https://github.com/official-ahmad/Skill-Hub"
          target="_blank"
          rel="noopener noreferrer"
          className="sh-focus flex items-center gap-1.5 rounded-md px-1 transition-colors hover:underline"
          style={{ color: "var(--ink)" }}
        >
          <svg
            className="w-3.5 h-3.5 fill-current"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
          </svg>
          official-ahmad/Skill-Hub
        </a>
      </footer>

      {/* Admin dialog */}
      {adminOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          style={{ background: "rgba(8,10,16,0.6)" }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAdminOpen(false);
          }}
        >
          <form
            className="w-full max-w-sm rounded-2xl p-6 sm:p-7 space-y-5"
            style={{
              background: "var(--panel)",
              border: "1px solid var(--line)",
              color: "var(--ink)",
            }}
            onSubmit={handleAdminLogin}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-login-title"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="admin-login-title"
                  className="sh-display text-xl font-bold"
                >
                  Administrator sign-in
                </h2>
                <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
                  Enter your admin ID and password.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminOpen(false)}
                aria-label="Close"
                className="sh-focus p-1.5 rounded-md"
                style={{ color: "var(--muted)" }}
              >
                <X size={16} strokeWidth={1.75} />
              </button>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium">
                Admin ID
                <input
                  ref={adminIdRef}
                  type="text"
                  value={adminId}
                  onChange={(event) => setAdminId(event.target.value)}
                  autoComplete="username"
                  required
                  className="sh-focus mt-1.5 w-full rounded-lg px-3 py-2.5 text-sm font-normal"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--line)",
                    color: "var(--ink)",
                  }}
                />
              </label>

              <label className="block text-sm font-medium">
                Password
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  className="sh-focus mt-1.5 w-full rounded-lg px-3 py-2.5 text-sm font-normal"
                  style={{
                    background: "var(--bg)",
                    border: "1px solid var(--line)",
                    color: "var(--ink)",
                  }}
                />
              </label>
            </div>

            {adminError && (
              <p
                role="alert"
                className="text-sm rounded-lg px-3 py-2.5"
                style={{
                  color: "#d92d20",
                  background: "rgba(217,45,32,0.08)",
                  border: "1px solid rgba(217,45,32,0.25)",
                }}
              >
                {adminError}
              </p>
            )}

            <button
              type="submit"
              disabled={adminLoading}
              className="sh-focus w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-60"
              style={{
                background: "var(--accent)",
                color: "var(--accent-ink)",
              }}
            >
              {adminLoading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
