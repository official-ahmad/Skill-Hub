import { useEffect, useState } from "react";
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
  const initialCount = course ? userProgress[course.id] || 0 : 0;
  const [currentIndex, setCurrentIndex] = useState(
    Math.min(initialCount, Math.max(0, (course?.v.length || 1) - 1)),
  );
  const [viewState, setViewState] = useState("watch");
  const [noteText, setNoteText] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [scorePercent, setScorePercent] = useState(0);
  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    if (!course) return;
    // The lesson selection is external to this form state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNoteText(userNotes[`${course.id}_${currentIndex}`] || "");
  }, [currentIndex, course, userNotes]);

  useEffect(() => {
    if (!course) return;
    // Reset the player controls when the selected lesson changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSaveStatus("Saved");
    setViewState("watch");
    setQuizSubmitted(false);
    setUserAnswers({});
    setValidationError("");
  }, [currentIndex, course]);

  if (!course) return null;
  const currentVideo = course.v[currentIndex];
  const completed = userProgress[course.id] || 0;
  const isPlaylist = /^PL[\w-]{10,}$/.test(currentVideo[1]);
  const videoId = isPlaylist
    ? currentVideo[1]
    : String(currentVideo[1]).match(
        /(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/,
      )?.[1] || currentVideo[1];
  const embedUrl = isPlaylist
    ? `https://www.youtube-nocookie.com/embed/videoseries?list=${videoId}`
    : `https://www.youtube-nocookie.com/embed/${videoId}`;

  const shuffle = (items) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const startQuiz = () => {
    const questions = currentVideo[2] || [];
    if (!questions.length) {
      if (completed === currentIndex)
        onUpdateProgress(course.id, currentIndex + 1);
      setViewState("no_quiz");
      return;
    }
    setQuizQuestions(
      shuffle(questions).map(([question, options, correctIndex]) => {
        const indexes = shuffle(options.map((_, index) => index));
        return {
          question,
          options: indexes.map((index) => options[index]),
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
    if (passed && completed === currentIndex)
      onUpdateProgress(course.id, currentIndex + 1);
    setViewState("result");
  };

  const saveLessonNote = (event) => {
    const value = event.target.value;
    setNoteText(value);
    setSaveStatus("Saving");
    onSaveNote(course.id, currentIndex, value);
    window.clearTimeout(saveLessonNote.timeout);
    saveLessonNote.timeout = window.setTimeout(
      () => setSaveStatus("Saved"),
      400,
    );
  };

  const primary =
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-semibold text-white";
  const secondary =
    "inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 text-sm font-medium dark:border-slate-700";
  return (
    <div className="space-y-6">
      <button
        className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"
        onClick={onBackToDetails}
      >
        <ArrowLeft size={18} />
        Course details
      </button>
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">
          {course.t}
        </p>
        <h1 className="mt-2 text-2xl font-bold">{currentVideo[0]}</h1>
        <p className="mt-1 text-sm tabular-nums text-slate-500">
          {completed} of {course.v.length} lessons complete · Lesson{" "}
          {currentIndex + 1} of {course.v.length}
        </p>
      </header>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0 space-y-5">
          {viewState === "watch" && (
            <>
              <div className="aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-black dark:border-slate-800">
                <iframe
                  className="h-full w-full"
                  src={embedUrl}
                  title={currentVideo[0]}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
                <button className={primary} onClick={startQuiz}>
                  <Check size={18} />
                  Video finished · Take quiz
                </button>
                <span className="text-xs text-slate-500">
                  {isPlaylist
                    ? "Watch the playlist before taking the lesson quiz."
                    : "Watch the lesson before checking your understanding."}
                </span>
              </div>
            </>
          )}
          {viewState === "no_quiz" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900">
              <CircleCheck className="mx-auto text-emerald-600" />
              <h2 className="mt-3 font-semibold">Lesson recorded</h2>
              <button
                className={`${primary} mt-4`}
                onClick={() =>
                  currentIndex === course.v.length - 1
                    ? onNavigate("dash")
                    : setCurrentIndex(currentIndex + 1)
                }
              >
                {currentIndex === course.v.length - 1
                  ? "My learning"
                  : "Next lesson"}
                <ArrowRight size={18} />
              </button>
            </section>
          )}
          {viewState === "quiz" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="font-semibold">Lesson quiz</h2>
              <p className="text-sm text-slate-500">
                Pass mark: 60% · Completion credit: 50 XP
              </p>
              {quizQuestions.map((question, questionIndex) => (
                <fieldset
                  className="mt-5 border-t border-slate-100 pt-4 dark:border-slate-800"
                  key={questionIndex}
                >
                  <legend className="font-medium">
                    <span className="tabular-nums">{questionIndex + 1}.</span>{" "}
                    {question.question}
                  </legend>
                  {question.options.map((option, optionIndex) => (
                    <label
                      className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm dark:border-slate-700"
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
                      <span>{option}</span>
                    </label>
                  ))}
                </fieldset>
              ))}
              {validationError && (
                <p className="mt-3 text-sm text-rose-600" role="alert">
                  {validationError}
                </p>
              )}
              <button className={`${primary} mt-5`} onClick={submitQuiz}>
                Submit answers
              </button>
            </section>
          )}
          {viewState === "result" && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 text-center dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-xl font-semibold">
                {quizPassed ? "Quiz passed" : "Quiz not passed"}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {quizPassed
                  ? "The next lesson is available."
                  : "A score of 60% is required."}
              </p>
              <strong className="mt-4 block text-3xl tabular-nums">
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
          <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <header className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold">Lesson notes</h2>
                <p className="text-xs text-slate-500">
                  Private notes for lesson {currentIndex + 1}
                </p>
              </div>
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Save size={16} />
                {saveStatus}
              </span>
            </header>
            <textarea
              className="min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950"
              value={noteText}
              onChange={saveLessonNote}
              placeholder="Write notes for this lesson"
            />
          </section>
        </section>
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-3 font-semibold">Course content</h2>
          <div className="grid gap-1">
            {course.v.map((lesson, index) => {
              const isDone = index < completed;
              const isLocked = index > completed;
              const isCurrent = index === currentIndex;
              return (
                <button
                  key={`${course.id}-${index}`}
                  disabled={isLocked}
                  className={`flex min-h-11 items-center gap-2 rounded-xl px-3 text-left text-sm ${
                    isCurrent
                      ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "text-slate-600 hover:bg-slate-50 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                >
                  <span>
                    {isDone ? (
                      <Check size={16} />
                    ) : isLocked ? (
                      <LockKeyhole size={16} />
                    ) : (
                      <Play size={16} />
                    )}
                  </span>
                  <span className="truncate">
                    <span className="tabular-nums">
                      {String(index + 1).padStart(2, "0")}
                    </span>{" "}
                    {lesson[0]}
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
