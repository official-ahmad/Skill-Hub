import { BadgeCheck } from "lucide-react";

export default function VerifiedBadge({ className = "" }) {
  return (
    <BadgeCheck
      aria-label="Verified instructor"
      role="img"
      className={`inline-block shrink-0 text-sky-500 ${className}`}
      size={16}
      fill="currentColor"
      stroke="white"
      strokeWidth={2.5}
    />
  );
}
