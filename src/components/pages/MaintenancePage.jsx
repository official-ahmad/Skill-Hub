import { CalendarClock } from "lucide-react";

export default function MaintenancePage() {
  return (
    <main className="maintenance-page">
      <section
        className="maintenance-panel"
        aria-labelledby="maintenance-title"
      >
        <img
          className="maintenance-avatar"
          src="/images.jpg"
          alt="Skillhub mark"
        />
        <div className="maintenance-status">
          <span className="status-dot" aria-hidden="true" />
          Scheduled Maintenance
        </div>
        <h1 id="maintenance-title">Skillhub LMS is currently upgrading</h1>
        <p>
          Shifting the LMS to a new and improved platform. We apologize for the
          inconvenience and appreciate your patience.
        </p>
        <div className="maintenance-note">
          <CalendarClock size={18} strokeWidth={1.5} aria-hidden="true" />
          Course access will return after the upgrade is complete.
        </div>
      </section>
      <footer className="app-footer">
        Best Regards, <br />
        <strong>Skillhub Team -Ahmad</strong>
      </footer>
    </main>
  );
}
