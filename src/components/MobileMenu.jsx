import { BookOpen, House, LibraryBig, LogOut, Trophy, UserRound, MessageSquareText } from "lucide-react";

const navigation = [
  ["home", "Home", House],
  ["courses", "Courses", LibraryBig],
  ["leaderboard", "Class standings", Trophy],
  ["dash", "My learning", BookOpen],
  ["profile", "Class profile", UserRound],
  ["queries", "Queries", MessageSquareText],
];

export default function MobileMenu({ isOpen, onNavigate, onLogout }) {
  if (!isOpen) return null;
  return (
    <nav className="fixed left-3 right-3 top-[72px] z-50 grid gap-1 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl dark:border-slate-800 dark:bg-slate-950 lg:hidden" aria-label="Mobile navigation">
      {navigation.map(([id, label, Icon]) => (
        <button key={id} className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-900" onClick={() => onNavigate(id)}>
          <Icon size={18} />{label}
        </button>
      ))}
      <button className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10" onClick={onLogout}><LogOut size={18} />Sign out</button>
    </nav>
  );
}
