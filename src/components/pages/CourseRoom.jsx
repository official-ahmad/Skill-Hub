import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  LockKeyhole,
  Play,
  RotateCcw,
  Save,
} from "lucide-react";

const PASS_MARK = 0.6;

export default function CourseRoom({
  course,
  userProgress,
  userNotes,
  onBackToDetails,
  onUpdateProgress,
  onSaveNote,
  onNavigate,
}) {
  const lessons = Array.isArray(course?.v) ? course.v : [];
  const initialCount = course ? userProgress?.[course.id] || 0 : 0;
  const activeRoomKey = "sh_active_course_room";
  const getSavedRoom = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(activeRoomKey) || "null");
      return saved?.courseId === course?.id ? saved : null;
    } catch {
      return null;
    }
  };
  const savedRoom = getSavedRoom();
  const getWatchedSeconds = (courseId = course?.id, index = savedRoom?.index ?? initialCount) => {
    try {
      return Math.max(0, Number(localStorage.getItem(`sh_watched_${courseId}_${index}`) || 0));
    } catch {
      return 0;
    }
  };
  const [currentIndex, setCurrentIndex] = useState(
    savedRoom?.index !== undefined
      ? Math.min(savedRoom.index, Math.max(0, lessons.length - 1))
      : Math.min(initialCount, Math.max(0, lessons.length - 1)),
  );
  const [viewState, setViewState] = useState(
    savedRoom?.viewState === "quiz" ||
    savedRoom?.viewState === "no_quiz" ||
    savedRoom?.viewState === "result"
      ? savedRoom.viewState
      : "watch",
  );
  const [watchedSecondsState, setWatchedSecondsState] = useState(() => ({
    key: `${course?.id}_${savedRoom?.index ?? initialCount}`,
    seconds: getWatchedSeconds(),
  }));
  const previousIndex = useRef(currentIndex);
  const [noteText, setNoteText] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [scorePercent, setScorePercent] = useState(0);
  const [validationError, setValidationError] = useState("");
  const restoredQuiz = useRef(false);

  useEffect(() => {
    if (!course) return;
    // The lesson selection is external to this form state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNoteText(userNotes?.[`${course.id}_${currentIndex}`] || "");
  }, [currentIndex, course, userNotes]);

  useEffect(() => {
    if (!course) return;
    if (previousIndex.current !== currentIndex) {
      setSaveStatus("Saved");
      setViewState("watch");
      setQuizSubmitted(false);
      setUserAnswers({});
      setValidationError("");
      previousIndex.current = currentIndex;
    }
  }, [currentIndex, course]);

  const safeIndex = Math.min(Math.max(0, currentIndex), lessons.length - 1);
  const currentVideo = Array.isArray(lessons[safeIndex])
    ? lessons[safeIndex]
    : [];

  const lessonTitle = currentVideo[0] ?? "";
  const rawMedia = currentVideo[1] ?? "";
  const completed = userProgress?.[course.id] || 0;
  const isPlaylist = /^PL[\w-]{10,}$/.test(String(rawMedia));
  const videoId = isPlaylist
    ? String(rawMedia)
    : String(rawMedia).match(
        /(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/,
      )?.[1] || String(rawMedia);
  const embedUrl = isPlaylist
    ? `https://www.youtube-nocookie.com/embed/videoseries?list=${videoId}`
    : `https://www.youtube-nocookie.com/embed/${videoId}`;

  useEffect(() => {
    if (!course) return;
    try {
      localStorage.setItem(
        "sh_active_course_room",
        JSON.stringify({
          courseId: course.id,
          index: safeIndex,
          viewState,
        }),
      );
    } catch {
      /* localStorage unavailable */
    }
  }, [course, safeIndex, viewState]);

  useEffect(() => {
    const courseId = course?.id;
    if (!courseId || viewState !== "watch" || typeof document === "undefined") return undefined;
    const watchedKey = `${courseId}_${safeIndex}`;
    const interval = window.setInterval(() => {
      if (document.hidden) return;
      setWatchedSecondsState((state) => {
        const currentSeconds =
          state.key === watchedKey
            ? state.seconds
            : getWatchedSeconds(courseId, safeIndex);
        const next = currentSeconds + 1;
        try {
          localStorage.setItem(
            `sh_watched_${watchedKey}`,
            String(next),
          );
        } catch {
          /* localStorage unavailable */
        }
        return { key: watchedKey, seconds: next };
      });
    }, 1000);
    return () => window.clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course?.id, safeIndex, viewState]);

  const currentWatchedKey = `${course?.id || "course"}_${safeIndex}`;
  const watchedSeconds =
    watchedSecondsState.key === currentWatchedKey
      ? watchedSecondsState.seconds
      : getWatchedSeconds(course?.id, safeIndex);

  const resumeUrl =
    watchedSeconds > 5
      ? `${embedUrl}${embedUrl.includes("?") ? "&" : "?"}start=${Math.floor(watchedSeconds)}`
      : embedUrl;

  const shuffle = (items) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const startQuiz = () => {
    const questions = Array.isArray(currentVideo[2]) ? currentVideo[2] : [];
    if (!questions.length) {
      if (completed === safeIndex) onUpdateProgress(course.id, safeIndex + 1);
      setViewState("no_quiz");
      return;
    }
    setQuizQuestions(
      shuffle(questions).map(([question, options, correctIndex]) => {
        const safeOptions = Array.isArray(options) ? options : [];
        const indexes = shuffle(safeOptions.map((_, index) => index));
        return {
          question,
          options: indexes.map((index) => safeOptions[index]),
          correctIndex: indexes.indexOf(correctIndex),
        };
      }),
    );
    setUserAnswers({});
    setQuizSubmitted(false);
    setValidationError("");
    setViewState("quiz");
  };

  const submitQuiz = () => {
    if (Object.keys(userAnswers).length < quizQuestions.length) {
      setValidationError(
        `Answer all questions first (${Object.keys(userAnswers).length} of ${
          quizQuestions.length
        }).`,
      );
      return;
    }
    const correct = quizQuestions.reduce(
      (sum, question, index) =>
        sum + (userAnswers[index] === question.correctIndex ? 1 : 0),
      0,
    );
    const passed = correct / quizQuestions.length >= PASS_MARK;
    setScorePercent(Math.round((correct / quizQuestions.length) * 100));
    setQuizPassed(passed);
    setQuizSubmitted(true);
    if (passed && completed === safeIndex)
      onUpdateProgress(course.id, safeIndex + 1);
    setViewState("result");
  };

  useEffect(() => {
    if (
      restoredQuiz.current ||
      savedRoom?.viewState !== "quiz" ||
      !course
    ) return;
    const questions = Array.isArray(course.v?.[currentIndex]?.[2])
      ? course.v[currentIndex][2]
      : [];
    if (!questions.length) return;
    restoredQuiz.current = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setQuizQuestions(
      questions.map(([question, options, correctIndex]) => ({
        question,
        options: Array.isArray(options) ? options : [],
        correctIndex,
      })),
    );
  }, [course, currentIndex, savedRoom?.viewState]);

  const saveLessonNote = (event) => {
    const value = event.target.value;
    setNoteText(value);
    setSaveStatus("Saving");
    onSaveNote(course.id, safeIndex, value);
    window.clearTimeout(saveLessonNote.timeout);
    saveLessonNote.timeout = window.setTimeout(
      () => setSaveStatus("Saved"),
      400,
    );
  };

  if (!course || !lessons.length) return null;

  const primary =
    "inline-flex h-10 sm:h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-white shrink-0";
  const secondary =
    "inline-flex h-10 sm:h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-3.5 sm:px-4 text-xs sm:text-sm font-medium dark:border-slate-700 shrink-0";

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 px-1 sm:px-0">
      <button
        className="flex items-center gap-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300"
        onClick={onBackToDetails}
      >
        <ArrowLeft size={16} />
        Course details
      </button>

      <header className="min-w-0">
        <p className="truncate text-[11px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">
          {course.t}
        </p>
        <h1 className="mt-1 sm:mt-2 break-words text-lg sm:text-2xl font-bold leading-snug">
          {lessonTitle}
        </h1>
        <p className="mt-1 text-xs sm:text-sm tabular-nums text-slate-500">
          {completed} of {lessons.length} lessons complete · Lesson{" "}
          {safeIndex + 1} of {lessons.length}
        </p>
      </header>

      <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0 space-y-4 sm:space-y-5">
          {viewState === "watch" && (
            <>
              <div className="aspect-video w-full max-h-[58vh] overflow-hidden rounded-2xl border border-slate-200 bg-black dark:border-slate-800">
                <iframe
                  className="h-full w-full"
                  src={resumeUrl}
                  title={lessonTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <button className={primary} onClick={startQuiz}>
                  <Check size={16} />
                  Video finished · Take quiz
                </button>
                <span className="min-w-0 flex-1 text-xs text-slate-500">
                  {isPlaylist
                    ? "Watch the playlist before taking the lesson quiz."
                    : "Watch the lesson before checking your understanding."}
                </span>
              </div>
            </>
          )}

          {viewState === "no_quiz" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 text-center dark:border-slate-800 dark:bg-slate-900">
              <CircleCheck className="mx-auto text-emerald-600" />
              <h2 className="mt-3 font-semibold">Lesson recorded</h2>
              <button
                className={`${primary} mt-4`}
                onClick={() =>
                  safeIndex === lessons.length - 1
                    ? onNavigate("dash")
                    : setCurrentIndex(safeIndex + 1)
                }
              >
                {safeIndex === lessons.length - 1
                  ? "My learning"
                  : "Next lesson"}
                <ArrowRight size={18} />
              </button>
            </section>
          )}

          {viewState === "quiz" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="font-semibold">Lesson quiz</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Pass mark: 60% · Completion credit: 50 XP
              </p>
              {quizQuestions.map((question, questionIndex) => (
                <fieldset
                  className="mt-4 sm:mt-5 border-t border-slate-100 pt-4 dark:border-slate-800"
                  key={questionIndex}
                >
                  <legend className="text-sm sm:text-base font-medium">
                    <span className="tabular-nums">{questionIndex + 1}.</span>{" "}
                    {question.question}
                  </legend>
                  {question.options.map((option, optionIndex) => (
                    <label
                      className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-xs sm:text-sm dark:border-slate-700"
                      key={optionIndex}
                    >
                      <input
                        type="radio"
                        name={`question-${questionIndex}`}
                        checked={userAnswers[questionIndex] === optionIndex}
                        disabled={quizSubmitted}
                        onChange={() =>
                          setUserAnswers((previous) => ({
                            ...previous,
                            [questionIndex]: optionIndex,
                          }))
                        }
                      />
                      <span className="break-words">{option}</span>
                    </label>
                  ))}
                </fieldset>
              ))}
              {validationError && (
                <p
                  className="mt-3 text-xs sm:text-sm text-rose-600"
                  role="alert"
                >
                  {validationError}
                </p>
              )}
              <button className={`${primary} mt-5`} onClick={submitQuiz}>
                Submit answers
              </button>
            </section>
          )}

          {viewState === "result" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 text-center dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-lg sm:text-xl font-semibold">
                {quizPassed ? "Quiz passed" : "Quiz not passed"}
              </h2>
              <p className="mt-2 text-xs sm:text-sm text-slate-500">
                {quizPassed
                  ? "The next lesson is available."
                  : "A score of 60% is required."}
              </p>
              <strong className="mt-4 block text-2xl sm:text-3xl tabular-nums">
                {scorePercent}%
              </strong>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                {quizPassed ? (
                  <button
                    className={primary}
                    onClick={() => onNavigate("dash")}
                  >
                    My learning
                  </button>
                ) : (
                  <button className={primary} onClick={startQuiz}>
                    <RotateCcw size={18} />
                    Retry quiz
                  </button>
                )}
                <button
                  className={secondary}
                  onClick={() => setViewState("watch")}
                >
                  Review video
                </button>
              </div>
            </section>
          )}

          <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
            <header className="mb-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-semibold text-sm sm:text-base">
                  Lesson notes
                </h2>
                <p className="text-xs text-slate-500">
                  Private notes for lesson {safeIndex + 1}
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs text-slate-500 shrink-0">
                <Save size={15} />
                {saveStatus}
              </span>
            </header>
            <textarea
              className="min-h-24 sm:min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs sm:text-sm outline-none dark:border-slate-700 dark:bg-slate-950"
              value={noteText}
              onChange={saveLessonNote}
              placeholder="Write notes for this lesson"
            />
          </section>
        </section>

        <aside className="min-w-0 w-full h-fit rounded-2xl border border-slate-200 bg-white p-3 sm:p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 font-semibold text-sm sm:text-base">
            Course content
          </h2>
          <div className="grid gap-1 max-h-72 lg:max-h-[70vh] overflow-y-auto pr-0.5">
            {lessons.map((lesson, index) => {
              const isDone = index < completed;
              const isLocked = index > completed;
              const isCurrent = index === safeIndex;
              return (
                <button
                  key={`${course.id}-${index}`}
                  disabled={isLocked}
                  className={`flex min-h-10 sm:min-h-11 w-full min-w-0 items-center gap-2 rounded-xl px-2.5 sm:px-3 text-left text-xs sm:text-sm ${
                    isCurrent
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <span className="shrink-0">
                    {isDone ? (
                      <Check size={15} />
                    ) : isLocked ? (
                      <LockKeyhole size={15} />
                    ) : (
                      <Play size={15} />
                    )}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    <span className="tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>{" "}
                    {Array.isArray(lesson) ? lesson[0] : ""}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </div>
  );
}
