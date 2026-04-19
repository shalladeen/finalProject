import {
  businessListings,
  emergencyAlerts,
  helpRequests,
  localNews,
} from "../../data";

function CommunityPanel({ activeRole }) {
  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        <div className="panel p-6">
          <p className="eyebrow">Community & Business Engagement</p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="section-title">Local activity feed</h2>
              <p className="section-copy">
                Resident-focused content is paired with AI summaries, volunteer
                suggestions, and emergency visibility for fast action.
              </p>
            </div>
            <span className="chip chip-strong">
              Active role: {activeRole === "business" ? "Business Owner" : "Resident"}
            </span>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {localNews.map((item) => (
              <article key={item.title} className="card">
                <div className="flex items-center justify-between gap-3">
                  <span className="chip">{item.tag}</span>
                  <span className="stat">{item.discussionCount} comments</span>
                </div>
                <h3 className="card-title">{item.title}</h3>
                <p className="section-copy">{item.summary}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="panel p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="section-title text-2xl">Help Requests</h3>
              <span className="chip">AI volunteer matching</span>
            </div>
            <div className="mt-4 space-y-4">
              {helpRequests.map((request) => (
                <article key={request.title} className="card">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-accentDark">
                    {request.location}
                  </p>
                  <h4 className="card-title">{request.title}</h4>
                  <p className="section-copy">{request.aiMatch}</p>
                </article>
              ))}
            </div>
          </div>

          <div className="panel p-6">
            <div className="flex items-center justify-between gap-3">
              <h3 className="section-title text-2xl">Emergency Alerts</h3>
              <span className="chip chip-alert">Real-time</span>
            </div>
            <div className="mt-4 space-y-4">
              {emergencyAlerts.map((alert) => (
                <article key={alert.title} className="card">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="card-title">{alert.title}</h4>
                    <span className="stat">{alert.time}</span>
                  </div>
                  <p className="section-copy">{alert.impact}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      <aside className="panel p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Business Owner Tools</p>
            <h2 className="section-title">Listings, deals, and sentiment</h2>
          </div>
          <span className="chip chip-teal">Gemini-ready</span>
        </div>

        <div className="mt-6 space-y-4">
          {businessListings.map((listing) => (
            <article key={listing.name} className="card">
              <h3 className="card-title">{listing.name}</h3>
              <p className="section-copy">{listing.offer}</p>
              <div className="sentiment-box">
                <p className="text-sm font-semibold uppercase tracking-[0.16em] text-tealDeep">
                  AI sentiment insight
                </p>
                <p className="section-copy">{listing.sentiment}</p>
              </div>
            </article>
          ))}
        </div>
      </aside>
    </section>
  );
}

export default CommunityPanel;
