import CourseIcon from "../CourseIcon";
import { Check } from "lucide-react";

const levels = { js:"Beginner", py:"Beginner", html:"Beginner", css:"Beginner", c:"Beginner", java:"Intermediate", cpp:"Intermediate", sql:"Intermediate", git:"Beginner", react:"Intermediate", node:"Intermediate", dsa:"Advanced", linux:"Beginner", ts:"Intermediate", django:"Intermediate", flutter:"Intermediate" };

export default function CoursesCatalog({ courses, userProgress, searchQuery, selectedCategory, selectedLevel, selectedSort, onCategoryChange, onLevelChange, onSortChange, onSelectCourse }) {
  const categories = ["All", ...new Set(courses.map((course) => course.cat))];
  const filtered = courses.filter((course) => {
    const categoryMatches = selectedCategory === "All" || course.cat === selectedCategory;
    const levelMatches = selectedLevel === "All" || (levels[course.id] || "Beginner") === selectedLevel;
    return categoryMatches && levelMatches && course.t.toLowerCase().includes(searchQuery.toLowerCase());
  }).sort((a, b) => selectedSort === "A-Z" ? a.t.localeCompare(b.t) : selectedSort === "Progress" ? ((userProgress[b.id] || 0) / b.v.length) - ((userProgress[a.id] || 0) / a.v.length) : 0);

  return (
    <div className="space-y-6">
      <header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Air University · Course library</p><h1 className="mt-2 text-3xl font-bold tracking-tight">Courses</h1><p className="mt-1 text-sm text-slate-500">{courses.length} courses · {courses.reduce((sum, course) => sum + course.v.length, 0)} lessons</p></header>
      <div className="flex flex-wrap items-end gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <label className="grid gap-1 text-xs text-slate-500">Level<select className="h-10 min-w-36 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={selectedLevel} onChange={(event) => onLevelChange(event.target.value)}><option>All</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
        <label className="grid gap-1 text-xs text-slate-500">Sort<select className="h-10 min-w-36 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={selectedSort} onChange={(event) => onSortChange(event.target.value)}><option>Default</option><option>A-Z</option><option>Progress</option></select></label>
        <div className="flex min-w-0 flex-1 flex-wrap gap-2">{categories.map((category) => <button key={category} className={`h-10 rounded-xl border px-3 text-sm ${category === selectedCategory ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"}`} onClick={() => onCategoryChange(category)}>{category}</button>)}</div>
      </div>
      {filtered.length === 0 ? <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700">No courses match these filters.</p> : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => {
            const complete = userProgress[course.id] || 0;
            const percent = course.v.length ? Math.round(complete / course.v.length * 100) : 0;
            return (
              <button key={course.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:border-indigo-200 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900" onClick={() => onSelectCourse(course.id)}>
                <div className="relative grid h-24 place-items-center bg-gradient-to-br from-indigo-50 via-white to-slate-50 text-indigo-600 dark:from-indigo-500/10 dark:via-slate-900 dark:to-slate-900"><CourseIcon course={course} />{complete >= course.v.length && <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"><Check size={12} />Complete</span>}</div>
                <div className="p-4"><div className="flex items-center justify-between gap-2 text-xs text-slate-500"><span className="truncate">{course.cat}</span><span className="shrink-0">{levels[course.id] || "Beginner"}</span></div><strong className="mt-2 block min-h-11 text-base text-slate-950 dark:text-white">{course.t}</strong><div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }} /></div><p className="mt-2 text-xs tabular-nums text-slate-500">{percent}% complete · {course.v.length - complete} remaining</p></div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
