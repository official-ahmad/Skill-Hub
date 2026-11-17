import { useState } from "react";
import { ArrowRight, CircleUserRound } from "lucide-react";

export default function MyLearning({ courses, usersData = {}, currentUser, userProgress, onSelectCourse, onNavigate }) {
  const [section, setSection] = useState("Overview");
  const inProgress = courses.filter((course) => (userProgress[course.id] || 0) > 0 && (userProgress[course.id] || 0) < course.v.length);
  const completed = courses.filter((course) => (userProgress[course.id] || 0) >= course.v.length);
  const passed = Object.values(userProgress || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  const xp = passed * 50;
  const renderCourse = (course) => {
    const done = userProgress[course.id] || 0;
    return <div className="learning-row" key={course.id}><div><strong>{course.t}</strong><span className="tabular-nums">{done} / {course.v.length} lessons</span></div><button className="text-button" onClick={() => onSelectCourse(course.id)}>{done >= course.v.length ? "Review" : "Continue"}<ArrowRight size={18} strokeWidth={1.5} /></button></div>;
  };

  return <div className="learning-layout">
    <nav className="learning-nav" aria-label="Learning sections">{["Overview", "In progress", "Completed", "Profile"].map((item) => <button key={item} className={item === section ? "is-active" : ""} onClick={() => setSection(item)}>{item}</button>)}</nav>
    <section className="learning-content">
      {section === "Overview" && <><header className="page-heading"><div><p className="eyebrow">My learning</p><h1 className="page-title">Course activity</h1><p className="page-description">Progress and recently active courses.</p></div></header><div className="metric-grid compact-metrics"><div className="metric-card"><strong className="tabular-nums">{xp}</strong><small>XP earned</small></div><div className="metric-card"><strong className="tabular-nums">{inProgress.length}</strong><small>In progress</small></div><div className="metric-card"><strong className="tabular-nums">{passed}</strong><small>Lessons passed</small></div></div><div className="page-section"><div className="section-heading"><div><h2>In progress</h2></div></div>{inProgress.length ? inProgress.map(renderCourse) : <p className="empty-state">No courses in progress.</p>}</div></>}
      {section === "In progress" && <div className="page-section"><div className="section-heading"><div><h1>In progress</h1><p>Courses with lesson activity.</p></div></div>{inProgress.length ? inProgress.map(renderCourse) : <p className="empty-state">No courses in progress.</p>}</div>}
      {section === "Completed" && <div className="page-section"><div className="section-heading"><div><h1>Completed courses</h1><p>Courses with all lessons passed.</p></div></div>{completed.length ? completed.map(renderCourse) : <p className="empty-state">No completed courses.</p>}</div>}
      {section === "Profile" && <div className="page-section"><div className="section-heading"><div><h1>Class profile</h1><p>Student account and university details.</p></div></div><div className="compact-profile"><CircleUserRound size={18} strokeWidth={1.5} /><strong>{usersData[currentUser]?.name || "Student"}</strong><span>{usersData[currentUser]?.studentId || "Student ID not added"}</span><span className="tabular-nums">{xp} XP · {passed} lessons passed</span><button className="text-button" onClick={() => onNavigate("profile")}>Open profile <ArrowRight size={18} strokeWidth={1.5} /></button></div></div>}
    </section>
  </div>;
}
