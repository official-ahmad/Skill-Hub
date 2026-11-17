import { BookOpen, House, LibraryBig, LogOut, Menu, Moon, Search, Sun, Trophy, UserRound } from "lucide-react";

const navigation = [
  ["home", "Home", House],
  ["courses", "Courses", LibraryBig],
  ["leaderboard", "Class standings", Trophy],
  ["dash", "My learning", BookOpen],
  ["profile", "Class profile", UserRound],
];

export default function Header({ profile, totalXP, currentTab, onNavigate, searchQuery, onSearchChange, theme, onToggleTheme, onLogout, onToggleMobileMenu }) {
  const image = profile?.avatar;
  const displayName = profile?.name || "Student";

  return (
    <header className="app-header">
      <button className="icon-button mobile-menu-button" onClick={onToggleMobileMenu} aria-label="Open navigation"><Menu size={18} strokeWidth={1.5} /></button>
      <button className="brand" onClick={() => onNavigate("home")}><BookOpen size={18} strokeWidth={1.5} /><span>Skillhub</span></button>
      <nav className="desktop-nav" aria-label="Main navigation">
        {navigation.map(([id, label, Icon]) => <button key={id} className={`nav-link ${currentTab === id ? "is-active" : ""}`} onClick={() => onNavigate(id)}><Icon size={18} strokeWidth={1.5} /><span>{label}</span></button>)}
      </nav>
      <label className="header-search"><Search size={18} strokeWidth={1.5} /><input aria-label="Search courses" placeholder="Search courses" value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} /></label>
      <div className="header-count"><span className="count-value tabular-nums">{totalXP}</span><span>XP</span></div>
      <button className="profile-shortcut" onClick={() => onNavigate("profile")} aria-label="Open class profile">
        {image ? <img src={image} alt="" /> : <span className="avatar-fallback">{displayName.charAt(0)}</span>}
        <span>{displayName}</span>
      </button>
      <button className="icon-button theme-button" onClick={onToggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>{theme === "light" ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}</button>
      <button className="icon-button logout-button" onClick={onLogout} aria-label="Sign out"><LogOut size={18} strokeWidth={1.5} /></button>
    </header>
  );
}
