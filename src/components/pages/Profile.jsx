import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  GraduationCap,
  Hash,
  LockKeyhole,
  Mail,
  RotateCcw,
  Save,
  TrendingUp,
  Trophy,
  X,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import {
  requestCertificate,
  getCertificateQuiz,
  getCertificates,
  submitCertificateQuiz,
} from "../../api";
import { getSafeErrorMessage } from "../../utils/errorMessage";
import { getLessonCount } from "../../utils/courseUtils";

const card =
  "rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900";

const badgeStyles = {
  issued:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/20",
  pending:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/20",
  eligible:
    "bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:bg-indigo-500/10 dark:text-indigo-300 dark:ring-indigo-400/20",
  marathon:
    "bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300 dark:ring-violet-400/20",
  locked:
    "bg-slate-100 text-slate-600 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-600/30",
};

function CompletionRing({ percent }) {
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;
  return (
    <div
      className="relative h-20 w-20 shrink-0"
      role="img"
      aria-label={`${percent}% overall completion`}
    >
      <svg viewBox="0 0 80 80" className="h-full w-full -rotate-90">
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          className="stroke-slate-200 dark:stroke-slate-700"
        />
        <circle
          cx="40"
          cy="40"
          r={radius}
          fill="none"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="stroke-indigo-600 transition-all duration-500 dark:stroke-indigo-400"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-bold tabular-nums">
        {percent}%
      </span>
    </div>
  );
}

export default function Profile({
  courses,
  userProgress,
  onSelectCourse,
  onResetProgress,
  onNavigate,
  userProfile,
  onUpdateProfile,
}) {
  const [className, setClassName] = useState(userProfile?.className || "");
  const [saving, setSaving] = useState(false);
  const [certificateData, setCertificateData] = useState({
    xp: 0,
    courses: [],
    certificates: [],
  });
  const [certificatesLoaded, setCertificatesLoaded] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const progress = userProgress || {};
  const derivedStudentId =
    String(userProfile?.email || "")
      .split("@")[0]
      .replace(/[^a-z0-9-]/gi, "") ||
    userProfile?.studentId ||
    "—";

  const loadCertificates = async () => {
    try {
      setCertificateData(await getCertificates());
    } catch (error) {
      toast.error(getSafeErrorMessage(error));
    }
  };

  useEffect(() => {
    let active = true;
    getCertificates()
      .then((data) => {
        if (active) setCertificateData(data);
      })
      .catch((error) => {
        if (active) toast.error(getSafeErrorMessage(error));
      })
      .finally(() => {
        if (active) setCertificatesLoaded(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const lessonCountOf = getLessonCount;

  const totalLessons = courses.reduce(
    (sum, course) => sum + lessonCountOf(course),
    0,
  );
  const totalPassed = Object.values(progress).reduce(
    (sum, count) => sum + Number(count || 0),
    0,
  );
  const coursesComplete = courses.filter((course) => {
    const count = lessonCountOf(course);
    return count > 0 && (progress[course.id] || 0) >= count;
  }).length;
  const completion = totalLessons
    ? Math.round((totalPassed / totalLessons) * 100)
    : 0;
  const xp = certificateData.xp || totalPassed * 50;

  const stats = [
    { label: "XP earned", value: xp, icon: Zap, tone: "amber" },
    {
      label: "Lessons passed",
      value: totalPassed,
      icon: CheckCircle2,
      tone: "emerald",
    },
    {
      label: "Courses complete",
      value: coursesComplete,
      icon: Trophy,
      tone: "indigo",
    },
    {
      label: "Overall completion",
      value: `${completion}%`,
      icon: TrendingUp,
      tone: "sky",
    },
  ];

  const toneClasses = {
    amber:
      "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300",
    emerald:
      "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300",
    indigo:
      "bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300",
    sky: "bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300",
  };

  const resetProgress = async () => {
    const result = await Swal.fire({
      title: "Reset all progress?",
      text: "Every saved lesson count will be cleared.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Reset progress",
      cancelButtonText: "Cancel",
      customClass: { popup: "skillhub-swal" },
    });
    if (result.isConfirmed) {
      onResetProgress();
      toast.success("Learning progress reset");
    }
  };

  const openQuiz = async (courseId) => {
    try {
      setQuiz({
        ...(await getCertificateQuiz(courseId)),
        selectedAnswer: null,
      });
      setSelectedAnswer(null);
    } catch (error) {
      toast.error(getSafeErrorMessage(error));
    }
  };

  const closeQuiz = () => {
    setQuiz(null);
    setSelectedAnswer(null);
  };

  const submitQuiz = async () => {
    if (!quiz || selectedAnswer === null)
      return toast.error("Choose an answer");
    try {
      const result = await submitCertificateQuiz({
        courseId: quiz.courseId,
        lessonIndex: quiz.lessonIndex,
        questionIndex: quiz.questionIndex,
        selectedIndex: selectedAnswer,
        transactionId: crypto.randomUUID(),
      });
      toast.success(`Correct answer! ${result.awardedXp} XP earned`);
      closeQuiz();
      await loadCertificates();
    } catch (error) {
      toast.error(getSafeErrorMessage(error));
    }
  };

  const request = async (courseId) => {
    try {
      await requestCertificate(courseId);
      toast.success("Certificate request sent to administration");
      await loadCertificates();
    } catch (error) {
      toast.error(getSafeErrorMessage(error));
    }
  };

  const saveDetails = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await onUpdateProfile({ className });
      toast.success("University details saved");
    } catch (error) {
      toast.error(getSafeErrorMessage(error, "Could not save changes"));
    } finally {
      setSaving(false);
    }
  };

  const detailsChanged = className !== (userProfile?.className || "");

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Student profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Your academic record, progress and certificates at Air University.
        </p>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        {/* ───────── Left column: identity ───────── */}
        <aside className="space-y-6 lg:sticky lg:top-6">
          <section className={`${card} overflow-hidden`}>
            <div className="h-20 bg-gradient-to-r from-indigo-600 via-indigo-500 to-sky-500" />
            <div className="px-5 pb-5">
              <div className="-mt-10 flex items-end justify-between gap-3">
                {userProfile?.avatar ? (
                  <img
                    className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-sm dark:border-slate-900"
                    src={userProfile.avatar}
                    alt=""
                  />
                ) : (
                  <span className="grid h-20 w-20 place-items-center rounded-2xl border-4 border-white bg-indigo-100 text-2xl font-bold text-indigo-700 shadow-sm dark:border-slate-900 dark:bg-indigo-500/20 dark:text-indigo-300">
                    {(userProfile?.name || "Student").charAt(0).toUpperCase()}
                  </span>
                )}
                <CompletionRing percent={completion} />
              </div>

              <h2 className="mt-4 break-words text-lg font-semibold leading-tight">
                {userProfile?.name || "Student"}
              </h2>
              <p className="mt-0.5 break-all text-sm text-slate-500 dark:text-slate-400">
                {userProfile?.email || ""}
              </p>

              <dl className="mt-5 divide-y divide-slate-100 border-t border-slate-100 text-sm dark:divide-slate-800 dark:border-slate-800">
                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Hash size={15} /> Student ID
                  </dt>
                  <dd className="break-all text-right font-semibold tabular-nums">
                    {derivedStudentId}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <GraduationCap size={15} /> Class
                  </dt>
                  <dd className="break-words text-right font-semibold">
                    {userProfile?.className || "Not set"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-3">
                  <dt className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Mail size={15} /> Institution
                  </dt>
                  <dd className="text-right font-semibold">Air University</dd>
                </div>
              </dl>
            </div>
          </section>

          <form className={`${card} p-5`} onSubmit={saveDetails}>
            <h2 className="font-semibold">University details</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Your Student ID comes from your verified email and can’t be
              changed.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label
                  htmlFor="student-id"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Student ID
                </label>
                <input
                  id="student-id"
                  className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400"
                  value={derivedStudentId}
                  readOnly
                />
              </div>
              <div>
                <label
                  htmlFor="class-name"
                  className="mb-1.5 block text-sm font-medium"
                >
                  Class / section
                </label>
                <input
                  id="class-name"
                  className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  value={className}
                  maxLength={120}
                  placeholder="e.g. BSCS-4A"
                  onChange={(event) => setClassName(event.target.value)}
                />
              </div>
            </div>

            <button
              className="button-primary mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus-visible:ring-offset-slate-900"
              type="submit"
              disabled={saving || !detailsChanged}
            >
              <Save size={17} />
              {saving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </aside>

        {/* ───────── Right column: progress ───────── */}
        <div className="min-w-0 space-y-6">
          <section
            className="grid grid-cols-2 gap-3 xl:grid-cols-4"
            aria-label="Learning summary"
          >
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className={`${card} p-4`}>
                  <span
                    className={`grid h-9 w-9 place-items-center rounded-xl ${
                      toneClasses[item.tone]
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <strong className="mt-3 block text-2xl font-bold tabular-nums">
                    {item.value}
                  </strong>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-lg font-semibold">Certificates</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Finish every lesson, pass the 75% Marathon Quiz, and reach the
                course XP requirement to request a certificate.
              </p>
            </div>

            {certificateData.courses.length ? (
              <div className="grid gap-4 md:grid-cols-2">
                {certificateData.courses.map((item) => {
                  const percent = item.requiredXp
                    ? Math.min(
                        100,
                        Math.round((item.currentXp / item.requiredXp) * 100),
                      )
                    : 0;
                  const status = item.certificate
                    ? "issued"
                    : item.request?.status === "pending"
                    ? "pending"
                    : item.eligible
                    ? "eligible"
                    : item.completed && !item.marathonPassed
                    ? "marathon"
                    : "locked";
                  const statusLabel = {
                    issued: "Issued",
                    pending: "Pending",
                    eligible: "Eligible",
                    marathon: "Marathon required",
                    locked: "Locked",
                  }[status];

                  return (
                    <article
                      key={item.courseId}
                      className={`${card} flex flex-col p-5`}
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl ${
                            item.certificate
                              ? "bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
                              : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                          }`}
                        >
                          {item.certificate ? (
                            <Award size={22} />
                          ) : (
                            <LockKeyhole size={20} />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="break-words font-semibold leading-snug">
                            {item.courseTitle}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            {item.completed
                              ? item.marathonPassed
                                ? "Lessons and Marathon Quiz passed"
                                : "Pass the Marathon Quiz to unlock the certificate"
                              : `${item.completedLessons}/${item.lessonCount} lessons`}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${badgeStyles[status]}`}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      <div className="mt-5">
                        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span className="tabular-nums">
                            {item.currentXp} XP
                          </span>
                          <span className="tabular-nums">
                            {item.requiredXp} XP required
                          </span>
                        </div>
                        <div
                          className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
                          role="progressbar"
                          aria-valuenow={percent}
                          aria-valuemin={0}
                          aria-valuemax={100}
                        >
                          <div
                            className="h-full rounded-full bg-indigo-600 transition-all duration-500 dark:bg-indigo-400"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <div className="mt-5 flex-1 content-end">
                        {item.certificate ? (
                          <button
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                            onClick={() =>
                              window.open(
                                `/verify/${item.certificate.verificationId}`,
                                "_blank",
                                "noopener,noreferrer",
                              )
                            }
                          >
                            <ExternalLink size={16} />
                            View certificate
                          </button>
                        ) : item.request?.status === "pending" ? (
                          <button
                            className="h-10 w-full cursor-default rounded-xl border border-amber-200 bg-amber-50 text-sm font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300"
                            disabled
                          >
                            Request pending review
                          </button>
                        ) : item.completed && !item.marathonPassed ? (
                          <button
                            className="button-primary flex h-10 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold"
                            onClick={() => onSelectCourse(item.courseId)}
                          >
                            <Trophy size={16} />
                            Take Marathon Quiz
                          </button>
                        ) : item.request?.status === "rejected" ? (
                          <button
                            className="h-10 w-full rounded-xl border border-slate-200 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                            onClick={() => request(item.courseId)}
                          >
                            Request again
                          </button>
                        ) : item.eligible ? (
                          <button
                            className="button-primary h-10 w-full rounded-xl text-sm font-semibold"
                            onClick={() => request(item.courseId)}
                          >
                            Request certificate
                          </button>
                        ) : (
                          <button
                            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
                            onClick={() => openQuiz(item.courseId)}
                          >
                            <Zap size={16} />
                            Earn XP with a quiz
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                {certificatesLoaded
                  ? "No certificates are available yet. Start a course to begin earning XP."
                  : "Loading certificates..."}
              </p>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold">Course progress</h2>
            <div
              className={`${card} divide-y divide-slate-100 dark:divide-slate-800`}
            >
              {courses.length === 0 && (
                <p className="p-5 text-sm text-slate-500 dark:text-slate-400">
                  You haven’t enrolled in any courses yet.
                </p>
              )}
              {courses.map((course) => {
                const lessonCount = lessonCountOf(course);
                const done = progress[course.id] || 0;
                const percent = lessonCount
                  ? Math.min(100, Math.round((done / lessonCount) * 100))
                  : 0;
                return (
                  <button
                    key={course.id}
                    className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-4 text-left transition first:rounded-t-2xl last:rounded-b-2xl hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500 dark:hover:bg-slate-800/50 sm:grid-cols-[minmax(0,1fr)_minmax(120px,220px)_auto] sm:px-5"
                    onClick={() => onSelectCourse(course.id)}
                  >
                    <span className="min-w-0">
                      <strong className="block truncate text-sm font-semibold">
                        {course.t}
                      </strong>
                      <span className="text-xs tabular-nums text-slate-500 dark:text-slate-400">
                        {done}/{lessonCount} lessons
                      </span>
                    </span>

                    <span className="flex items-center gap-2 sm:hidden">
                      <span className="text-xs font-semibold tabular-nums">
                        {percent}%
                      </span>
                      <ChevronRight
                        size={16}
                        className="text-slate-400"
                        aria-hidden="true"
                      />
                    </span>

                    <span className="col-span-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800 sm:col-span-1 sm:col-start-2 sm:row-start-1">
                      <span
                        className={`block h-full rounded-full transition-all duration-500 ${
                          percent === 100
                            ? "bg-emerald-500"
                            : "bg-indigo-600 dark:bg-indigo-400"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </span>

                    <span className="hidden items-center gap-2 sm:flex">
                      <span className="w-10 text-right text-xs font-semibold tabular-nums">
                        {percent}%
                      </span>
                      <ChevronRight
                        size={16}
                        className="text-slate-400 transition group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="flex flex-col gap-3 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
            <button
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              onClick={() => onNavigate("courses")}
            >
              <BookOpen size={17} />
              Browse courses
            </button>
            <button
              className="flex h-11 items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 text-sm font-medium text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/30 dark:text-rose-400 dark:hover:bg-rose-500/10"
              onClick={resetProgress}
            >
              <RotateCcw size={17} />
              Reset progress
            </button>
          </div>
        </div>
      </div>

      {quiz && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeQuiz();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="quiz-question"
            className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-800 dark:bg-slate-950 sm:p-6"
          >
            <div className="flex items-start justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                <Zap size={13} />
                {quiz.rewardXp} XP reward
              </span>
              <button
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:hover:bg-slate-800"
                onClick={closeQuiz}
                aria-label="Close quiz"
              >
                <X size={18} />
              </button>
            </div>

            <h2 id="quiz-question" className="mt-4 text-lg font-semibold">
              {quiz.question}
            </h2>

            <div className="mt-4 grid gap-2" role="radiogroup">
              {quiz.options.map((option, index) => {
                const selected = selectedAnswer === index;
                return (
                  <button
                    key={option}
                    role="radio"
                    aria-checked={selected}
                    className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition ${
                      selected
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                        : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
                    }`}
                    onClick={() => setSelectedAnswer(index)}
                  >
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border ${
                        selected
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-300 dark:border-slate-600"
                      }`}
                    >
                      {selected && <CheckCircle2 size={14} />}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-medium transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
                onClick={closeQuiz}
              >
                Cancel
              </button>
              <button
                className="button-primary h-10 rounded-xl px-4 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                onClick={submitQuiz}
                disabled={selectedAnswer === null}
              >
                Submit answer
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
