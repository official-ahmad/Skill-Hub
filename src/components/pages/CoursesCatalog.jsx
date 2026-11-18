import CourseIcon from "../CourseIcon";
import CategoryIcon from "../CategoryIcon";
import { Check } from "lucide-react";

const levels = { js: "Beginner", py: "Beginner", html: "Beginner", css: "Beginner", c: "Beginner", java: "Intermediate", cpp: "Intermediate", sql: "Intermediate", git: "Beginner", react: "Intermediate", node: "Intermediate", dsa: "Advanced", linux: "Beginner", ts: "Intermediate", django: "Intermediate", flutter: "Intermediate" };

export default function CoursesCatalog({ courses, userProgress, searchQuery, selectedCategory, selectedLevel, selectedSort, onCategoryChange, onLevelChange, onSortChange, onSelectCourse }) {
  const categories = ["All", ...new Set(courses.map((course) => course.cat))];
  const filtered = courses.filter((course) => {
    const categoryMatches = selectedCategory === "All" || course.cat === selectedCategory;
    const levelMatches = selectedLevel === "All" || (levels[course.id] || "Beginner") === selectedLevel;
    return categoryMatches && levelMatches && course.t.toLowerCase().includes(searchQuery.toLowerCase());
  }).sort((a, b) => selectedSort === "A-Z" ? a.t.localeCompare(b.t) : selectedSort === "Progress" ? ((userProgress[b.id] || 0) / b.v.length) - ((userProgress[a.id] || 0) / a.v.length) : 0);

  return <div className="space-y-6">
    <header className="page-heading"><div><p className="eyebrow">Air University · Course library</p><h1 className="page-title">Courses</h1><p className="page-description">{courses.length} courses · {courses.reduce((sum, course) => sum + course.v.length, 0)} lessons</p></div></header>
    <div className="catalog-controls">
      <label className="filter-control">Level<select value={selectedLevel} onChange={(event) => onLevelChange(event.target.value)}><option value="All">All levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
      <label className="filter-control">Sort<select value={selectedSort} onChange={(event) => onSortChange(event.target.value)}><option value="Default">Default</option><option value="A-Z">Name</option><option value="Progress">Progress</option></select></label>
      <div className="category-filters">{categories.map((category) => <button key={category} className={`filter-chip ${category === selectedCategory ? "is-active" : ""}`} onClick={() => onCategoryChange(category)}><CategoryIcon category={category} size={16} /><span>{category}</span></button>)}</div>
    </div>
    {filtered.length === 0 ? <p className="empty-state">No courses match these filters.</p> : <div className="course-grid">{filtered.map((course) => {
      const complete = userProgress[course.id] || 0;
      const percent = Math.round((complete / course.v.length) * 100);
      const isDone = complete >= course.v.length;
      return <button className="course-card" key={course.id} onClick={() => onSelectCourse(course.id)}>
        <span className="course-card-icon"><span className="course-icon-container"><CourseIcon course={course} /></span>{isDone && <span className="complete-mark"><Check size={18} strokeWidth={1.5} /> Complete</span>}</span>
        <span className="course-card-body"><span className="course-card-meta"><span>{course.cat}</span><span>{course.level || levels[course.id] || "Beginner"} · {String(course.duration || 0).toLocaleString()} min</span></span><strong>{course.t}</strong><span className="course-card-description">{course.description}</span><span className="course-card-tags">{(course.tags || []).slice(0, 3).map((tag) => <i key={tag}>{tag}</i>)}</span><span className="course-card-instructor">{course.by} · {course.v.length} lessons</span><span className="progress-track"><span className="progress-fill" style={{ width: `${percent}%` }} /></span><span className="course-progress tabular-nums">{percent}% complete · {course.v.length - complete} remaining</span></span>
      </button>;
    })}</div>}
  </div>;
}
