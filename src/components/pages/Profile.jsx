import React, { useState } from "react";

export default function Profile({
  courses,
  usersData,
  currentUser,
  userProgress,
  allScoresCache,
  onSelectCourse,
  onResetProgress,
  onNavigate,
}) {
  const [resetConfirm, setResetConfirm] = useState(false);

  // Helper to extract Google Profile or Fallback
  const getProfileInfo = () => {
    if (!currentUser) return { name: "Student", email: "", photo: null };

    // 1. Read Google Profile stored during login
    const saved = localStorage.getItem(`sh_profile_${currentUser}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          return {
            name: parsed.name || "AU Student",
            email: parsed.email || "",
            photo: parsed.photo || null,
          };
        }
      } catch (e) {
        console.error("Error parsing profile:", e);
      }
    }

    // 2. Check legacy usersData if present
    if (usersData && usersData[currentUser]) {
      return {
        name: usersData[currentUser].name,
        email: `${currentUser.toLowerCase()}@students.au.edu.pk`,
        photo: null,
      };
    }

    return {
      name: "AU Student",
      email: "",
      photo: null,
    };
  };

  const profile = getProfileInfo();

  const getInitials = (name) => {
    if (!name) return "ST";
    return name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("");
  };

  const totalPassed = Object.values(userProgress || {}).reduce(
    (acc, val) => acc + (Number(val) || 0),
    0,
  );
  const totalXP = totalPassed * 50;

  const getLevel = (xp) => {
    if (xp >= 3000)
      return {
        label: "Master 🔥",
        cls: "border-[rgba(255,93,115,0.3)] bg-[rgba(255,93,115,0.15)] text-[#ff5d73]",
      };
    if (xp >= 1500)
      return {
        label: "Advanced ⚡",
        cls: "border-[rgba(255,184,0,0.3)] bg-[rgba(255,184,0,0.15)] text-[#ffb800]",
      };
    if (xp >= 500)
      return {
        label: "Intermediate 🚀",
        cls: "border-[rgba(124,92,255,0.3)] bg-[rgba(124,92,255,0.15)] text-[#947bff]",
      };
    return {
      label: "Beginner 📚",
      cls: "border-[rgba(47,209,139,0.3)] bg-[rgba(47,209,139,0.15)] text-[#2fd18b]",
    };
  };

  const level = getLevel(totalXP);

  const completedCourses = courses.filter(
    (c) => (userProgress[c.id] || 0) >= c.v.length,
  );
  const inProgressCourses = courses.filter(
    (c) =>
      (userProgress[c.id] || 0) > 0 && (userProgress[c.id] || 0) < c.v.length,
  );
  const totalLessonsInPlatform = courses.reduce(
    (acc, c) => acc + c.v.length,
    0,
  );

  const levelsThresholds = [0, 500, 1500, 3000];
  const levelNames = ["Beginner", "Intermediate", "Advanced", "Master"];
  let curLvlIdx = 0;
  for (let i = levelsThresholds.length - 1; i >= 0; i--) {
    if (totalXP >= levelsThresholds[i]) {
      curLvlIdx = i;
      break;
    }
  }

  const nextXP =
    levelsThresholds[curLvlIdx + 1] ||
    levelsThresholds[levelsThresholds.length - 1];
  const prevXP = levelsThresholds[curLvlIdx];
  const xpPct =
    curLvlIdx >= levelsThresholds.length - 1
      ? 100
      : Math.round(((totalXP - prevXP) / (nextXP - prevXP)) * 100);

  const calculateRank = () => {
    if (!allScoresCache) return "-";
    const entries = Object.entries(allScoresCache).map(([id, data]) => {
      const pCount =
        typeof data === "object" ? data.passedCount || 0 : Number(data) || 0;
      return { id, xp: pCount * 50 };
    });

    entries.sort((a, b) => b.xp - a.xp);
    const myIndex = entries.findIndex((item) => item.id === currentUser);
    return myIndex !== -1 ? myIndex + 1 : "-";
  };

  const myRank = calculateRank();

  const colorList = [
    "#f7df1e",
    "#3776ab",
    "#e44d26",
    "#1572b6",
    "#a8b9cc",
    "#f89820",
    "#659ad2",
    "#00b4d8",
    "#f05032",
    "#61dafb",
    "#68a063",
    "#ff7bac",
  ];

  const handleResetClick = () => {
    if (resetConfirm) {
      onResetProgress();
      setResetConfirm(false);
    } else {
      setResetConfirm(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-[rgba(124,92,255,0.3)] bg-gradient-to-br from-[rgba(124,92,255,0.12)] to-[rgba(47,209,139,0.04)] p-7 shadow-xl sm:flex-row">
        {profile.photo ? (
          <img
            src={profile.photo}
            alt={profile.name}
            className="h-20 w-20 flex-none rounded-full border-2 border-[#7c5cff] object-cover shadow-lg shadow-[#7c5cff]/25"
          />
        ) : (
          <div className="flex h-20 w-20 flex-none items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff] to-[#947bff] text-2xl font-extrabold text-white shadow-lg shadow-[#7c5cff]/25">
            {getInitials(profile.name)}
          </div>
        )}

        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-2xl font-extrabold text-[#f1f0fc]">
            {profile.name}
          </h2>
          <div className="text-sm font-medium text-[#9492bf]">
            {profile.email || "Air University Verified Student"}
          </div>
          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${level.cls}`}
          >
            {level.label}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-4.5 shadow-xl space-y-1">
          <div className="text-xl">⚡</div>
          <b className="block text-2xl font-extrabold text-[#ffb800]">
            {totalXP}
          </b>
          <span className="text-xs text-[#9492bf]">XP Earned</span>
        </div>

        <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-4.5 shadow-xl space-y-1">
          <div className="text-xl">🏆</div>
          <b className="block text-2xl font-extrabold text-[#947bff]">
            #{myRank}
          </b>
          <span className="text-xs text-[#9492bf]">Class Rank</span>
        </div>

        <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-4.5 shadow-xl space-y-1">
          <div className="text-xl">✅</div>
          <b className="block text-2xl font-extrabold text-[#2fd18b]">
            {totalPassed}
          </b>
          <span className="text-xs text-[#9492bf]">Lessons Passed</span>
        </div>

        <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-4.5 shadow-xl space-y-1">
          <div className="text-xl">🎓</div>
          <b className="block text-2xl font-extrabold text-[#f1f0fc]">
            {completedCourses.length}
          </b>
          <span className="text-xs text-[#9492bf]">Courses Done</span>
        </div>

        <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-4.5 shadow-xl space-y-1">
          <div className="text-xl">📚</div>
          <b className="block text-2xl font-extrabold text-[#7c5cff]">
            {inProgressCourses.length}
          </b>
          <span className="text-xs text-[#9492bf]">In Progress</span>
        </div>

        <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-4.5 shadow-xl space-y-1">
          <div className="text-xl">📊</div>
          <b className="block text-2xl font-extrabold text-[#f1f0fc]">
            {totalLessonsInPlatform > 0
              ? Math.round((totalPassed / totalLessonsInPlatform) * 100)
              : 0}
            %
          </b>
          <span className="text-xs text-[#9492bf]">Overall Progress</span>
        </div>
      </div>

      <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-5 shadow-xl space-y-2">
        <div className="flex items-center justify-between text-sm">
          <b className="text-[#f1f0fc]">
            XP Progress — {levelNames[curLvlIdx]}
          </b>
          <span className="text-xs text-[#9492bf]">
            {curLvlIdx < levelsThresholds.length - 1
              ? `${totalXP} / ${nextXP} XP to ${levelNames[curLvlIdx + 1]}`
              : "🔥 Max Level Reached!"}
          </span>
        </div>

        <div className="h-2.5 w-full rounded-full bg-[#22224c] overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#7c5cff] to-[#947bff] transition-all duration-1000"
            style={{ width: `${xpPct}%` }}
          />
        </div>

        <div className="text-xs text-[#9492bf]">
          {xpPct}% to next level{" "}
          {curLvlIdx < levelsThresholds.length - 1
            ? `· ${nextXP - totalXP} XP remaining`
            : ""}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h2 className="text-xl font-bold tracking-tight text-[#f1f0fc]">
          📈 Course Progress
        </h2>

        <div className="space-y-2.5">
          {courses.map((c) => {
            const doneCount = userProgress[c.id] || 0;
            const progressPercent = Math.round((doneCount / c.v.length) * 100);
            const isCompleted = doneCount >= c.v.length;
            const themeColor = colorList[c.c % colorList.length];

            return (
              <div
                key={c.id}
                onClick={() => onSelectCourse(c.id)}
                className="flex cursor-pointer items-center gap-3.5 rounded-xl border border-[#22224c] bg-[#11112b] p-3.5 transition-all hover:border-[#7c5cff]"
              >
                <div
                  className="flex h-10 w-10 flex-none items-center justify-center rounded-xl text-sm font-extrabold"
                  style={{
                    backgroundColor: `${themeColor}22`,
                    color: themeColor,
                  }}
                >
                  {c.ic}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <b className="block truncate text-sm text-[#f1f0fc]">{c.t}</b>
                  <div className="text-xs text-[#9492bf]">
                    {doneCount}/{c.v.length} lessons ·{" "}
                    {isCompleted ? "✅ Complete" : `${progressPercent}% done`}
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#22224c] overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isCompleted
                          ? "bg-[#2fd18b]"
                          : "bg-gradient-to-r from-[#7c5cff] to-[#947bff]"
                      }`}
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div
                  className={`text-sm font-bold ${
                    isCompleted
                      ? "text-[#2fd18b]"
                      : progressPercent > 0
                        ? "text-[#947bff]"
                        : "text-[#9492bf]"
                  }`}
                >
                  {isCompleted
                    ? "✓"
                    : progressPercent > 0
                      ? `${progressPercent}%`
                      : "—"}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-4">
        <button
          onClick={() => onNavigate("courses")}
          className="rounded-xl bg-[#7c5cff] px-4.5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#7c5cff]/25 hover:bg-[#947bff]"
        >
          Browse Courses 📚
        </button>

        <button
          onClick={handleResetClick}
          className={`rounded-xl border px-4 py-2.5 text-xs font-semibold transition-all ${
            resetConfirm
              ? "border-[#ff5d73] bg-[#ff5d73] text-white shadow-md"
              : "border-[#22224c] bg-transparent text-[#f1f0fc] hover:bg-[#17173a]"
          }`}
        >
          {resetConfirm ? "Click again to confirm reset" : "Reset my progress"}
        </button>
      </div>
    </div>
  );
}
