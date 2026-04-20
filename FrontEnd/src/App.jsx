import { useState } from "react";
import AuthPanel from "./microfrontends/auth/AuthPanel";
import CommunityPanel from "./microfrontends/community/CommunityPanel";
import EventsPanel from "./microfrontends/events/EventsPanel";

const tabs = [
  { id: "auth", label: "Auth", title: "Authentication & User Management" },
  { id: "community", label: "Engagement", title: "Community & Business Engagement" },
  { id: "events", label: "Events", title: "Events & Administration" },
];

function App() {
  const [activeTab, setActiveTab] = useState("auth");
  const [activeRole, setActiveRole] = useState("resident");

  // Called after successful login or register — switches to community tab
  const handleAuthSuccess = () => {
    setActiveTab("community");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="hero-panel">
          <div className="max-w-3xl">
            <p className="eyebrow">COMP308 Frontend Prototype</p>
            <h1 className="hero-title">NeighbourHQ</h1>
            <p className="hero-copy">
              An AI-driven community engagement frontend designed around the
              software engineering project specification: role-based access,
              neighborhood collaboration, business support, events, and AI
              insights in one responsive React experience.
            </p>
          </div>

          <div className="hero-metrics">
            <div className="hero-pill">
              <span className="hero-pill-value">3</span>
              <span>Micro-frontend modules</span>
            </div>
            <div className="hero-pill">
              <span className="hero-pill-value">AI</span>
              <span>Summaries, sentiment, matching</span>
            </div>
            <div className="hero-pill">
              <span className="hero-pill-value">RWD</span>
              <span>Desktop to mobile layout</span>
            </div>
          </div>
        </header>

        <nav className="tab-bar" aria-label="Module navigation">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-btn ${activeTab === tab.id ? "tab-btn-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-label">{tab.label}</span>
              <span className="tab-title">{tab.title}</span>
            </button>
          ))}
        </nav>

        <main className="flex-1 py-6">
          {activeTab === "auth" && (
            <AuthPanel
              activeRole={activeRole}
              onRoleChange={setActiveRole}
              onAuthSuccess={handleAuthSuccess}
            />
          )}
          {activeTab === "community" && <CommunityPanel activeRole={activeRole} />}
          {activeTab === "events" && <EventsPanel />}
        </main>
      </div>
    </div>
  );
}

export default App;