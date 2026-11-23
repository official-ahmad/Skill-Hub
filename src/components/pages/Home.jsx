import { useState } from "react";
import {
  ArrowRight,
  Check,
  LayoutGrid,
  List,
  Search,
  Trophy,
} from "lucide-react";
import CourseIcon from "../CourseIcon";

/* ---------- shared tokens ---------- */

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-teal-400 dark:focus-visible:ring-offset-zinc-950";

const card =
  "rounded-2xl border border-zinc-950/10 bg-white dark:border-white/10 dark:bg-zinc-900";

const interactive = `${card} text-left transition-colors duration-150 ease-out hover:border-zinc-950/25 hover:bg-zinc-50 active:scale-[0.99] dark:hover:border-white/25 dark:hover:bg-zinc-800/60 ${focusRing}`;

const plural = (n, word) => `${n} ${word}${n === 1 ? "" : "s"}`;
const lessonsOf = (course) =>
  Number(course.lessonCount || course.v?.length || 0);

/* Column template shared by the list header and every list row so they align */
const LIST_COLS =
  "md:grid md:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_80px_minmax(0,1.2fr)_128px] md:items-center md:gap-6";

/* ---------- small building blocks ---------- */

function IconTile({ course, size = "md" }) {
  const box = size === "lg" ? "h-14 w-14 rounded-xl" : "h-11 w-11 rounded-lg";
  return (
    <span
      className={`grid shrink-0 place-items-center overflow-hidden bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 [&_img]:h-7 [&_img]:w-7 [&_img]:object-contain [&_svg]:h-6 [&_svg]:w-6 ${box}`}
    >
      <CourseIcon course={course} />
    </span>
  );
}

function ProgressBar({ percent }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800"
    >
      <div
        className="h-full rounded-full bg-teal-700 transition-[width] duration-300 ease-out dark:bg-teal-400"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function Status({ done, total }) {
  if (total > 0 && done >= total)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-teal-700 dark:text-teal-400">
        <Check size={14} strokeWidth={1.5} />
        Completed
      </span>
    );
  if (done > 0)
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-zinc-900 dark:text-zinc-50">
        <span className="h-1.5 w-1.5 rounded-full bg-teal-700 dark:bg-teal-400" />
        In progress
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
      <span className="h-1.5 w-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
      Not started
    </span>
  );
}

function StatCell({ label, value, className = "" }) {
  return (
    <div className={`bg-white p-5 dark:bg-zinc-900 ${className}`}>
      <dt className="text-sm text-zinc-500 dark:text-zinc-400">{label}</dt>
      <dd className="mt-1 text-2xl font-medium tabular-nums tracking-tight text-zinc-900 dark:text-zinc-50">
        {value}
      </dd>
    </div>
  );
}

/* ---------- course views ---------- */

function CourseCard({ course, done, onSelect }) {
  const total = lessonsOf(course);
  const percent = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`${interactive} flex h-full flex-col p-5`}
    >
      <span className="flex h-11 items-center justify-between gap-3">
        <IconTile course={course} />
        <Status done={done} total={total} />
      </span>

      <span className="mt-5 block truncate text-sm text-zinc-500 dark:text-zinc-400">
        {course.cat}
      </span>
      <span className="mt-1 line-clamp-2 flex-1 text-base font-medium leading-6 text-zinc-900 dark:text-zinc-50">
        {course.t}
      </span>

      <span className="mt-5 block border-t border-zinc-950/10 pt-4 dark:border-white/10">
        <ProgressBar percent={percent} />
        <span className="mt-3 flex items-center justify-between gap-3 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
          <span>
            {done} of {plural(total, "lesson")}
          </span>
          <span>{percent}%</span>
        </span>
      </span>
    </button>
  );
}

function CourseRow({ course, done, onSelect }) {
  const total = lessonsOf(course);
  const percent = total ? Math.min(100, Math.round((done / total) * 100)) : 0;
  return (
    <li>
      <button
        type="button"
        onClick={onSelect}
        className={`block w-full px-5 py-4 text-left transition-colors duration-150 ease-out hover:bg-zinc-50 dark:hover:bg-white/5 ${focusRing} focus-visible:ring-inset ${LIST_COLS}`}
      >
        <span className="flex min-w-0 items-center gap-4">
          <IconTile course={course} />
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-zinc-900 dark:text-zinc-50">
              {course.t}
            </span>
            <span className="mt-0.5 block truncate text-xs text-zinc-500 dark:text-zinc-400 md:hidden">
              {course.cat} · {plural(total, "lesson")}
            </span>
          </span>
        </span>

        <span className="hidden truncate text-sm text-zinc-600 dark:text-zinc-300 md:block">
          {course.cat}
        </span>
        <span className="hidden text-sm tabular-nums text-zinc-600 dark:text-zinc-300 md:block">
          {total}
        </span>

        <span className="mt-3 flex items-center gap-3 md:mt-0">
          <span className="flex-1">
            <ProgressBar percent={percent} />
          </span>
          <span className="w-10 shrink-0 text-right text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
            {percent}%
          </span>
        </span>

        <span className="hidden md:block">
          <Status done={done} total={total} />
        </span>
      </button>
    </li>
  );
}

/* ---------- page ---------- */

export default function Home({
  courses = [],
  currentUser,
  usersData = {},
  userProfile,
  userProgress = {},
  onSelectCourse,
  onNavigate,
  onCategorySelect,
  onSearchSubmit,
  isHydrating = false,
}) {
  const [searchInput, setSearchInput] = useState("");
  const [view, setView] = useState("grid");

  const name = userProfile?.name || usersData[currentUser]?.name || "";
  const categories = [...new Set(courses.map((c) => c.cat))];
  const lessonTotal = courses.reduce((sum, c) => sum + lessonsOf(c), 0);
  const completedTotal = Object.values(userProgress).reduce(
    (sum, n) => sum + Number(n || 0),
    0,
  );
  const overall = lessonTotal
    ? Math.min(100, Math.round((completedTotal / lessonTotal) * 100))
    : 0;

  const lastWatched = courses.find((c) => {
    const done = userProgress[c.id] || 0;
    return done > 0 && done < lessonsOf(c);
  });
  const lastDone = lastWatched ? userProgress[lastWatched.id] || 0 : 0;
  const lastTotal = lastWatched ? lessonsOf(lastWatched) : 0;
  const lastPercent = lastTotal ? Math.round((lastDone / lastTotal) * 100) : 0;

  const visible = courses.slice(0, 9);

  return (
    <div className="mx-auto w-full max-w-6xl space-y-10">
      {/* Header */}
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,400px)] lg:items-end">
        <div className="min-w-0">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Skillhub · Student course portal
          </p>
          <h1 className="mt-2 text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            Courses for the class
          </h1>
          <p className="mt-2 max-w-prose text-zinc-600 dark:text-zinc-300">
            Course materials, lesson notes, and class progress in one place
          </p>
        </div>

        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            onSearchSubmit(searchInput);
          }}
        >
          <label className="flex h-11 min-w-0 flex-1 items-center gap-3 rounded-lg border border-zinc-950/10 bg-white px-3.5 transition-colors duration-150 ease-out focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-700/20 dark:border-white/10 dark:bg-zinc-900 dark:focus-within:border-teal-400 dark:focus-within:ring-teal-400/20">
            <Search
              size={16}
              strokeWidth={1.5}
              className="shrink-0 text-zinc-400 dark:text-zinc-500"
            />
            <input
              type="search"
              aria-label="Search courses"
              placeholder="Search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:ring-0 dark:text-zinc-50 dark:placeholder:text-zinc-500"
            />
          </label>
          <button
            type="submit"
            className={`h-11 rounded-lg bg-teal-700 px-5 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-teal-800 active:scale-[0.98] dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white ${focusRing}`}
          >
            Search
          </button>
        </form>
      </header>

      {/* Overview strip: one container, hairline dividers via gap-px */}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-zinc-950/10 bg-zinc-950/10 dark:border-white/10 dark:bg-white/10 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
        <div className="col-span-2 bg-white p-5 dark:bg-zinc-900 lg:col-span-1">
          <dt className="text-sm text-zinc-500 dark:text-zinc-400">Student</dt>
          <dd className="mt-1 truncate text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
            {isHydrating ? (
              <span className="block h-7 w-36 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
            ) : (
              name
            )}
          </dd>
        </div>
        <StatCell label="Courses" value={courses.length} />
        <StatCell label="Lessons" value={lessonTotal} />
        <StatCell label="Completed" value={completedTotal} />
        <StatCell
          label="Overall progress"
          value={`${overall}%`}
          className="col-span-2 lg:col-span-1"
        />
      </dl>

      {/* Continue learning */}
      {lastWatched && (
        <button
          type="button"
          onClick={() => onSelectCourse(lastWatched.id)}
          className={`${interactive} group flex w-full items-center gap-4 p-4 sm:gap-5 sm:p-5`}
        >
          <IconTile course={lastWatched} size="lg" />
          <span className="min-w-0 flex-1">
            <span className="block text-sm text-zinc-500 dark:text-zinc-400">
              Continue learning
            </span>
            <span className="mt-0.5 block truncate text-base font-medium text-zinc-900 dark:text-zinc-50">
              {lastWatched.t}
            </span>
            <span className="mt-3 flex items-center gap-3">
              <span className="flex-1">
                <ProgressBar percent={lastPercent} />
              </span>
              <span className="shrink-0 text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                Lesson {Math.min(lastDone + 1, lastTotal)} of {lastTotal}
              </span>
            </span>
          </span>
          <span className="hidden h-10 shrink-0 items-center gap-2 rounded-lg bg-teal-700 px-4 text-sm font-medium text-white transition-colors duration-150 ease-out group-hover:bg-teal-800 dark:bg-zinc-100 dark:text-zinc-900 dark:group-hover:bg-white sm:inline-flex">
            Resume
            <ArrowRight size={16} strokeWidth={1.5} />
          </span>
        </button>
      )}

      {/* Courses */}
      <section className="space-y-5" aria-labelledby="courses-heading">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h2
              id="courses-heading"
              className="text-xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50"
            >
              Courses
            </h2>
            <p className="mt-0.5 text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
              {plural(courses.length, "course")} ·{" "}
              {plural(lessonTotal, "lesson")}
            </p>
          </div>

          <div
            role="group"
            aria-label="Course layout"
            className="inline-flex shrink-0 rounded-lg border border-zinc-950/10 bg-white p-0.5 dark:border-white/10 dark:bg-zinc-900"
          >
            {[
              ["grid", LayoutGrid, "Grid view"],
              ["list", List, "List view"],
            ].map(([key, Icon, label]) => (
              <button
                key={key}
                type="button"
                aria-label={label}
                aria-pressed={view === key}
                onClick={() => setView(key)}
                className={`grid h-8 w-9 place-items-center rounded-md transition-colors duration-150 ease-out ${focusRing} ${
                  view === key
                    ? "bg-zinc-100 text-zinc-900 dark:bg-white/10 dark:text-zinc-50"
                    : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                }`}
              >
                <Icon size={16} strokeWidth={1.5} />
              </button>
            ))}
          </div>
        </div>

        {/* Category shortcuts */}
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
          {[
            ["All", courses.length],
            ...categories.map((cat) => [
              cat,
              courses.filter((c) => c.cat === cat).length,
            ]),
          ].map(([label, count]) => (
            <button
              key={label}
              type="button"
              onClick={() => onCategorySelect(label)}
              className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-lg border border-zinc-950/10 bg-white px-3 text-sm text-zinc-700 transition-colors duration-150 ease-out hover:border-zinc-950/25 hover:text-zinc-900 active:scale-[0.98] dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-white/25 dark:hover:text-zinc-50 ${focusRing}`}
            >
              {label}
              <span className="text-xs tabular-nums text-zinc-400 dark:text-zinc-500">
                {count}
              </span>
            </button>
          ))}
        </div>

        {view === "grid" ? (
          <div className="grid grid-cols-1 items-stretch gap-4 min-[600px]:grid-cols-2 xl:grid-cols-3">
            {visible.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                done={userProgress[course.id] || 0}
                onSelect={() => onSelectCourse(course.id)}
              />
            ))}
          </div>
        ) : (
          <div className={`${card} overflow-hidden`}>
            <div
              className={`hidden border-b border-zinc-950/10 bg-zinc-50 px-5 py-3 text-xs text-zinc-500 dark:border-white/10 dark:bg-white/5 dark:text-zinc-400 ${LIST_COLS}`}
            >
              <span>Course</span>
              <span>Category</span>
              <span>Lessons</span>
              <span>Progress</span>
              <span>Status</span>
            </div>
            <ul className="divide-y divide-zinc-950/10 dark:divide-white/10">
              {visible.map((course) => (
                <CourseRow
                  key={course.id}
                  course={course}
                  done={userProgress[course.id] || 0}
                  onSelect={() => onSelectCourse(course.id)}
                />
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Standings */}
      <section
        className={`${card} flex flex-col items-start justify-between gap-4 p-5 sm:flex-row sm:items-center sm:p-6`}
      >
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
            <Trophy size={20} strokeWidth={1.5} />
          </span>
          <div>
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Class standings
            </h2>
            <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
              View completed lessons and current rankings
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("leaderboard")}
          className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-zinc-950/10 px-4 text-sm font-medium text-zinc-900 transition-colors duration-150 ease-out hover:bg-zinc-100 active:scale-[0.98] dark:border-white/10 dark:text-zinc-50 dark:hover:bg-white/5 ${focusRing}`}
        >
          View standings
          <ArrowRight size={16} strokeWidth={1.5} />
        </button>
      </section>
    </div>
  );
}
