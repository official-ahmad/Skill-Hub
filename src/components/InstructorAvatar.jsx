import { useState } from "react";
import { getInstructorPhotoCandidates } from "./data/assetMappings";

function makeInitials(name) {
  return (
    String(name || "Instructor")
      .replace(/\s*\([^)]*\)\s*/g, " ")
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("") || "IN"
  );
}

export default function InstructorAvatar({
  instructor,
  course,
  initials,
  className = "",
}) {
  const candidates = getInstructorPhotoCandidates(course || instructor);
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const fallback = initials || makeInitials(instructor);
  const imageSrc = !failed ? candidates[candidateIndex] : null;

  return (
    <span
      className={`instructor-avatar ${className}`}
      role="img"
      aria-label={instructor || "Course instructor"}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt=""
          loading="lazy"
          onError={() => {
            if (candidateIndex + 1 < candidates.length)
              setCandidateIndex((index) => index + 1);
            else setFailed(true);
          }}
        />
      ) : (
        <span className="instructor-avatar-initials">{fallback}</span>
      )}
    </span>
  );
}
