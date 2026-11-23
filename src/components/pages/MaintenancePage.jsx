import { CalendarClock } from "lucide-react";

export default function MaintenancePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10 text-slate-950 dark:bg-slate-950 dark:text-slate-50">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/30 sm:p-10">
        <img
          className="h-14 w-14 rounded-2xl border border-slate-200 object-cover dark:border-slate-700"
          src="/images.jpg"
          alt="Skillhub"
        />
        <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Maintenance in progress
        </div>
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
          Skillhub LMS is upgrading
        </h1>
        <p className="mt-3 leading-7 text-slate-600 dark:text-slate-300">
          We are shifting the LMS to a new and improved platform. Course access
          will return after the upgrade is complete.
        </p>
        <div className="mt-6 flex items-start gap-3 border-t border-slate-200 pt-5 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <CalendarClock className="mt-0.5 shrink-0" size={18} />
          Estimated completion: 2 Hours.
        </div>
      </section>
    </main>
  );
}
