import React, { useState } from "react";

export default function Home({
  courses,
  usersData,
  currentUser,
  userProgress,
  onSelectCourse,
  onNavigate,
  onCategorySelect,
  onSearchSubmit,
}) {
  const [searchInput, setSearchInput] = useState("");

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

  const getLevel = (c) => {
    const levels = {
      js: "Beginner",
      py: "Beginner",
      html: "Beginner",
      css: "Beginner",
      c: "Beginner",
      java: "Intermediate",
      cpp: "Intermediate",
      sql: "Intermediate",
      git: "Beginner",
      react: "Intermediate",
      node: "Intermediate",
      dsa: "Advanced",
      linux: "Beginner",
      ts: "Intermediate",
      django: "Intermediate",
      flutter: "Intermediate",
    };
    return levels[c.id] || "Beginner";
  };

  const categories = [...new Set(courses.map((c) => c.cat))];
  const totalLessons = courses.reduce((acc, c) => acc + c.v.length, 0);

  const baseName = (name) => name.replace(/\s*\(.*?\)/g, "").trim();
  const creatorNames = [...new Set(courses.map((c) => baseName(c.by)))];
  const creators = creatorNames
    .map((name) => ({
      name,
      list: courses.filter((c) => baseName(c.by) === name),
    }))
    .sort((a, b) => b.list.length - a.list.length);

  const getLastWatchedCourse = () => {
    let best = null;
    let bestDone = 0;
    courses.forEach((c) => {
      const doneCount = userProgress[c.id] || 0;
      if (doneCount > 0 && doneCount < c.v.length && doneCount > bestDone) {
        bestDone = doneCount;
        best = c;
      }
    });
    return best;
  };

  const lastWatched = getLastWatchedCourse();

  const handleSearchClick = () => {
    if (onSearchSubmit) {
      onSearchSubmit(searchInput);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSearchClick();
    }
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("");
  };

  return (
    <div className="space-y-10">
      <section className="grid grid-cols-1 items-center gap-9 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#22224c] bg-[#11112b] px-3.5 py-1.5 text-xs font-bold text-[#947bff]">
            🚀 {Object.keys(usersData).length} Enrolled Students •{" "}
            {courses.length} Real-World Courses
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-[#f1f0fc] sm:text-5xl md:leading-[1.1]">
            Learn skills.
            <br />
            Build your future.
          </h1>
          <p className="max-w-xl text-base text-[#9492bf]">
            Free interactive video courses with live quizzes. Pass quizzes to
            earn XP, unlock subsequent lectures, and climb the class
            leaderboard.
          </p>

          <div className="flex max-w-xl flex-wrap items-center gap-2 pt-2">
            <input
              type="text"
              placeholder="What do you want to learn today?"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 min-w-[200px] rounded-xl border border-[#22224c] bg-[#0c0c24] px-4 py-2.5 text-sm text-[#f1f0fc] placeholder-[#9492bf] outline-none focus:border-[#947bff] focus:ring-2 focus:ring-[#7c5cff]/25"
            />
            <button
              onClick={handleSearchClick}
              className="rounded-xl bg-[#7c5cff] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#7c5cff]/25 hover:bg-[#947bff]"
            >
              Search
            </button>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-3xl border border-[rgba(124,92,255,0.35)] bg-gradient-to-br from-[rgba(124,92,255,0.15)] to-[rgba(47,209,139,0.05)] p-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#22224c] pb-3">
            <div className="font-bold text-base text-[#f1f0fc]">
              ⚡ Live Learning Portal
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,184,0,0.3)] bg-[rgba(255,184,0,0.15)] px-3 py-1 text-xs font-bold text-[#ffb800]">
              Class Active
            </span>
          </div>

          <pre className="my-4 overflow-x-auto rounded-xl bg-[#0c0c24] p-3.5 text-xs text-[#947bff]">
            <code>{`const student = "${usersData[currentUser]?.name || "Student"}";
await student.watchLesson();
if (await student.passQuiz()) {
  unlockNextLesson(); // +50 XP
}`}</code>
          </pre>

          <div className="grid grid-cols-3 gap-3 border-t border-[#22224c] pt-4">
            <div>
              <b className="block text-xl font-extrabold text-[#f1f0fc]">
                {Object.keys(usersData).length}
              </b>
              <span className="text-xs text-[#9492bf]">Classmates</span>
            </div>
            <div>
              <b className="block text-xl font-extrabold text-[#f1f0fc]">
                {courses.length}
              </b>
              <span className="text-xs text-[#9492bf]">Courses</span>
            </div>
            <div>
              <b className="block text-xl font-extrabold text-[#f1f0fc]">60%</b>
              <span className="text-xs text-[#9492bf]">Pass Mark</span>
            </div>
          </div>
        </div>
      </section>

      {lastWatched && (
        <div
          onClick={() => onSelectCourse(lastWatched.id)}
          className="flex cursor-pointer items-center gap-4.5 rounded-2xl border border-[rgba(124,92,255,0.4)] bg-gradient-to-r from-[rgba(124,92,255,0.15)] to-[rgba(47,209,139,0.05)] p-5 shadow-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-[#7c5cff]"
        >
          <div
            className="flex h-15 w-15 flex-none items-center justify-center rounded-xl text-2xl font-extrabold"
            style={{
              backgroundColor: `${colorList[lastWatched.c % colorList.length]}22`,
              color: colorList[lastWatched.c % colorList.length],
            }}
          >
            {lastWatched.ic}
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="text-[11px] font-bold uppercase tracking-widest text-[#9492bf]">
              ▶ Continue where you left off
            </div>
            <b className="block truncate text-base font-bold text-[#f1f0fc]">
              {lastWatched.t}
            </b>
            <div className="text-xs text-[#9492bf]">
              Lesson {(userProgress[lastWatched.id] || 0) + 1} of{" "}
              {lastWatched.v.length} ·{" "}
              {Math.round(
                ((userProgress[lastWatched.id] || 0) / lastWatched.v.length) *
                  100,
              )}
              % complete
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-[#22224c] overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#7c5cff] to-[#947bff]"
                style={{
                  width: `${Math.round(((userProgress[lastWatched.id] || 0) / lastWatched.v.length) * 100)}%`,
                }}
              />
            </div>
          </div>

          <button className="whitespace-nowrap rounded-xl bg-[#7c5cff] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#7c5cff]/25 hover:bg-[#947bff]">
            Continue →
          </button>
        </div>
      )}

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3.5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#f1f0fc]">
              Popular categories
            </h2>
            <div className="text-xs text-[#9492bf]">
              Pick a topic and start learning
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategorySelect(cat)}
              className="flex flex-col items-start gap-1 rounded-xl border border-[#22224c] bg-[#11112b] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#7c5cff]"
            >
              <b className="text-sm text-[#f1f0fc]">{cat}</b>
              <span className="text-xs text-[#9492bf]">
                {courses.filter((c) => c.cat === cat).length} courses
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3.5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#f1f0fc]">
              Featured courses
            </h2>
            <div className="text-xs text-[#9492bf]">
              {courses.length} courses · {totalLessons} lessons · quizzes after
              every lesson
            </div>
          </div>

          <button
            onClick={() => onCategorySelect("All")}
            className="rounded-xl border border-[#22224c] bg-transparent px-4 py-2 text-xs font-semibold text-[#f1f0fc] hover:border-[#7c5cff] hover:bg-[#17173a]"
          >
            View all courses →
          </button>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {courses.slice(0, 8).map((c) => {
            const doneCount = userProgress[c.id] || 0;
            const progressPercent = Math.round((doneCount / c.v.length) * 100);
            const isCompleted = doneCount >= c.v.length;
            const themeColor = colorList[c.c % colorList.length];

            return (
              <div
                key={c.id}
                onClick={() => onSelectCourse(c.id)}
                className="group cursor-pointer overflow-hidden rounded-2xl border border-[#22224c] bg-[#11112b] shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-[#7c5cff]"
              >
                <div
                  className="relative flex h-[130px] items-center justify-center font-extrabold text-4xl"
                  style={{
                    backgroundColor: `${themeColor}22`,
                    color: themeColor,
                  }}
                >
                  {c.ic}
                  {isCompleted && (
                    <span className="absolute top-2.5 right-2.5 rounded-full bg-[#2fd18b] px-2.5 py-0.5 text-[11px] font-extrabold text-[#06281b] tracking-wider">
                      ✓ DONE
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-1.5">
                  <h3 className="font-bold text-base text-[#f1f0fc] line-clamp-1 group-hover:text-[#947bff]">
                    {c.t}
                  </h3>
                  <div className="text-xs text-[#9492bf]">
                    {c.by} · {getLevel(c)}
                  </div>

                  <div className="mt-3 h-1.5 w-full rounded-full bg-[#22224c] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#7c5cff] to-[#947bff] transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="text-[12px] text-[#9492bf]">
                    {isCompleted
                      ? "✅ Completed!"
                      : `${progressPercent}% complete · ${c.v.length - doneCount} left`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-end justify-between gap-3 mb-3.5">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#f1f0fc]">
              Meet our creators
            </h2>
            <div className="text-xs text-[#9492bf]">
              Learn from {creators.length} creators whose videos power SkillHub
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {creators.map((x, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-[#22224c] bg-[#11112b] p-4.5 shadow-xl transition-all duration-200 hover:-translate-y-1 hover:border-[#7c5cff] space-y-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-12 w-12 flex-none items-center justify-center rounded-xl font-extrabold text-white text-base shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${colorList[idx % colorList.length]}, #7c5cff)`,
                  }}
                >
                  {getInitials(x.name)}
                </span>
                <div>
                  <b className="block text-sm text-[#f1f0fc]">{x.name}</b>
                  <div className="text-xs text-[#9492bf]">
                    {x.list.length} course{x.list.length > 1 ? "s" : ""} on
                    SkillHub
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {x.list.slice(0, 3).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => onSelectCourse(c.id)}
                    className="rounded-full border border-[#22224c] bg-[#0c0c24] px-2.5 py-1 text-left text-xs font-semibold text-[#f1f0fc] hover:border-[#7c5cff] hover:bg-[rgba(124,92,255,0.2)]"
                  >
                    {c.t}
                  </button>
                ))}
                {x.list.length > 3 && (
                  <span className="self-center text-xs text-[#9492bf]">
                    +{x.list.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-gradient-to-r from-[#37288f] to-[#6d4aff] p-8 text-white shadow-xl shadow-[#7c5cff]/25">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Climb the Class Leaderboard!
          </h2>
          <div className="text-sm text-white/85">
            Watch lessons, submit quizzes, and compete with{" "}
            {Object.keys(usersData).length - 1} fellow classmates.
          </div>
        </div>

        <button
          onClick={() => onNavigate("leaderboard")}
          className="rounded-xl bg-white px-5 py-2.5 text-sm font-bold text-[#37288f] shadow-md hover:bg-white/90"
        >
          View Leaderboard 🏆
        </button>
      </div>

      <footer className="border-t border-[#22224c] pt-6 text-xs text-[#9492bf]">
        © 2026 SkillHub LMS. Designed for interactive learning.
      </footer>
    </div>
  );
}
