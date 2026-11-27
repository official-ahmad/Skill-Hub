import CourseIcon from "../CourseIcon";
import { getLessonCount } from "../../utils/courseUtils";
import { ArrowRight, BookOpen, Check, Layers, SearchX } from "lucide-react";

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

const levelStyles = {
  Beginner:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  Intermediate:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  Advanced:
    "bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300 dark:ring-rose-400/20",
};

const levelOptions = ["All", "Beginner", "Intermediate", "Advanced"];
const sortOptions = ["Default", "A-Z", "Progress"];

const fieldClass =
  "h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white";

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
  const progress = userProgress || {};
  const lessonCountOf = getLessonCount;
  const ratioOf = (course) => {
    const count = lessonCountOf(course);
    return count ? (progress[course.id] || 0) / count : 0;
  };

  const categories = ["All", ...new Set(courses.map((course) => course.cat))];
  const totalLessons = courses.reduce(
    (sum, course) => sum + lessonCountOf(course),
    0,
  );
  const completedCourses = courses.filter(
    (course) => lessonCountOf(course) > 0 && ratioOf(course) >= 1,
  ).length;

  const query = (searchQuery || "").toLowerCase();
  const filtered = courses
    .filter((course) => {
      const categoryMatches =
        selectedCategory === "All" || course.cat === selectedCategory;
      const levelMatches =
        selectedLevel === "All" ||
        (levels[course.id] || "Beginner") === selectedLevel;
      return (
        categoryMatches &&
        levelMatches &&
        course.t.toLowerCase().includes(query)
      );
    })
    .sort((a, b) =>
      selectedSort === "A-Z"
        ? a.t.localeCompare(b.t)
        : selectedSort === "Progress"
        ? ratioOf(b) - ratioOf(a)
        : 0,
    );

  const filtersActive =
    selectedCategory !== "All" ||
    selectedLevel !== "All" ||
    selectedSort !== "Default";

  const clearFilters = () => {
    onCategoryChange("All");
    onLevelChange("All");
    onSortChange("Default");
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-800 dark:text-indigo-300 sem:text-indigo-600">
            Skillhub · Course library
          </p>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Course library
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Browse Air University learning paths and pick up where you left off.
          </p>
        </div>
        <dl className="flex gap-3">
          {[
            { label: "Courses", value: courses.length, icon: Layers },
            { label: "Lessons", value: totalLessons, icon: BookOpen },
            { label: "Completed", value: completedCourses, icon: Check },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900"
              >
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                  <Icon size={16} />
                </span>
                <div>
                  <dd className="text-base font-bold leading-none tabular-nums">
                    {item.value}
                  </dd>
                  <dt className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {item.label}
                  </dt>
                </div>
              </div>
            );
          })}
        </dl>
      </header>

      {/* Filters */}
      <section
        aria-label="Filters"
        className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5"
      >
        <div className="flex flex-wrap items-end gap-4">
          <div className="grid gap-1.5">
            <label
              htmlFor="level-filter"
              className="text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Level
            </label>
            <select
              id="level-filter"
              className={`${fieldClass} min-w-40`}
              value={selectedLevel}
              onChange={(event) => onLevelChange(event.target.value)}
            >
              {levelOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="grid gap-1.5">
            <label
              htmlFor="sort-filter"
              className="text-xs font-medium text-slate-600 dark:text-slate-400"
            >
              Sort by
            </label>
            <select
              id="sort-filter"
              className={`${fieldClass} min-w-40`}
              value={selectedSort}
              onChange={(event) => onSortChange(event.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </div>
          {filtersActive && (
            <button
              className="h-10 rounded-xl px-3 text-sm font-medium text-indigo-600 transition hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-500/10 sm:ml-auto"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>

        <div
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0"
          role="group"
          aria-label="Category"
        >
          {categories.map((category) => {
            const active = category === selectedCategory;
            return (
              <button
                key={category}
                aria-pressed={active}
                className={`h-9 shrink-0 rounded-full border px-4 text-sm font-medium transition ${
                  active
                    ? "border-indigo-600 bg-indigo-600 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
                onClick={() => onCategoryChange(category)}
              >
                {category}
              </button>
            );
          })}
        </div>
      </section>

      {/* Results */}
      <p
        className="text-sm text-slate-500 dark:text-slate-400"
        aria-live="polite"
      >
        Showing{" "}
        <span className="font-semibold text-slate-900 dark:text-white">
          {filtered.length}
        </span>{" "}
        of {courses.length} courses
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center rounded-2xl border border-dashed border-slate-300 px-6 py-14 text-center dark:border-slate-700">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800">
            <SearchX size={22} />
          </span>
          <h2 className="mt-4 font-semibold">No courses found</h2>
          <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            Try a different search, or clear the filters to see every course.
          </p>
          {filtersActive && (
            <button
              className="button-primary mt-5 h-10 rounded-xl px-4 text-sm font-semibold"
              onClick={clearFilters}
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => {
            const complete = progress[course.id] || 0;
            const lessonCount = lessonCountOf(course);
            const percent = lessonCount
              ? Math.min(100, Math.round((complete / lessonCount) * 100))
              : 0;
            const isComplete = lessonCount > 0 && complete >= lessonCount;
            const level = levels[course.id] || "Beginner";
            const action = isComplete
              ? "Review course"
              : complete > 0
              ? "Continue"
              : "Start course";

            return (
              <button
                key={course.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:border-indigo-300 hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/50 dark:focus-visible:ring-offset-slate-950"
                onClick={() => onSelectCourse(course.id)}
              >
                <div className="relative grid h-28 place-items-center bg-gradient-to-br from-indigo-50 via-white to-slate-50 text-indigo-600 dark:from-indigo-500/10 dark:via-slate-900 dark:to-slate-900">
                  <CourseIcon course={course} />
                  {isComplete && (
                    <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                      <Check size={12} />
                      Complete
                    </span>
                  )}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                      {course.cat}
                    </span>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${levelStyles[level]}`}
                    >
                      {level}
                    </span>
                  </div>

                  <h2 className="mt-3 min-h-12 text-base font-semibold leading-snug text-slate-900 dark:text-white">
                    {course.t}
                  </h2>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs tabular-nums text-slate-500 dark:text-slate-400">
                      <span>
                        {complete}/{lessonCount} lessons
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {percent}%
                      </span>
                    </div>
                    <div
                      className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isComplete
                            ? "bg-emerald-500"
                            : "bg-indigo-600 dark:bg-indigo-400"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 text-sm dark:border-slate-800">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {isComplete
                        ? "All lessons passed"
                        : `${Math.max(0, lessonCount - complete)} remaining`}
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-300">
                      {action}
                      <ArrowRight
                        size={15}
                        className="transition group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
