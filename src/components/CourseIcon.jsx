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
  return <span className={`course-image-wrap ${className}`} aria-hidden="true">
    {image && <img className="course-image" src={image} alt="" onError={(event) => { event.currentTarget.hidden = true; }} />}
    {getCourseIcon(course, "course-icon-fallback")}
  </span>;
}
