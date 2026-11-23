import { useEffect, useRef, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  House,
  LibraryBig,
  LogOut,
  Menu,
  MessageSquareText,
  Moon,
  Search,
  Sun,
  Trophy,
  UserRound,
  X,
  Zap,
} from "lucide-react";

const navigation = [
  ["home", "Home", House],
  ["courses", "Courses", LibraryBig],
  ["leaderboard", "Standings", Trophy],
  ["dash", "My learning", BookOpen],
  ["profile", "Profile", UserRound],
  ["queries", "Queries", MessageSquareText],
];

const iconButton =
  "grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-600 transition hover:bg-slate-100 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-slate-300 dark:hover:bg-slate-800";

function SearchBox({ className = "", searchQuery, onSearchChange }) {
  return (
    <label
      className={`group flex h-10 items-center gap-2 rounded-full bg-slate-100 px-4 text-slate-400 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500 dark:bg-slate-900 dark:focus-within:bg-slate-950 ${className}`}
    >
      <Search size={16} className="shrink-0" />
      <input
        className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
        aria-label="Search courses"
        placeholder="Search courses"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      {searchQuery && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onSearchChange("")}
          className="grid h-5 w-5 place-items-center rounded-full bg-slate-300 text-white hover:bg-slate-400 dark:bg-slate-700"
        >
          <X size={12} />
        </button>
      )}
    </label>
  );
}

export default function Header({
  profile,
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
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const displayName = profile?.name || "Student";
  const initial = displayName.charAt(0).toUpperCase();

  useEffect(() => {
    const onPointerDown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setProfileOpen(false);
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/80">
   
      <div className="mx-auto flex h-16 max-w-[1600px] items-center gap-2 px-3 sm:gap-3 sm:px-5 lg:px-8">
        <button
          className={`${iconButton} xl:hidden`}
          onClick={onToggleMobileMenu}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <button
          className="flex shrink-0 items-center gap-2.5 rounded-full pr-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          onClick={() => onNavigate("home")}
          aria-label="Skillhub home"
        >
          <img
            className="h-9 w-9 rounded-xl object-cover shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
            src="/images.jpg"
            alt=""
          />
          <span className="text-base font-bold tracking-tight text-slate-950 dark:text-white">
            Skillhub
            {/* <span className="text-indigo-600 dark:text-indigo-400">hub</span> */}
          </span>
        </button>

        <nav
          className="mx-auto hidden items-center gap-1 rounded-full bg-slate-100/80 p-1 dark:bg-slate-900/80 xl:flex"
          aria-label="Main navigation"
        >
          {navigation.map(([id, label, Icon]) => {
            const active = currentTab === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id)}
                aria-current={active ? "page" : undefined}
                className={`flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  active
                    ? "bg-white text-indigo-700 shadow-sm dark:bg-slate-800 dark:text-indigo-300"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Icon size={16} />
                {label}
              </button>
            );
          })}
        </nav>

        {/* Spacer for < xl */}
        <div className="flex-1 xl:hidden" />

        {/* Right cluster */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <SearchBox className="hidden w-44 md:flex lg:w-56" searchQuery={searchQuery} onSearchChange={onSearchChange} />

          <div
            className="hidden items-center gap-1.5 rounded-full bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700 ring-1 ring-amber-200/70 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20 sm:flex"
            title="Total XP"
          >
            <Zap size={14} className="fill-current" />
            <span className="font-bold tabular-nums">{totalXP}</span>
            <span className="opacity-70">XP</span>
          </div>

          <button
            className={iconButton}
            onClick={onToggleTheme}
            aria-label={`Switch to ${
              theme === "light" ? "dark" : "light"
            } theme`}
          >
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              className="flex h-10 items-center gap-1.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-2 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 sm:pr-3"
              onClick={() => setProfileOpen((open) => !open)}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
            >
              {profile?.avatar ? (
                <img
                  className="h-8 w-8 rounded-full object-cover"
                  src={profile.avatar}
                  alt=""
                />
              ) : (
                <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-semibold text-white">
                  {initial}
                </span>
              )}
              <span className="hidden max-w-24 truncate text-sm font-medium text-slate-700 dark:text-slate-200 lg:block">
                {displayName}
              </span>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-12 w-60 origin-top-right overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl shadow-slate-900/10 dark:border-slate-800 dark:bg-slate-950"
              >
                <div className="flex items-center gap-3 px-3 py-3">
                  {profile?.avatar ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={profile.avatar}
                      alt=""
                    />
                  ) : (
                    <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 font-semibold text-white">
                      {initial}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {displayName}
                    </p>
                    <p className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                      <Zap size={12} className="fill-current" />
                      <span className="tabular-nums">{totalXP}</span> XP
                    </p>
                  </div>
                </div>
                <div className="my-1 h-px bg-slate-100 dark:bg-slate-800" />
                <button
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate("profile");
                  }}
                >
                  <UserRound size={17} />
                  Class profile
                </button>
                <button
                  role="menuitem"
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={17} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search row */}
      <div className="px-3 pb-3 sm:px-5 md:hidden">
        <SearchBox className="w-full" searchQuery={searchQuery} onSearchChange={onSearchChange} />
      </div>
    </header>
  );
}
