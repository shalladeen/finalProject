import { events, insights } from "../../data";

function EventsPanel() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
      <div className="panel p-6">
        <p className="eyebrow">Events & Administration</p>
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="section-title">Community event management</h2>
            <p className="section-copy">
              Organizers can create events, preview AI timing recommendations,
              and assign volunteers based on participation history and skills.
            </p>
          </div>
          <button type="button" className="primary-btn">
            Create new event
          </button>
        </div>

        <div className="mt-6 grid gap-4">
          {events.map((event) => (
            <article key={event.title} className="card">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accentDark">
                    {event.date}
                  </p>
                  <h3 className="card-title">{event.title}</h3>
                </div>
                <span className="chip">{event.aiInsight}</span>
              </div>
              <p className="section-copy mt-4">{event.volunteers}</p>
            </article>
          ))}
        </div>
      </div>

      <aside className="grid gap-6">
        <div className="panel p-6">
          <p className="eyebrow">AI Insights</p>
          <h2 className="section-title">Trend detection and recommendations</h2>
          <div className="mt-4 space-y-4">
            {insights.map((insight) => (
              <article key={insight} className="card">
                <p className="section-copy">{insight}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="panel p-6">
          <p className="eyebrow">Admin Snapshot</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="metric-card">
              <span className="metric-value">146</span>
              <span className="metric-label">Active residents</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">21</span>
              <span className="metric-label">Live business deals</span>
            </div>
            <div className="metric-card">
              <span className="metric-value">9</span>
              <span className="metric-label">Events this month</span>
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}

export default EventsPanel;
