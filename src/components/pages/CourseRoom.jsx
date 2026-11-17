import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check, CircleCheck, CircleX, LockKeyhole, Play, RotateCcw, Save } from "lucide-react";

const PASS_MARK = 0.6;

export default function CourseRoom({ course, userProgress, userNotes, onBackToDetails, onUpdateProgress, onSaveNote, onNavigate }) {
  const initialCount = course ? userProgress[course.id] || 0 : 0;
  const [currentIndex, setCurrentIndex] = useState(Math.min(initialCount, Math.max(0, (course?.v.length || 1) - 1)));
  const [viewState, setViewState] = useState("watch");
  const [noteText, setNoteText] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [scorePercent, setScorePercent] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
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
  const videoId = isPlaylist ? currentVideo[1] : (String(currentVideo[1]).match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/)?.[1] || currentVideo[1]);
  const embedUrl = isPlaylist ? `https://www.youtube-nocookie.com/embed/videoseries?list=${videoId}` : `https://www.youtube-nocookie.com/embed/${videoId}`;

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
      if (completed === currentIndex) onUpdateProgress(course.id, currentIndex + 1);
      setViewState("no_quiz");
      return;
    }
    setQuizQuestions(shuffle(questions).map(([question, options, correctIndex]) => {
      const indexes = shuffle(options.map((_, index) => index));
      return { question, options: indexes.map((index) => options[index]), correctIndex: indexes.indexOf(correctIndex) };
    }));
    setUserAnswers({});
    setQuizSubmitted(false);
    setValidationError("");
    setViewState("quiz");
  };

  const submitQuiz = () => {
    if (Object.keys(userAnswers).length < quizQuestions.length) {
      setValidationError(`Answer all questions first (${Object.keys(userAnswers).length} of ${quizQuestions.length}).`);
      return;
    }
    const correct = quizQuestions.reduce((sum, question, index) => sum + (userAnswers[index] === question.correctIndex ? 1 : 0), 0);
    const passed = correct / quizQuestions.length >= PASS_MARK;
    setCorrectCount(correct);
    setScorePercent(Math.round(correct / quizQuestions.length * 100));
    setQuizPassed(passed);
    setQuizSubmitted(true);
    if (passed && completed === currentIndex) onUpdateProgress(course.id, currentIndex + 1);
    setViewState("result");
  };

  const saveLessonNote = (event) => {
    const value = event.target.value;
    setNoteText(value);
    setSaveStatus("Saving");
    onSaveNote(course.id, currentIndex, value);
    window.clearTimeout(saveLessonNote.timeout);
    saveLessonNote.timeout = window.setTimeout(() => setSaveStatus("Saved"), 400);
  };

  return <div className="player-page space-y-6">
    <button className="text-button" onClick={onBackToDetails}><ArrowLeft size={18} strokeWidth={1.5} /> Course details</button>
    <header className="page-heading"><div><p className="eyebrow">{course.t}</p><h1 className="page-title">{currentVideo[0]}</h1><p className="page-description tabular-nums">{completed} of {course.v.length} lessons complete · Lesson {currentIndex + 1} of {course.v.length}</p></div></header>
    <div className="player-layout"><section className="player-main">
      {viewState === "watch" && <><div className="video-frame"><iframe src={embedUrl} title={currentVideo[0]} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div><div className="player-controls"><button className="button-primary" onClick={startQuiz}><Check size={18} strokeWidth={1.5} /> Video finished · Take quiz</button><span>{isPlaylist ? "Watch the playlist before taking the lesson quiz." : "Watch the lesson before checking your understanding."}</span></div></>}

      {viewState === "no_quiz" && <section className="surface-card state-panel"><CircleCheck size={18} strokeWidth={1.5} /><h2>Lesson recorded</h2><p>This lesson does not include a quiz.</p><button className="button-primary" onClick={() => currentIndex === course.v.length - 1 ? onNavigate("dash") : setCurrentIndex(currentIndex + 1)}>{currentIndex === course.v.length - 1 ? "My learning" : "Next lesson"}<ArrowRight size={18} strokeWidth={1.5} /></button></section>}

      {viewState === "quiz" && <section className="surface-card quiz-panel"><header className="section-heading"><div><h2>Lesson quiz</h2><p>Pass mark: 60% · Completion credit: 50 XP</p></div></header>{quizQuestions.map((question, questionIndex) => <fieldset className="question-block" key={questionIndex}><legend><span className="tabular-nums">{questionIndex + 1}.</span> {question.question}</legend>{question.options.map((option, optionIndex) => <label className="answer-option" key={optionIndex}><input type="radio" name={`question-${questionIndex}`} checked={userAnswers[questionIndex] === optionIndex} disabled={quizSubmitted} onChange={() => setUserAnswers((previous) => ({ ...previous, [questionIndex]: optionIndex }))} /><span>{option}</span></label>)}</fieldset>)}{validationError && <p className="form-error" role="alert">{validationError}</p>}<button className="button-primary" onClick={submitQuiz}>Submit answers</button></section>}

      {viewState === "result" && <section className="surface-card result-panel"><div className="result-status">{quizPassed ? <CircleCheck size={22} strokeWidth={1.5} /> : <CircleX size={22} strokeWidth={1.5} />}<h2>{quizPassed ? "Quiz passed" : "Quiz not passed"}</h2></div><p>{quizPassed ? currentIndex === course.v.length - 1 ? "All lessons in this course are complete." : "The next lesson is available." : "A score of 60% is required. Review the lesson and try again."}</p><strong className="result-percent tabular-nums">{scorePercent}%</strong><div className="result-stats"><div><strong className="tabular-nums">{correctCount} / {quizQuestions.length}</strong><span>Correct answers</span></div><div><strong className="tabular-nums">{quizPassed ? 50 : 0}</strong><span>XP earned</span></div></div><div className="result-actions">{quizPassed ? currentIndex === course.v.length - 1 ? <><button className="button-primary" onClick={() => onNavigate("dash")}>My learning</button><button className="button-secondary" onClick={() => onNavigate("leaderboard")}>Class standings</button></> : <><button className="button-primary" onClick={() => setCurrentIndex(currentIndex + 1)}>Next lesson <ArrowRight size={18} strokeWidth={1.5} /></button><button className="button-secondary" onClick={() => setViewState("watch")}>Review video</button></> : <><button className="button-primary" onClick={startQuiz}><RotateCcw size={18} strokeWidth={1.5} /> Retry quiz</button><button className="button-secondary" onClick={() => setViewState("watch")}>Review video</button></>}</div></section>}

      <section className="surface-card notes-panel"><header className="section-heading"><div><h2>Lesson notes</h2><p>Private notes for lesson {currentIndex + 1}</p></div><span className="save-state"><Save size={18} strokeWidth={1.5} />{saveStatus}</span></header><textarea value={noteText} onChange={saveLessonNote} placeholder="Write notes for this lesson" /></section>
    </section>

    <aside className="syllabus-panel"><h2>Course content</h2><div className="syllabus-list">{course.v.map((lesson, index) => {
      const isDone = index < completed;
      const isLocked = index > completed;
      const isCurrent = index === currentIndex;
      return <button key={`${course.id}-${index}`} disabled={isLocked} className={`syllabus-item ${isCurrent ? "is-current" : ""}`} onClick={() => setCurrentIndex(index)}><span className="syllabus-state">{isDone ? <Check size={18} strokeWidth={1.5} /> : isLocked ? <LockKeyhole size={18} strokeWidth={1.5} /> : <Play size={18} strokeWidth={1.5} />}</span><span><span className="tabular-nums">{String(index + 1).padStart(2, "0")}</span> {lesson[0]}</span></button>;
    })}</div></aside></div>
  </div>;
}
