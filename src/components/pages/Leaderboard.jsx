import { Medal, Trophy, Users } from "lucide-react";

export default function Leaderboard({
  usersData = {},
  currentUser,
  userProgress,
  allScoresCache = {},
}) {
  const students = Object.entries(usersData)
    .map(([id, user]) => {
      const score = allScoresCache[id] || user;
      const passed =
        id === currentUser
          ? Object.values(userProgress || {}).reduce(
              (sum, count) => sum + Number(count || 0),
              0,
            )
          : Number(score.passedCount || 0);
      return {
        id,
        name: user.name || "Student",
        studentId: user.studentId || "—",
        avatar: user.avatar || "",
        passed,
        xp: id === currentUser ? passed * 50 : Number(score.xp ?? passed * 50),
        completedCourses: Number(score.completedCourses || 0),
        isMe: id === currentUser,
      };
    })
    .sort(
      (a, b) =>
        b.xp - a.xp || b.passed - a.passed || a.name.localeCompare(b.name),
    );
  const rank = students.findIndex((student) => student.isMe);
  const mine = students.find((student) => student.isMe) || { xp: 0, passed: 0 };

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-800 dark:text-indigo-300 sem:text-indigo-600">
            Skillhub · Course library
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Class standings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            A shared view of learning progress across the class.
          </p>
        </div>
        <div className="hidden rounded-2xl border border-slate-200 bg-white px-5 py-3 text-right shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:block">
          <span className="block text-xs text-slate-500">Your position</span>
          <strong className="text-2xl">
            {rank >= 0 ? `#${rank + 1}` : "—"}
          </strong>
        </div>
      </header>
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-indigo-900 p-5 text-white shadow-xl sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="flex items-center gap-2 text-xs text-indigo-200">
              <Trophy size={15} />
              Class pulse
            </span>
            <h2 className="mt-2 text-xl font-semibold">Learning, in motion</h2>
          </div>
          <span className="flex items-center gap-2 text-xs text-indigo-200">
            <Users size={16} />
            <span className="tabular-nums">{students.length}</span> students
          </span>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          {students.slice(0, 3).map((student, index) => (
            <article
              key={student.id}
              className="grid grid-cols-[40px_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <span className="col-span-2 flex items-center gap-2 text-xs text-indigo-200">
                <Medal size={14} />#{index + 1}
              </span>
              {student.avatar ? (
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={student.avatar}
                  alt=""
                />
              ) : (
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white/10">
                  {student.name.charAt(0)}
                </span>
              )}
              <div className="min-w-0">
                <strong className="block truncate">{student.name}</strong>
                <small className="tabular-nums text-indigo-200">
                  {student.xp.toLocaleString()} XP
                </small>
              </div>
            </article>
          ))}
        </div>
      </section>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Completed lessons", value: mine.passed },
          { label: "XP earned", value: mine.xp.toLocaleString() },
          { label: "Students", value: students.length },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
          >
            <span className="block text-[11px] text-slate-500 sm:text-xs">
              {item.label}
            </span>
            <strong className="mt-1 block text-lg tabular-nums sm:text-2xl">
              {item.value}
            </strong>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[680px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs text-slate-500 dark:border-slate-800">
              {[
                "Rank",
                "Student",
                "Student ID",
                "Courses complete",
                "Lessons passed",
                "XP",
              ].map((head) => (
                <th className="px-4 py-3 font-medium" key={head}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((student, index) => (
              <tr
                key={student.id}
                className={`border-b border-slate-100 last:border-0 dark:border-slate-800 ${
                  student.isMe ? "bg-indigo-50/60 dark:bg-indigo-500/10" : ""
                }`}
              >
                <td className="px-4 py-3 tabular-nums">
                  <span className="flex items-center gap-1">
                    {index < 3 && <Medal size={14} />}#{index + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="flex items-center gap-3">
                    {student.avatar ? (
                      <img
                        className="h-8 w-8 rounded-full object-cover"
                        src={student.avatar}
                        alt=""
                      />
                    ) : (
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-100 text-xs text-indigo-700 dark:bg-indigo-500/20">
                        {student.name.charAt(0)}
                      </span>
                    )}
                    <strong>{student.name}</strong>
                    {student.isMe && (
                      <em className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                        You
                      </em>
                    )}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums">{student.studentId}</td>
                <td className="px-4 py-3 tabular-nums">
                  {student.completedCourses}
                </td>
                <td className="px-4 py-3 tabular-nums">{student.passed}</td>
                <td className="px-4 py-3 font-semibold tabular-nums">
                  {student.xp.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
