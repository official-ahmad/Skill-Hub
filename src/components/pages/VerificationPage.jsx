import { useEffect, useState } from "react";
import { BadgeCheck, CalendarDays, Printer, ShieldX } from "lucide-react";
import { verifyCertificate } from "../../api";
import { getSafeErrorMessage } from "../../utils/errorMessage";

const serif = {
  fontFamily: "'Playfair Display', 'Georgia', 'Times New Roman', serif",
};

const TEAL = "#0f5c66";
const CORAL = "#ff7a59";

/* Certificate is designed at A4 landscape (96dpi) and scaled to fit the screen */
const W = 1123;
const H = 794;

/* Skillhub logo mark (inline SVG, inherits `fill` from the color prop) */
function SkillhubMark({ size = 40, color = CORAL, className = "", style }) {
  const bracket =
    "M237 80 L130 145 Q95 168 95 195 Q95 222 130 245 L203 295 L203 252 L160 226 Q130 208 130 195 Q130 182 160 165 L237 120 Z";
  const bar = "M177 178 L205 195 L205 252 L177 235 Z";
  return (
    <svg
      viewBox="60 60 326 326"
      width={size}
      height={size}
      className={className}
      style={style}
      fill={color}
      aria-hidden="true"
    >
      <path d={bracket} />
      <path d={bar} />
      <g transform="rotate(180 222 222)">
        <path d={bracket} />
        <path d={bar} />
      </g>
    </svg>
  );
}

function Corner({ className }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute h-14 w-14 border-[#ff7a59] ${className}`}
    />
  );
}

function useFitScale() {
  const calc = () =>
    Math.max(
      0.2,
      Math.min((window.innerWidth - 24) / W, (window.innerHeight - 76) / H),
    );
  const [scale, setScale] = useState(calc);
  useEffect(() => {
    const onResize = () => setScale(calc());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return scale;
}

export default function VerificationPage({ certificateId }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const scale = useFitScale();

  useEffect(() => {
    let active = true;
    verifyCertificate(certificateId)
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((item) => {
        if (active) setError(getSafeErrorMessage(item, "Certificate could not be verified."));
      });
    return () => {
      active = false;
    };
  }, [certificateId]);

  const cert = result?.certificate;
  const issued = cert
    ? new Date(cert.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <main className="flex h-screen flex-col items-center justify-center gap-3 overflow-hidden bg-slate-100 px-3 text-slate-900 print:h-auto print:bg-white print:p-0 dark:bg-slate-950">
      <style>{`
        @page { size: A4 landscape; margin: 0; }
        @media print {
          .cert-wrap { width: ${W}px !important; height: ${H}px !important; }
          .cert-scale { transform: none !important; }
        }
      `}</style>

      {error ? (
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
          <ShieldX className="mx-auto text-rose-500" size={48} />
          <h1 className="mt-4 text-2xl font-bold">Certificate not verified</h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
        </section>
      ) : cert ? (
        <>
          {/* Verification status bar */}
          <div
            className="flex items-center justify-between gap-3 print:hidden"
            style={{ width: W * scale }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">
              <BadgeCheck size={18} />
              Authentic certificate · Verified
            </span>
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              <Printer size={16} />
              Print
            </button>
          </div>

          {/* Certificate (landscape, fits the screen, no scrolling) */}
          <div
            className="cert-wrap shrink-0"
            style={{ width: W * scale, height: H * scale }}
          >
            <section
              className="cert-scale relative overflow-hidden bg-[#fdfaf4] p-5 shadow-2xl ring-1 ring-black/5 print:shadow-none"
              style={{
                width: W,
                height: H,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                backgroundImage:
                  "radial-gradient(circle at 50% 0%, rgba(255,122,89,0.10), transparent 55%), radial-gradient(circle at 50% 100%, rgba(15,92,102,0.08), transparent 55%)",
              }}
            >
              {/* Outer frame */}
              <div className="relative h-full border-[4px] border-[#0f5c66] p-3">
                {/* Inner frame */}
                <div className="relative flex h-full flex-col justify-between border border-[#ff7a59] px-20 py-8 text-center">
                  <Corner className="left-2 top-2 border-l-2 border-t-2" />
                  <Corner className="right-2 top-2 border-r-2 border-t-2" />
                  <Corner className="bottom-2 left-2 border-b-2 border-l-2" />
                  <Corner className="bottom-2 right-2 border-b-2 border-r-2" />

                  {/* Logo watermark */}
                  <SkillhubMark
                    size={470}
                    color={TEAL}
                    className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ opacity: 0.06 }}
                  />

                  {/* Top: brand + title */}
                  <div className="relative">
                    <div className="flex items-center justify-center gap-3">
                      <span
                        className="grid h-14 w-14 place-items-center rounded-xl shadow-md"
                        style={{ backgroundColor: TEAL }}
                      >
                        <SkillhubMark size={38} />
                      </span>
                      <span
                        className="text-3xl font-bold tracking-wide text-[#0f5c66]"
                        style={serif}
                      >
                        Skillhub
                      </span>
                    </div>

                    <h1
                      className="mt-5 text-6xl font-bold uppercase tracking-[0.12em] text-[#0b3f47]"
                      style={serif}
                    >
                      Certificate
                    </h1>
                    <div className="mx-auto mt-2 flex items-center justify-center gap-3">
                      <span className="h-px w-24 bg-[#ff7a59]" />
                      <span
                        className="text-base uppercase tracking-[0.4em] text-[#e0583a]"
                        style={serif}
                      >
                        of Completion
                      </span>
                      <span className="h-px w-24 bg-[#ff7a59]" />
                    </div>
                  </div>

                  {/* Middle: recipient + course */}
                  <div className="relative">
                    <p
                      className="text-base italic text-slate-500"
                      style={serif}
                    >
                      This is to certify that
                    </p>
                    <h2
                      className="mx-auto mt-2 max-w-3xl border-b border-[#ff7a59]/70 pb-2 text-5xl font-semibold italic text-slate-900"
                      style={serif}
                    >
                      {cert.studentName}
                    </h2>
                    <p
                      className="mt-4 text-base italic text-slate-500"
                      style={serif}
                    >
                      has successfully completed the course
                    </p>
                    <h3
                      className="mx-auto mt-1 max-w-3xl text-3xl font-bold text-[#0b3f47]"
                      style={serif}
                    >
                      {cert.courseTitle}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600">
                      earning{" "}
                      <span className="font-bold tabular-nums text-[#0f5c66]">
                        {cert.xpEarned} XP
                      </span>{" "}
                      on the Skillhub learning platform
                    </p>
                  </div>

                  {/* Bottom: date / seal / issuer + IDs */}
                  <div className="relative">
                    <div className="grid grid-cols-3 items-end">
                      <div>
                        <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-800">
                          <CalendarDays size={14} className="text-[#e0583a]" />
                          {issued}
                        </p>
                        <div className="mx-auto mt-1 h-px w-48 bg-slate-400" />
                        <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">
                          Date of issue
                        </p>
                      </div>

                      <div className="flex justify-center">
                        <div
                          className="grid h-28 w-28 place-items-center rounded-full shadow-lg ring-4 ring-[#ff7a59]/40"
                          style={{ backgroundColor: TEAL }}
                        >
                          <div className="grid h-[5.6rem] w-[5.6rem] place-items-center rounded-full border-2 border-dashed border-[#ff7a59]/80">
                            <div className="text-center">
                              <SkillhubMark size={38} className="mx-auto" />
                              <p className="mt-1 text-[9px] font-bold uppercase tracking-widest text-white/90">
                                Verified
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p
                          className="text-lg font-semibold italic text-slate-800"
                          style={serif}
                        >
                          Skillhub
                        </p>
                        <div className="mx-auto mt-1 h-px w-48 bg-slate-400" />
                        <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">
                          Issuing authority
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-end justify-between border-t border-[#ff7a59]/50 pt-3 text-left text-[11px] text-slate-500">
                      <p>
                        <span className="uppercase tracking-widest">
                          Student ID
                        </span>
                        <br />
                        <span className="text-sm font-semibold tabular-nums text-slate-800">
                          {cert.immutableStudentId}
                        </span>
                      </p>
                      <p className="text-right">
                        <span className="uppercase tracking-widest">
                          Verification ID
                        </span>
                        <br />
                        <span className="break-all text-sm font-semibold tabular-nums text-slate-800">
                          {cert.verificationId}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </>
      ) : (
        <p className="text-center text-sm text-slate-500">
          Verifying certificate...
        </p>
      )}
    </main>
  );
}
