import { useEffect, useState } from "react";
import { BadgeCheck, CalendarDays, ShieldCheck } from "lucide-react";
import { verifyCertificate } from "../../api";

export default function VerificationPage({ certificateId }) {
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    verifyCertificate(certificateId).then((data) => { if (active) setResult(data); }).catch((item) => { if (active) setError(item.message); });
    return () => { active = false; };
  }, [certificateId]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900 sm:p-9">
        {error ? <div className="text-center"><ShieldCheck className="mx-auto text-rose-500" size={44}/><h1 className="mt-4 text-2xl font-bold">Certificate not verified</h1><p className="mt-2 text-sm text-slate-500">{error}</p></div> : result ? (
          <div><div className="flex items-center justify-between gap-4"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"><BadgeCheck size={28}/></span><span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">Verified</span></div><p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">Skillhub Certificate</p><h1 className="mt-2 text-3xl font-bold">{result.certificate.courseTitle}</h1><p className="mt-3 text-lg">{result.certificate.studentName}</p><dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2"><div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"><dt className="text-xs text-slate-500">Student ID</dt><dd className="mt-1 font-semibold tabular-nums">{result.certificate.immutableStudentId}</dd></div><div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"><dt className="text-xs text-slate-500">XP earned</dt><dd className="mt-1 font-semibold tabular-nums">{result.certificate.xpEarned} XP</dd></div><div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800 sm:col-span-2"><dt className="text-xs text-slate-500">Verification ID</dt><dd className="mt-1 break-all font-semibold tabular-nums">{result.certificate.verificationId}</dd></div></dl><p className="mt-5 flex items-center gap-2 text-xs text-slate-500"><CalendarDays size={15}/>Issued {new Date(result.certificate.createdAt).toLocaleDateString()}</p></div>
        ) : <p className="text-center text-sm text-slate-500">Verifying certificate...</p>}
      </section>
    </main>
  );
}
