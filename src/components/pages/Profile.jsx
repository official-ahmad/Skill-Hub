import { useEffect, useState } from "react";
import { BookOpen, RotateCcw, Save, Send } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { getNotifications, sendQuery } from "../../api";

export default function Profile({ courses, userProgress, onSelectCourse, onResetProgress, onNavigate, userProfile, onUpdateProfile }) {
  const [studentId,setStudentId]=useState(userProfile?.studentId||"");
  const [className,setClassName]=useState(userProfile?.className||"");
  const [queryMessage,setQueryMessage]=useState("");
  const [notifications,setNotifications]=useState([]);

  useEffect(()=>{getNotifications().then(setNotifications).catch((error)=>toast.error(error.message));},[]);
  const totalLessons=courses.reduce((sum,course)=>sum+course.v.length,0);
  const totalPassed=Object.values(userProgress||{}).reduce((sum,count)=>sum+Number(count||0),0);
  const xp=totalPassed*50;

  const resetProgress=async()=>{const result=await Swal.fire({title:"Reset all progress?",text:"Every saved lesson count will be cleared.",icon:"warning",showCancelButton:true,confirmButtonText:"Reset progress",cancelButtonText:"Cancel",customClass:{popup:"skillhub-swal"}});if(result.isConfirmed){onResetProgress();toast.success("Learning progress reset");}};

  return (
    <div className="space-y-6">
      <header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Air University · Student record</p><h1 className="mt-2 text-3xl font-bold">Class profile</h1></header>
      <section className="grid items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[56px_minmax(0,1fr)_auto]">
        {userProfile?.avatar?<img className="h-14 w-14 rounded-full object-cover" src={userProfile.avatar} alt=""/>:<span className="grid h-14 w-14 place-items-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">{(userProfile?.name||"Student").charAt(0)}</span>}
        <div className="min-w-0"><h2 className="truncate font-semibold">{userProfile?.name||"Student"}</h2><p className="truncate text-sm text-slate-500">{userProfile?.email||""}</p></div>
        <div className="grid gap-2 text-sm sm:grid-cols-2"><span className="text-slate-500">ID: <strong className="text-slate-900 dark:text-white">{studentId||"—"}</strong></span><span className="text-slate-500">Class: <strong className="text-slate-900 dark:text-white">{className||"—"}</strong></span></div>
      </section>

      <form className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2" onSubmit={async(event)=>{event.preventDefault();try{await onUpdateProfile({studentId,className});toast.success("University details saved");}catch(error){toast.error(error.message||"Could not save changes");}}}>
        <div className="sm:col-span-2"><h2 className="font-semibold">University details</h2><p className="text-sm text-slate-500">Update the fields used in class records.</p></div>
        <label className="grid gap-1 text-xs text-slate-500">Student ID<input className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={studentId} maxLength={80} onChange={(event)=>setStudentId(event.target.value)} /></label>
        <label className="grid gap-1 text-xs text-slate-500">Class / section<input className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={className} maxLength={120} onChange={(event)=>setClassName(event.target.value)} /></label>
        <div className="sm:col-span-2"><button className="flex h-11 items-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white" type="submit"><Save size={17}/>Save details</button></div>
      </form>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[{label:"XP earned",value:xp},{label:"Lessons passed",value:totalPassed},{label:"Courses complete",value:courses.filter((course)=>(userProgress[course.id]||0)>=course.v.length).length},{label:"Overall completion",value:`${totalLessons?Math.round(totalPassed/totalLessons*100):0}%`}].map((item)=><div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><strong className="block text-2xl tabular-nums">{item.value}</strong><span className="text-xs text-slate-500">{item.label}</span></div>)}</section>

      <section className="space-y-3"><h2 className="font-semibold">Course progress</h2>{courses.map((course)=>{const done=userProgress[course.id]||0;const percent=course.v.length?Math.round(done/course.v.length*100):0;return <button key={course.id} className="grid w-full grid-cols-[minmax(0,1fr)_72px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[minmax(0,1fr)_90px_minmax(120px,240px)_50px]" onClick={()=>onSelectCourse(course.id)}><strong className="truncate">{course.t}</strong><span className="text-xs tabular-nums text-slate-500">{done}/{course.v.length}</span><span className="hidden h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 sm:block"><span className="block h-full rounded-full bg-indigo-600" style={{width:`${percent}%`}}/></span><span className="text-right text-xs tabular-nums">{percent}%</span></button>})}</section>

      <section className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-[minmax(0,1fr)_320px]"><div><h2 className="font-semibold">Support and notifications</h2><form className="mt-3 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]" onSubmit={async(event)=>{event.preventDefault();try{await sendQuery(queryMessage);setQueryMessage("");setNotifications(await getNotifications());toast.success("Query sent to administration");}catch(error){toast.error(error.message);}}}><textarea className="min-h-24 resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950" value={queryMessage} onChange={(event)=>setQueryMessage(event.target.value)} maxLength={4000} placeholder="Describe your question..."/><button className="flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white" type="submit" disabled={!queryMessage.trim()}><Send size={17}/>Send query</button></form></div><div className="max-h-72 space-y-2 overflow-y-auto">{notifications.map((item)=><article key={item._id} className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"><strong className="text-xs">{item.status==="resolved"?"Admin response":"Query pending"}</strong><p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{item.status==="resolved"?item.adminResponse:item.message}</p></article>)}</div></section>

      <div className="flex flex-col gap-3 sm:flex-row"><button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm dark:border-slate-700" onClick={()=>onNavigate("courses")}><BookOpen size={17}/>Browse courses</button><button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 text-sm text-rose-600 dark:border-rose-500/30" onClick={resetProgress}><RotateCcw size={17}/>Reset progress</button></div>
    </div>
  );
}
