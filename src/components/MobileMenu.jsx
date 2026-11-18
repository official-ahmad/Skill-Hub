import {
  BookOpen,
  House,
  LibraryBig,
  LogOut,
  Trophy,
  UserRound,
} from "lucide-react";

const navigation = [
  ["home", "Home", House],
  ["courses", "Courses", LibraryBig],
  ["leaderboard", "Class standings", Trophy],
  ["dash", "My learning", BookOpen],
  ["profile", "Class profile", UserRound],
];

export default function MobileMenu({ isOpen, onNavigate, onLogout }) {
  if (!isOpen) return null;
  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {navigation.map(([id, label, Icon]) => (
        <button
          key={id}
          className="mobile-nav-link"
          onClick={() => onNavigate(id)}
        >
          <Icon size={18} strokeWidth={1.5} />
          {label}
        </button>
      ))}
      <button className="mobile-nav-link" onClick={onLogout}>
        <LogOut size={18} strokeWidth={1.5} />
        Sign out
      </button>
    </nav>
  );
}
