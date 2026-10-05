import React from "react";

export default function MobileMenu({ isOpen, totalXP, onNavigate, onLogout }) {
  if (!isOpen) return null;

  return (
    <div className="fixed top-[65px] left-0 right-0 z-50 border-b border-[#22224c] bg-[#11112b] p-5 shadow-2xl md:hidden">
      <div className="flex flex-col gap-2.5">
        <a
          onClick={() => onNavigate("home")}
          className="cursor-pointer rounded-xl border border-[#22224c] bg-[#0c0c24] px-4 py-3 text-sm font-semibold text-[#f1f0fc] hover:border-[#7c5cff] hover:bg-[#17173a]"
        >
          🏠 Home
        </a>
        <a
          onClick={() => onNavigate("courses")}
          className="cursor-pointer rounded-xl border border-[#22224c] bg-[#0c0c24] px-4 py-3 text-sm font-semibold text-[#f1f0fc] hover:border-[#7c5cff] hover:bg-[#17173a]"
        >
          📚 Courses
        </a>
        <a
          onClick={() => onNavigate("leaderboard")}
          className="cursor-pointer rounded-xl border border-[#22224c] bg-[#0c0c24] px-4 py-3 text-sm font-semibold text-[#f1f0fc] hover:border-[#7c5cff] hover:bg-[#17173a]"
        >
          🏆 Class Leaderboard
        </a>
        <a
          onClick={() => onNavigate("dash")}
          className="cursor-pointer rounded-xl border border-[#22224c] bg-[#0c0c24] px-4 py-3 text-sm font-semibold text-[#f1f0fc] hover:border-[#7c5cff] hover:bg-[#17173a]"
        >
          🎓 My Learning
        </a>
        <a
          onClick={() => onNavigate("profile")}
          className="cursor-pointer rounded-xl border border-[#22224c] bg-[#0c0c24] px-4 py-3 text-sm font-semibold text-[#f1f0fc] hover:border-[#7c5cff] hover:bg-[#17173a]"
        >
          👤 My Profile
        </a>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[#22224c] pt-3.5">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-[rgba(255,184,0,0.3)] bg-[rgba(255,184,0,0.15)] px-3 py-1 text-xs font-bold text-[#ffb800]">
          ⚡ {totalXP} XP
        </div>
        <button
          onClick={onLogout}
          className="rounded-xl border border-[#22224c] bg-transparent px-3.5 py-1.5 text-xs font-semibold text-[#f1f0fc] hover:bg-[#17173a]"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
