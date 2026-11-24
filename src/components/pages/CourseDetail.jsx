import { useState } from "react";
import { ArrowLeft, Check, LockKeyhole, Play } from "lucide-react";
import CourseIcon from "../CourseIcon";
import InstructorAvatar from "../InstructorAvatar";

const TABS = ["Overview", "Course content", "Instructor"];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-teal-400 dark:focus-visible:ring-offset-zinc-950";

const card =
  "rounded-2xl border border-zinc-950/10 bg-white dark:border-white/10 dark:bg-zinc-900";

function ProgressRing({ percent }) {
  return (
    <div className="relative grid h-36 w-36 place-items-center">
      <svg
        viewBox="0 0 120 120"
        className="h-full w-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          strokeWidth="8"
          className="stroke-zinc-100 dark:stroke-zinc-800"
        />
        <circle
          cx="60"
          cy="60"
          r="52"
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray={`${percent} 100`}
          className="stroke-teal-700 transition-[stroke-dasharray] duration-300 ease-out dark:stroke-teal-400"
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-3xl font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
          {percent}%
        </p>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">complete</p>
      </div>
    </div>
  );
}

function LessonNode({ state }) {
  const base = "grid h-8 w-8 shrink-0 place-items-center rounded-full";
  if (state === "done")
    return (
      <span
        className={`${base} bg-teal-700 text-white dark:bg-teal-400 dark:text-zinc-950`}
      >
        <Check size={16} strokeWidth={1.5} />
      </span>
    );
  if (state === "current")
    return (
      <span
        className={`${base} border border-teal-700 text-teal-700 dark:border-teal-400 dark:text-teal-400`}
      >
        <Play size={16} strokeWidth={1.5} />
      </span>
    );
  return (
    <span
      className={`${base} bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500`}
    >
      <LockKeyhole size={16} strokeWidth={1.5} />
    </span>
  );
}

export default function CourseDetail({
  course,
  userProgress = {},
  onBack,
  onStartCourse,
}) {
  const [tab, setTab] = useState("Overview");

  if (!course)
    return (
      <div className={`${card} p-6`}>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">
          Course details are not available
        </p>
        <button
          type="button"
          onClick={onBack}
          className={`mt-4 inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-teal-700 transition-colors hover:bg-zinc-100 dark:text-teal-400 dark:hover:bg-white/5 ${focusRing}`}
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Back to courses
        </button>
      </div>
    );

  const done = userProgress[course.id] || 0;
  const total = course.v.length;
  const percent = total ? Math.round((done / total) * 100) : 0;
  const finished = total > 0 && done >= total;
  const quizCount = course.v.filter((l) => l[2]?.length).length;
  const next = finished ? null : course.v[done];
  const ctaLabel =
    done === 0
      ? "Start course"
      : finished
      ? "Review course"
      : "Continue course";
  const instructor = course.by || "Skillhub Instructor";
  const initials = instructor
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <button
        type="button"
        onClick={onBack}
        className={`-ml-2 inline-flex h-9 items-center gap-2 rounded-lg px-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-50 ${focusRing}`}
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Courses
      </button>

      <section
        className={`${card} grid items-center gap-8 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_auto]`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200">
              <CourseIcon course={course} />
            </span>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {course.cat}
            </p>
          </div>
          <h1 className="mt-5 text-3xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-4xl">
            {course.t}
          </h1>
          <div className="mt-3 flex min-w-0 items-center gap-2.5">
            <InstructorAvatar
              key={instructor}
              instructor={instructor}
              initials={initials}
              className="instructor-avatar-inline"
            />
            <p className="truncate text-sm text-zinc-500 dark:text-zinc-400">
              {instructor} · <span className="tabular-nums">{total}</span> lessons
            </p>
          </div>
          <button
            type="button"
            onClick={() => onStartCourse(course.id)}
            className={`button-primary mt-6 inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold ${focusRing}`}
          >
            <Play size={16} strokeWidth={1.5} />
            {ctaLabel}
          </button>
        </div>

        <div className="flex flex-col items-center gap-3 md:items-end">
          <ProgressRing percent={percent} />
          <p className="text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
            {done} of {total} lessons
          </p>
        </div>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <div
            role="tablist"
            aria-label="Course sections"
            className="flex gap-6 overflow-x-auto border-b border-zinc-950/10 dark:border-white/10"
          >
            {TABS.map((item) => {
              const active = tab === item;
              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setTab(item)}
                  className={`-mb-px h-11 shrink-0 border-b-2 text-sm transition-colors ${focusRing} ${
                    active
                      ? "border-teal-700 font-medium text-zinc-900 dark:border-teal-400 dark:text-zinc-50"
                      : "border-transparent text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <div className="mt-6" role="tabpanel">
            {tab === "Overview" && (
              <section className={`${card} p-6`}>
                <h2 className="text-base font-medium text-zinc-900 dark:text-zinc-50">
                  About this course
                </h2>
                <p className="mt-2 max-w-prose leading-7 text-zinc-600 dark:text-zinc-300">
                  Study {course.t} through a sequence of video lessons and short
                  knowledge checks. Pass each quiz to record completion.
                </p>
                <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-zinc-950/10 pt-6 dark:border-white/10">
                  {[
                    ["Lessons", total],
                    ["Quizzes", quizCount],
                    ["Completed", done],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <dt className="text-sm text-zinc-500 dark:text-zinc-400">
                        {label}
                      </dt>
                      <dd className="mt-1 text-2xl font-medium tabular-nums text-zinc-900 dark:text-zinc-50">
                        {value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {tab === "Course content" && (
              <ol
                className={`${card} divide-y divide-zinc-950/10 overflow-hidden dark:divide-white/10`}
              >
                {course.v.map((lesson, index) => {
                  const state =
                    index < done
                      ? "done"
                      : index === done
                      ? "current"
                      : "locked";
                  const questions = lesson[2]?.length;
                  const inner = (
                    <>
                      <LessonNode state={state} />
                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm ${
                            state === "locked"
                              ? "text-zinc-400 dark:text-zinc-500"
                              : "font-medium text-zinc-900 dark:text-zinc-50"
                          }`}
                        >
                          {lesson[0]}
                        </span>
                        <span className="mt-0.5 block text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                          Lesson {index + 1}
                        </span>
                      </span>
                      <span className="text-xs tabular-nums text-zinc-500 dark:text-zinc-400">
                        {questions ? `${questions} questions` : "No quiz"}
                      </span>
                    </>
                  );
                  const rowClass =
                    "flex w-full items-center gap-4 px-5 py-4 text-left";
                  return (
                    <li key={`${course.id}-${index}`}>
                      {state === "current" ? (
                        <button
                          type="button"
                          aria-current="step"
                          onClick={() => onStartCourse(course.id)}
                          className={`${rowClass} bg-zinc-50 transition-colors hover:bg-zinc-100 dark:bg-white/5 dark:hover:bg-white/10 ${focusRing}`}
                        >
                          {inner}
                        </button>
                      ) : (
                        <div className={rowClass}>{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}

            {tab === "Instructor" && (
              <section className={`${card} flex items-center gap-4 p-6`}>
                <InstructorAvatar
                  key={instructor}
                  instructor={instructor}
                  initials={initials}
                  className="instructor-avatar-large"
                />
                <div>
                  <p className="font-medium text-zinc-900 dark:text-zinc-50">
                    {instructor}
                  </p>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    Course instructor
                  </p>
                </div>
              </section>
            )}
          </div>
        </div>

        <aside className={`${card} p-6 lg:sticky lg:top-6`}>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {finished ? "Status" : "Up next"}
          </p>
          {finished ? (
            <p className="mt-2 text-lg font-medium text-zinc-900 dark:text-zinc-50">
              Course complete
            </p>
          ) : (
            <>
              <p className="mt-2 text-lg font-medium leading-snug text-zinc-900 dark:text-zinc-50">
                {next?.[0]}
              </p>
              <p className="mt-1 text-sm tabular-nums text-zinc-500 dark:text-zinc-400">
                Lesson {done + 1} of {total}
                {next?.[2]?.length ? ` · ${next[2].length} questions` : ""}
              </p>
            </>
          )}
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
            <div
              className="h-full rounded-full bg-teal-700 transition-[width] duration-300 ease-out dark:bg-teal-400"
              style={{ width: `${percent}%` }}
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
