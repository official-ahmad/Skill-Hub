import { BookOpen, Code, Database, Globe, Terminal } from "lucide-react";
import { getCourseImage } from "./data/assetMappings";

function getCourseIcon(course, className) {
  const text = `${course?.title || course?.t || ""} ${course?.category || course?.cat || ""}`.toLowerCase();
  const props = { "aria-hidden": true, className: `course-icon ${className}`, size: 18, strokeWidth: 1.5 };

  if (/database|\bsql\b/.test(text)) return <Database {...props} />;
  if (/object[- ]oriented|\boop\b|c\+\+|data structure|\bdsa\b/.test(text)) return <Terminal {...props} />;
  if (/web development|frontend|front-end|backend|back-end|\bweb\b/.test(text)) return <Globe {...props} />;
  if (/python|programming|\bc\b|\bjava\b/.test(text)) return <Code {...props} />;
  return <BookOpen {...props} />;
}

export default function CourseIcon({ course, className = "" }) {
  const image = getCourseImage(course);
  return <span className={`grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 ${className}`} aria-hidden="true">
    {image && <img className="h-9 w-9 object-contain" src={image} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />}
    {!image && getCourseIcon(course, "h-5 w-5")}
  </span>;
}
