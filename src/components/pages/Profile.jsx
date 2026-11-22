import { useEffect, useState } from "react";
import { Award, BookOpen, ExternalLink, LockKeyhole, RotateCcw, Save } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { requestCertificate, getCertificateQuiz, getCertificates, submitCertificateQuiz } from "../../api";

export default function Profile({ courses, userProgress, onSelectCourse, onResetProgress, onNavigate, userProfile, onUpdateProfile }) {
  const [className, setClassName] = useState(userProfile?.className || "");
  const [certificateData, setCertificateData] = useState({ xp: 0, courses: [], certificates: [] });
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const derivedStudentId = String(userProfile?.email || "").split("@")[0].replace(/[^a-z0-9-]/gi, "") || userProfile?.studentId || "—";

  const loadCertificates = async () => {
    try { setCertificateData(await getCertificates()); } catch (error) { toast.error(error.message); }
  };

  useEffect(() => {
    let active = true;
    getCertificates()
      .then((data) => { if (active) setCertificateData(data); })
      .catch((error) => { if (active) toast.error(error.message); });
    return () => { active = false; };
  }, []);

  const totalLessons = courses.reduce((sum, course) => sum + course.v.length, 0);
  const totalPassed = Object.values(userProgress || {}).reduce((sum, count) => sum + Number(count || 0), 0);
  const xp = certificateData.xp || totalPassed * 50;

  const resetProgress = async () => {
    const result = await Swal.fire({ title: "Reset all progress?", text: "Every saved lesson count will be cleared.", icon: "warning", showCancelButton: true, confirmButtonText: "Reset progress", cancelButtonText: "Cancel", customClass: { popup: "skillhub-swal" } });
    if (result.isConfirmed) { onResetProgress(); toast.success("Learning progress reset"); }
  };

  const openQuiz = async (courseId) => {
    try { setQuiz({ ...(await getCertificateQuiz(courseId)), selectedAnswer: null }); setSelectedAnswer(null); }
    catch (error) { toast.error(error.message); }
  };

  const submitQuiz = async () => {
    if (!quiz || selectedAnswer === null) return toast.error("Choose an answer");
    try {
      const result = await submitCertificateQuiz({
        courseId: quiz.courseId,
        lessonIndex: quiz.lessonIndex,
        questionIndex: quiz.questionIndex,
        selectedIndex: selectedAnswer,
        transactionId: crypto.randomUUID(),
      });
      toast.success(`Correct answer! ${result.awardedXp} XP earned`);
      setQuiz(null);
      setSelectedAnswer(null);
      await loadCertificates();
    } catch (error) { toast.error(error.message); }
  };

  const request = async (courseId) => {
    try {
      await requestCertificate(courseId);
      toast.success("Certificate request sent to administration");
      await loadCertificates();
    } catch (error) { toast.error(error.message); }
  };

  return (
    <div className="space-y-6">
      <header><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Air University · Student record</p><h1 className="mt-2 text-3xl font-bold">Class profile</h1></header>

      <section className="grid items-start gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[56px_minmax(0,1fr)_auto] sm:items-center sm:p-5">
        {userProfile?.avatar ? <img className="h-14 w-14 rounded-full object-cover" src={userProfile.avatar} alt="" /> : <span className="grid h-14 w-14 place-items-center rounded-full bg-indigo-100 text-lg font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">{(userProfile?.name || "Student").charAt(0)}</span>}
        <div className="min-w-0"><h2 className="truncate font-semibold">{userProfile?.name || "Student"}</h2><p className="truncate text-sm text-slate-500">{userProfile?.email || ""}</p></div>
        <div className="grid w-full min-w-0 gap-2 text-sm"><span className="text-slate-500">Student ID</span><strong className="w-fit max-w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 break-all tabular-nums text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white">{derivedStudentId}</strong></div>
      </section>

      <form className="grid min-w-0 gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 sm:p-5" onSubmit={async (event) => { event.preventEvent?.(); event.preventDefault(); try { await onUpdateProfile({ className }); toast.success("University details saved"); } catch (error) { toast.error(error.message || "Could not save changes"); } }}>
        <div className="sm:col-span-2"><h2 className="font-semibold">University details</h2><p className="text-sm text-slate-500">Your Student ID is derived from your verified email and cannot be changed.</p></div>
        <label className="grid gap-1 text-xs text-slate-500">Student ID (read-only)<input className="h-11 cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950" value={derivedStudentId} readOnly /></label>
        <label className="grid gap-1 text-xs text-slate-500">Class / section<input className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white" value={className} maxLength={120} onChange={(event) => setClassName(event.target.value)} /></label>
        <div className="sm:col-span-2"><button className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white sm:w-auto" type="submit"><Save size={17}/>Save details</button></div>
      </form>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[
        { label: "XP earned", value: xp },
        { label: "Lessons passed", value: totalPassed },
        { label: "Courses complete", value: courses.filter((course) => (userProgress[course.id] || 0) >= course.v.length).length },
        { label: "Overall completion", value: `${totalLessons ? Math.round(totalPassed / totalLessons * 100) : 0}%` },
      ].map((item) => <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><strong className="block text-2xl tabular-nums">{item.value}</strong><span className="text-xs text-slate-500">{item.label}</span></div>)}</section>

      <section className="space-y-3"><div className="flex items-end justify-between gap-3"><div><h2 className="font-semibold">Certificates & badges</h2><p className="text-sm text-slate-500">Complete the course and meet the XP threshold.</p></div></div>
        {certificateData.courses.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{certificateData.courses.map((item) => {
          const percent = Math.min(100, Math.round(item.currentXp / item.requiredXp * 100));
          return (
            <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900" key={item.courseId}>
              <div className={`flex h-24 items-center justify-center ${item.certificate ? "bg-gradient-to-br from-amber-100 via-white to-indigo-100 dark:from-amber-500/10 dark:via-slate-900 dark:to-indigo-500/10" : "bg-slate-100 dark:bg-slate-800"}`}>
                {item.certificate ? <Award className="h-12 w-12 text-amber-600 dark:text-amber-300" /> : <LockKeyhole className="h-10 w-10 text-slate-400" />}
              </div>
              <div className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="text-xs text-slate-500">{item.completed ? "Course completed" : `${item.completedLessons}/${item.lessonCount} lessons`}</p><h3 className="mt-1 break-words font-semibold">{item.courseTitle}</h3></div><span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${item.certificate ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" : item.request?.status === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" : item.eligible ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"}`}>{item.certificate ? "Issued" : item.request?.status === "pending" ? "Pending" : item.eligible ? "Eligible" : "Locked"}</span></div>
                <div className="mt-4"><div className="flex justify-between text-xs text-slate-500"><span className="tabular-nums">{item.currentXp} XP</span><span className="tabular-nums">{item.requiredXp} XP required</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"><div className="h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }}/></div></div>
                {item.certificate ? <button className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-medium dark:border-slate-700" onClick={() => window.open(`/verify/${item.certificate.verificationId}`, "_blank", "noopener,noreferrer")}><ExternalLink size={16}/>View certificate</button> :
                  item.request?.status === "pending" ? <button className="mt-4 h-10 w-full cursor-default rounded-xl border border-amber-200 bg-amber-50 text-sm font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300" disabled>Request pending review</button> :
                  item.request?.status === "rejected" ? <button className="mt-4 h-10 w-full rounded-xl border border-slate-200 text-sm font-medium dark:border-slate-700" onClick={() => request(item.courseId)}>Request again</button> :
                  item.eligible ? <button className="mt-4 h-10 w-full rounded-xl bg-indigo-600 text-sm font-semibold text-white" onClick={() => request(item.courseId)}>Request certificate</button> :
                  <button className="mt-4 h-10 w-full rounded-xl border border-slate-200 text-sm font-medium dark:border-slate-700" onClick={() => openQuiz(item.courseId)}>Earn XP with a quiz</button>}
              </div>
            </article>
          );
        })}</div> : <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-sm text-slate-500 dark:border-slate-700">Loading certificates...</p>}
      </section>

      <section className="space-y-3"><h2 className="font-semibold">Course progress</h2>{courses.map((course) => { const done = userProgress[course.id] || 0; const percent = course.v.length ? Math.round(done / course.v.length * 100) : 0; return <button key={course.id} className="grid w-full grid-cols-[minmax(0,1fr)_72px] items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 text-left dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[minmax(0,1fr)_90px_minmax(120px,240px)_50px]" onClick={() => onSelectCourse(course.id)}><strong className="truncate">{course.t}</strong><span className="text-xs tabular-nums text-slate-500">{done}/{course.v.length}</span><span className="hidden h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 sm:block"><span className="block h-full rounded-full bg-indigo-600" style={{ width: `${percent}%` }}/></span><span className="text-right text-xs tabular-nums">{percent}%</span></button>; })}</section>

      <div className="flex flex-col gap-3 sm:flex-row"><button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm dark:border-slate-700" onClick={() => onNavigate("courses")}><BookOpen size={17}/>Browse courses</button><button className="flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 text-sm text-rose-600 dark:border-rose-500/30" onClick={resetProgress}><RotateCcw size={17}/>Reset progress</button></div>

      {quiz && <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setQuiz(null); }}><section className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">XP quiz · {quiz.rewardXp} XP</p><h2 className="mt-2 text-lg font-semibold">{quiz.question}</h2><div className="mt-4 grid gap-2">{quiz.options.map((option, index) => <button key={option} className={`min-h-11 rounded-xl border px-3 text-left text-sm ${selectedAnswer === index ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300" : "border-slate-200 dark:border-slate-700"}`} onClick={() => setSelectedAnswer(index)}>{option}</button>)}</div><div className="mt-5 flex justify-end gap-2"><button className="h-10 rounded-xl border border-slate-200 px-4 text-sm dark:border-slate-700" onClick={() => setQuiz(null)}>Cancel</button><button className="h-10 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white" onClick={submitQuiz}>Submit answer</button></div></section></div>}
    </div>
  );
}
