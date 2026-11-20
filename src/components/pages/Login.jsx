import { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { Moon, Sun, Shield, Lock } from "lucide-react";
import { adminLogin, apiLogin } from "../../api";

export default function Login({ onLoginSuccess, theme, onToggleTheme }) {
  const [error, setError] = useState("");
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminError, setAdminError] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  const handleGoogleLogin = async (response) => {
    try {
      setError("");
      if (!response.credential)
        throw new Error(
          "Google did not return an ID token. Check the configured OAuth client ID.",
        );
      const result = await apiLogin(response.credential);
      onLoginSuccess(result.token, result.user);
    } catch (loginError) {
      setError(loginError.message || "Sign-in failed. Try again.");
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
    } catch (adminLoginError) {
      setAdminError(adminLoginError.message || "Admin sign-in failed.");
    } finally {
      setAdminLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-[#f4f4f5] flex flex-col justify-between selection:bg-emerald-500/30 font-sans">
      {/* Top Navbar */}
      <header className="w-full border-b border-white/[0.06] bg-[#09090b]/90 backdrop-blur-md sticky top-0 z-50 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img
            src="/images.jpg"
            alt=""
            className="w-9 h-9 rounded-xl border border-white/[0.08] object-cover shadow-sm"
          />
          <div className="flex items-baseline gap-2">
            <span className="font-medium tracking-tight text-white text-sm">
              Skillhub
            </span>
            <span className="text-[11px] text-white/40 hidden sm:inline">
              Air University · BSSE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-lg border border-white/10 hover:border-white/20 text-white/70 hover:text-white transition-colors bg-white/[0.02]"
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <Moon size={15} strokeWidth={1.5} />
            ) : (
              <Sun size={15} strokeWidth={1.5} />
            )}
          </button>

          <button
            type="button"
            onClick={() => setAdminOpen(true)}
            className="text-xs font-medium text-white/70 hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 transition-colors flex items-center gap-1.5 bg-white/[0.02]"
          >
            <Shield className="text-emerald-400" size={13} strokeWidth={1.5} />
            Admin portal
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-[#121216] border border-white/[0.08] rounded-xl p-8 shadow-2xl relative">
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[11px] font-medium tracking-wider text-emerald-400 uppercase">
                Air University · Student portal
              </p>
              <h1 className="text-xl font-semibold tracking-tight text-white">
                Coursework, in one place.
              </h1>
              <p className="text-xs text-white/50 leading-relaxed">
                Sign in with your university Google account to view registered
                courses, check progress records, and access class updates.
              </p>
            </div>

            <div className="pt-2">
              <div className="w-full flex justify-center overflow-hidden rounded-lg border border-white/10">
                <GoogleLogin
                  onSuccess={handleGoogleLogin}
                  onError={() => setError("Google sign-in failed. Try again.")}
                  text="continue_with"
                  shape="rectangular"
                  theme="filled_black"
                  size="large"
                  width="100%"
                />
              </div>
            </div>

            {error && (
              <p
                role="alert"
                className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg"
              >
                {error}
              </p>
            )}

            <div className="pt-4 border-t border-white/[0.06] text-center">
              <p className="text-[11px] text-white/40">
                Access is restricted strictly to authorized university email
                accounts.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Admin Login Modal */}
      {adminOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setAdminOpen(false);
          }}
        >
          <form
            className="bg-[#121216] border border-white/10 rounded-xl p-6 sm:p-7 w-full max-w-sm shadow-2xl space-y-5"
            onSubmit={handleAdminLogin}
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-login-title"
          >
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-medium">
                <Lock size={11} strokeWidth={1.5} /> Restricted
              </div>
              <h2
                id="admin-login-title"
                className="text-lg font-semibold tracking-tight text-white mt-1"
              >
                Admin Portal
              </h2>
              <p className="text-xs text-white/50">
                Enter credentials to access controls.
              </p>
            </div>

            <div className="space-y-3.5">
              <label className="block text-xs font-medium text-white/70 space-y-1">
                Admin ID
                <input
                  type="text"
                  value={adminId}
                  onChange={(event) => setAdminId(event.target.value)}
                  autoComplete="username"
                  required
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="Enter admin ID"
                />
              </label>

              <label className="block text-xs font-medium text-white/70 space-y-1">
                Password
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(event) => setAdminPassword(event.target.value)}
                  autoComplete="current-password"
                  required
                  className="w-full bg-[#09090b] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  placeholder="••••••••••••"
                />
              </label>
            </div>

            {adminError && (
              <p
                className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2.5 rounded-lg"
                role="alert"
              >
                {adminError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/20 transition-colors bg-white/[0.02]"
                type="button"
                onClick={() => setAdminOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white transition-colors disabled:opacity-50"
                type="submit"
                disabled={adminLoading}
              >
                {adminLoading ? "Verifying..." : "Sign in"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Footer with GitHub Integration */}
      <footer className="w-full border-t border-white/[0.06] py-3.5 px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/40 gap-2">
        <span>SkillHub · Air University BSSE</span>
        <div className="flex items-center gap-3">
          <span>UI refined with unslop</span>
          <span>·</span>
          <a
            href="https://github.com/official-ahmad/Skill-Hub"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors"
          >
            {/* Official GitHub SVG Icon */}
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="font-mono text-[11px]">official-ahmad</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
