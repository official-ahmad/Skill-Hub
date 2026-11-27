import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CircleCheck,
  CircleX,
  Clock3,
  Download,
  LockKeyhole,
  Play,
  RotateCcw,
  Save,
} from "lucide-react";
import {
  API_BASE_URL,
  getMarathonStatus,
  startLessonQuiz,
  startMarathonQuiz,
  submitLessonQuiz,
  submitMarathonQuiz,
} from "../../api";
import { getSafeErrorMessage } from "../../utils/errorMessage";

const PRIMARY_BUTTON_STYLE = { color: "#ffffff" };
const ROOM_VIEW_STATES = new Set(["watch", "quiz", "marathon", "no_quiz", "result"]);

function normalizeLessonEntry(entry) {
  if (Array.isArray(entry)) {
    return [
      typeof entry[0] === "string" ? entry[0] : "Lesson",
      typeof entry[1] === "string" ? entry[1] : "",
      normalizeQuestions(entry[2]),
    ];
  }
  if (entry && typeof entry === "object") {
    return [
      typeof entry.title === "string" ? entry.title : "Lesson",
      typeof entry.video === "string" ? entry.video : "",
      normalizeQuestions(entry.questions),
    ];
  }
  return ["Lesson unavailable", "", []];
}

function normalizeQuestions(questions) {
  if (!Array.isArray(questions)) return [];
  return questions.flatMap((item) => {
    if (Array.isArray(item)) {
      if (typeof item[0] !== "string" || !Array.isArray(item[1])) return [];
      return [[item[0], item[1].map((option) => String(option ?? ""))]];
    }
    if (item && typeof item === "object" && typeof item.question === "string" && Array.isArray(item.options))
      return [[item.question, item.options.map((option) => String(option ?? ""))]];
    return [];
  });
}

async function imageToPngDataUrl(source, { circle = false, size = 512 } = {}) {
  if (!source || typeof Image === "undefined") return null;

  let objectUrl = null;
  try {
    let imgSrc = source;
    if (/^https?:\/\//i.test(source)) {
      const response = await fetch(source, { mode: "cors" });
      if (!response.ok) return null;
      const blob = await response.blob();
      objectUrl = URL.createObjectURL(blob);
      imgSrc = objectUrl;
    }

    return await new Promise((resolve) => {
      const image = new Image();
      if (!objectUrl) image.crossOrigin = "anonymous";

      image.onload = () => {
        if (!image.naturalWidth || !image.naturalHeight) return resolve(null);
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) return resolve(null);
        if (circle) {
          context.beginPath();
          context.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
          context.clip();
          context.fillStyle = "#e2e8f0";
          context.fillRect(0, 0, size, size);
        }
        const scale = circle
          ? Math.max(size / image.naturalWidth, size / image.naturalHeight)
          : Math.min(size / image.naturalWidth, size / image.naturalHeight);
        const width = image.naturalWidth * scale;
        const height = image.naturalHeight * scale;
        try {
          context.drawImage(
            image,
            (size - width) / 2,
            (size - height) / 2,
            width,
            height,
          );
          resolve(canvas.toDataURL("image/png"));
        } catch {
          resolve(null);
        }
      };

      image.onerror = () => resolve(null);
      image.src = imgSrc;
    });
  } catch {
    return null;
  } finally {
    if (objectUrl) {
      try {
        URL.revokeObjectURL(objectUrl);
      } catch {
        // A failed cleanup must not prevent the initials fallback.
      }
    }
  }
}

function getInitials(name) {
  return (
    String(name || "Student")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "ST"
  );
}

export default function CourseRoom({
  course,
  userProgress,
  userNotes,
  user,
  onBackToDetails,
  onUpdateProgress,
  onSaveNote,
  onNavigate,
}) {
  const courseId = String(course?.id ?? course?._id ?? "");
  const rawLessons = Array.isArray(course?.v)
    ? course.v
    : Array.isArray(course?.lessons)
      ? course.lessons
      : [];
  const lessons = rawLessons.map(normalizeLessonEntry);
  const rawProgress = Number(userProgress?.[courseId] || 0);
  const initialCount = Number.isFinite(rawProgress)
    ? Math.min(Math.max(0, Math.trunc(rawProgress)), Math.max(0, lessons.length - 1))
    : 0;
  const activeRoomKey = "sh_active_course_room";
  const getSavedRoom = () => {
    try {
      const saved = JSON.parse(localStorage.getItem(activeRoomKey) || "null");
      if (
        !saved ||
        typeof saved !== "object" ||
        saved.courseId !== courseId ||
        !Number.isInteger(saved.index) ||
        saved.index < 0 ||
        saved.index >= lessons.length ||
        !ROOM_VIEW_STATES.has(saved.viewState)
      ) return null;
      return {
        courseId,
        index: saved.index,
        viewState: saved.viewState,
        attemptId: typeof saved.attemptId === "string" ? saved.attemptId : "",
      };
    } catch {
      return null;
    }
  };
  const savedRoom = getSavedRoom();
  const [currentIndex, setCurrentIndex] = useState(
    savedRoom?.index !== undefined
      ? savedRoom.index
      : initialCount,
  );
  const [viewState, setViewState] = useState(
    ["quiz", "marathon", "no_quiz"].includes(savedRoom?.viewState)
      ? savedRoom.viewState
      : "watch",
  );
  const previousIndex = useRef(currentIndex);
  const [noteText, setNoteText] = useState("");
  const [saveStatus, setSaveStatus] = useState("Saved");
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [quizMode, setQuizMode] = useState(savedRoom?.viewState === "marathon" ? "marathon" : "lesson");
  const [quizAttemptId, setQuizAttemptId] = useState(savedRoom?.attemptId || "");
  const [userAnswers, setUserAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);
  const [scorePercent, setScorePercent] = useState(0);
  const [quizResult, setQuizResult] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [marathonExpiresAt, setMarathonExpiresAt] = useState(null);
  const [marathonSeconds, setMarathonSeconds] = useState(0);
  const [marathonPassed, setMarathonPassed] = useState(false);
  const [marathonStatusLoaded, setMarathonStatusLoaded] = useState(false);
  const restoredQuiz = useRef(false);

  useEffect(() => {
    if (!courseId) return;
    // The lesson selection is external to this form state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNoteText(userNotes?.[`${courseId}_${currentIndex}`] || "");
  }, [currentIndex, courseId, userNotes]);

  useEffect(() => {
    if (!courseId) return;
    if (previousIndex.current !== currentIndex) {
      setSaveStatus("Saved");
      setViewState("watch");
      setQuizSubmitted(false);
      setUserAnswers({});
      setValidationError("");
      previousIndex.current = currentIndex;
    }
  }, [currentIndex, courseId]);

  const safeIndex = lessons.length
    ? Math.min(Math.max(0, Number.isInteger(currentIndex) ? currentIndex : 0), lessons.length - 1)
    : 0;
  const currentVideo = lessons[safeIndex] || [];

  const lessonTitle = typeof currentVideo[0] === "string" ? currentVideo[0] : "Lesson unavailable";
  const rawMedia = typeof currentVideo[1] === "string" ? currentVideo[1] : "";
  const completedValue = Number(userProgress?.[courseId] || 0);
  const completed = Number.isFinite(completedValue)
    ? Math.min(Math.max(0, Math.trunc(completedValue)), lessons.length)
    : 0;
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
    if (!courseId) return;
    try {
      localStorage.setItem(
        "sh_active_course_room",
        JSON.stringify({
          courseId,
          index: safeIndex,
          viewState,
          attemptId: quizAttemptId,
        }),
      );
    } catch {
      /* localStorage unavailable */
    }
  }, [courseId, safeIndex, viewState, quizAttemptId]);

  const shuffle = (items) => {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  };

  const installAttempt = (attempt, mode) => {
    setQuizMode(mode);
    setQuizAttemptId(attempt.attemptId || "");
    setMarathonExpiresAt(attempt.expiresAt || null);
    setMarathonSeconds(attempt.expiresAt ? Math.max(0, Math.ceil((new Date(attempt.expiresAt).getTime() - Date.now()) / 1000)) : 0);
    if (attempt.result) {
      setQuizResult(attempt.result);
      setScorePercent(Number(attempt.result.scorePercent) || 0);
      setQuizPassed(Boolean(attempt.result.passed));
      setQuizSubmitted(true);
      if (mode === "marathon" && attempt.result.passed) setMarathonPassed(true);
      setViewState("result");
      return;
    }
    setQuizQuestions(
      shuffle(
        (attempt.questions || []).map((question, questionIndex) => ({
          ...question,
          questionIndex,
          options: shuffle(
            (question.options || []).map((text, originalIndex) => ({
              text,
              originalIndex,
            })),
          ),
        })),
      ),
    );
    setUserAnswers({});
    setQuizSubmitted(false);
    setQuizResult(null);
    setValidationError("");
    setViewState(mode === "marathon" ? "marathon" : "quiz");
  };

  const loadAttempt = async (mode, resumeAttemptId = "") => {
    setValidationError("");
    const safeAttemptId = typeof resumeAttemptId === "string" ? resumeAttemptId : "";
    try {
      let attempt = mode === "marathon"
        ? await startMarathonQuiz(courseId, safeAttemptId)
        : await startLessonQuiz(courseId, safeIndex, safeAttemptId);
      if (attempt.status === "expired" && !attempt.result) {
        attempt = mode === "marathon"
          ? await startMarathonQuiz(courseId)
          : await startLessonQuiz(courseId, safeIndex);
      }
      installAttempt(attempt, mode);
    } catch (error) {
      setValidationError(getSafeErrorMessage(error, "Could not start the quiz. Please try again."));
    }
  };

  const startQuiz = async (resumeAttemptId = "") => {
    const questions = Array.isArray(currentVideo[2]) ? currentVideo[2] : [];
    if (!questions.length) {
      if (completed === safeIndex) onUpdateProgress(courseId, safeIndex + 1);
      setViewState("no_quiz");
      return;
    }
    await loadAttempt("lesson", typeof resumeAttemptId === "string" ? resumeAttemptId : "");
  };

  const startMarathon = async (resumeAttemptId = "") => {
    await loadAttempt("marathon", typeof resumeAttemptId === "string" ? resumeAttemptId : "");
  };

  const submitQuiz = async () => {
    if (submittingQuiz) return;
    if (quizMode === "lesson" && Object.keys(userAnswers).length < quizQuestions.length) {
      setValidationError(
        `Answer all questions first (${Object.keys(userAnswers).length} of ${
          quizQuestions.length
        }).`,
      );
      return;
    }
    setSubmittingQuiz(true);
    setValidationError("");
    try {
      const submittedAnswers = quizQuestions.map((question, questionIndex) => {
        const selectedOption = question.options[userAnswers[questionIndex]];
        return {
          questionId: question.questionId,
          selectedIndex: selectedOption ? selectedOption.originalIndex : null,
        };
      });
      const result = quizMode === "marathon"
        ? await submitMarathonQuiz(courseId, quizAttemptId, submittedAnswers)
        : await submitLessonQuiz(courseId, safeIndex, quizAttemptId, submittedAnswers);
      setScorePercent(result.scorePercent);
      setQuizPassed(result.passed);
      setQuizResult(result);
      setQuizSubmitted(true);
      if (quizMode === "marathon" && result.passed) setMarathonPassed(true);
      if (result.passed && result.completedLessons > completed)
        onUpdateProgress(courseId, result.completedLessons, false);
      setViewState("result");
    } catch (error) {
      setValidationError(
        getSafeErrorMessage(error, "Quiz submission failed. Please retry."),
      );
    } finally {
      setSubmittingQuiz(false);
    }
  };

  useEffect(() => {
    if (!courseId || marathonStatusLoaded) return;
    getMarathonStatus(courseId)
      .then((status) => setMarathonPassed(Boolean(status.passed)))
      .catch(() => {})
      .finally(() => setMarathonStatusLoaded(true));
  }, [courseId, marathonStatusLoaded]);

  useEffect(() => {
    if (
      restoredQuiz.current ||
      !courseId ||
      !["quiz", "marathon"].includes(savedRoom?.viewState)
    ) return;
    restoredQuiz.current = true;
    const mode = savedRoom.viewState === "marathon" ? "marathon" : "lesson";
    loadAttempt(mode, savedRoom.attemptId || "");
    // The restore is intentionally one-shot for the course room mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [course, savedRoom?.viewState]);

  useEffect(() => {
    if (viewState !== "marathon" || !marathonExpiresAt || quizSubmitted) return undefined;
    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((new Date(marathonExpiresAt).getTime() - Date.now()) / 1000));
      setMarathonSeconds(remaining);
    };
    updateRemaining();
    const timer = window.setInterval(updateRemaining, 250);
    return () => window.clearInterval(timer);
  }, [viewState, marathonExpiresAt, quizSubmitted]);

  useEffect(() => {
    if (
      viewState !== "marathon" ||
      marathonSeconds !== 0 ||
      !marathonExpiresAt ||
      Date.now() < new Date(marathonExpiresAt).getTime() ||
      quizSubmitted ||
      submittingQuiz
    ) return undefined;
    const submitOnExpiry = window.setTimeout(() => submitQuiz(), 0);
    return () => window.clearTimeout(submitOnExpiry);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewState, marathonSeconds, marathonExpiresAt, quizSubmitted, submittingQuiz]);

  const downloadQuizReport = async () => {
    if (!quizResult || !Array.isArray(quizResult.questionResults)) return;

    const avatarSource = String(
      user?.avatar || user?.picture || user?.photoURL || user?.image || "",
    ).trim();
    const avatarUrl = /^https?:\/\//i.test(avatarSource)
      ? `${API_BASE_URL}/api/avatar-proxy?url=${encodeURIComponent(avatarSource)}`
      : avatarSource;

    const [{ jsPDF }, logoDataUrl, avatarDataUrl] = await Promise.all([
      import("jspdf"),
      imageToPngDataUrl("/images.jpg", { circle: true }),
      imageToPngDataUrl(avatarUrl, { circle: true }),
    ]);
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;
    const bottom = pageHeight - 14;
    let y = 13;

    const ensureSpace = (height) => {
      if (y + height <= bottom) return;
      pdf.addPage();
      y = margin;
    };

    // Two-column branded header with the real logo and student profile.
    pdf.setFillColor(248, 250, 252);
    pdf.setDrawColor(226, 232, 240);
    pdf.roundedRect(margin, y, contentWidth, 33, 3, 3, "FD");
    if (logoDataUrl) {
      pdf.addImage(logoDataUrl, "PNG", margin + 4, y + 7, 19, 19);
    } else {
      pdf.setFillColor(124, 58, 237);
      pdf.roundedRect(margin + 4, y + 7, 19, 19, 4, 4, "F");
      pdf.setTextColor(255, 255, 255);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(11);
      pdf.text("SH", margin + 8, y + 19);
    }
    pdf.setTextColor(15, 23, 42);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(15);
    pdf.text("AU SkillHub", margin + 28, y + 12);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(9);
    pdf.setTextColor(71, 85, 105);
    pdf.text("Quiz Performance Report", margin + 28, y + 18);
    pdf.setFontSize(8);
    pdf.setTextColor(100, 116, 139);
    pdf.text(`Generated ${new Date().toLocaleString()}`, margin + 28, y + 25);

    const avatarX = pageWidth - margin - 68;
    if (avatarDataUrl) {
      pdf.addImage(avatarDataUrl, "PNG", avatarX, y + 7, 19, 19);
    } else {
      pdf.setFillColor(224, 231, 255);
      pdf.circle(avatarX + 9.5, y + 16.5, 9.5, "F");
      pdf.setTextColor(67, 56, 202);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9);
      pdf.text(getInitials(user?.name), avatarX + 9.5, y + 17.7, {
        align: "center",
      });
    }
    const studentName = user?.name || "Student";
    const studentId = user?.studentId || "ID not provided";
    pdf.setTextColor(30, 41, 59);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    const studentLines = pdf.splitTextToSize(
      `${studentName} - ${studentId}`,
      43,
    );
    pdf.text(studentLines.slice(0, 2), avatarX + 23, y + 14);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(100, 116, 139);
    pdf.text("Student", avatarX + 23, y + 23);
    y += 42;

    pdf.setTextColor(30, 41, 59);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    pdf.text("COURSE & SCORE SUMMARY", margin, y);
    y += 5;

    const quizNumber = quizMode === "marathon"
      ? "Marathon Quiz"
      : `Quiz #${String(safeIndex + 1).padStart(2, "0")}`;
    const score = Number.isInteger(quizResult.score) ? quizResult.score : 0;
    const totalQuestions = Number.isInteger(quizResult.totalQuestions)
      ? quizResult.totalQuestions
      : quizResult.questionResults.length;
    const xpEarned = Number(quizResult.xpEarned) || 0;
    const summary = [
      {
        label: "Course",
        value: `${course?.t || "Course"} (${courseId || "-"})`,
      },
      {
        label: quizMode === "marathon" ? "Course Assessment" : "Lesson & Quiz",
        value: quizMode === "marathon" ? `${quizNumber} - All Lessons` : `${quizNumber} - ${lessonTitle || "Lesson"}`,
      },
      { label: "Marks", value: `${score} / ${totalQuestions}` },
      {
        label: "Percentage",
        value: `${Number(quizResult.scorePercent) || 0}%`,
      },
      {
        label: "Status",
        value: quizResult.passed ? "Passed" : "Not Passed",
        status: true,
      },
      { label: "XP Credit", value: `${xpEarned ? "+" : ""}${xpEarned} XP` },
    ];
    const gap = 5;
    const cardWidth = (contentWidth - gap) / 2;
    const cardHeight = 22;
    summary.forEach((item, index) => {
      const row = Math.floor(index / 2);
      const column = index % 2;
      const x = margin + column * (cardWidth + gap);
      const cardY = y + row * (cardHeight + 4);
      const statusFill = item.status
        ? quizResult.passed
          ? [240, 253, 244]
          : [254, 242, 242]
        : [248, 250, 252];
      const statusStroke = item.status
        ? quizResult.passed
          ? [187, 247, 208]
          : [254, 202, 202]
        : [226, 232, 240];
      pdf.setFillColor(...statusFill);
      pdf.setDrawColor(...statusStroke);
      pdf.roundedRect(x, cardY, cardWidth, cardHeight, 2, 2, "FD");
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text(item.label.toUpperCase(), x + 4, cardY + 7);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(
        item.status ? (quizResult.passed ? 21 : 185) : 30,
        item.status ? (quizResult.passed ? 128 : 28) : 41,
        item.status ? (quizResult.passed ? 61 : 28) : 59,
      );
      const valueLines = pdf
        .splitTextToSize(item.value, cardWidth - 8)
        .slice(0, 2);
      pdf.text(valueLines, x + 4, cardY + 15);
    });
    y += 3 * (cardHeight + 4) + 4;

    pdf.setTextColor(30, 41, 59);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(11);
    ensureSpace(10);
    pdf.text("QUESTION-BY-QUESTION BREAKDOWN", margin, y);
    y += 6;

    quizResult.questionResults.forEach((item, index) => {
      const questionLines = pdf.splitTextToSize(
        `${index + 1}. ${item.question}`,
        contentWidth - 10,
      );
      const selectedLines = pdf.splitTextToSize(
        `Your Answer: ${item.selectedOption}`,
        contentWidth - 10,
      );
      const correctLines = pdf.splitTextToSize(
        `Correct Answer: ${item.correctOption}`,
        contentWidth - 10,
      );
      const blockHeight =
        8 +
        questionLines.length * 4.6 +
        selectedLines.length * 4.2 +
        correctLines.length * 4.2;
      ensureSpace(blockHeight + 3);
      pdf.setFillColor(255, 255, 255);
      pdf.setDrawColor(226, 232, 240);
      pdf.roundedRect(margin, y, contentWidth, blockHeight, 2, 2, "FD");
      let textY = y + 6;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(9.5);
      pdf.setTextColor(30, 41, 59);
      pdf.text(questionLines, margin + 5, textY);
      textY += questionLines.length * 4.6 + 1;
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8.5);
      pdf.setTextColor(...(item.isCorrect ? [21, 128, 61] : [185, 28, 28]));
      pdf.text(selectedLines, margin + 5, textY);
      textY += selectedLines.length * 4.2 + 1;
      pdf.setTextColor(21, 128, 61);
      pdf.text(correctLines, margin + 5, textY);
      y += blockHeight + 3;
    });

    const pageCount = pdf.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      pdf.setPage(page);
      pdf.setDrawColor(226, 232, 240);
      pdf.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      pdf.setTextColor(100, 116, 139);
      pdf.text("AU SkillHub | Quiz Performance Report", margin, pageHeight - 5);
      pdf.text(
        `Page ${page} of ${pageCount}`,
        pageWidth - margin,
        pageHeight - 5,
        { align: "right" },
      );
    }

    const reportScope = quizMode === "marathon" ? "marathon" : safeIndex + 1;
    const filename = `skillhub-quiz-${String(courseId || "course").replace(
      /[^\w-]/g,
      "-",
    )}-${reportScope}.pdf`;
    pdf.save(filename);
  };

  const saveLessonNote = (event) => {
    const value = typeof event?.target?.value === "string" ? event.target.value : "";
    setNoteText(value);
    setSaveStatus("Saving");
    onSaveNote(courseId, safeIndex, value);
    window.clearTimeout(saveLessonNote.timeout);
    saveLessonNote.timeout = window.setTimeout(
      () => setSaveStatus("Saved"),
      400,
    );
  };

  if (!courseId || !lessons.length) {
    return (
      <section className="mx-auto grid min-h-[45vh] w-full max-w-2xl content-center justify-items-center rounded-3xl border border-amber-200 bg-white p-6 text-center shadow-lg dark:border-amber-900/50 dark:bg-slate-950 sm:p-10">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
          <CircleX size={26} />
        </span>
        <h1 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
          Course content is unavailable
        </h1>
        <p className="mt-2 max-w-lg break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
          {course?.t || course?.title || "This course"} doesn’t have a valid lesson list right now. Go back to Courses or reload to try again.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button type="button" className="button-secondary" onClick={onBackToDetails}>
            <ArrowLeft size={16} /> Back to Courses
          </button>
          <button type="button" className="button-primary" onClick={() => window.location.reload()}>
            <RotateCcw size={16} /> Reload page
          </button>
        </div>
      </section>
    );
  }

  const secondary =
    "inline-flex min-h-10 sm:min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-3.5 sm:px-4 text-xs sm:text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-100 active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700 shrink-0";
  const primary =
    "quiz-primary-button inline-flex min-h-10 sm:min-h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-teal-600 to-teal-700 px-3.5 sm:px-4 text-xs sm:text-sm font-semibold !text-white shadow-sm shadow-teal-900/15 ring-1 ring-inset ring-white/15 transition-all duration-150 ease-out hover:from-teal-700 hover:to-teal-800 hover:shadow-md hover:shadow-teal-900/20 active:scale-[0.98] dark:from-zinc-50 dark:to-zinc-100 dark:!text-zinc-900 dark:ring-zinc-900/10 dark:hover:from-white dark:hover:to-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 shrink-0";
  const answeredCount = Object.keys(userAnswers).length;
  const answerProgress = quizQuestions.length
    ? Math.round((answeredCount / quizQuestions.length) * 100)
    : 0;
  const isMarathon = quizMode === "marathon";
  const marathonTimerProgress = Math.max(0, Math.min(1, marathonSeconds / (20 * 60)));
  const marathonTimeLabel = `${String(Math.floor(marathonSeconds / 60)).padStart(2, "0")}:${String(marathonSeconds % 60).padStart(2, "0")}`;

  return (
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-6 px-1 sm:px-0">
      <button className={`${secondary} min-h-9 px-3`} onClick={onBackToDetails}>
        <ArrowLeft size={16} />
        Course details
      </button>

      <header className="min-w-0">
        <p className="truncate text-[11px] sm:text-xs font-semibold uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-300">
          {course?.t || course?.title || "Course"}
        </p>
        <h1 className="mt-1 sm:mt-2 break-words text-lg sm:text-2xl font-bold leading-snug">
          {lessonTitle}
        </h1>
        <p className="mt-1 text-xs sm:text-sm tabular-nums text-slate-500">
          {completed} of {lessons.length} lessons complete · Lesson{" "}
          {safeIndex + 1} of {lessons.length}
        </p>
      </header>

      {completed >= lessons.length && lessons.length > 0 && (
        <section className="flex flex-col gap-3 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-white p-4 shadow-sm dark:border-teal-900/70 dark:from-teal-950/40 dark:to-slate-900 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="font-semibold text-slate-900 dark:text-white">Course Marathon Quiz</h2>
            <p className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">
              {marathonPassed ? "Passed · You can request your certificate once the course XP requirement is met." : "All lessons are complete. Pass 20 questions with at least 75% to unlock the certificate request."}
            </p>
          </div>
          {marathonPassed ? (
            <span className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200">
              <CircleCheck size={17} /> Passed
            </span>
          ) : viewState !== "marathon" ? (
            <button className={primary} onClick={() => startMarathon()}>
              {isMarathon ? "Retry Marathon Quiz" : "Start Marathon Quiz"}
              <ArrowRight size={16} />
            </button>
          ) : null}
        </section>
      )}

      {validationError && !["quiz", "marathon"].includes(viewState) && (
        <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300" role="alert">
          {validationError}
        </p>
      )}

      <div className="grid min-w-0 gap-4 sm:gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <section className="min-w-0 space-y-4 sm:space-y-5">
          {viewState === "watch" && (
            <>
              <div className="aspect-video w-full max-h-[58vh] overflow-hidden rounded-2xl border border-slate-200 bg-black dark:border-slate-800">
                <iframe
                  key={`${courseId}-${safeIndex}-${videoId}`}
                  className="h-full w-full"
                  src={embedUrl}
                  title={lessonTitle}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
                <button
                  style={PRIMARY_BUTTON_STYLE}
                  className={primary}
                  onClick={() => startQuiz()}
                >
                  <Check
                    style={PRIMARY_BUTTON_STYLE}
                    className="text-white"
                    size={16}
                  />
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
                style={PRIMARY_BUTTON_STYLE}
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
                <ArrowRight
                  style={PRIMARY_BUTTON_STYLE}
                  className="text-white"
                  size={18}
                />
              </button>
            </section>
          )}

          {(viewState === "quiz" || viewState === "marathon") && (
            <section className="overflow-hidden rounded-3xl border border-indigo-100 bg-white shadow-xl shadow-indigo-950/5 ring-1 ring-indigo-100/70 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20 dark:ring-slate-700/70">
              <header className="bg-gradient-to-br from-indigo-50 via-white to-violet-50 p-4 sm:p-6 dark:from-indigo-950/60 dark:via-slate-900 dark:to-violet-950/40">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-400/15 dark:text-indigo-200 dark:ring-indigo-300/20">
                        {isMarathon ? "Course Marathon" : `Quiz #${String(safeIndex + 1).padStart(2, "0")}`}
                      </span>
                      <span className="rounded-full bg-white/80 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700">
                        {quizQuestions.length} questions
                      </span>
                    </div>
                    <h2 className="mt-3 text-xl font-bold tracking-tight text-slate-950 sm:text-2xl dark:text-white">
                      {isMarathon ? "20-question course assessment" : "Lesson assessment"}
                    </h2>
                    <p className="mt-1 max-w-2xl text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300">
                      {isMarathon
                        ? "Answer the course-wide questions before the timer ends. Unanswered questions count as incorrect."
                        : "Choose the best answer for each question. Your score is graded securely when you submit."}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="min-w-20 rounded-2xl border border-white/80 bg-white/80 px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Pass mark
                      </span>
                      <strong className="mt-0.5 block text-lg text-slate-900 dark:text-white">
                        75%
                      </strong>
                    </div>
                    {isMarathon && (
                      <div className="col-span-2 flex items-center justify-center gap-3 rounded-2xl border border-indigo-100 bg-white/80 px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
                        <svg viewBox="0 0 48 48" className="h-12 w-12 -rotate-90" aria-hidden="true">
                          <circle cx="24" cy="24" r="19" fill="none" strokeWidth="4" className="stroke-slate-200 dark:stroke-slate-700" />
                          <circle cx="24" cy="24" r="19" fill="none" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 19}`} strokeDashoffset={`${2 * Math.PI * 19 * (1 - marathonTimerProgress)}`} className="stroke-indigo-600 transition-[stroke-dashoffset] duration-300 dark:stroke-indigo-300" />
                        </svg>
                        <span className="text-left">
                          <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Time left</span>
                          <strong className="block font-mono text-xl tabular-nums text-slate-900 dark:text-white">{marathonTimeLabel}</strong>
                        </span>
                        <Clock3 size={17} className="text-indigo-600 dark:text-indigo-300" />
                      </div>
                    )}
                    <div className="min-w-20 rounded-2xl border border-white/80 bg-white/80 px-3 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        Reward
                      </span>
                      <strong className="mt-0.5 block text-lg text-violet-700 dark:text-violet-300">
                        50 XP
                      </strong>
                    </div>
                  </div>
                </div>
                <div className="mt-5 rounded-2xl border border-indigo-100 bg-white/80 p-3 shadow-sm dark:border-slate-700 dark:bg-slate-950/50">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-200">
                      Your progress
                    </span>
                    <span className="tabular-nums text-indigo-700 dark:text-indigo-300">
                      {answeredCount} / {quizQuestions.length} Answered
                    </span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 transition-[width] duration-300"
                      style={{ width: `${answerProgress}%` }}
                    />
                  </div>
                </div>
              </header>
              <div className="space-y-4 p-4 sm:space-y-5 sm:p-6">
                {quizQuestions.map((question, questionIndex) => (
                  <fieldset
                    className="min-w-0 rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50/80 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5 dark:border-slate-700 dark:from-slate-900 dark:to-slate-800/70"
                    key={question.questionId}
                  >
                    <legend className="sr-only">
                      Question {questionIndex + 1}: {question.question}
                    </legend>
                    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-600 text-sm font-bold text-white shadow-md shadow-indigo-600/20 ring-4 ring-indigo-100 dark:bg-indigo-500 dark:ring-indigo-500/15">
                        {String(questionIndex + 1).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="break-words text-sm font-semibold leading-relaxed text-slate-900 sm:text-base dark:text-white">
                          {question.question}
                        </h3>
                        <div className="mt-3 grid gap-2 sm:mt-4">
                          {question.options.map((option, optionIndex) => {
                            const selected =
                              userAnswers[questionIndex] === optionIndex;
                            const letter = String.fromCharCode(
                              65 + optionIndex,
                            );
                            return (
                              <label
                                className={`flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border p-3 text-xs transition-all duration-200 sm:text-sm ${
                                  selected
                                    ? "border-indigo-600 bg-indigo-50/80 text-slate-900 shadow-sm ring-2 ring-indigo-500/30 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-white"
                                    : "border-slate-200 bg-white text-slate-800 hover:-translate-y-px hover:border-indigo-300 hover:bg-indigo-50/60 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:border-indigo-500/70 dark:hover:bg-indigo-500/10"
                                } ${
                                  quizSubmitted
                                    ? "cursor-default"
                                    : "active:scale-[0.995]"
                                }`}
                                key={optionIndex}
                              >
                                <input
                                  className="sr-only"
                                  type="radio"
                                  name={`question-${questionIndex}`}
                                  checked={selected}
                                  disabled={quizSubmitted}
                                  onChange={() =>
                                    setUserAnswers((previous) => ({
                                      ...previous,
                                      [questionIndex]: optionIndex,
                                    }))
                                  }
                                />
                                <span
                                  className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-[11px] font-bold ring-1 transition-colors ${
                                    selected
                                      ? "bg-indigo-600 text-white ring-indigo-600 dark:bg-indigo-400 dark:text-slate-950 dark:ring-indigo-400"
                                      : "bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-600"
                                  }`}
                                >
                                  {letter}
                                </span>
                                <span className="min-w-0 flex-1 break-words font-medium">
                                  {option.text}
                                </span>
                                {selected && (
                                  <CircleCheck
                                    className="shrink-0 text-indigo-600 dark:text-indigo-300"
                                    size={17}
                                  />
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </fieldset>
                ))}
                {validationError && (
                  <p
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-300 sm:text-sm"
                    role="alert"
                  >
                    {validationError}
                  </p>
                )}
                <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
                  <span className="text-center text-[11px] text-slate-500 sm:text-left dark:text-slate-400">
                    {isMarathon
                      ? `${answeredCount} of ${quizQuestions.length} answered. Unanswered items count as incorrect.`
                      : answeredCount === quizQuestions.length
                        ? "All questions answered. Ready to submit."
                        : `Answer ${quizQuestions.length - answeredCount} more to continue.`}
                  </span>
                  <button
                    style={PRIMARY_BUTTON_STYLE}
                    className={`${primary} w-full sm:w-auto`}
                    onClick={submitQuiz}
                    disabled={submittingQuiz}
                  >
                    {submittingQuiz ? "Grading..." : isMarathon ? "Submit Marathon Quiz" : "Submit answers"}
                    {!submittingQuiz && (
                      <ArrowRight
                        style={PRIMARY_BUTTON_STYLE}
                        className="text-white"
                        size={16}
                      />
                    )}
                  </button>
                </div>
              </div>
            </section>
          )}

          {viewState === "result" && (
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-indigo-950/5 ring-1 ring-slate-200/80 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/20 dark:ring-slate-700">
              <div
                className={`p-5 sm:p-7 ${
                  quizPassed
                    ? "bg-gradient-to-br from-emerald-50 via-white to-indigo-50 dark:from-emerald-950/40 dark:via-slate-900 dark:to-indigo-950/30"
                    : "bg-gradient-to-br from-rose-50 via-white to-amber-50 dark:from-rose-950/40 dark:via-slate-900 dark:to-amber-950/20"
                }`}
              >
                <div className="flex flex-col items-center gap-5 text-center sm:flex-row sm:text-left">
                  <div
                    className={`relative grid h-28 w-28 shrink-0 place-items-center rounded-full p-2 shadow-inner ring-8 ${
                      quizPassed
                        ? "bg-emerald-50 ring-emerald-100 dark:bg-emerald-950/60 dark:ring-emerald-400/10"
                        : "bg-rose-50 ring-rose-100 dark:bg-rose-950/50 dark:ring-rose-400/10"
                    }`}
                    style={{
                      background: `conic-gradient(${
                        quizPassed ? "#10b981" : "#f43f5e"
                      } ${scorePercent * 3.6}deg, ${
                        quizPassed ? "#d1fae5" : "#ffe4e6"
                      } 0deg)`,
                    }}
                    role="img"
                    aria-label={`Quiz score ${scorePercent}%`}
                  >
                    <div className="grid h-full w-full place-items-center rounded-full bg-white text-2xl font-black tabular-nums text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white">
                      {scorePercent}%
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ring-1 ${
                        quizPassed
                          ? "bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/20"
                          : "bg-rose-100 text-rose-800 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-400/20"
                      }`}
                    >
                      {quizPassed ? (
                        <CircleCheck size={14} />
                      ) : (
                        <CircleX size={14} />
                      )}
                      {quizPassed ? "Assessment passed" : quizResult?.timedOut ? "Time expired" : "Keep practicing"}
                    </span>
                    <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
                      {quizPassed ? "Great work!" : "You are making progress"}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                      {quizPassed
                        ? isMarathon ? "Marathon requirement passed. Meet the course XP requirement to request your certificate." : "The next lesson is now available."
                        : isMarathon ? quizResult?.timedOut ? "Time expired. Unanswered questions counted as incorrect; retry with a fresh set." : "Review the course and try a fresh set of questions." : "Review the lesson and try the assessment again."}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/80 bg-white/80 px-4 py-3 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Quiz
                    </span>
                    <strong className="mt-1 block text-xl text-slate-900 dark:text-white">
                      {isMarathon ? "Marathon" : `#${String(safeIndex + 1).padStart(2, "0")}`}
                    </strong>
                  </div>
                </div>
              </div>
              <div className="p-4 sm:p-6">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {[
                    {
                      label: "Correct / Total",
                      value: `${quizResult?.score ?? 0} / ${
                        quizResult?.totalQuestions ?? quizQuestions.length
                      }`,
                      tone: "text-indigo-700 dark:text-indigo-300",
                    },
                    {
                      label: "Percentage",
                      value: `${scorePercent}%`,
                      tone: "text-slate-900 dark:text-white",
                    },
                    {
                      label: "Pass mark",
                      value: "75%",
                      tone: "text-slate-900 dark:text-white",
                    },
                    {
                      label: "XP earned",
                      value: `${quizResult?.xpEarned || 0} XP`,
                      tone: "text-violet-700 dark:text-violet-300",
                    },
                  ].map((item) => (
                    <div
                      className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4 dark:border-slate-700 dark:bg-slate-800/60"
                      key={item.label}
                    >
                      <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {item.label}
                      </span>
                      <strong
                        className={`mt-1 block truncate text-lg font-bold tabular-nums sm:text-xl ${item.tone}`}
                      >
                        {item.value}
                      </strong>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
                  <button
                    style={PRIMARY_BUTTON_STYLE}
                    className={`${primary} w-full sm:w-auto`}
                    onClick={downloadQuizReport}
                  >
                    <Download
                      style={PRIMARY_BUTTON_STYLE}
                      className="text-white"
                      size={17}
                    />
                    Download Quiz Report (PDF)
                  </button>
                  {quizPassed ? (
                    <button
                      style={PRIMARY_BUTTON_STYLE}
                      className={`${primary} w-full sm:w-auto`}
                      onClick={() => onNavigate("dash")}
                    >
                      <CircleCheck
                        style={PRIMARY_BUTTON_STYLE}
                        className="text-white"
                        size={17}
                      />
                      My learning
                    </button>
                  ) : (
                    <button
                      style={PRIMARY_BUTTON_STYLE}
                      className={`${primary} w-full sm:w-auto`}
                      onClick={() => (isMarathon ? startMarathon() : startQuiz())}
                    >
                      <RotateCcw
                        style={PRIMARY_BUTTON_STYLE}
                        className="text-white"
                        size={17}
                      />
                      {isMarathon ? "Retry Marathon Quiz" : "Retry quiz"}
                    </button>
                  )}
                  <button
                    className={`${secondary} w-full sm:w-auto`}
                    onClick={() => setViewState("watch")}
                  >
                    Review video
                  </button>
                </div>
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
                  key={`${courseId}-${index}`}
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
