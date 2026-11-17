import { useState } from "react";
import { BookOpen, Check, GraduationCap, Layers3, Medal, RotateCcw, Save, TrendingUp } from "lucide-react";
import CourseIcon from "../CourseIcon";

function Metric({ icon: Icon, label, value }) {
  return <div className="metric-card"><span><Icon size={18} strokeWidth={1.5} /></span><strong className="tabular-nums">{value}</strong><small>{label}</small></div>;
}

export default function Profile({ courses, currentUser, userProgress, allScoresCache, onSelectCourse, onResetProgress, onNavigate, userProfile, onUpdateProfile }) {
  const [studentId, setStudentId] = useState(userProfile?.studentId || "");
  const [className, setClassName] = useState(userProfile?.className || "");
  const [status, setStatus] = useState("");
  const [confirmReset, setConfirmReset] = useState(false);
  const totalLessons = courses.reduce((sum, course) => sum + course.v.length, 0);
  const totalPassed = Object.values(userProgress || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  const xp = totalPassed * 50;
  const thresholds = [0, 500, 1500, 3000];
  const levelNames = ["Beginner", "Intermediate", "Advanced", "Master"];
  const levelIndex = thresholds.reduce((current, threshold, index) => xp >= threshold ? index : current, 0);
  const nextThreshold = thresholds[levelIndex + 1] || thresholds[levelIndex];
  const levelPercent = nextThreshold === thresholds[levelIndex] ? 100 : Math.round((xp - thresholds[levelIndex]) / (nextThreshold - thresholds[levelIndex]) * 100);
  const standings = Object.entries(allScoresCache || {}).sort((a, b) => Number(b[1]?.passedCount || 0) - Number(a[1]?.passedCount || 0));
  const rankIndex = standings.findIndex(([id]) => id === currentUser);
  const rank = rankIndex >= 0 ? rankIndex + 1 : "—";
  const profile = userProfile || {};
  const initials = (profile.name || "Student").split(" ").map((part) => part[0]).slice(0, 2).join("");

  return <div className="space-y-8">
    <header className="page-heading"><div><p className="eyebrow">Air University · Student record</p><h1 className="page-title">Class profile</h1><p className="page-description">Your university details and course activity.</p></div></header>

    <section className="student-card">
      {profile.avatar ? <img className="student-avatar" src={profile.avatar} alt={`${profile.name || "Student"} profile`} /> : <span className="student-avatar avatar-fallback">{initials}</span>}
      <div className="student-identity"><h2>{profile.name || "Student"}</h2><p>{profile.email || ""}</p></div>
      <div className="student-identifiers"><div><span>Student ID</span><strong>{profile.studentId || "Not added"}</strong></div><div><span>Class / section</span><strong>{profile.className || "Not added"}</strong></div></div>
    </section>

    <form className="profile-form" onSubmit={async (event) => {
      event.preventDefault(); setStatus("");
      try { await onUpdateProfile({ studentId, className }); setStatus("Changes saved"); }
      catch (error) { setStatus(error.message || "Could not save changes"); }
    }}>
      <div className="section-heading"><div><h2>University details</h2><p>Your Google account name, email, and photo are managed by Google.</p></div></div>
      <label>Student ID<input value={studentId} maxLength={80} onChange={(event) => setStudentId(event.target.value)} placeholder="University roll number" /></label>
      <label>Class / section<input value={className} maxLength={120} onChange={(event) => setClassName(event.target.value)} placeholder="BS Software Engineering · Semester 1" /></label>
      <div className="form-actions"><button className="button-primary" type="submit"><Save size={18} strokeWidth={1.5} /> Save details</button><span role="status">{status}</span></div>
    </form>

    <section className="page-section"><div className="section-heading"><div><h2>Learning record</h2><p>Progress recorded across your courses.</p></div></div><div className="metric-grid">
      <Metric icon={TrendingUp} label="XP earned" value={xp} />
      <Metric icon={Medal} label="Class rank" value={rank === "—" ? rank : `#${rank}`} />
      <Metric icon={Check} label="Lessons passed" value={totalPassed} />
      <Metric icon={GraduationCap} label="Courses completed" value={courses.filter((course) => (userProgress[course.id] || 0) >= course.v.length).length} />
      <Metric icon={BookOpen} label="Courses in progress" value={courses.filter((course) => (userProgress[course.id] || 0) > 0 && (userProgress[course.id] || 0) < course.v.length).length} />
      <Metric icon={Layers3} label="Overall completion" value={`${totalLessons ? Math.round((totalPassed / totalLessons) * 100) : 0}%`} />
    </div><div className="level-progress"><div><span>Learning level</span><strong>{levelNames[levelIndex]}</strong><span className="tabular-nums">{levelIndex < levelNames.length - 1 ? `${xp} / ${nextThreshold} XP to ${levelNames[levelIndex + 1]}` : "Highest level"}</span></div><span className="progress-track"><span className="progress-fill" style={{ width: `${levelPercent}%` }} /></span></div></section>

    <section className="page-section"><div className="section-heading"><div><h2>Course progress</h2><p className="tabular-nums">{totalPassed} of {totalLessons} lessons completed</p></div></div><div className="progress-list">{courses.map((course) => {
      const done = userProgress[course.id] || 0;
      const percent = Math.round((done / course.v.length) * 100);
      return <button className="progress-row" key={course.id} onClick={() => onSelectCourse(course.id)}><CourseIcon course={course} /><span className="progress-course-title">{course.t}</span><span className="tabular-nums progress-row-count">{done} / {course.v.length}</span><span className="progress-track"><span className="progress-fill" style={{ width: `${percent}%` }} /></span><span className="tabular-nums progress-row-percent">{percent}%</span></button>;
    })}</div></section>

    <div className="profile-actions"><button className="button-secondary" onClick={() => onNavigate("courses")}><BookOpen size={18} strokeWidth={1.5} /> Browse courses</button><button className={`button-secondary ${confirmReset ? "is-danger" : ""}`} onClick={() => { if (confirmReset) { onResetProgress(); setConfirmReset(false); } else setConfirmReset(true); }}><RotateCcw size={18} strokeWidth={1.5} /> {confirmReset ? "Confirm reset" : "Reset progress"}</button>{confirmReset && <span className="muted">Select again to clear lesson counts.</span>}</div>
  </div>;
}
