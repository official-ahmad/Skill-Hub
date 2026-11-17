import { useState } from "react";
import { ArrowLeft, Check, LockKeyhole, Play, UserRound } from "lucide-react";
import CourseIcon from "../CourseIcon";

const levels = { js: "Beginner", py: "Beginner", html: "Beginner", css: "Beginner", c: "Beginner", java: "Intermediate", cpp: "Intermediate", sql: "Intermediate", git: "Beginner", react: "Intermediate", node: "Intermediate", dsa: "Advanced", linux: "Beginner", ts: "Intermediate", django: "Intermediate", flutter: "Intermediate" };

export default function CourseDetail({ course, courses = [], userProgress = {}, onBack, onStartCourse }) {
  const [tab, setTab] = useState("Overview");
  if (!course) return <div className="empty-state">Course details are not available.<button className="text-button" onClick={onBack}><ArrowLeft size={18} strokeWidth={1.5} /> Back to courses</button></div>;
  const done = userProgress[course.id] || 0;
  const total = course.v.length;
  const percent = total ? Math.round(done / total * 100) : 0;

  return <div className="space-y-7">
    <button className="text-button" onClick={onBack}><ArrowLeft size={18} strokeWidth={1.5} /> Courses</button>
    <section className="course-detail-header">
      <div className="course-detail-icon"><CourseIcon course={course} /></div>
      <div className="course-detail-info"><p className="eyebrow">{course.cat} · {levels[course.id] || "Beginner"}</p><h1 className="page-title">{course.t}</h1><p className="page-description">{course.by} · {total} lessons</p><div className="progress-track"><span className="progress-fill" style={{ width: `${percent}%` }} /></div><p className="tabular-nums">{done} of {total} lessons complete · {percent}%</p><button className="button-primary" onClick={() => onStartCourse(course.id)}><Play size={18} strokeWidth={1.5} /> {done === 0 ? "Start course" : done >= total ? "Review course" : "Continue course"}</button></div>
    </section>
    <nav className="detail-tabs" aria-label="Course details">{["Overview", "Course content", "Instructor"].map((item) => <button key={item} className={tab === item ? "is-active" : ""} onClick={() => setTab(item)}>{item}</button>)}</nav>
    {tab === "Overview" && <section className="detail-copy"><h2>About this course</h2><p>Study {course.t} through a sequence of video lessons and short knowledge checks. Pass the lesson quiz to record completion and continue to the next lesson.</p><dl><div><dt>Lessons</dt><dd className="tabular-nums">{total}</dd></div><div><dt>Checks</dt><dd>Quiz after each lesson</dd></div><div><dt>Category</dt><dd>{course.cat}</dd></div><div><dt>Level</dt><dd>{levels[course.id] || "Beginner"}</dd></div></dl></section>}
    {tab === "Course content" && <section className="lesson-list">{course.v.map((lesson, index) => {
      const isDone = index < done;
      const isLocked = index > done;
      return <div className={`lesson-row ${isLocked ? "is-locked" : ""}`} key={`${course.id}-${index}`}><span className="lesson-state">{isDone ? <Check size={18} strokeWidth={1.5} /> : isLocked ? <LockKeyhole size={18} strokeWidth={1.5} /> : <Play size={18} strokeWidth={1.5} />}</span><span className="lesson-title"><span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span>{lesson[0]}</span><span className="lesson-meta">{lesson[2]?.length ? `${lesson[2].length} questions` : "No quiz"}</span></div>;
    })}</section>}
    {tab === "Instructor" && <section className="instructor-profile"><span className="avatar-fallback"><UserRound size={18} strokeWidth={1.5} /></span><div><h2>{course.by}</h2><p>{courses.filter((item) => item.by === course.by).length} courses in the Skillhub library</p></div></section>}
  </div>;
}
