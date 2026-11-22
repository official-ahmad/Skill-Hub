import { useState } from "react";
import { ArrowRight, Clock3, Search, Trophy } from "lucide-react";
import CourseIcon from "../CourseIcon";

export default function Home({ courses, currentUser, usersData = {}, userProfile, userProgress, onSelectCourse, onNavigate, onCategorySelect, onSearchSubmit }) {
  const [searchInput, setSearchInput] = useState("");
  const categories = [...new Set(courses.map((course) => course.cat))];
  const lessonTotal = courses.reduce((sum, course) => sum + course.v.length, 0);
  const completedTotal = Object.values(userProgress || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  const lastWatched = courses.find((course) => (userProgress[course.id] || 0) > 0 && (userProgress[course.id] || 0) < course.v.length);
  const name = userProfile?.name || usersData[currentUser]?.name || "Student";

  return (
    <div className="space-y-8">
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Skillhub · Student course portal</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-4xl">Courses for the class</h1>
          <p className="mt-2 text-slate-600 dark:text-slate-300">Course materials, lesson notes, and class progress in one place.</p>
          <form className="mt-5 flex max-w-xl gap-2" onSubmit={(event) => { event.preventDefault(); onSearchSubmit(searchInput); }}>
            <label className="flex h-12 min-w-0 flex-1 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Search size={18} className="shrink-0 text-slate-400" /><input className="min-w-0 flex-1 border-0 bg-transparent text-sm text-slate-900 outline-none dark:text-white" aria-label="Search courses" placeholder="Search courses" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
            </label>
            <button className="h-12 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20" type="submit">Search</button>
          </form>
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs text-slate-500 dark:text-slate-400">Student</p><strong className="mt-1 block truncate">{name}</strong>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center"><div><strong className="block text-xl tabular-nums">{courses.length}</strong><small className="text-slate-500">Courses</small></div><div><strong className="block text-xl tabular-nums">{lessonTotal}</strong><small className="text-slate-500">Lessons</small></div><div><strong className="block text-xl tabular-nums">{completedTotal}</strong><small className="text-slate-500">Complete</small></div></div>
        </section>
      </section>

      {lastWatched && (
        <button className="flex w-full items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900" onClick={() => onSelectCourse(lastWatched.id)}>
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"><CourseIcon course={lastWatched} /></span>
          <span className="min-w-0 flex-1"><span className="flex items-center gap-2 text-xs text-slate-500"><Clock3 size={14} />Continue learning</span><strong className="mt-1 block truncate text-sm">{lastWatched.t}</strong></span>
          <ArrowRight className="shrink-0 text-slate-400" size={18} />
        </button>
      )}

      <section className="space-y-4"><div><h2 className="text-lg font-semibold">Course categories</h2><p className="text-sm text-slate-500">Browse materials by subject.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{categories.map((category) => <button key={category} className="flex min-h-16 items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md dark:border-slate-800 dark:bg-slate-900" onClick={() => onCategorySelect(category)}><span className="font-medium">{category}</span><span className="text-xs tabular-nums text-slate-500">{courses.filter((course) => course.cat === category).length} courses</span></button>)}</div></section>

      <section className="space-y-4"><div className="flex items-end justify-between gap-4"><div><h2 className="text-lg font-semibold">Courses</h2><p className="text-sm text-slate-500">{courses.length} courses · {lessonTotal} lessons</p></div><button className="flex shrink-0 items-center gap-2 text-sm font-medium text-indigo-600" onClick={() => onCategorySelect("All")}>View all <ArrowRight size={16} /></button></div><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{courses.slice(0, 9).map((course) => { const done = userProgress[course.id] || 0; const percent = course.v.length ? Math.round(done / course.v.length * 100) : 0; return <button key={course.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900" onClick={() => onSelectCourse(course.id)}><div className="grid h-24 place-items-center bg-gradient-to-br from-indigo-50 via-white to-slate-50 dark:from-indigo-500/10 dark:via-slate-900 dark:to-slate-900"><CourseIcon course={course} /></div><div className="p-4"><div className="flex items-center justify-between gap-2 text-xs text-slate-500"><span className="truncate">{course.cat}</span><span className="shrink-0 tabular-nums">{course.v.length} lessons</span></div><strong className="mt-2 block min-h-11 text-base text-slate-950 dark:text-white">{course.t}</strong><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-xs tabular-nums text-slate-500">{percent}% complete</p></div></button>; })}</div></section>

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center"><div><h2 className="text-lg font-semibold">Class standings</h2><p className="text-sm text-slate-500">View completed lessons and current rankings.</p></div><button className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium dark:border-slate-700" onClick={() => onNavigate("leaderboard")}>View standings <Trophy size={16} /></button></section>
    </div>
  );
}
