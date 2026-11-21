import { useState } from "react";
import { ArrowLeft, Check, LockKeyhole, Play } from "lucide-react";
import CourseIcon from "../CourseIcon";

export default function CourseDetail({ course, userProgress = {}, onBack, onStartCourse }) {
  const [tab,setTab] = useState("Overview");
  if (!course) return <div className="rounded-2xl border border-slate-200 p-6 dark:border-slate-800"><p>Course details are not available.</p><button className="mt-4 flex items-center gap-2 text-sm text-indigo-600" onClick={onBack}><ArrowLeft size={16}/>Back to courses</button></div>;
  const done = userProgress[course.id] || 0;
  const total = course.v.length;
  const percent = total ? Math.round(done/total*100) : 0;

  return (
    <div className="space-y-6">
      <button className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300" onClick={onBack}><ArrowLeft size={16}/>Courses</button>
      <section className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-7 md:grid-cols-[180px_minmax(0,1fr)]">
        <div className="grid min-h-36 place-items-center rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-100 text-indigo-600 dark:from-indigo-500/10 dark:to-slate-950"><CourseIcon course={course} /></div>
        <div><p className="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">{course.cat}</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{course.t}</h1><p className="mt-2 text-sm text-slate-500">{course.by} · {total} lessons</p><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-indigo-600" style={{width:`${percent}%`}} /></div><p className="mt-2 text-xs tabular-nums text-slate-500">{done} of {total} lessons complete · {percent}%</p><button className="mt-5 flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20" onClick={()=>onStartCourse(course.id)}><Play size={17}/>{done===0?"Start course":done>=total?"Review course":"Continue course"}</button></div>
      </section>
      <nav className="flex gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">{["Overview","Course content","Instructor"].map((item)=><button key={item} className={`h-10 shrink-0 rounded-xl px-4 text-sm ${tab===item?"bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300":"text-slate-600 dark:text-slate-300"}`} onClick={()=>setTab(item)}>{item}</button>)}</nav>
      {tab==="Overview" && <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><h2 className="font-semibold">About this course</h2><p className="mt-2 leading-7 text-slate-600 dark:text-slate-300">Study {course.t} through a sequence of video lessons and short knowledge checks. Pass each quiz to record completion.</p></section>}
      {tab==="Course content" && <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">{course.v.map((lesson,index)=>{const isDone=index<done;const isLocked=index>done;return <div key={`${course.id}-${index}`} className={`grid grid-cols-[40px_minmax(0,1fr)_auto] items-center gap-3 border-b border-slate-100 px-4 py-4 last:border-0 dark:border-slate-800 ${isLocked?"text-slate-400":""}`}><span className="grid h-9 w-9 place-items-center rounded-xl bg-slate-100 dark:bg-slate-800">{isDone?<Check size={16}/>:isLocked?<LockKeyhole size={16}/>:<Play size={16}/>}</span><strong className="min-w-0 truncate text-sm">{lesson[0]}</strong><span className="text-xs text-slate-500">{lesson[2]?.length?`${lesson[2].length} questions`:"No quiz"}</span></div>})}</section>}
      {tab==="Instructor" && <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"><strong>{course.by || "Skillhub Instructor"}</strong></section>}
    </div>
  );
}
