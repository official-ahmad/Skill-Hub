import { useEffect, useState } from "react";
import { MessageSquareText, Send } from "lucide-react";
import toast from "react-hot-toast";
import { getNotifications, sendQuery } from "../../api";

export default function QueriesPage() {
  const [message, setMessage] = useState("");
  const [notifications, setNotifications] = useState([]);

  const load = async () => {
    try {
      setNotifications(await getNotifications());
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    let active = true;
    getNotifications()
      .then((data) => {
        if (active) setNotifications(data);
      })
      .catch((error) => {
        if (active) toast.error(error.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      await sendQuery(message);
      setMessage("");
      await load();
      toast.success("Query sent to administration");
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-indigo-800 dark:text-indigo-300 sem:text-indigo-600">
          Submit your queries to administration
        </p>
        <h1 className="mt-2 text-3xl font-bold">Queries</h1>
        <p className="mt-1 text-sm text-slate-500">
          Ask administration and follow their responses.
        </p>
      </header>
      <form
        className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-[minmax(0,1fr)_auto]"
        onSubmit={submit}
      >
        <textarea
          className="min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm outline-none dark:border-slate-700 dark:bg-slate-950"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          maxLength={4000}
          placeholder="Describe your question..."
        />
        <button
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white"
          type="submit"
          disabled={!message.trim()}
        >
          <Send size={17} />
          Send query
        </button>
      </form>
      <section className="grid gap-3">
        {notifications.length ? (
          notifications.map((item) => (
            <article
              className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
              key={item._id}
            >
              <div className="flex items-start gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                  <MessageSquareText size={17} />
                </span>
                <div className="min-w-0">
                  <strong className="text-sm">
                    {item.status === "resolved"
                      ? "Admin response"
                      : "Query pending"}
                  </strong>
                  <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {item.status === "resolved"
                      ? item.adminResponse
                      : item.message}
                  </p>
                  <time className="mt-2 block text-xs text-slate-500">
                    {new Date(item.updatedAt).toLocaleString()}
                  </time>
                </div>
              </div>
            </article>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700">
            No queries submitted yet.
          </p>
        )}
      </section>
    </div>
  );
}
