import { useState } from "react";
import { ArrowRight, Check, Clock3, Search, Trophy } from "lucide-react";
import CourseIcon from "../CourseIcon";
import CategoryIcon from "../CategoryIcon";

export default function Home({ courses, usersData = {}, currentUser, userProfile, userProgress, onSelectCourse, onNavigate, onCategorySelect, onSearchSubmit }) {
  const [searchInput, setSearchInput] = useState("");
  const categories = [...new Set(courses.map((course) => course.cat))];
  const lessonTotal = courses.reduce((sum, course) => sum + course.v.length, 0);
  const completedTotal = Object.values(userProgress || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  const lastWatched = courses.find((course) => (userProgress[course.id] || 0) > 0 && (userProgress[course.id] || 0) < course.v.length);
  const instructors = [...new Set(courses.map((course) => course.by))];
  const name = userProfile?.name || usersData[currentUser]?.name || "Student";
  const submitSearch = () => onSearchSubmit(searchInput);

  return <div className="space-y-10">
    <section className="home-intro">
      <div>
        <p className="eyebrow">Air University · Student course portal</p>
        <h1 className="page-title">Courses for the class</h1>
        <p className="page-description">Course materials, lesson notes, and class progress in one place.</p>
        <form className="home-search" onSubmit={(event) => { event.preventDefault(); submitSearch(); }}>
          <Search size={18} strokeWidth={1.5} />
          <input aria-label="Search courses" placeholder="Search courses" value={searchInput} onChange={(event) => setSearchInput(event.target.value)} />
          <button className="button-primary" type="submit">Search</button>
        </form>
      </div>
      <section className="overview-card" aria-label="Learning overview">
        <div><span className="section-label">Student</span><strong>{name}</strong></div>
        <div className="overview-stats tabular-nums">
          <div><strong>{courses.length}</strong><span>Courses</span></div>
          <div><strong>{lessonTotal}</strong><span>Lessons</span></div>
          <div><strong>{completedTotal}</strong><span>Completed</span></div>
        </div>
      </section>
    </section>

    {lastWatched && <button className="continue-card" onClick={() => onSelectCourse(lastWatched.id)}>
      <span className="continue-icon"><CourseIcon course={lastWatched} /></span>
      <span className="continue-copy"><span className="section-label"><Clock3 size={18} strokeWidth={1.5} /> Continue learning</span><strong>{lastWatched.t}</strong><span>Lesson <span className="tabular-nums">{userProgress[lastWatched.id] + 1}</span> of <span className="tabular-nums">{lastWatched.v.length}</span></span></span>
      <span className="continue-action">Open course <ArrowRight size={18} strokeWidth={1.5} /></span>
    </button>}

    <section className="page-section">
      <div className="section-heading"><div><h2>Course categories</h2><p>Browse materials by subject.</p></div></div>
      <div className="category-list">{categories.map((category) => <button className="category-item" key={category} onClick={() => onCategorySelect(category)}><span className="category-name"><span className="category-icon"><CategoryIcon category={category} /></span>{category}</span><span className="tabular-nums">{courses.filter((course) => course.cat === category).length} courses</span></button>)}</div>
    </section>

    <section className="page-section">
      <div className="section-heading"><div><h2>Courses</h2><p>{courses.length} courses · {lessonTotal} lessons</p></div><button className="text-button" onClick={() => onCategorySelect("All")}>View all <ArrowRight size={18} strokeWidth={1.5} /></button></div>
      <div className="course-grid">{courses.slice(0, 8).map((course) => {
        const complete = userProgress[course.id] || 0;
        const percent = Math.round((complete / course.v.length) * 100);
        return <button className="course-card" key={course.id} onClick={() => onSelectCourse(course.id)}>
          <span className="course-card-icon"><span className="course-icon-container"><CourseIcon course={course} /></span>{complete >= course.v.length && <span className="complete-mark"><Check size={18} strokeWidth={1.5} /> Complete</span>}</span>
          <span className="course-card-body"><span className="course-card-meta"><span>{course.cat}</span><span className="tabular-nums">{String(course.duration || 0).toLocaleString()} min</span></span><strong>{course.t}</strong><span className="course-card-description">{course.description}</span><span className="course-card-tags">{(course.tags || []).slice(0, 3).map((tag) => <i key={tag}>{tag}</i>)}</span><span className="course-card-instructor">{course.by} · {course.v.length} lessons</span><span className="progress-track"><span className="progress-fill" style={{ width: `${percent}%` }} /></span><span className="course-progress tabular-nums">{percent}% complete</span></span>
        </button>;
      })}</div>
    </section>

    <section className="page-section">
      <div className="section-heading"><div><h2>Instructors</h2><p>People behind the course materials.</p></div></div>
      <div className="instructor-list">{instructors.map((instructor) => <div className="instructor-item" key={instructor}><span className="avatar-fallback">{instructor.charAt(0)}</span><span>{instructor}</span><span className="muted">{courses.filter((course) => course.by === instructor).length} courses</span></div>)}</div>
    </section>

    <section className="standings-link"><div><h2>Class standings</h2><p>View completed lessons and current rankings.</p></div><button className="button-secondary" onClick={() => onNavigate("leaderboard")}>View standings <Trophy size={18} strokeWidth={1.5} /></button></section>
  </div>;
}
