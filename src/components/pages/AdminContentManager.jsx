import { useCallback, useEffect, useRef, useState } from "react";
import { Download, ExternalLink, FileSpreadsheet, LoaderCircle, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  bulkCreateCourses,
  createCourse,
  createTechnology,
  deleteCourse,
  deleteTechnology,
  getCourses,
  getCourse,
  resolveYouTubeCourse,
  resolveYouTubeInstructor,
  getTechnologies,
  updateCourse,
  updateTechnology,
} from "../../api";
import { getSafeErrorMessage } from "../../utils/errorMessage";
import { getLessonCount, guessCourseCategory, guessCourseLevel, parseYouTubeUrl } from "../../utils/courseUtils";
import VerifiedBadge from "../VerifiedBadge";

const COURSE_TEMPLATE_COLUMNS = [
  "courseName", "uploadType", "videoOrPlaylistUrl", "imagePath", "instructorName",
  "instructorChannelUrl", "instructorPhotoPath", "category", "level", "tags",
  "description", "verifiedInstructor",
];
const COURSE_TEMPLATE_SAMPLE = {
  courseName: "Introduction to JavaScript",
  uploadType: "video",
  videoOrPlaylistUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  imagePath: "/courses/javascript.png",
  instructorName: "SkillHub Instructor",
  instructorChannelUrl: "https://www.youtube.com/@SkillHub",
  instructorPhotoPath: "/instructors/skillhub.jpg",
  category: "Programming",
  level: "Beginner",
  tags: "javascript, programming",
  description: "A sample course row. Replace it with your course details.",
  verifiedInstructor: "false",
};

const blankCourse = {
  id: "",
  title: "",
  category: "Programming",
  description: "",
  level: "Beginner",
  instructor: "",
  image: "",
  instructorPhoto: "",
  instructorUrl: "",
  instructorVerified: false,
  uploadType: "video",
  videoOrPlaylistUrl: "",
  tags: "",
};
const blankTechnology = {
  name: "",
  category: "General",
  description: "",
  image: "",
};
const primaryButton =
  "button-primary inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold";
const secondaryButton =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200";
const iconButton =
  "grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300";

export default function AdminContentManager() {
  const [section, setSection] = useState("courses");
  const [courses, setCourses] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [courseForm, setCourseForm] = useState(blankCourse);
  const [technologyForm, setTechnologyForm] = useState(blankTechnology);
  const [editingCourse, setEditingCourse] = useState(null);
  const [editingTechnology, setEditingTechnology] = useState(null);
  const [loading, setLoading] = useState(true);
  const [keptLessons, setKeptLessons] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [importPreview, setImportPreview] = useState(null);
  const [importing, setImporting] = useState(false);
  const [resolvingVideo, setResolvingVideo] = useState(false);
  const [resolvingInstructor, setResolvingInstructor] = useState(false);
  const searchInputRef = useRef(null);

  const load = useCallback(async () => {
    try {
      const [courseList, techList] = await Promise.all([
        getCourses(),
        getTechnologies(),
      ]);
      setCourses(courseList);
      setTechnologies(techList);
    } catch (error) {
      toast.error(getSafeErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([getCourses(), getTechnologies()])
      .then(([courseList, techList]) => {
        if (!active) return;
        setCourses(courseList);
        setTechnologies(techList);
      })
      .catch((error) => {
        if (active) toast.error(getSafeErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const saveCourse = async (event) => {
    event.preventDefault();
    const parsed = parseYouTubeUrl(courseForm.videoOrPlaylistUrl, courseForm.uploadType);
    if (!parsed.valid) return toast.error(`Enter a valid YouTube ${courseForm.uploadType} URL or ID`);
    const fallbackLessons = parsed.videoId
      ? [{ title: courseForm.title.trim(), video: parsed.videoId, questions: [] }]
      : [{ title: courseForm.title.trim() || "YouTube Playlist", video: parsed.playlistId, questions: [] }];
    const payload = {
      ...courseForm,
      instructorUrl: courseForm.instructorUrl.trim(),
      instructorChannelUrl: courseForm.instructorUrl.trim(),
      instructorUrlVerified: courseForm.instructorVerified,
      tags: courseForm.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      lessons: keptLessons || fallbackLessons,
    };
    try {
      if (editingCourse) await updateCourse(editingCourse, payload);
      else await createCourse(payload);
      toast.success(editingCourse ? "Course updated" : "Course created");
      setCourseForm(blankCourse);
      setEditingCourse(null);
      setKeptLessons(null);
      await load();
    } catch (error) {
      toast.error(getSafeErrorMessage(error));
    }
  };

  const editCourse = async (course) => {
    setSection("courses");
    try {
      const full = await getCourse(course._id || course.id);
      const lessons = Array.isArray(full.lessons) ? full.lessons : [];
      const firstLesson = lessons[0];
      const firstVideo = Array.isArray(firstLesson) ? firstLesson[1] : firstLesson?.video;
      const mode = /^PL[\w-]{10,}$/.test(String(firstVideo || "")) ? "playlist" : full.uploadType || "video";
      const lessonUrl = full.videoOrPlaylistUrl || firstVideo || "";
      setEditingCourse(full._id || course._id);
      setKeptLessons(lessons);
      setCourseForm({
        ...blankCourse,
        id: full._id || course._id,
        title: full.title || "",
        category: full.category || "Programming",
        description: full.description || "",
        level: full.level || "Beginner",
        instructor: full.instructor || "",
        image: full.image || "",
        instructorPhoto: full.instructorPhoto || "",
        instructorUrl: full.instructorChannelUrl || full.instructorUrl || "",
        instructorVerified: Boolean(full.instructorVerified || full.instructorUrlVerified),
        uploadType: mode,
        videoOrPlaylistUrl: lessonUrl,
        tags: (full.tags || []).join(", "),
      });
      setSearchText("");
    } catch (error) {
      toast.error(getSafeErrorMessage(error, "Could not load this course for editing"));
    }
  };

  const resetCourseForm = () => {
    setEditingCourse(null);
    setCourseForm(blankCourse);
    setKeptLessons(null);
  };

  const handleYouTubeResolve = async () => {
    const parsed = parseYouTubeUrl(courseForm.videoOrPlaylistUrl, courseForm.uploadType);
    if (!parsed.valid) return;
    setResolvingVideo(true);
    try {
      const metadata = await resolveYouTubeCourse(courseForm.videoOrPlaylistUrl, courseForm.uploadType, courseForm.title);
      setKeptLessons(metadata.lessons?.length ? metadata.lessons : null);
      setCourseForm((current) => ({
        ...current,
        title: current.title || metadata.suggestedCourseTitle || current.title,
        instructor: current.instructor || metadata.instructor || "",
        instructorUrl: current.instructorUrl || metadata.instructorUrl || "",
        instructorPhoto: current.instructorPhoto || metadata.instructorPhoto || "",
        category: current.category === "Programming" ? guessCourseCategory(metadata.videoTitle || current.title) : current.category,
        level: current.level === "Beginner" ? guessCourseLevel(metadata.videoTitle || current.title) : current.level,
      }));
      if (metadata.lessons?.length > 1) toast.success(`Detected ${metadata.lessons.length} playlist videos`);
    } catch (error) {
      toast.error(getSafeErrorMessage(error, "Could not read YouTube details; using the playlist fallback"));
    } finally {
      setResolvingVideo(false);
    }
  };

  const handleInstructorResolve = async (url) => {
    const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    if (!/^https?:\/\/(?:www\.)?(?:m\.)?youtube\.com\/(?:@|channel\/|user\/)/i.test(normalizedUrl)) return;
    setResolvingInstructor(true);
    try {
      const result = await resolveYouTubeInstructor(normalizedUrl);
      setCourseForm((current) => ({
        ...current,
        instructor: current.instructor || result.instructor || "",
        instructorUrl: result.instructorUrl || current.instructorUrl,
        instructorPhoto: current.instructorPhoto || result.instructorPhoto || "",
      }));
    } catch (error) {
      toast.error(getSafeErrorMessage(error, "Could not look up the instructor channel"));
    } finally {
      setResolvingInstructor(false);
    }
  };

  const courseMatches = courses.filter((course) => {
    const query = searchText.trim().toLowerCase();
    if (!query) return true;
    return [course.title, course.instructor, course.category, ...(course.tags || [])]
      .some((value) => String(value || "").toLowerCase().includes(query));
  });
  const suggestions = searchText.trim() ? courseMatches.slice(0, 8) : [];

  const downloadTemplate = (type) => {
    const sheet = XLSX.utils.json_to_sheet([COURSE_TEMPLATE_SAMPLE], { header: COURSE_TEMPLATE_COLUMNS });
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, "Courses");
    if (type === "csv") XLSX.writeFile(book, "skillhub-course-template.csv", { bookType: "csv" });
    else XLSX.writeFile(book, "skillhub-course-template.xlsx", { bookType: "xlsx" });
  };

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!/\.(csv|xlsx)$/i.test(file.name)) return toast.error("Choose a .csv or .xlsx file");
    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: "" });
      const valid = [];
      const invalid = [];
      rows.forEach((row, index) => {
        const get = (...keys) => {
          const key = Object.keys(row).find((candidate) => keys.includes(candidate.toLowerCase().trim()));
          return key ? row[key] : "";
        };
        const title = String(get("coursename", "title", "course name")).trim();
        const uploadType = String(get("uploadtype", "upload type")).trim().toLowerCase();
        const videoOrPlaylistUrl = String(get("videoorplaylisturl", "video or playlist url", "url")).trim();
        const parsed = parseYouTubeUrl(videoOrPlaylistUrl, uploadType);
        const errors = [];
        if (title.length < 2 || title.length > 160) errors.push("courseName must be 2–160 characters");
        if (!["video", "playlist"].includes(uploadType)) errors.push("uploadType must be video or playlist");
        else if (!parsed.valid) errors.push(`invalid YouTube ${uploadType} URL`);
        if (errors.length) invalid.push({ row: index + 2, title, errors });
        else {
          const rawTags = get("tags");
          valid.push({
            title,
            uploadType,
            videoOrPlaylistUrl,
            image: String(get("imagepath", "image path")).trim(),
            instructor: String(get("instructorname", "instructor name")).trim() || "SkillHub",
            instructorUrl: String(get("instructorchannelurl", "instructor channel url")).trim(),
            instructorChannelUrl: String(get("instructorchannelurl", "instructor channel url")).trim(),
            instructorPhoto: String(get("instructorphotopath", "instructor photo path")).trim(),
            instructorVerified: [true, "true", "yes", "1"].includes(String(get("verifiedinstructor", "verified instructor")).trim().toLowerCase()),
            category: String(get("category")).trim() || guessCourseCategory(title),
            level: String(get("level")).trim() || guessCourseLevel(title),
            tags: String(rawTags).split(",").map((tag) => tag.trim()).filter(Boolean),
            description: String(get("description")).trim(),
          });
        }
      });
      setImportPreview({ fileName: file.name, valid, invalid });
    } catch (error) {
      toast.error(getSafeErrorMessage(error, "Could not read that spreadsheet"));
    }
  };

  const runBulkImport = async () => {
    if (!importPreview?.valid.length) return;
    setImporting(true);
    try {
      const result = await bulkCreateCourses(importPreview.valid);
      toast.success(`Imported ${result.importedCount} course${result.importedCount === 1 ? "" : "s"}; ${result.invalidCount} row${result.invalidCount === 1 ? "" : "s"} failed`);
      setImportPreview({ ...importPreview, valid: [], serverErrors: result.errors || [] });
      await load();
    } catch (error) {
      toast.error(getSafeErrorMessage(error, "Bulk import failed"));
    } finally {
      setImporting(false);
    }
  };

  const removeCourse = async (course) => {
    const result = await Swal.fire({
      title: "Delete course?",
      text: `Delete "${course.title}" and its saved course progress?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete course",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteCourse(course._id);
      toast.success("Course deleted");
      await load();
    } catch (error) {
      toast.error(getSafeErrorMessage(error));
    }
  };

  const saveTechnology = async (event) => {
    event.preventDefault();
    try {
      if (editingTechnology)
        await updateTechnology(editingTechnology, technologyForm);
      else await createTechnology(technologyForm);
      toast.success(
        editingTechnology ? "Technology updated" : "Technology created",
      );
      setTechnologyForm(blankTechnology);
      setEditingTechnology(null);
      await load();
    } catch (error) {
      toast.error(getSafeErrorMessage(error));
    }
  };

  const editTechnology = (technology) => {
    setSection("technologies");
    setEditingTechnology(technology._id);
    setTechnologyForm({
      name: technology.name || "",
      category: technology.category || "General",
      description: technology.description || "",
      image: technology.image || "",
    });
  };

  const removeTechnology = async (technology) => {
    const result = await Swal.fire({
      title: "Delete technology?",
      text: `Delete "${technology.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete technology",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteTechnology(technology._id);
      toast.success("Technology deleted");
      await load();
    } catch (error) {
      toast.error(getSafeErrorMessage(error));
    }
  };

  return (
    <section className="grid gap-4">
      <div className="flex gap-2">
        <button
          className={section === "courses" ? "is-active" : ""}
          onClick={() => setSection("courses")}
        >
          Courses <span>{courses.length}</span>
        </button>
        <button
          className={section === "technologies" ? "is-active" : ""}
          onClick={() => setSection("technologies")}
        >
          Technologies <span>{technologies.length}</span>
        </button>
      </div>
      {section === "courses" ? (
        <>
          <div className="relative z-20">
            <label className="sr-only" htmlFor="admin-course-search">Search courses</label>
            <div className="flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 shadow-sm focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 dark:border-slate-700 dark:bg-slate-900">
              <Search size={17} className="shrink-0 text-slate-400" />
              <input ref={searchInputRef} id="admin-course-search" className="min-w-0 flex-1 bg-transparent text-sm outline-none" placeholder="Search course, instructor, category or tag…" value={searchText} role="combobox" aria-expanded={suggestions.length > 0} aria-controls="admin-course-suggestions" aria-autocomplete="list"
                onChange={(event) => { setSearchText(event.target.value); setSuggestionIndex(-1); }}
                onKeyDown={(event) => {
                  if (event.key === "ArrowDown" && suggestions.length) { event.preventDefault(); setSuggestionIndex((index) => Math.min(index + 1, suggestions.length - 1)); }
                  if (event.key === "ArrowUp" && suggestions.length) { event.preventDefault(); setSuggestionIndex((index) => Math.max(index - 1, 0)); }
                  if (event.key === "Escape") { setSearchText(""); setSuggestionIndex(-1); }
                  if (event.key === "Enter" && suggestions.length) { event.preventDefault(); editCourse(suggestions[Math.max(0, suggestionIndex)]); }
                }} />
              {searchText && <button type="button" aria-label="Clear course search" onClick={() => { setSearchText(""); setSuggestionIndex(-1); searchInputRef.current?.focus(); }} className="rounded-full p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={16} /></button>}
            </div>
            {!!suggestions.length && <ul id="admin-course-suggestions" role="listbox" className="absolute left-0 right-0 top-full mt-1 max-h-80 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {suggestions.map((course, index) => <li key={course._id || course.id} role="option" aria-selected={suggestionIndex === index}><button type="button" className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-teal-50 dark:hover:bg-white/5 ${suggestionIndex === index ? "bg-teal-50 dark:bg-white/5" : ""}`} onMouseEnter={() => setSuggestionIndex(index)} onClick={() => editCourse(course)}><span className="min-w-0"><strong className="block truncate text-sm">{course.title}</strong><small className="block truncate text-slate-500">{course.instructor || "No instructor"} · {course.category || "General"}</small></span><Pencil size={15} className="shrink-0 text-slate-400" /></button></li>)}
            </ul>}
          </div>
          <section className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-semibold">Spreadsheet import</h2><p className="mt-1 text-xs text-slate-500">Download a template or preview a CSV/XLSX batch before importing.</p></div><div className="flex flex-wrap gap-2"><button type="button" className={secondaryButton} onClick={() => downloadTemplate("csv")}><Download size={15} /> CSV template</button><button type="button" className={secondaryButton} onClick={() => downloadTemplate("xlsx")}><FileSpreadsheet size={15} /> Excel template</button><label className={`${primaryButton} cursor-pointer`}><Plus size={15} /> Choose file<input className="sr-only" type="file" accept=".csv,.xlsx" onChange={handleImportFile} /></label></div></div>
            {importPreview && <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950"><div className="flex flex-wrap items-center justify-between gap-3"><div><strong className="text-sm">{importPreview.fileName}</strong><p className="text-xs text-slate-500">{importPreview.valid.length} valid · {importPreview.invalid.length + (importPreview.serverErrors?.length || 0)} invalid</p></div><div className="flex gap-2"><button type="button" className={secondaryButton} onClick={() => setImportPreview(null)}>Clear preview</button><button type="button" disabled={!importPreview.valid.length || importing} className={primaryButton} onClick={runBulkImport}>{importing && <LoaderCircle size={15} className="animate-spin" />} Import {importPreview.valid.length} courses</button></div></div><div className="mt-3 grid gap-1 text-xs sm:grid-cols-2"><p className="text-emerald-700 dark:text-emerald-300">Valid rows: {importPreview.valid.slice(0, 4).map((row) => row.title).join(", ") || "none"}</p><p className="text-rose-700 dark:text-rose-300">Invalid rows: {[...importPreview.invalid, ...(importPreview.serverErrors || [])].slice(0, 4).map((row) => `Row ${row.row}: ${row.errors?.join(", ") || row.message}`).join(" · ") || "none"}</p></div></div>}
          </section>
          <form className="manager-form" onSubmit={saveCourse}>
            <header className="mb-4 flex items-center justify-between gap-3">
              <div><h2 className="font-semibold">{editingCourse ? "Edit course" : "Create a course"}</h2><p className="mt-1 text-xs text-slate-500">Structured fields only. Existing quiz questions are preserved during metadata edits.</p></div>
              {editingCourse && (
                <button
                  className={secondaryButton}
                  type="button"
                  onClick={resetCourseForm}
                >
                  Cancel edit
                </button>
              )}
            </header>
            <div className="manager-fields">
              <label>
                Course name
                <input
                  required
                  minLength={2}
                  maxLength={160}
                  value={courseForm.title}
                  onChange={(event) => { const title = event.target.value; setCourseForm((current) => ({ ...current, title, category: guessCourseCategory(title), level: guessCourseLevel(title) })); }}
                />
              </label>
              <label>Course mode<select value={courseForm.uploadType} onChange={(event) => { setCourseForm((current) => ({ ...current, uploadType: event.target.value })); setKeptLessons(null); }}><option value="video">Single YouTube video</option><option value="playlist">YouTube playlist</option></select></label>
              <label className="manager-wide">{courseForm.uploadType === "playlist" ? "Playlist URL or ID" : "Course video URL"}<input required placeholder={courseForm.uploadType === "playlist" ? "https://youtube.com/playlist?list=PL…" : "https://youtube.com/watch?v=…"} value={courseForm.videoOrPlaylistUrl} onChange={(event) => { const value = event.target.value; const type = /[?&]list=|^PL[\w-]{10,}$/i.test(value.trim()) ? "playlist" : courseForm.uploadType; setKeptLessons(null); setCourseForm((current) => ({ ...current, uploadType: type, videoOrPlaylistUrl: value, category: guessCourseCategory(`${current.title} ${value}`), level: guessCourseLevel(current.title) })); }} onBlur={handleYouTubeResolve} />{resolvingVideo && <small className="text-teal-700">Looking up YouTube details…</small>}</label>
              <label>
                Category
                <input
                  required
                  maxLength={80}
                  value={courseForm.category}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, category: e.target.value })
                  }
                />
              </label>
              <label>
                Instructor name
                <input
                  value={courseForm.instructor}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, instructor: e.target.value })
                  }
                />
              </label>
              <label>
                Level
                <input
                  value={courseForm.level}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, level: e.target.value })
                  }
                />
              </label>
              <label>
                Course image path
                <input
                  placeholder="/courses/javascript.png"
                  value={courseForm.image}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, image: e.target.value })
                  }
                />
                {courseForm.image && <img src={courseForm.image} alt="Course image preview" className="mt-2 h-20 w-32 rounded-lg object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
              </label>
              <label>
                Instructor photo path
                <input
                  placeholder="/instructors/creator.jpg"
                  value={courseForm.instructorPhoto}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      instructorPhoto: e.target.value,
                    })
                  }
                />
                {courseForm.instructorPhoto && <img src={courseForm.instructorPhoto} alt="Instructor photo preview" className="mt-2 h-16 w-16 rounded-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} />}
              </label>
              <label>
                Instructor YouTube channel URL
                <input
                  type="url"
                  value={courseForm.instructorUrl}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      instructorUrl: e.target.value,
                    })
                  }
                  onBlur={(event) => handleInstructorResolve(event.target.value)}
                />
                {resolvingInstructor && <small className="text-teal-700">Looking up channel details…</small>}
              </label>
              <label>
                Tags, comma separated
                <input
                  value={courseForm.tags}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, tags: e.target.value })
                  }
                />
              </label>
              <label className="manager-wide">
                Description
                <textarea
                  value={courseForm.description}
                  onChange={(e) =>
                    setCourseForm({
                      ...courseForm,
                      description: e.target.value,
                    })
                  }
                />
              </label>
              <p className="manager-wide text-xs text-slate-500">YouTube details are checked when the video or playlist URL is entered. Instructor photo can be set above or filled from available video metadata.</p>
              <label className="manager-check">
                <input
                  type="checkbox"
                  checked={courseForm.instructorVerified}
                  onChange={(e) =>
                    setCourseForm({ ...courseForm, instructorVerified: e.target.checked })
                  }
                />{" "}
                I verified this instructor {courseForm.instructorVerified && <VerifiedBadge />}
              </label>
            </div>
            <button className={primaryButton} type="submit" disabled={resolvingVideo || resolvingInstructor}>
              <Plus size={16} />{" "}
              {editingCourse ? "Save course" : "Create course"}
            </button>
          </form>
          <div className="grid gap-2">
            {courseMatches.map((course) => (
              <article
                className={`flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800 ${editingCourse === course._id ? "ring-2 ring-teal-500" : ""}`}
                key={course._id}
              >
                <span className="min-w-0">
                  <strong className="flex items-center gap-1.5 truncate">{course.title}{(course.instructorVerified || course.instructorUrlVerified) && <VerifiedBadge />}</strong>
                  <small className="text-slate-500">
                    {course.category} · {getLessonCount(course)} lessons ·{" "}
                    {course._id}
                  </small>
                  <small className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">{course.instructor || "No instructor"}{(course.instructorVerified || course.instructorUrlVerified) && <VerifiedBadge />}{(course.instructorChannelUrl || course.instructorUrl) && <a className="ml-1 inline-flex items-center gap-1 text-sky-700 hover:underline dark:text-sky-300" href={course.instructorChannelUrl || course.instructorUrl} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>YouTube <ExternalLink size={12} /></a>}</small>
                </span>
                <div className="flex shrink-0 gap-2">
                  <button
                    className={iconButton}
                    aria-label={`Edit ${course.title}`}
                    onClick={() => editCourse(course)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className={`${iconButton} text-rose-600`}
                    aria-label={`Delete ${course.title}`}
                    onClick={() => removeCourse(course)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
            {!loading && courseMatches.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                No courses found.
              </p>
            )}
          </div>
        </>
      ) : (
        <>
          <form className="manager-form" onSubmit={saveTechnology}>
            <header className="mb-4 flex items-center justify-between gap-3">
              <h2 className="font-semibold">
                {editingTechnology ? "Edit technology" : "Add technology"}
              </h2>
              {editingTechnology && (
                <button
                  className={secondaryButton}
                  type="button"
                  onClick={() => {
                    setEditingTechnology(null);
                    setTechnologyForm(blankTechnology);
                  }}
                >
                  Cancel edit
                </button>
              )}
            </header>
            <div className="manager-fields">
              <label>
                Name
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={technologyForm.name}
                  onChange={(e) =>
                    setTechnologyForm({
                      ...technologyForm,
                      name: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Category
                <input
                  value={technologyForm.category}
                  onChange={(e) =>
                    setTechnologyForm({
                      ...technologyForm,
                      category: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Image path
                <input
                  placeholder="/courses/javascript.png"
                  value={technologyForm.image}
                  onChange={(e) =>
                    setTechnologyForm({
                      ...technologyForm,
                      image: e.target.value,
                    })
                  }
                />
              </label>
              <label>
                Description
                <textarea
                  value={technologyForm.description}
                  onChange={(e) =>
                    setTechnologyForm({
                      ...technologyForm,
                      description: e.target.value,
                    })
                  }
                />
              </label>
            </div>
            <button className={primaryButton} type="submit">
              <Plus size={16} />{" "}
              {editingTechnology ? "Save technology" : "Create technology"}
            </button>
          </form>
          <div className="grid gap-2">
            {technologies.map((technology) => (
              <article
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                key={technology._id}
              >
                <span>
                  <strong>{technology.name}</strong>
                  <small className="ml-2 text-slate-500">
                    {technology.category}
                  </small>
                </span>
                <div className="flex shrink-0 gap-2">
                  <button
                    className={iconButton}
                    aria-label={`Edit ${technology.name}`}
                    onClick={() => editTechnology(technology)}
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    className={`${iconButton} text-rose-600`}
                    aria-label={`Delete ${technology.name}`}
                    onClick={() => removeTechnology(technology)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </article>
            ))}
            {!loading && technologies.length === 0 && (
              <p className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">
                No technologies found.
              </p>
            )}
          </div>
        </>
      )}
    </section>
  );
}
