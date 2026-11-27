export function getLessonCount(course) {
  if (!course || typeof course !== "object") return 0;
  const candidates = [
    course.lessonCount, course.totalLessons, course.lesson_count,
    course.course?.lessonCount, course.course?.totalLessons,
    course.data?.lessonCount, course.data?.totalLessons,
  ];
  const arrayCandidates = [
    course.lessons, course.v,
    course.course?.lessons, course.course?.v,
    course.courseData?.lessons, course.courseData?.v,
    course.data?.lessons, course.data?.v,
  ];
  const counts = candidates
    .map(Number)
    .filter((value) => Number.isFinite(value) && value >= 0);
  for (const lessons of arrayCandidates) {
    if (Array.isArray(lessons)) counts.push(lessons.length);
  }
  return counts.length ? Math.max(...counts) : 0;
}

export function normalizeLesson(lesson) {
  if (Array.isArray(lesson)) {
    return [
      typeof lesson[0] === "string" ? lesson[0] : "Lesson unavailable",
      typeof lesson[1] === "string" ? lesson[1] : "",
      Array.isArray(lesson[2]) ? lesson[2] : [],
    ];
  }
  if (lesson && typeof lesson === "object") {
    return [
      typeof lesson.title === "string" ? lesson.title : "Lesson unavailable",
      typeof lesson.video === "string" ? lesson.video : "",
      Array.isArray(lesson.questions) ? lesson.questions : [],
    ];
  }
  return ["Lesson unavailable", "", []];
}

export function parseYouTubeUrl(value, uploadType = "video") {
  const raw = String(value || "").trim();
  if (uploadType === "playlist" && /^PL[\w-]{10,}$/.test(raw))
    return { valid: true, uploadType, playlistId: raw };
  if (uploadType === "video" && /^[\w-]{11}$/.test(raw))
    return { valid: true, uploadType, videoId: raw };
  try {
    const url = new URL(/^https?:\/\//i.test(raw) ? raw : `https://${raw}`);
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    if (!["youtube.com", "m.youtube.com", "youtu.be", "youtube-nocookie.com"].includes(host))
      return { valid: false, uploadType };
    if (uploadType === "playlist") {
      const playlistId = url.searchParams.get("list") || "";
      return { valid: /^PL[\w-]{10,}$/.test(playlistId), uploadType, playlistId };
    }
    const videoId = host === "youtu.be"
      ? url.pathname.split("/").filter(Boolean)[0]
      : url.searchParams.get("v") || url.pathname.match(/\/(?:embed|shorts)\/([\w-]{11})/)?.[1];
    return { valid: /^[\w-]{11}$/.test(videoId || ""), uploadType, videoId };
  } catch {
    return { valid: false, uploadType };
  }
}

export function guessCourseCategory(text) {
  const value = String(text || "").toLowerCase();
  if (/database|sql|mongodb|mysql/.test(value)) return "Database";
  if (/html|css|web|javascript|react|node|frontend|backend/.test(value)) return "Web Development";
  if (/linux|devops|docker|kubernetes|git/.test(value)) return "Tools";
  if (/android|flutter|ios|mobile/.test(value)) return "Mobile Development";
  if (/algorithm|data structure|computer science|operating system|network/.test(value)) return "Computer Science";
  return "Programming";
}

export function guessCourseLevel(text) {
  const value = String(text || "").toLowerCase();
  if (/advanced|expert|masterclass|deep dive/.test(value)) return "Advanced";
  if (/intermediate|full course|complete course|project/.test(value)) return "Intermediate";
  return "Beginner";
}
