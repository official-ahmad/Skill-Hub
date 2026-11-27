import { Component } from "react";
import { AlertTriangle, ArrowLeft, RotateCw } from "lucide-react";
import { getSafeErrorMessage } from "../utils/errorMessage";

export default class ErrorBoundary extends Component {
  state = { errorMessage: "" };

  static getDerivedStateFromError(error) {
    return {
      errorMessage: getSafeErrorMessage(
        error,
        "The course page could not be displayed.",
      ),
    };
  }

  componentDidCatch(error) {
    console.error(
      "Course route render failed:",
      getSafeErrorMessage(error, "Unknown render error."),
    );
  }

  render() {
    if (!this.state.errorMessage) return this.props.children;

    return (
      <section className="mx-auto grid min-h-[50vh] w-full max-w-xl content-center justify-items-center rounded-3xl border border-rose-200 bg-white p-6 text-center shadow-xl dark:border-rose-900/60 dark:bg-slate-950 sm:p-10">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300">
          <AlertTriangle size={26} />
        </span>
        <h1 className="mt-5 text-xl font-bold text-slate-950 dark:text-white">
          This course page ran into a problem
        </h1>
        <p className="mt-2 max-w-md break-words text-sm leading-6 text-slate-600 dark:text-slate-300">
          {this.state.errorMessage}
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            className="button-secondary"
            onClick={this.props.onBack}
          >
            <ArrowLeft size={16} />
            Back to courses
          </button>
          <button
            type="button"
            className="button-primary"
            onClick={() => window.location.reload()}
          >
            <RotateCw size={16} />
            Reload page
          </button>
        </div>
      </section>
    );
  }
}
