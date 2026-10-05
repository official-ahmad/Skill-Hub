import React, { useEffect, useRef } from "react";
export default function Confetti({ onComplete }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = [
      "#7c5cff",
      "#2fd18b",
      "#ffb800",
      "#ff5d73",
      "#38bdf8",
      "#ec4899",
      "#a855f7",
    ];
    const particles = Array.from({ length: 90 }, () => ({
      x: canvas.width / 2 + (Math.random() - 0.5) * 260,
      y: canvas.height * 0.45 + (Math.random() - 0.5) * 80,
      vx: (Math.random() - 0.5) * 18,
      vy: (Math.random() - 1.2) * 16 - 4,
      size: Math.random() * 9 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      rSpeed: (Math.random() - 0.5) * 14,
      alpha: 1,
      decay: Math.random() * 0.012 + 0.012,
    }));

    let animId;

    const step = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = 0;

      for (let p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.35;
        p.rotation += p.rSpeed;
        p.alpha -= p.decay;

        if (p.alpha > 0) {
          active++;
          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.65);
          ctx.restore();
        }
      }

      if (active > 0) {
        animId = requestAnimationFrame(step);
      } else {
        cancelAnimationFrame(animId);
        if (onComplete) onComplete();
      }
    };

    animId = requestAnimationFrame(step);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [onComplete]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-[99999] h-screen w-screen"
    />
  );
}
