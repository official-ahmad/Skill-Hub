import { useEffect, useState } from "react";
import {
  Award,
  BadgeCheck,
  CalendarDays,
  Printer,
  ShieldCheck,
  ShieldX,
} from "lucide-react";
import { verifyCertificate } from "../../api";

const serif = {
  fontFamily: "'Playfair Display', 'Georgia', 'Times New Roman', serif",
};

function Corner({ className }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute h-10 w-10 border-amber-600/70 sm:h-14 sm:w-14 ${className}`}
    />
  );
}

export default function VerificationPage({ certificateId }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    verifyCertificate(certificateId)
      .then((data) => {
        if (active) setResult(data);
      })
      .catch((item) => {
        if (active) setError(item.message);
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
    <main className="grid min-h-screen place-items-center bg-slate-100 px-3 py-10 text-slate-900 print:bg-white print:p-0 dark:bg-slate-950">
      {error ? (
        <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl dark:border-slate-800 dark:bg-slate-900 dark:text-slate-50">
          <ShieldX className="mx-auto text-rose-500" size={48} />
          <h1 className="mt-4 text-2xl font-bold">Certificate not verified</h1>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
        </section>
      ) : cert ? (
        <div className="w-full max-w-4xl">
          {/* Verification status bar */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 print:hidden">
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

          {/* Certificate */}
          <section
            className="relative overflow-hidden rounded-md bg-[#fdfaf2] p-3 shadow-2xl ring-1 ring-black/5 sm:p-5 print:shadow-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 50% 0%, rgba(251,191,36,0.10), transparent 55%), radial-gradient(circle at 50% 100%, rgba(79,70,229,0.07), transparent 55%)",
            }}
          >
            {/* Outer frame */}
            <div className="relative border-[3px] border-indigo-900 p-2 sm:p-3">
              {/* Inner frame */}
              <div className="relative border border-amber-600/70 px-5 py-9 text-center sm:px-14 sm:py-14">
                <Corner className="left-2 top-2 border-l-2 border-t-2" />
                <Corner className="right-2 top-2 border-r-2 border-t-2" />
                <Corner className="bottom-2 left-2 border-b-2 border-l-2" />
                <Corner className="bottom-2 right-2 border-b-2 border-r-2" />

                {/* Watermark */}
                <ShieldCheck
                  aria-hidden="true"
                  className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-900/[0.04]"
                  size={360}
                  strokeWidth={1}
                />

                <div className="relative">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-indigo-900 sm:text-sm">
                    Skillhub
                  </p>
                  <div className="mx-auto mt-3 flex items-center justify-center gap-3">
                    <span className="h-px w-12 bg-amber-600/70 sm:w-20" />
                    <Award className="text-amber-600" size={22} />
                    <span className="h-px w-12 bg-amber-600/70 sm:w-20" />
                  </div>

                  <h1
                    className="mt-5 text-3xl font-bold uppercase tracking-[0.12em] text-indigo-950 sm:text-5xl"
                    style={serif}
                  >
                    Certificate
                  </h1>
                  <p
                    className="mt-1 text-sm uppercase tracking-[0.35em] text-amber-700 sm:text-base"
                    style={serif}
                  >
                    of Completion
                  </p>

                  <p
                    className="mt-8 text-sm italic text-slate-500"
                    style={serif}
                  >
                    This is to certify that
                  </p>

                  <h2
                    className="mx-auto mt-3 max-w-2xl border-b border-amber-600/60 pb-3 text-3xl font-semibold italic text-slate-900 sm:text-5xl"
                    style={serif}
                  >
                    {cert.studentName}
                  </h2>

                  <p
                    className="mt-6 text-sm italic text-slate-500"
                    style={serif}
                  >
                    has successfully completed the course
                  </p>

                  <h3
                    className="mx-auto mt-2 max-w-2xl text-xl font-bold text-indigo-950 sm:text-3xl"
                    style={serif}
                  >
                    {cert.courseTitle}
                  </h3>

                  <p className="mt-4 text-sm text-slate-600">
                    earning{" "}
                    <span className="font-bold tabular-nums text-indigo-900">
                      {cert.xpEarned} XP
                    </span>{" "}
                    on the Skillhub learning platform
                  </p>

                  {/* Footer */}
                  <div className="mt-10 grid items-end gap-6 sm:grid-cols-3">
                    <div className="order-2 sm:order-1">
                      <p className="flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-800">
                        <CalendarDays size={14} className="text-amber-700" />
                        {issued}
                      </p>
                      <div className="mx-auto mt-1 h-px w-40 bg-slate-400" />
                      <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">
                        Date of issue
                      </p>
                    </div>

                    {/* Seal */}
                    <div className="order-1 flex justify-center sm:order-2">
                      <div className="relative grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-amber-300 via-amber-500 to-amber-700 shadow-lg ring-4 ring-amber-200/70">
                        <div className="grid h-[4.9rem] w-[4.9rem] place-items-center rounded-full border-2 border-dashed border-amber-100/90">
                          <div className="text-center text-amber-50">
                            <BadgeCheck className="mx-auto" size={26} />
                            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-widest">
                              Verified
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="order-3">
                      <p
                        className="text-lg font-semibold italic text-slate-800"
                        style={serif}
                      >
                        Skillhub
                      </p>
                      <div className="mx-auto mt-1 h-px w-40 bg-slate-400" />
                      <p className="mt-1 text-[11px] uppercase tracking-widest text-slate-500">
                        Issuing authority
                      </p>
                    </div>
                  </div>

                  {/* IDs */}
                  <div className="mt-9 grid gap-2 border-t border-amber-600/40 pt-5 text-left text-[11px] text-slate-500 sm:grid-cols-2">
                    <p>
                      <span className="uppercase tracking-widest">
                        Student ID
                      </span>
                      <br />
                      <span className="text-sm font-semibold tabular-nums text-slate-800">
                        {cert.immutableStudentId}
                      </span>
                    </p>
                    <p className="sm:text-right">
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
      ) : (
        <p className="text-center text-sm text-slate-500">
          Verifying certificate...
        </p>
      )}
    </main>
  );
}
