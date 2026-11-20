import { ExternalLink, UserRound } from "lucide-react";
import { getCreatorChannel, getInstructorPhoto } from "./data/assetMappings";

export default function InstructorIdentity({ course, count, compact = false }) {
  const name = course?.by || course?.instructor || "Skillhub instructor";
  const photo = getInstructorPhoto(course);
  const channel = getCreatorChannel(course);
  return <div className={`instructor-identity${compact ? " is-compact" : ""}`}>
    <span className="instructor-avatar">
      <UserRound size={18} strokeWidth={1.5} />
      {photo && <img src={photo} alt="" loading="lazy" onError={(event) => { event.currentTarget.hidden = true; }} />}
    </span>
    <span className="instructor-identity-copy">
      <strong>{name}</strong>
      {count != null && <small>{count} {count === 1 ? "course" : "courses"}</small>}
    </span>
    {channel.verified
      ? <a className="instructor-channel" href={channel.url} target="_blank" rel="noreferrer" aria-label={`${name} YouTube channel`}><ExternalLink size={16} strokeWidth={1.5} /> YouTube</a>
      : <span className="instructor-channel-status">Channel unverified</span>}
  </div>;
}
