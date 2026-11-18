import { useEffect, useRef, useState } from "react";
import { BookOpen, ChevronDown, House, LibraryBig, LogOut, Menu, Moon, Search, Sun, Trophy, UserRound } from "lucide-react";

const navigation = [
  ["home", "Home", House],
  ["courses", "Courses", LibraryBig],
  ["leaderboard", "Class standings", Trophy],
  ["dash", "My learning", BookOpen],
  ["profile", "Class profile", UserRound],
];

export default function Header({ profile, totalXP, currentTab, onNavigate, searchQuery, onSearchChange, theme, onToggleTheme, onLogout, onToggleMobileMenu }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef(null);
  const image = profile?.avatar;
  const displayName = profile?.name || "Student";

  useEffect(() => {
    const closeDropdown = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", closeDropdown);
    return () => document.removeEventListener("mousedown", closeDropdown);
  }, []);

  return (
    <header className="app-header">
      <button className="icon-button mobile-menu-button" onClick={onToggleMobileMenu} aria-label="Open navigation"><Menu size={18} strokeWidth={1.5} /></button>
      <button className="brand" onClick={() => onNavigate("home")}><img className="brand-logo" src="/images.jpg" alt="" /><span>Skillhub</span></button>
      <nav className="desktop-nav" aria-label="Main navigation">
        {navigation.map(([id, label, Icon]) => <button key={id} className={`nav-link ${currentTab === id ? "is-active" : ""}`} onClick={() => onNavigate(id)}><Icon size={18} strokeWidth={1.5} /><span>{label}</span></button>)}
      </nav>
      <label className="header-search"><Search size={18} strokeWidth={1.5} /><input aria-label="Search courses" placeholder="Search courses" value={searchQuery} onChange={(event) => onSearchChange(event.target.value)} /></label>
      <div className="header-count"><span className="count-value tabular-nums">{totalXP}</span><span>XP</span></div>
      <div className="profile-menu" ref={dropdownRef}>
        <button className="profile-shortcut" onClick={() => setProfileOpen((open) => !open)} aria-label="Open profile menu" aria-expanded={profileOpen}>
          {image ? <img src={image} alt="" /> : <span className="avatar-fallback">{displayName.charAt(0)}</span>}
          <span>{displayName}</span>
          <ChevronDown size={16} strokeWidth={1.5} className={profileOpen ? "rotate-180" : ""} />
        </button>
        {profileOpen && <div className="profile-dropdown">
          <button onClick={() => { setProfileOpen(false); onNavigate("profile"); }}><UserRound size={18} strokeWidth={1.5} />Class profile</button>
          <button onClick={() => { setProfileOpen(false); onToggleTheme(); }}>{theme === "light" ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}Switch theme</button>
          <button className="dropdown-logout" onClick={() => { setProfileOpen(false); onLogout(); }}><LogOut size={18} strokeWidth={1.5} />Log out</button>
        </div>}
      </div>
      <button className="icon-button theme-button" onClick={onToggleTheme} aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}>{theme === "light" ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}</button>
      <button className="icon-button logout-button" onClick={onLogout} aria-label="Sign out"><LogOut size={18} strokeWidth={1.5} /></button>
    </header>
  );
}
