import React, { useState } from "react";

export default function CourseDetail({
  course,
  courses = [],
  userProgress = {},
  onBack,
  onStartCourse,
}) {
  const [activeTab, setActiveTab] = useState("Overview");

  if (!course) {
    return (
      <div className="p-8 text-center text-[#f1f0fc]">
        <p>Course details load nahi ho pa rahe hain.</p>
        <button
          onClick={onBack}
          className="mt-4 rounded-xl border border-[#22224c] bg-transparent px-4 py-2 text-sm text-[#f1f0fc]"
        >
          ← Back to courses
        </button>
      </div>
    );
  }

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

  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("");
  };

  const doneCount = userProgress[course.id] || 0;
  const totalLessons = course.v ? course.v.length : 0;
  const progressPercent =
    totalLessons > 0 ? Math.round((doneCount / totalLessons) * 100) : 0;
  const themeColor = colorList[course.c % colorList.length];

  const renderTabContent = () => {
    if (activeTab === "Overview") {
      return (
        <div className="space-y-3 text-sm text-[#9492bf]">
          <p>
            Learn{" "}
            <span className="font-semibold text-[#f1f0fc]">{course.t}</span>{" "}
            step by step. Watch each video, then pass an interactive quiz (60%
            to pass) to unlock the next lesson and earn +50 XP.
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>
              {totalLessons} video lessons and {totalLessons} quizzes
            </li>
            <li>Level: {getLevel(course)}</li>
            <li>Category: {course.cat}</li>
          </ul>
        </div>
      );
    }

    if (activeTab === "Course content") {
      return (
        <div className="max-w-2xl rounded-xl border border-[#22224c] bg-[#11112b] p-2.5">
          {course.v &&
            course.v.map((item, idx) => {
              const isDone = idx < doneCount;
              const isLocked = idx > doneCount;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2.5 rounded-lg p-2.5 text-sm font-medium ${
                    isDone
                      ? "text-[#f1f0fc]"
                      : isLocked
                        ? "opacity-45"
                        : "text-[#f1f0fc]"
                  }`}
                >
                  <span className="flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 border-[#22224c] text-[11px]">
                    {isDone ? "✓" : isLocked ? "🔒" : ""}
                  </span>
                  <span className="flex-1">
                    {idx + 1}. {item[0]}
                  </span>
                  <span className="ml-auto text-xs text-[#9492bf]">
                    {item[2] && item[2].length
                      ? `${item[2].length} questions`
                      : "No quiz"}
                  </span>
                </div>
              );
            })}
        </div>
      );
    }

    if (activeTab === "Instructor") {
      const instructorCourses = courses.filter(
        (k) => k.by === course.by,
      ).length;

      return (
        <div className="flex flex-col items-start gap-1.5 rounded-xl border border-[#22224c] bg-[#11112b] p-4 min-w-[140px] max-w-xs">
          <span className="flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff] to-[#947bff] text-base font-bold text-white shadow-lg shadow-[#7c5cff]/25">
            {getInitials(course.by)}
          </span>
          <b className="text-[#f1f0fc]">{course.by}</b>
          <span className="text-xs text-[#9492bf]">
            {instructorCourses} course(s) on SkillHub
          </span>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="rounded-xl border border-[#22224c] bg-transparent px-4 py-2 text-sm font-semibold text-[#f1f0fc] hover:border-[#7c5cff] hover:bg-[#17173a]"
      >
        ← Back to courses
      </button>

      <div className="flex flex-wrap items-center gap-6 mt-4.5">
        <div
          className="flex h-[120px] w-[140px] items-center justify-center rounded-2xl font-extrabold text-4xl"
          style={{
            backgroundColor: `${themeColor}22`,
            color: themeColor,
          }}
        >
          {course.ic}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#f1f0fc] md:text-3xl">
            {course.t}
          </h1>
          <div className="text-sm text-[#9492bf]">
            {course.by} · {getLevel(course)} · {totalLessons} lessons
          </div>

          <div className="h-1.5 w-65 rounded-full bg-[#22224c] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7c5cff] to-[#947bff] transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="text-xs text-[#9492bf]">
            {doneCount}/{totalLessons} completed
          </div>

          <button
            onClick={() => onStartCourse(course.id)}
            className="mt-3 inline-flex items-center justify-center rounded-xl bg-[#7c5cff] px-4.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#7c5cff]/25 transition-all hover:bg-[#947bff] hover:-translate-y-0.5 active:translate-y-0"
          >
            {doneCount === 0
              ? "Start learning"
              : doneCount >= totalLessons
                ? "Review course"
                : "Continue learning"}
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b border-[#22224c] my-5">
        {["Overview", "Course content", "Instructor"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-none bg-transparent px-4 py-2.5 text-sm font-medium transition-all border-b-2 shadow-none ${
              activeTab === tab
                ? "border-[#7c5cff] font-bold text-[#f1f0fc]"
                : "border-transparent text-[#9492bf] hover:text-[#f1f0fc]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div>{renderTabContent()}</div>
    </div>
  );
}
