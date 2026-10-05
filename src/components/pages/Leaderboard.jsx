import React from "react";

export default function Leaderboard({
  usersData,
  currentUser,
  userProgress,
  allScoresCache,
}) {
  const getStudentPassedCount = (studentId) => {
    if (studentId === currentUser) {
      return Object.values(userProgress || {}).reduce(
        (acc, count) => acc + (Number(count) || 0),
        0,
      );
    }
    if (allScoresCache && allScoresCache[studentId] !== undefined) {
      return allScoresCache[studentId];
    }
    return 0;
  };

  const studentsList = Object.keys(usersData).map((id) => {
    const isMe = id === currentUser;
    const passed = getStudentPassedCount(id);
    return {
      id,
      name: usersData[id].name,
      passed,
      xp: passed * 50,
      isMe,
    };
  });

  const activeStudents = studentsList.filter((s) => s.xp > 0);
  activeStudents.sort((a, b) => b.xp - a.xp || b.passed - a.passed);

  const me = studentsList.find((s) => s.isMe) || { xp: 0, passed: 0 };
  const myRankIndex = activeStudents.findIndex((s) => s.isMe);
  const myRank =
    me.xp > 0 && myRankIndex !== -1 ? `#${myRankIndex + 1}` : "Unranked";

  const top1 = activeStudents[0];
  const top2 = activeStudents[1];
  const top3 = activeStudents[2];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#f1f0fc] md:text-3xl">
            Class Leaderboard 🏆
          </h1>
          <div className="mt-1 text-sm text-[#9492bf]">
            Live rankings — updated in real time from the cloud. ☁️
          </div>
        </div>

        <div className="rounded-2xl border border-[#22224c] bg-[#11112b] px-4.5 py-2.5 shadow-xl">
          <span className="block text-xs text-[#9492bf]">Your Ranking:</span>
          <b className="text-2xl font-extrabold text-[#947bff]">{myRank}</b>
        </div>
      </div>

      <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-5 shadow-xl space-y-1">
        <span className="text-xs text-[#9492bf]">Your real progress</span>
        <div className="flex items-center gap-2">
          <b className="text-xl font-extrabold text-[#ffb800]">⚡ {me.xp} XP</b>
          <span className="text-sm text-[#9492bf]">
            · {me.passed} lesson(s) passed
          </span>
        </div>
      </div>

      {activeStudents.length > 0 && (
        <div className="grid grid-cols-1 items-end gap-4 sm:grid-cols-3 my-6">
          <div className="order-2 rounded-2xl border border-[#22224c] bg-[#11112b] p-5 text-center shadow-xl sm:order-1 space-y-2">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#cbd5e1] text-lg font-extrabold text-[#0f172a]">
              🥈
            </div>
            <h3 className="font-bold text-base text-[#f1f0fc]">
              {top2 ? top2.name : "—"}
            </h3>
            <div className="text-xs text-[#9492bf]">
              {top2 ? `${top2.passed} videos passed` : "No score yet"}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-[rgba(255,184,0,0.3)] bg-[rgba(255,184,0,0.15)] px-3 py-1 text-xs font-bold text-[#ffb800]">
              ⚡ {top2 ? top2.xp : 0} XP
            </div>
          </div>

          <div className="order-1 scale-105 rounded-2xl border border-[#ffb800] bg-gradient-to-b from-[rgba(255,184,0,0.12)] to-[#11112b] p-6 text-center shadow-2xl sm:order-2 space-y-2">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#ffb800] text-lg font-extrabold text-black shadow-lg shadow-[#ffb800]/40">
              🥇
            </div>
            <h3 className="font-bold text-lg text-[#f1f0fc]">
              {top1 ? top1.name : "—"}
            </h3>
            <div className="text-xs text-[#9492bf]">
              {top1 ? `${top1.passed} videos passed` : "No score yet"}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-[rgba(255,184,0,0.3)] bg-[rgba(255,184,0,0.15)] px-3 py-1 text-xs font-bold text-[#ffb800]">
              ⚡ {top1 ? top1.xp : 0} XP
            </div>
          </div>

          <div className="order-3 rounded-2xl border border-[#22224c] bg-[#11112b] p-5 text-center shadow-xl space-y-2">
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#d97706] text-lg font-extrabold text-white">
              🥉
            </div>
            <h3 className="font-bold text-base text-[#f1f0fc]">
              {top3 ? top3.name : "—"}
            </h3>
            <div className="text-xs text-[#9492bf]">
              {top3 ? `${top3.passed} videos passed` : "No score yet"}
            </div>
            <div className="inline-flex items-center gap-1 rounded-full border border-[rgba(255,184,0,0.3)] bg-[rgba(255,184,0,0.15)] px-3 py-1 text-xs font-bold text-[#ffb800]">
              ⚡ {top3 ? top3.xp : 0} XP
            </div>
          </div>
        </div>
      )}

      {activeStudents.length === 0 ? (
        <div className="my-6 rounded-2xl border border-dashed border-[#22224c] bg-[#11112b] p-12 text-center space-y-2">
          <div className="text-4xl">🏁</div>
          <h3 className="font-bold text-lg text-[#f1f0fc]">
            No one has earned XP yet!
          </h3>
          <p className="text-sm text-[#9492bf]">
            Watch a video, pass a quiz, and be the first to take the #1 spot on
            the leaderboard!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight text-[#f1f0fc]">
            Full Class Standings
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-2 text-left">
              <thead>
                <tr className="text-xs font-semibold text-[#9492bf]">
                  <th className="px-4 py-2.5">Rank</th>
                  <th className="px-4 py-2.5">Student</th>
                  <th className="px-4 py-2.5">Student ID</th>
                  <th className="px-4 py-2.5">Videos Passed</th>
                  <th className="px-4 py-2.5">XP Points</th>
                  <th className="px-4 py-2.5">Badge</th>
                </tr>
              </thead>
              <tbody>
                {activeStudents.map((student, idx) => {
                  const rank = idx + 1;
                  const badge =
                    rank <= 3
                      ? "Champion 👑"
                      : rank <= 10
                        ? "Top 10 ⭐"
                        : rank <= 25
                          ? "Rising Star 🚀"
                          : "Learner 📚";

                  return (
                    <tr
                      key={student.id}
                      className={`rounded-xl border border-[#22224c] bg-[#11112b] transition-all hover:translate-x-1 ${
                        student.isMe
                          ? "border-2 border-[#7c5cff] bg-[rgba(124,92,255,0.12)]"
                          : ""
                      }`}
                    >
                      <td className="rounded-l-xl px-4 py-3.5 font-bold text-sm text-[#f1f0fc]">
                        #{rank}
                      </td>
                      <td className="px-4 py-3.5 font-bold text-sm text-[#f1f0fc]">
                        {student.name}{" "}
                        {student.isMe && (
                          <span className="font-bold text-xs text-[#947bff]">
                            (You)
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-[#9492bf]">
                        {student.id}
                      </td>
                      <td className="px-4 py-3.5 text-sm text-[#f1f0fc]">
                        {student.passed} lessons
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(255,184,0,0.3)] bg-[rgba(255,184,0,0.15)] px-3 py-1 text-xs font-bold text-[#ffb800]">
                          ⚡ {student.xp} XP
                        </span>
                      </td>
                      <td className="rounded-r-xl px-4 py-3.5 text-xs text-[#9492bf]">
                        {badge}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
