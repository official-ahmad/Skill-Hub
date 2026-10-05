import React, { useState } from "react";

export default function MyLearning({
  courses,
  usersData,
  currentUser,
  userProgress,
  onSelectCourse,
  onNavigate,
}) {
  const [activeSection, setActiveSection] = useState("Overview");

  const inProgressCourses = courses.filter((c) => {
    const doneCount = userProgress[c.id] || 0;
    return doneCount > 0 && doneCount < c.v.length;
  });

  const completedCourses = courses.filter((c) => {
    const doneCount = userProgress[c.id] || 0;
    return doneCount >= c.v.length;
  });

  const totalPassedVideos = courses.reduce(
    (acc, c) => acc + (userProgress[c.id] || 0),
    0,
  );
  const totalXP = totalPassedVideos * 50;

  const renderCourseRow = (c) => {
    const doneCount = userProgress[c.id] || 0;
    const isDone = doneCount >= c.v.length;

    return (
      <div
        key={c.id}
        className="flex flex-wrap items-center justify-between gap-3.5 rounded-xl border border-[#22224c] bg-[#11112b] p-4.5"
      >
        <b className="text-sm font-bold text-[#f1f0fc]">{c.t}</b>
        <span className="text-xs text-[#9492bf]">
          {doneCount}/{c.v.length} videos
        </span>
        <button
          onClick={() => onSelectCourse(c.id)}
          className="rounded-xl bg-[#7c5cff] px-4 py-2 text-xs font-semibold text-white shadow-md shadow-[#7c5cff]/25 hover:bg-[#947bff]"
        >
          {isDone ? "Review" : "Continue"}
        </button>
      </div>
    );
  };

  const renderEmptyMessage = (msg) => (
    <p className="py-4 text-xs text-[#9492bf]">{msg}</p>
  );

  const renderSectionContent = () => {
    if (activeSection === "Overview") {
      return (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#f1f0fc] md:text-3xl">
              Welcome back, {usersData[currentUser]?.name || currentUser}
            </h1>
            <div className="mt-1 text-sm text-[#9492bf]">
              Keep up the momentum. Every quiz passed earns you XP!
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-5 shadow-xl space-y-1">
              <span className="text-xs text-[#9492bf]">XP Earned</span>
              <b className="block text-2xl font-extrabold text-[#ffb800]">
                ⚡ {totalXP} XP
              </b>
            </div>
            <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-5 shadow-xl space-y-1">
              <span className="text-xs text-[#9492bf]">In progress</span>
              <b className="block text-2xl font-extrabold text-[#f1f0fc]">
                {inProgressCourses.length}
              </b>
            </div>
            <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-5 shadow-xl space-y-1">
              <span className="text-xs text-[#9492bf]">Videos passed</span>
              <b className="block text-2xl font-extrabold text-[#f1f0fc]">
                {totalPassedVideos}
              </b>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <h2 className="text-xl font-bold tracking-tight text-[#f1f0fc]">
              Continue learning
            </h2>
            {inProgressCourses.length > 0
              ? inProgressCourses.map(renderCourseRow)
              : renderEmptyMessage(
                  "Nothing in progress yet. Open Courses and start one.",
                )}
          </div>
        </div>
      );
    }

    if (activeSection === "In progress") {
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#f1f0fc] md:text-3xl">
            In progress
          </h1>
          {inProgressCourses.length > 0
            ? inProgressCourses.map(renderCourseRow)
            : renderEmptyMessage("No courses in progress.")}
        </div>
      );
    }

    if (activeSection === "Completed") {
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#f1f0fc] md:text-3xl">
            Completed
          </h1>
          {completedCourses.length > 0
            ? completedCourses.map(renderCourseRow)
            : renderEmptyMessage("No completed courses yet.")}
        </div>
      );
    }

    if (activeSection === "Profile") {
      return (
        <div className="space-y-4">
          <h1 className="text-2xl font-extrabold tracking-tight text-[#f1f0fc] md:text-3xl">
            Profile
          </h1>
          <div className="max-w-sm rounded-2xl border border-[#22224c] bg-[#11112b] p-5 shadow-xl space-y-1.5">
            <b className="block text-lg font-bold text-[#f1f0fc]">
              {usersData[currentUser]?.name || currentUser}
            </b>
            <div className="text-xs text-[#9492bf]">
              Student ID: {currentUser}
            </div>
            <div className="text-xs text-[#9492bf]">
              Total XP: ⚡ {totalXP} XP
            </div>
            <div className="text-xs text-[#9492bf]">
              Videos passed: {totalPassedVideos}
            </div>
          </div>
          <button
            onClick={() => onNavigate("profile")}
            className="rounded-xl bg-[#7c5cff] px-4.5 py-2.5 text-xs font-semibold text-white shadow-lg shadow-[#7c5cff]/25 hover:bg-[#947bff]"
          >
            View Full Profile →
          </button>
        </div>
      );
    }

    return null;
  };

  const sections = ["Overview", "In progress", "Completed", "Profile"];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_1fr]">
      <aside className="h-fit rounded-2xl border border-[#22224c] bg-[#11112b] p-2.5 shadow-xl space-y-1">
        {sections.map((sec) => (
          <div
            key={sec}
            onClick={() => setActiveSection(sec)}
            className={`cursor-pointer rounded-xl p-3 text-sm font-medium transition-all ${
              activeSection === sec
                ? "bg-[rgba(124,92,255,0.16)] font-bold text-[#947bff]"
                : "text-[#f1f0fc] hover:bg-[#17173a]"
            }`}
          >
            {sec}
          </div>
        ))}
      </aside>

      <div>{renderSectionContent()}</div>
    </div>
  );
}
