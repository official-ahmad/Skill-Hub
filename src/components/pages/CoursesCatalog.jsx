import React from "react";

export default function CoursesCatalog({
  courses,
  userProgress,
  searchQuery,
  selectedCategory,
  selectedLevel,
  selectedSort,
  onCategoryChange,
  onLevelChange,
  onSortChange,
  onSelectCourse,
}) {
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

  const categories = ["All", ...new Set(courses.map((c) => c.cat))];

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

  const filteredCourses = courses.filter((c) => {
    const matchesCategory =
      selectedCategory === "All" || c.cat === selectedCategory;
    const matchesLevel =
      selectedLevel === "All" || getLevel(c) === selectedLevel;
    const matchesSearch = c.t.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesLevel && matchesSearch;
  });

  if (selectedSort === "A-Z") {
    filteredCourses.sort((a, b) => a.t.localeCompare(b.t));
  } else if (selectedSort === "Progress") {
    filteredCourses.sort((a, b) => {
      const aProgress = (userProgress[a.id] || 0) / a.v.length;
      const bProgress = (userProgress[b.id] || 0) / b.v.length;
      return bProgress - aProgress;
    });
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#f1f0fc] md:text-3xl">
          All courses
        </h1>
        <div className="mt-1 text-sm text-[#9492bf]">
          Explore all {courses.length} courses. Pass each quiz to unlock the
          next video and earn XP.
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <select
          value={selectedLevel}
          onChange={(e) => onLevelChange(e.target.value)}
          className="w-auto rounded-xl border border-[#22224c] bg-[#0c0c24] px-3.5 py-2 text-xs font-semibold text-[#f1f0fc] outline-none focus:border-[#947bff]"
        >
          <option value="All">All levels</option>
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>

        <select
          value={selectedSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="w-auto rounded-xl border border-[#22224c] bg-[#0c0c24] px-3.5 py-2 text-xs font-semibold text-[#f1f0fc] outline-none focus:border-[#947bff]"
        >
          <option value="Default">Sort: Default</option>
          <option value="A-Z">Sort: A-Z</option>
          <option value="Progress">Sort: Progress</option>
        </select>

        {categories.map((cat) => {
          const isActive = cat === selectedCategory;
          return (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-all ${
                isActive
                  ? "border-[#7c5cff] bg-[#7c5cff] text-white shadow-md shadow-[#7c5cff]/25"
                  : "border-[#22224c] bg-[#11112b] text-[#9492bf] hover:border-[#7c5cff] hover:bg-[#17173a] hover:text-[#f1f0fc]"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {filteredCourses.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#9492bf]">
          No course matches your search or filter criteria.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCourses.map((c) => {
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
                    {c.by} · {c.v.length} lessons · {getLevel(c)}
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
                      : `${progressPercent}% complete`}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
