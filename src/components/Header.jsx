import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronDown, House, LibraryBig, LogOut, Menu, Moon, Search, Sun, Trophy, UserRound, MessageSquareText } from "lucide-react";

const navigation = [
  ["home", "Home", House],
  ["courses", "Courses", LibraryBig],
  ["leaderboard", "Class standings", Trophy],
  ["dash", "My learning", BookOpen],
  ["profile", "Class profile", UserRound],
  ["queries", "Queries", MessageSquareText],
];

export default function Header({ profile, totalXP, currentTab, onNavigate, searchQuery, onSearchChange, theme, onToggleTheme, onLogout, onToggleMobileMenu }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const displayName = profile?.name || "Student";

  useEffect(() => {
    const closeDropdown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  return (
    <header className="sticky top-0 z-40 flex min-h-16 items-center gap-2 border-b border-slate-200/80 bg-white/90 px-3 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90 sm:gap-3 sm:px-5 lg:px-8">
      <button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900 lg:hidden" onClick={onToggleMobileMenu} aria-label="Open navigation">
        <Menu size={18} />
      </button>
      <button className="flex shrink-0 items-center gap-2 font-semibold text-slate-950 dark:text-white" onClick={() => onNavigate("home")}>
        <img className="h-9 w-9 rounded-xl border border-slate-200 object-cover dark:border-slate-800" src="/images.jpg" alt="" />
        <span className="hidden sm:inline">Skillhub</span>
      </button>
      <nav className="hidden min-w-0 flex-1 items-center justify-center gap-1 lg:flex" aria-label="Main navigation">
        {navigation.map(([id, label, Icon]) => (
          <button key={id} className={`flex min-h-10 items-center gap-2 rounded-xl px-3 text-sm transition ${currentTab === id ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-900"}`} onClick={() => onNavigate(id)}>
            <Icon size={18} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 dark:border-slate-800 dark:bg-slate-900 lg:max-w-56">
        <Search size={18} />
        <input className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" aria-label="Search courses" placeholder="Search courses" value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} />
      </label>
      <div className="hidden shrink-0 items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 md:flex">
        <span className="font-semibold tabular-nums text-slate-900 dark:text-white">{totalXP}</span><span>XP</span>
      </div>
      <div className="relative hidden sm:block" ref={dropdownRef}>
        <button className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-2 text-slate-600 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300" onClick={() => setProfileOpen((open) => !open)} aria-expanded={profileOpen}>
          {profile?.avatar ? <img className="h-7 w-7 rounded-full object-cover" src={profile.avatar} alt="" /> : <span className="grid h-7 w-7 place-items-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">{displayName.charAt(0)}</span>}
          <span className="hidden max-w-28 truncate text-sm xl:block">{displayName}</span><ChevronDown size={16} className={profileOpen ? "rotate-180" : "transition"} />
        </button>
        {profileOpen && (
          <div className="absolute right-0 top-12 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-800 dark:bg-slate-950">
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900" onClick={() => { setProfileOpen(false); onNavigate("profile"); }}><UserRound size={18} />Class profile</button>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900" onClick={() => { setProfileOpen(false); onToggleTheme(); }}>{theme === "light" ? <Moon size={18} /> : <Sun size={18} />}Switch theme</button>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10" onClick={() => { setProfileOpen(false); onLogout(); }}><LogOut size={18} />Log out</button>
          </div>
        )}
      </div>
      <button className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300" onClick={onToggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>
        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
      </button>
      <button className="hidden h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 text-rose-600 dark:border-slate-800 sm:grid" onClick={onLogout} aria-label="Sign out"><LogOut size={18} /></button>
    </header>
  );
}
