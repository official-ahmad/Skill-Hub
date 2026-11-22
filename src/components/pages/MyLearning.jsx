import { useState } from "react";
import { ArrowRight, CircleUserRound } from "lucide-react";

export default function MyLearning({
  courses,
  usersData = {},
  currentUser,
  userProgress,
  onSelectCourse,
  onNavigate,
}) {
  const [section, setSection] = useState("Overview");
  const inProgress = courses.filter((course) => {
    const lessonCount = Number(course.lessonCount || course.v.length || 0);
    const done = userProgress[course.id] || 0;
    return done > 0 && done < lessonCount;
  });
  const completed = courses.filter((course) => {
    const lessonCount = Number(course.lessonCount || course.v.length || 0);
    return lessonCount > 0 && (userProgress[course.id] || 0) >= lessonCount;
  });
  const passed = Object.values(userProgress || {}).reduce(
    (sum, count) => sum + Number(count || 0),
    0,
  );
  const xp = passed * 50;
  const renderCourse = (course) => {
    const lessonCount = Number(course.lessonCount || course.v.length || 0);
    const done = userProgress[course.id] || 0;
    return (
      <article
        key={course.id}
        className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="min-w-0">
          <strong className="block truncate">{course.t}</strong>
          <span className="text-xs tabular-nums text-slate-500">
            {done} / {lessonCount} lessons
          </span>
        </div>
        <button
          className="flex shrink-0 items-center gap-2 text-sm font-medium text-indigo-600"
          onClick={() => onSelectCourse(course.id)}
        >
          {done >= lessonCount ? "Review" : "Continue"}
          <ArrowRight size={16} />
        </button>
      </article>
    );
  };

  return (
    <div className="grid gap-5 md:grid-cols-[190px_minmax(0,1fr)]">
      <nav className="grid content-start gap-1 rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
        {["Overview", "In progress", "Completed", "Profile"].map((item) => (
          <button
            key={item}
            className={`min-h-10 rounded-xl px-3 text-left text-sm ${
              item === section
                ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
            onClick={() => setSection(item)}
          >
            {item}
          </button>
        ))}
      </nav>
      <section className="min-w-0 space-y-5">
        {section === "Overview" && (
          <>
            <header>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
                My learning
              </p>
              <h1 className="mt-2 text-3xl font-bold">Course activity</h1>
            </header>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "XP earned", value: xp },
                { label: "In progress", value: inProgress.length },
                { label: "Lessons passed", value: passed },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-slate-200 bg-white p-4 text-center dark:border-slate-800 dark:bg-slate-900"
                >
                  <strong className="block text-xl tabular-nums">
                    {item.value}
                  </strong>
                  <small className="text-slate-500">{item.label}</small>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h2 className="font-semibold">In progress</h2>
              {inProgress.length ? (
                inProgress.map(renderCourse)
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-slate-500 dark:border-slate-700">
                  No courses in progress.
                </p>
              )}
            </div>
          </>
        )}
        {section === "In progress" && (
          <div className="space-y-3">
            <h1 className="text-2xl font-bold">In progress</h1>
            {inProgress.length ? (
              inProgress.map(renderCourse)
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-slate-500">
                No courses in progress.
              </p>
            )}
          </div>
        )}
        {section === "Completed" && (
          <div className="space-y-3">
            <h1 className="text-2xl font-bold">Completed courses</h1>
            {completed.length ? (
              completed.map(renderCourse)
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-slate-500">
                No completed courses.
              </p>
            )}
          </div>
        )}
        {section === "Profile" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <CircleUserRound size={24} className="text-indigo-600" />
            <strong className="mt-3 block">
              {usersData[currentUser]?.name || "Student"}
            </strong>
            <p className="text-sm text-slate-500">
              {xp} XP · {passed} lessons passed
            </p>
            <button
              className="mt-4 flex items-center gap-2 text-sm font-medium text-indigo-600"
              onClick={() => onNavigate("profile")}
            >
              Open profile <ArrowRight size={16} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
