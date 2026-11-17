import { Medal } from "lucide-react";

export default function Leaderboard({ usersData = {}, currentUser, userProgress, allScoresCache = {} }) {
  const students = Object.entries(usersData).map(([id, user]) => {
    const passed = id === currentUser
      ? Object.values(userProgress || {}).reduce((sum, count) => sum + Number(count || 0), 0)
      : Number(allScoresCache[id]?.passedCount || 0);
    return { id, name: user.name || "Student", studentId: user.studentId || "—", passed, xp: passed * 50, isMe: id === currentUser };
  }).sort((a, b) => b.xp - a.xp || b.passed - a.passed || a.name.localeCompare(b.name));
  const active = students.filter((student) => student.xp > 0);
  const rank = active.findIndex((student) => student.isMe);
  const mine = students.find((student) => student.isMe) || { xp: 0, passed: 0 };

  return <div className="space-y-8">
    <header className="page-heading standings-heading"><div><p className="eyebrow">Air University · Class</p><h1 className="page-title">Class standings</h1><p className="page-description">Rankings by completed lessons.</p></div><div className="rank-card"><span>Your rank</span><strong>{rank >= 0 ? `#${rank + 1}` : "—"}</strong></div></header>
    <div className="standings-summary"><div><span>Your completed lessons</span><strong className="tabular-nums">{mine.passed}</strong></div><div><span>XP earned</span><strong className="tabular-nums">{mine.xp}</strong></div></div>
    {active.length === 0 ? <p className="empty-state">No lesson completions recorded yet.</p> : <div className="table-wrap"><table className="standings-table"><thead><tr><th>Rank</th><th>Student</th><th>Student ID</th><th>Lessons passed</th><th>XP</th></tr></thead><tbody>{active.map((student, index) => <tr key={student.id} className={student.isMe ? "is-current" : ""}><td className="tabular-nums">{index < 3 ? <span className="rank-number"><Medal size={18} strokeWidth={1.5} />{index + 1}</span> : index + 1}</td><td>{student.name}{student.isMe && <span className="you-label">You</span>}</td><td>{student.studentId}</td><td className="tabular-nums">{student.passed}</td><td className="tabular-nums">{student.xp}</td></tr>)}</tbody></table></div>}
  </div>;
}
