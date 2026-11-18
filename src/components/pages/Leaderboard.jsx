import { Medal, Trophy, Users } from "lucide-react";

export default function Leaderboard({ usersData = {}, currentUser, userProgress, allScoresCache = {} }) {
  const students = Object.entries(usersData).map(([id, user]) => {
    const score = allScoresCache[id] || user;
    const passed = id === currentUser
      ? Object.values(userProgress || {}).reduce((sum, count) => sum + Number(count || 0), 0)
      : Number(score.passedCount || 0);
    return {
      id,
      name: user.name || "Student",
      studentId: user.studentId || "—",
      avatar: user.avatar || "",
      passed,
      xp: id === currentUser ? passed * 50 : Number(score.xp ?? passed * 50),
      completedCourses: Number(score.completedCourses || 0),
      className: user.className || "BSSE - Evening",
      isMe: id === currentUser,
    };
  }).sort((a, b) => b.xp - a.xp || b.passed - a.passed || a.name.localeCompare(b.name));
  const rank = students.findIndex((student) => student.isMe);
  const mine = students.find((student) => student.isMe) || { xp: 0, passed: 0 };
  const leaders = students.slice(0, 3);

  return <div className="space-y-8">
    <header className="page-heading standings-heading">
      <div><p className="eyebrow">Air University · BSSE - Evening</p><h1 className="page-title">Class standings</h1><p className="page-description">A shared view of learning progress across the class.</p></div>
      <div className="rank-card"><span>Your position</span><strong>{rank >= 0 ? `#${rank + 1}` : "—"}</strong></div>
    </header>

    <section className="standings-feature" aria-label="Class leaders">
      <div className="standings-feature-heading"><div><span className="feature-kicker"><Trophy size={15} /> Class pulse</span><h2>Learning, in motion</h2></div><span className="feature-class-count"><Users size={16} /> <span className="tabular-nums">{students.length}</span> students</span></div>
      <div className="leader-strip">{leaders.map((student, index) => <article className={`leader-tile leader-${index + 1}`} key={student.id}>
        <span className="leader-rank"><Medal size={16} /> {String(index + 1).padStart(2, "0")}</span>
        {student.avatar ? <img src={student.avatar} alt="" /> : <span className="leader-avatar-fallback">{student.name.charAt(0)}</span>}
        <div><strong>{student.name}</strong><span className="tabular-nums">{student.xp.toLocaleString()} XP · {student.completedCourses} courses</span></div>
      </article>)}</div>
    </section>

    <div className="standings-summary"><div><span>Your completed lessons</span><strong className="tabular-nums">{mine.passed}</strong></div><div><span>XP earned</span><strong className="tabular-nums">{mine.xp.toLocaleString()}</strong></div><div><span>Students in section</span><strong className="tabular-nums">{students.length}</strong></div></div>
    <div className="table-wrap"><table className="standings-table"><thead><tr><th>Rank</th><th>Student</th><th>Student ID</th><th>Courses complete</th><th>Lessons passed</th><th>XP</th></tr></thead><tbody>{students.map((student, index) => <tr key={student.id} className={student.isMe ? "is-current" : ""}>
      <td className="tabular-nums"><span className={`rank-number ${index < 3 ? "is-leader" : ""}`}>{index < 3 && <Medal size={16} />}{String(index + 1).padStart(2, "0")}</span></td>
      <td><span className="standing-person">{student.avatar ? <img src={student.avatar} alt="" /> : <span>{student.name.charAt(0)}</span>}<span>{student.name}{student.isMe && <em className="you-label">You</em>}</span></span></td>
      <td className="tabular-nums">{student.studentId}</td><td className="tabular-nums">{student.completedCourses}</td><td className="tabular-nums">{student.passed}</td><td className="tabular-nums"><strong>{student.xp.toLocaleString()}</strong></td>
    </tr>)}</tbody></table></div>
  </div>;
}
