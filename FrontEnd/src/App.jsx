import { useState, useEffect } from "react";
import AuthPanel from "./microfrontends/auth/AuthPanel";
import CommunityPanel from "./microfrontends/community/CommunityPanel";
import EventsPanel from "./microfrontends/events/EventsPanel";
import { FiUser, FiLogOut } from "react-icons/fi";

const tabs = [
  { id: "auth", label: "Sign In" },
  { id: "community", label: "Community" },
  { id: "events", label: "Events" },
];

const roleLabels = {
  resident: "Resident",
  business_owner: "Business Owner",
  business: "Business Owner",
  community_organizer: "Community Organizer",
  organizer: "Community Organizer",
};

function App() {
  const [activeTab, setActiveTab] = useState("auth");
  const [activeRole, setActiveRole] = useState("resident");
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      setActiveRole(user.role);
      setActiveTab("community");
    }
  }, []);

  const handleAuthSuccess = () => {
    const stored = localStorage.getItem("user");
    if (stored) {
      const user = JSON.parse(stored);
      setCurrentUser(user);
      setActiveRole(user.role);
    }
    setActiveTab("community");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setActiveRole("resident");
    setActiveTab("auth");
  };

  return (
    <div className="min-h-screen" style={{ background: "var(--surface)" }}>
      <nav className="navbar">
        <span className="navbar-brand">Neighbour<span>HQ</span></span>
        <div className="navbar-user">
          {currentUser ? (
            <>
              <span className="navbar-badge">
                <FiUser className="text-sm" />
                {currentUser.username} — {roleLabels[currentUser.role] || currentUser.role}
              </span>
              <button className="logout-btn flex items-center gap-1" onClick={handleLogout}>
                <FiLogOut className="text-sm" /> Log out
              </button>
            </>
          ) : (
            <span className="chip">Not signed in</span>
          )}
        </div>
      </nav>

      <div className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "tab-btn-active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-title">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="page-content">
        {activeTab === "auth" && (
          <AuthPanel activeRole={activeRole} onRoleChange={setActiveRole} onAuthSuccess={handleAuthSuccess} />
        )}
        {activeTab === "community" && (
          <CommunityPanel activeRole={activeRole} currentUser={currentUser} />
        )}
        {activeTab === "events" && (
          <EventsPanel activeRole={activeRole} currentUser={currentUser} />
        )}
      </div>
    </div>
  );
}

export default App;