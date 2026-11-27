import { ExternalLink } from "lucide-react";
import InstructorAvatar from "./InstructorAvatar";
import { getCreatorChannel } from "./data/assetMappings";
import VerifiedBadge from "./VerifiedBadge";

export default function InstructorIdentity({ course, count, compact = false }) {
  const name = course?.by || course?.instructor || "Skillhub instructor";
  const channel = getCreatorChannel(course);
  const verified = Boolean(course?.instructorVerified || course?.instructorUrlVerified || channel.verified);
  return (
    <div className={`instructor-identity${compact ? " is-compact" : ""}`}>
      <InstructorAvatar key={name} instructor={name} course={course} />
      <span className="instructor-identity-copy">
        <strong className="inline-flex items-center gap-1.5">{name}{verified && <VerifiedBadge />}</strong>
        {count != null && (
          <small>
            {count} {count === 1 ? "course" : "courses"}
          </small>
        )}
      </span>
      {channel.url ? (
        <a
          className="instructor-channel"
          href={channel.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`${name} YouTube channel`}
        >
          <ExternalLink size={16} strokeWidth={1.5} /> YouTube
        </a>
      ) : (
        <span className="instructor-channel-status">Channel unverified</span>
      )}
    </div>
  );
}
