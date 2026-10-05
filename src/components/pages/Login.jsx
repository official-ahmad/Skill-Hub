import React, { useState } from "react";

export default function Login({
  usersData,
  onLoginSuccess,
  theme,
  onToggleTheme,
}) {
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    const formattedId = studentId.trim().toUpperCase();
    const formattedPw = password.trim();

    if (usersData[formattedId] && usersData[formattedId].pw === formattedPw) {
      setError("");
      onLoginSuccess(formattedId);
    } else {
      setError("Invalid Student ID or password. Check credentials.");
    }
  };

  return (
    <section className="min-h-screen w-full flex items-center justify-center p-5 bg-[radial-gradient(circle_at_50%_20%,rgba(124,92,255,0.15),transparent_60%)] bg-[#090919]">
      <div className="w-full max-w-[400px] rounded-2xl border border-[#22224c] bg-[#11112b] p-8 shadow-2xl">
        <div className="flex items-center justify-between mb-4.5">
          <div className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight text-[#f1f0fc]">
            <i className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#947bff] text-xs font-bold not-italic text-white shadow-lg shadow-[#7c5cff]/25">
              ▶
            </i>
            SkillHub
          </div>
          <button
            type="button"
            onClick={onToggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#22224c] bg-transparent text-sm text-[#f1f0fc] hover:bg-[#17173a]"
            title="Toggle Light/Dark Theme"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-[#f1f0fc]">
          Welcome back
        </h1>
        <div className="mt-1 text-sm text-[#9492bf]">
          Enter your assigned Student ID and password.
        </div>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div>
            <label
              htmlFor="studentId"
              className="block text-xs font-semibold text-[#9492bf] mb-1.5"
            >
              Student ID
            </label>
            <input
              id="studentId"
              type="text"
              placeholder="SH-1001"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              autoComplete="username"
              className="w-full rounded-xl border border-[#22224c] bg-[#0c0c24] px-3.5 py-2.5 text-sm text-[#f1f0fc] placeholder-[#9492bf] outline-none transition-all focus:border-[#947bff] focus:ring-2 focus:ring-[#7c5cff]/25"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-[#9492bf] mb-1.5"
            >
              Password
            </label>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-xl border border-[#22224c] bg-[#0c0c24] pl-3.5 pr-11 py-2.5 text-sm text-[#f1f0fc] placeholder-[#9492bf] outline-none transition-all focus:border-[#947bff] focus:ring-2 focus:ring-[#7c5cff]/25"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 rounded-lg bg-transparent p-1.5 text-base text-[#9492bf] hover:bg-[#17173a] hover:text-[#f1f0fc]"
                title="Show / Hide Password"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-xs font-semibold text-[#ff5d73]">{error}</div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-[#7c5cff] py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#7c5cff]/25 transition-all hover:bg-[#947bff] hover:-translate-y-0.5 active:translate-y-0"
          >
            Login to SkillHub
          </button>
        </form>
      </div>
    </section>
  );
}
