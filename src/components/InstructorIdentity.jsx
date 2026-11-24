import { ExternalLink } from "lucide-react";
import InstructorAvatar from "./InstructorAvatar";
import { getCreatorChannel } from "./data/assetMappings";

export default function InstructorIdentity({ course, count, compact = false }) {
  const name = course?.by || course?.instructor || "Skillhub instructor";
  const channel = getCreatorChannel(course);
  return (
    <div className={`instructor-identity${compact ? " is-compact" : ""}`}>
      <InstructorAvatar key={name} instructor={name} />
      <span className="instructor-identity-copy">
        <strong>{name}</strong>
        {count != null && (
          <small>
            {count} {count === 1 ? "course" : "courses"}
          </small>
        )}
      </span>
      {channel.verified ? (
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
