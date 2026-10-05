import React, { useState, useEffect } from "react";
import Confetti from "../Confetti";

export default function CourseRoom({
  course,
  userProgress,
  userNotes,
  totalPassed,
  onBackToDetails,
  onUpdateProgress,
  onSaveNote,
  onNavigate,
}) {
  if (!course) return null;

  const initialCompletedCount = userProgress[course.id] || 0;
  const initialIndex = Math.min(
    initialCompletedCount >= course.v.length ? 0 : initialCompletedCount,
    course.v.length - 1,
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [viewState, setViewState] = useState("watch");
  const [noteText, setNoteText] = useState("");
  const [saveStatus, setSaveStatus] = useState("✓ Saved");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [scorePercent, setScorePercent] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [validationError, setValidationError] = useState("");
  const [showConfetti, setShowConfetti] = useState(false);

  const currentVideo = course.v[currentIndex];
  const PASS_MARK = 0.6;

  useEffect(() => {
    const key = `${course.id}_${currentIndex}`;
    setNoteText(userNotes[key] || "");
    setSaveStatus("✓ Saved");
    setViewState("watch");
    setQuizSubmitted(false);
    setUserAnswers({});
    setValidationError("");
  }, [currentIndex, course.id, userNotes]);

  const handleNoteChange = (e) => {
    const val = e.target.value;
    setNoteText(val);
    setSaveStatus("Saving...");
    onSaveNote(course.id, currentIndex, val);
    setTimeout(() => {
      setSaveStatus("✓ Saved");
    }, 400);
  };

  const extractYoutubeId = (url) => {
    const m = String(url).match(
      /(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/,
    );
    return m ? m[1] : url;
  };

  const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const startQuiz = () => {
    const rawQuestions = currentVideo[2] || [];
    if (rawQuestions.length === 0) {
      const isLastLesson = currentIndex === course.v.length - 1;
      const completedSoFar = userProgress[course.id] || 0;
      if (completedSoFar === currentIndex) {
        onUpdateProgress(course.id, currentIndex + 1);
      }
      setViewState("no_quiz");
      return;
    }

    const shuffledQs = shuffleArray(rawQuestions).map((q) => {
      const optionIndices = shuffleArray(q[1].map((_, idx) => idx));
      return {
        question: q[0],
        options: optionIndices.map((idx) => q[1][idx]),
        correctIndex: optionIndices.indexOf(q[2]),
      };
    });

    setQuizQuestions(shuffledQs);
    setUserAnswers({});
    setQuizSubmitted(false);
    setValidationError("");
    setViewState("quiz");
  };

  const handleOptionSelect = (qIdx, oIdx) => {
    if (quizSubmitted) return;
    setUserAnswers((prev) => ({ ...prev, [qIdx]: oIdx }));
    setValidationError("");
  };

  const handleSubmitQuiz = () => {
    if (Object.keys(userAnswers).length < quizQuestions.length) {
      setValidationError(
        `⚠️ Please answer all questions first (${Object.keys(userAnswers).length}/${quizQuestions.length} answered).`,
      );
      return;
    }

    let correct = 0;
    quizQuestions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctIndex) {
        correct++;
      }
    });

    const total = quizQuestions.length;
    const pct = Math.round((correct / total) * 100);
    const passed = correct / total >= PASS_MARK;

    setCorrectCount(correct);
    setScorePercent(pct);
    setQuizPassed(passed);
    setQuizSubmitted(true);

    if (passed) {
      setShowConfetti(true);
      const completedSoFar = userProgress[course.id] || 0;
      if (completedSoFar === currentIndex) {
        onUpdateProgress(course.id, currentIndex + 1);
      }
    }

    setViewState("result");
  };

  const isPlaylist = /^PL[\w-]{10,}$/.test(currentVideo[1]);
  const videoId = isPlaylist
    ? currentVideo[1]
    : extractYoutubeId(currentVideo[1]);
  const embedUrl = isPlaylist
    ? `https://www.youtube-nocookie.com/embed/videoseries?list=${videoId}`
    : `https://www.youtube-nocookie.com/embed/${videoId}`;

  const completedCount = userProgress[course.id] || 0;

  return (
    <div className="space-y-6">
      {showConfetti && <Confetti onComplete={() => setShowConfetti(false)} />}

      <button
        onClick={onBackToDetails}
        className="rounded-xl border border-[#22224c] bg-transparent px-4 py-2 text-sm font-semibold text-[#f1f0fc] hover:border-[#7c5cff] hover:bg-[#17173a]"
      >
        ← Back to course details
      </button>

      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-[#f1f0fc] md:text-3xl">
          {course.t}
        </h1>
        <div className="mt-1 text-sm text-[#9492bf]">
          {completedCount}/{course.v.length} videos completed · Lesson{" "}
          {currentIndex + 1} of {course.v.length}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-5">
          {viewState === "watch" && (
            <div>
              <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-black shadow-xl">
                <iframe
                  src={embedUrl}
                  title={currentVideo[0]}
                  className="absolute inset-0 h-full w-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <button
                  onClick={startQuiz}
                  className="rounded-xl bg-[#7c5cff] px-4.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#7c5cff]/25 hover:bg-[#947bff]"
                >
                  Finished Video: Take Quiz (+50 XP)
                </button>
                <span className="text-xs text-[#9492bf]">
                  {isPlaylist
                    ? "Watch the videos in the playlist, then take the quiz."
                    : "Watch the full video, then test your understanding."}
                </span>
              </div>
            </div>
          )}

          {viewState === "no_quiz" && (
            <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-6 shadow-xl">
              <h2 className="text-xl font-bold text-[#f1f0fc]">
                {currentVideo[0]}
              </h2>
              <div className="mt-2 text-sm text-[#9492bf]">
                No quiz for this video. Lesson completed!
              </div>
              <button
                onClick={() => {
                  if (currentIndex === course.v.length - 1) {
                    onNavigate("dash");
                  } else {
                    setCurrentIndex(currentIndex + 1);
                  }
                }}
                className="mt-4 rounded-xl bg-[#7c5cff] px-4.5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#7c5cff]/25 hover:bg-[#947bff]"
              >
                {currentIndex === course.v.length - 1
                  ? "Back to Dashboard"
                  : "Next Video →"}
              </button>
            </div>
          )}

          {viewState === "quiz" && (
            <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-[#22224c] pb-4">
                <div>
                  <h2 className="text-xl font-bold text-[#f1f0fc]">
                    Quiz: {currentVideo[0]}
                  </h2>
                  <div className="mt-1 text-xs text-[#9492bf]">
                    Score 60% or higher to unlock the next lecture.
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-[rgba(255,184,0,0.3)] bg-[rgba(255,184,0,0.15)] px-3 py-1 text-xs font-bold text-[#ffb800]">
                  Reward: +50 XP
                </span>
              </div>

              {quizQuestions.map((q, qIdx) => (
                <div key={qIdx} className="space-y-3">
                  <div className="font-semibold text-sm text-[#f1f0fc]">
                    {qIdx + 1}. {q.question}
                  </div>
                  <div className="space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isSelected = userAnswers[qIdx] === oIdx;
                      return (
                        <label
                          key={oIdx}
                          onClick={() => handleOptionSelect(qIdx, oIdx)}
                          className={`flex cursor-pointer items-center rounded-xl border p-3 text-sm transition-all ${
                            isSelected
                              ? "border-[#7c5cff] bg-[rgba(124,92,255,0.14)] font-semibold text-[#f1f0fc]"
                              : "border-[#22224c] bg-[#0c0c24] text-[#9492bf] hover:border-[#7c5cff] hover:bg-[#17173a]"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`q_${qIdx}`}
                            checked={isSelected}
                            onChange={() => {}}
                            className="mr-3 accent-[#7c5cff]"
                          />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}

              {validationError && (
                <div className="rounded-xl border border-[rgba(255,93,115,0.35)] bg-[rgba(255,93,115,0.15)] p-3.5 text-xs font-semibold text-[#ff5d73]">
                  {validationError}
                </div>
              )}

              <button
                onClick={handleSubmitQuiz}
                className="w-full rounded-xl bg-[#7c5cff] py-3 text-sm font-semibold text-white shadow-lg shadow-[#7c5cff]/25 hover:bg-[#947bff]"
              >
                Submit Quiz Answers
              </button>
            </div>
          )}

          {viewState === "result" && (
            <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-8 text-center shadow-xl space-y-5">
              <div className="text-6xl">{quizPassed ? "🎉" : "😔"}</div>

              <div>
                <h2
                  className={`text-2xl font-extrabold ${
                    quizPassed ? "text-[#2fd18b]" : "text-[#ff5d73]"
                  }`}
                >
                  {quizPassed ? "Quiz Passed!" : "Quiz Failed"}
                </h2>
                <div className="mt-1 text-sm text-[#9492bf]">
                  {quizPassed
                    ? currentIndex === course.v.length - 1
                      ? "You completed this course!"
                      : "Next lecture is now unlocked!"
                    : "You need 60% to pass. Keep trying!"}
                </div>
              </div>

              <div
                className={`mx-auto flex h-28 w-28 items-center justify-center rounded-full border-4 text-2xl font-extrabold ${
                  quizPassed
                    ? "border-[#2fd18b] bg-[rgba(47,209,139,0.1)] text-[#2fd18b]"
                    : "border-[#ff5d73] bg-[rgba(255,93,115,0.1)] text-[#ff5d73]"
                }`}
              >
                {scorePercent}%
              </div>

              <div className="flex flex-wrap justify-center gap-4">
                <div className="min-w-[110px] rounded-xl border border-[#22224c] bg-[#0c0c24] p-3.5">
                  <b
                    className={`block text-xl font-extrabold ${
                      quizPassed ? "text-[#2fd18b]" : "text-[#ff5d73]"
                    }`}
                  >
                    {correctCount}/{quizQuestions.length}
                  </b>
                  <span className="text-xs text-[#9492bf]">
                    {quizPassed ? "Correct answers" : "Correct answers"}
                  </span>
                </div>

                <div className="min-w-[110px] rounded-xl border border-[#22224c] bg-[#0c0c24] p-3.5">
                  <b className="block text-xl font-extrabold text-[#ffb800]">
                    {quizPassed ? "+50" : "0"}
                  </b>
                  <span className="text-xs text-[#9492bf]">XP Earned</span>
                </div>

                <div className="min-w-[110px] rounded-xl border border-[#22224c] bg-[#0c0c24] p-3.5">
                  <b className="block text-xl font-extrabold text-[#947bff]">
                    {totalPassed * 50}
                  </b>
                  <span className="text-xs text-[#9492bf]">Total XP</span>
                </div>
              </div>

              {quizPassed && currentIndex === course.v.length - 1 && (
                <div className="rounded-xl border border-[rgba(47,209,139,0.3)] bg-[rgba(47,209,139,0.1)] p-3.5 text-sm font-bold text-[#2fd18b]">
                  🏆 Course 100% Completed! You're amazing!
                </div>
              )}

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                {quizPassed ? (
                  currentIndex === course.v.length - 1 ? (
                    <>
                      <button
                        onClick={() => onNavigate("dash")}
                        className="rounded-xl bg-[#7c5cff] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#7c5cff]/25 hover:bg-[#947bff]"
                      >
                        🏠 Back to Dashboard
                      </button>
                      <button
                        onClick={() => onNavigate("leaderboard")}
                        className="rounded-xl border border-[#22224c] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#f1f0fc] hover:bg-[#17173a]"
                      >
                        View Leaderboard 🏆
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setCurrentIndex(currentIndex + 1)}
                        className="rounded-xl bg-[#7c5cff] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#7c5cff]/25 hover:bg-[#947bff]"
                      >
                        Next Video →
                      </button>
                      <button
                        onClick={() => setViewState("watch")}
                        className="rounded-xl border border-[#22224c] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#f1f0fc] hover:bg-[#17173a]"
                      >
                        Rewatch Video
                      </button>
                    </>
                  )
                ) : (
                  <>
                    <button
                      onClick={startQuiz}
                      className="rounded-xl bg-[#7c5cff] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#7c5cff]/25 hover:bg-[#947bff]"
                    >
                      🔄 Retry Quiz
                    </button>
                    <button
                      onClick={() => setViewState("watch")}
                      className="rounded-xl border border-[#22224c] bg-transparent px-5 py-2.5 text-sm font-semibold text-[#f1f0fc] hover:bg-[#17173a]"
                    >
                      📺 Rewatch Video
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-5 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <b className="text-sm font-bold text-[#f1f0fc]">
                📝 My Study Notes (Lesson {currentIndex + 1})
              </b>
              <span className="text-xs text-[#9492bf]">{saveStatus}</span>
            </div>
            <textarea
              value={noteText}
              onChange={handleNoteChange}
              placeholder="Type key takeaways, formulas, or code snippets for this lecture..."
              className="min-h-[110px] w-full resize-y rounded-xl border border-[#22224c] bg-[#0c0c24] p-3 text-sm text-[#f1f0fc] placeholder-[#9492bf] outline-none focus:border-[#947bff] focus:ring-2 focus:ring-[#7c5cff]/25"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-[#22224c] bg-[#11112b] p-3 shadow-xl h-fit">
          <div className="border-b border-[#22224c] pb-2.5 px-3 font-bold text-sm text-[#f1f0fc]">
            Course Syllabus
          </div>
          <div className="mt-2 space-y-1">
            {course.v.map((item, idx) => {
              const isDone = idx < completedCount;
              const isCurrent = idx === currentIndex;
              const isLocked = idx > completedCount;

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (idx <= completedCount) {
                      setCurrentIndex(idx);
                    }
                  }}
                  className={`flex items-center gap-2.5 rounded-xl p-3 text-sm font-medium transition-all ${
                    isCurrent
                      ? "bg-[rgba(124,92,255,0.16)] font-bold text-[#947bff]"
                      : isDone
                        ? "cursor-pointer text-[#f1f0fc] hover:bg-[#17173a]"
                        : isLocked
                          ? "cursor-not-allowed opacity-45"
                          : "cursor-pointer text-[#f1f0fc] hover:bg-[#17173a]"
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 flex-none items-center justify-center rounded-full border-2 text-[11px] ${
                      isDone
                        ? "border-[#2fd18b] bg-[#2fd18b] font-extrabold text-[#06281b]"
                        : "border-[#22224c]"
                    }`}
                  >
                    {isDone ? "✓" : isLocked ? "🔒" : ""}
                  </span>
                  <span className="flex-1 truncate">
                    {idx + 1}. {item[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
