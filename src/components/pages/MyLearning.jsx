import { useState } from "react";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  LayoutDashboard,
  PlayCircle,
  Trophy,
  UserRound,
  Zap,
} from "lucide-react";
import { getLessonCount } from "../../utils/courseUtils";

const card =
  "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900";

const toneClasses = {
  amber: "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
  indigo:
    "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
  emerald:
    "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
};

export default function MyLearning({
  courses,
  usersData = {},
  currentUser,
  userProfile,
  userProgress,
  onSelectCourse,
  onNavigate,
}) {
  const [section, setSection] = useState("Overview");
  const progress = userProgress || {};

  const lessonCountOf = getLessonCount;

  const inProgress = courses.filter((course) => {
    const done = progress[course.id] || 0;
    return done > 0 && done < lessonCountOf(course);
  });
  const completed = courses.filter((course) => {
    const count = lessonCountOf(course);
    return count > 0 && (progress[course.id] || 0) >= count;
  });
  const passed = Object.values(progress).reduce(
    (sum, count) => sum + Number(count || 0),
    0,
  );
  const xp = passed * 50;
  const name = userProfile?.name || usersData[currentUser]?.name || "";
  const avatar = userProfile?.avatar || usersData[currentUser]?.avatar || "";
  const firstName = name.split(" ")[0];

  // Course the student is furthest along in, for the "pick up where you left off" card
  const featured = [...inProgress].sort(
    (a, b) =>
      (progress[b.id] || 0) / lessonCountOf(b) -
      (progress[a.id] || 0) / lessonCountOf(a),
  )[0];

  const navItems = [
    { id: "Overview", label: "Overview", icon: LayoutDashboard },
    {
      id: "In progress",
      label: "In progress",
      icon: PlayCircle,
      count: inProgress.length,
    },
    {
      id: "Completed",
      label: "Completed",
      icon: CheckCircle2,
      count: completed.length,
    },
    { id: "Profile", label: "Profile", icon: UserRound },
  ];

  const stats = [
    { label: "XP earned", value: xp, icon: Zap, tone: "amber" },
    {
      label: "In progress",
      value: inProgress.length,
      icon: PlayCircle,
      tone: "indigo",
    },
    {
      label: "Completed",
      value: completed.length,
      icon: Trophy,
      tone: "emerald",
    },
    { label: "Lessons passed", value: passed, icon: BookOpen, tone: "sky" },
  ];

  const renderCourse = (course) => {
    const lessonCount = lessonCountOf(course);
    const done = progress[course.id] || 0;
    const percent = lessonCount
      ? Math.min(100, Math.round((done / lessonCount) * 100))
      : 0;
    const isComplete = lessonCount > 0 && done >= lessonCount;

    return (
      <article
        key={course.id}
        className={`${card} grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-3 p-4 sm:grid-cols-[minmax(0,1fr)_minmax(120px,200px)_auto] sm:px-5`}
      >
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{course.t}</h3>
          <p className="mt-0.5 text-xs tabular-nums text-slate-500 dark:text-slate-400">
            {done} / {lessonCount} lessons · {percent}%
          </p>
        </div>

        <div
          className="order-last col-span-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 sm:order-none sm:col-span-1"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isComplete ? "bg-emerald-500" : "bg-indigo-600 dark:bg-indigo-400"
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>

        <button
          className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
          onClick={() => onSelectCourse(course.id)}
        >
          {isComplete ? "Review" : "Continue"}
          <ArrowRight size={15} />
        </button>
      </article>
    );
  };

  const emptyState = (message, cta) => (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 px-6 py-12 text-center dark:border-slate-700">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
        <BookOpen size={22} />
      </span>
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        {message}
      </p>
      {cta && (
        <button
          className="button-primary mt-4 h-10 rounded-xl px-4 text-sm font-semibold"
          onClick={() => onNavigate("courses")}
        >
          Browse courses
        </button>
      )}
    </div>
  );

  const list = (items, message, cta) =>
    items.length ? (
      <div className="space-y-3">{items.map(renderCourse)}</div>
    ) : (
      emptyState(message, cta)
    );

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-6 md:grid-cols-[220px_minmax(0,1fr)] md:items-start">
      {/* Navigation */}
      <nav
        aria-label="My learning sections"
        className={`${card} -mx-1 flex gap-1 overflow-x-auto p-2 md:mx-0 md:sticky md:top-6 md:grid md:content-start md:overflow-visible`}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.id === section;
          return (
            <button
              key={item.id}
              aria-current={active ? "page" : undefined}
              className={`flex h-10 shrink-0 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                active
                  ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                  : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
              onClick={() => setSection(item.id)}
            >
              <Icon size={17} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count > 0 && (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs tabular-nums ${
                    active
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Content */}
      <section className="min-w-0 space-y-6">
        {section === "Overview" && (
          <>
            <header>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome back, {firstName}
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Here’s a summary of your learning activity.
              </p>
            </header>

            <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
              {stats.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className={`${card} p-4`}>
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-xl ${
                        toneClasses[item.tone]
                      }`}
                    >
                      <Icon size={18} />
                    </span>
                    <strong className="mt-3 block text-2xl font-bold tabular-nums">
                      {item.value}
                    </strong>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {featured && (
              <div className="flex flex-col gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-indigo-500 p-5 text-white shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
                <div className="min-w-0">
                  <p className="text-sm text-indigo-100">
                    Pick up where you left off
                  </p>
                  <h2 className="mt-1 truncate text-lg font-semibold sm:text-xl">
                    {featured.t}
                  </h2>
                  <p className="mt-1 text-sm tabular-nums text-indigo-100">
                    {progress[featured.id] || 0} of {lessonCountOf(featured)}{" "}
                    lessons done
                  </p>
                </div>
                {/* <button
                  className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-600"
                  onClick={() => onSelectCourse(featured.id)}
                >
                  Continue course
                  <ArrowRight size={16} />
                </button> */}
               
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">In progress</h2>
                {inProgress.length > 0 && (
                  <button
                    className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
                    onClick={() => setSection("In progress")}
                  >
                    View all
                  </button>
                )}
              </div>
              {list(
                inProgress.slice(0, 4),
                "No courses in progress yet.",
                true,
              )}
            </div>

            {completed.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Recently completed</h2>
                  <button
                    className="text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-300"
                    onClick={() => setSection("Completed")}
                  >
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {completed.slice(0, 2).map(renderCourse)}
                </div>
              </div>
            )}
          </>
        )}

        {section === "In progress" && (
          <>
            <header>
              <h1 className="text-2xl font-bold tracking-tight">In progress</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {inProgress.length}{" "}
                {inProgress.length === 1 ? "course" : "courses"} underway.
              </p>
            </header>
            {list(inProgress, "No courses in progress yet.", true)}
          </>
        )}

        {section === "Completed" && (
          <>
            <header>
              <h1 className="text-2xl font-bold tracking-tight">
                Completed courses
              </h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {completed.length}{" "}
                {completed.length === 1 ? "course" : "courses"} finished.
              </p>
            </header>
            {list(completed, "You haven’t completed a course yet.", true)}
          </>
        )}

        {section === "Profile" && (
          <>
            <header>
              <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                A snapshot of your account and results.
              </p>
            </header>
            <div className={`${card} p-5 sm:p-6`}>
              <div className="flex items-center gap-4">
                {avatar ? (
                  <img
                    className="h-16 w-16 shrink-0 rounded-2xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    src={avatar}
                    alt={`${name} profile`}
                  />
                ) : (
                  <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-indigo-100 text-2xl font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                    {name ? name.charAt(0).toUpperCase() : ""}
                  </span>
                )}
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold">
                    {name || "Loading profile"}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Air University student
                  </p>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-100 text-center dark:divide-slate-800 dark:border-slate-800">
                {[
                  { label: "XP", value: xp },
                  { label: "Lessons passed", value: passed },
                  { label: "Courses completed", value: completed.length },
                ].map((item) => (
                  <div key={item.label} className="px-2 py-4">
                    <dd className="text-xl font-bold tabular-nums">
                      {item.value}
                    </dd>
                    <dt className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {item.label}
                    </dt>
                  </div>
                ))}
              </dl>

              <button
                className="button-primary mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl px-5 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900"
                onClick={() => onNavigate("profile")}
              >
                Open full profile
                <ArrowRight size={16} />
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
