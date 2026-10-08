import React from "react";

export default function Header({
  user,
  usersData,
  totalXP,
  currentTab,
  onNavigate,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
  onLogout,
  onToggleMobileMenu,
}) {
  // Helper to extract student profile data (Google account info or legacy data)
  const getProfileData = () => {
    if (!user) return { name: "Student", photo: null };

    // 1. Check local storage for Google user profile
    const savedProfile = localStorage.getItem(`sh_profile_${user}`);
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        if (parsed) {
          return {
            name: parsed.name || "AU Student",
            photo: parsed.photo || null,
          };
        }
      } catch (e) {
        console.error("Error parsing user profile:", e);
      }
    }

    // 2. Check hardcoded fallback users list
    if (usersData && usersData[user]) {
      return { name: usersData[user].name, photo: null };
    }

    // 3. Fallback for non-mapped strings
    return {
      name: user.startsWith("SH-") ? user : "AU Student",
      photo: null,
    };
  };

  const { name: displayName, photo: photoURL } = getProfileData();

  return (
    <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-[#22224c] bg-[#090919]/80 px-4 py-3.5 backdrop-blur-md md:px-7">
      <button
        onClick={onToggleMobileMenu}
        className="flex items-center justify-center rounded-lg border border-[#22224c] p-2 text-xl text-[#f1f0fc] hover:bg-[#17173a] md:hidden"
        aria-label="Toggle Navigation"
      >
        ☰
      </button>

      <div
        onClick={() => onNavigate("home")}
        className="flex cursor-pointer items-center gap-2.5 text-xl font-extrabold tracking-tight text-[#f1f0fc]"
      >
        <i className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#7c5cff] to-[#947bff] text-xs font-bold not-italic text-white shadow-lg shadow-[#7c5cff]/25">
          ▶
        </i>
        SkillHub
      </div>

      <nav className="hidden gap-3.5 md:flex">
        <a
          onClick={() => onNavigate("home")}
          className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
            currentTab === "home"
              ? "bg-[#17173a] font-bold text-[#f1f0fc]"
              : "text-[#9492bf] hover:bg-[#17173a] hover:text-[#f1f0fc]"
          }`}
        >
          Home
        </a>
        <a
          onClick={() => onNavigate("courses")}
          className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
            currentTab === "courses"
              ? "bg-[#17173a] font-bold text-[#f1f0fc]"
              : "text-[#9492bf] hover:bg-[#17173a] hover:text-[#f1f0fc]"
          }`}
        >
          Courses
        </a>
        <a
          onClick={() => onNavigate("leaderboard")}
          className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
            currentTab === "leaderboard"
              ? "bg-[#17173a] font-bold text-[#f1f0fc]"
              : "text-[#9492bf] hover:bg-[#17173a] hover:text-[#f1f0fc]"
          }`}
        >
          Leaderboard 🏆
        </a>
        <a
          onClick={() => onNavigate("dash")}
          className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
            currentTab === "dash"
              ? "bg-[#17173a] font-bold text-[#f1f0fc]"
              : "text-[#9492bf] hover:bg-[#17173a] hover:text-[#f1f0fc]"
          }`}
        >
          My learning
        </a>
        <a
          onClick={() => onNavigate("profile")}
          className={`cursor-pointer rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
            currentTab === "profile"
              ? "bg-[#17173a] font-bold text-[#f1f0fc]"
              : "text-[#9492bf] hover:bg-[#17173a] hover:text-[#f1f0fc]"
          }`}
        >
          Profile 👤
        </a>
      </nav>

      <div className="flex-1" />

      <input
        type="text"
        placeholder="Search courses..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full max-w-[160px] rounded-full border border-[#22224c] bg-[#0c0c24] px-3.5 py-1.5 text-sm text-[#f1f0fc] placeholder-[#9492bf] outline-none transition-all focus:border-[#947bff] focus:ring-2 focus:ring-[#7c5cff]/25 md:max-w-[260px]"
      />

      <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,184,0,0.3)] bg-[rgba(255,184,0,0.15)] px-3 py-1 text-xs font-bold text-[#ffb800]">
        ⚡ {totalXP} XP
      </div>

      <div
        onClick={() => onNavigate("profile")}
        className="hidden cursor-pointer items-center gap-2 sm:flex hover:opacity-80 transition-opacity"
      >
        {photoURL ? (
          <img
            src={photoURL}
            alt={displayName}
            className="h-7 w-7 rounded-full border border-[#7c5cff]/50 object-cover"
          />
        ) : (
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#17173a] border border-[#22224c] text-xs font-bold text-[#7c5cff]">
            {displayName.charAt(0)}
          </div>
        )}
        <span className="font-semibold text-sm text-[#f1f0fc]">
          {displayName}
        </span>
      </div>

      <button
        onClick={onToggleTheme}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#22224c] bg-transparent text-sm text-[#f1f0fc] hover:bg-[#17173a]"
        title="Toggle Theme"
      >
        {theme === "light" ? "🌙" : "☀️"}
      </button>

      <button
        onClick={onLogout}
        className="rounded-xl border border-[#22224c] bg-transparent px-3 py-1.5 text-xs font-semibold text-[#f1f0fc] transition-all hover:border-[#7c5cff] hover:bg-[#17173a]"
      >
        Logout
      </button>
    </header>
  );
}
