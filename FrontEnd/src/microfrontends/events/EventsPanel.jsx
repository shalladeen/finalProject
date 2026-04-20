import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { businessClient, aiClient } from "../../apolloClient";
import { FiCalendar, FiMapPin, FiHome, FiUsers, FiUserCheck, FiPlus, FiCheck, FiX } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { MdHandyman, MdPeople, MdNaturePeople, MdFavorite, MdCelebration, MdPushPin } from "react-icons/md";

const GET_EVENTS = gql`
  query GetEvents {
    getEvents {
      id title description category organizerName
      neighborhood location date maxAttendees
      attendees { userId userName }
      volunteers { userId userName skills }
    }
  }
`;
const CREATE_EVENT = gql`
  mutation CreateEvent($title: String!, $description: String!, $category: String, $neighborhood: String, $location: String, $date: String!, $maxAttendees: Int) {
    createEvent(title: $title, description: $description, category: $category, neighborhood: $neighborhood, location: $location, date: $date, maxAttendees: $maxAttendees) { id title }
  }
`;
const JOIN_EVENT = gql`mutation JoinEvent($eventId: ID!) { joinEvent(eventId: $eventId) { id attendees { userId } } }`;
const VOLUNTEER_EVENT = gql`mutation VolunteerForEvent($eventId: ID!, $skills: [String]) { volunteerForEvent(eventId: $eventId, skills: $skills) { id volunteers { userId } } }`;
const SUGGEST_TIMING = gql`
  query SuggestEventTiming($eventCategory: String!, $neighborhood: String!) {
    suggestEventTiming(eventCategory: $eventCategory, neighborhood: $neighborhood) { suggestedDay suggestedTime reason }
  }
`;
const MATCH_VOLUNTEERS = gql`
  query MatchVolunteers($helpRequestCategory: String!, $neighborhood: String!) {
    matchVolunteers(helpRequestCategory: $helpRequestCategory, neighborhood: $neighborhood) { userId userName matchScore matchReason }
  }
`;

const categoryIcons = {
  workshop: <MdHandyman className="text-xl" />,
  meetup: <MdPeople className="text-xl" />,
  cleanup: <MdNaturePeople className="text-xl" />,
  fundraiser: <MdFavorite className="text-xl" />,
  social: <MdCelebration className="text-xl" />,
  other: <MdPushPin className="text-xl" />,
};

function EventsPanel({ activeRole, currentUser }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [timing, setTiming] = useState(null);
  const [matchedVolunteers, setMatchedVolunteers] = useState({});
  const [form, setForm] = useState({ title: "", description: "", category: "meetup", neighborhood: "", location: "", date: "", maxAttendees: "" });

  const isOrganizer = activeRole === "community_organizer" || activeRole === "organizer";

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const { data } = await businessClient.query({ query: GET_EVENTS, fetchPolicy: "network-only" });
      setEvents(data.getEvents);
    } catch { setError("Could not load events. Make sure you are logged in."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleCreateEvent = async () => {
    setError("");
    try {
      await businessClient.mutate({ mutation: CREATE_EVENT, variables: { ...form, maxAttendees: form.maxAttendees ? parseInt(form.maxAttendees) : null } });
      setShowForm(false);
      setTiming(null);
      setForm({ title: "", description: "", category: "meetup", neighborhood: "", location: "", date: "", maxAttendees: "" });
      fetchEvents();
    } catch (err) { setError(err.message); }
  };

  const handleJoin = async (eventId) => {
    try { await businessClient.mutate({ mutation: JOIN_EVENT, variables: { eventId } }); fetchEvents(); }
    catch (err) { setError(err.message); }
  };

  const handleVolunteer = async (eventId) => {
    try { await businessClient.mutate({ mutation: VOLUNTEER_EVENT, variables: { eventId, skills: [] } }); fetchEvents(); }
    catch (err) { setError(err.message); }
  };

  const handleSuggestTiming = async () => {
    try {
      const { data } = await aiClient.query({ query: SUGGEST_TIMING, variables: { eventCategory: form.category, neighborhood: form.neighborhood || "general" } });
      setTiming(data.suggestEventTiming);
    } catch (err) { setError(err.message); }
  };

  const handleMatchVolunteers = async (event) => {
    if (matchedVolunteers[event.id]) { setMatchedVolunteers({ ...matchedVolunteers, [event.id]: null }); return; }
    try {
      const { data } = await aiClient.query({ query: MATCH_VOLUNTEERS, variables: { helpRequestCategory: event.category, neighborhood: event.neighborhood || "general" } });
      setMatchedVolunteers({ ...matchedVolunteers, [event.id]: data.matchVolunteers });
    } catch (err) { setError(err.message); }
  };

  if (loading) return (
    <div className="loading-wrap"><div className="flex gap-2">
      <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
    </div></div>
  );

  return (
    <div className="space-y-6">
      {error && <div className="banner-error">{error}</div>}

      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Events & Administration</p>
          <h2 className="section-title">Community Events</h2>
        </div>
        {isOrganizer && (
          <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
            {showForm ? <><FiX className="inline mr-1" />Cancel</> : <><FiPlus className="inline mr-1" />Create Event</>}
          </button>
        )}
      </div>

      {/* Create event form */}
      {showForm && isOrganizer && (
        <div className="panel p-6 space-y-4">
          <h3 className="section-title">New Event</h3>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="field"><span>Title</span><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label>
            <label className="field"><span>Category</span>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {["workshop","meetup","cleanup","fundraiser","social","other"].map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
              </select>
            </label>
            <label className="field md:col-span-2"><span>Description</span>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--border)" }} />
            </label>
            <label className="field"><span>Neighbourhood</span><input type="text" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} /></label>
            <label className="field"><span>Location</span><input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} /></label>
            <label className="field"><span>Date & Time</span><input type="datetime-local" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></label>
            <label className="field"><span>Max Attendees (optional)</span><input type="number" value={form.maxAttendees} onChange={(e) => setForm({ ...form, maxAttendees: e.target.value })} /></label>
          </div>

          {timing && (
            <div className="sentiment-box">
              <p className="text-sm font-semibold flex items-center gap-1" style={{ color: "var(--green)" }}><HiSparkles /> AI Timing Suggestion</p>
              <p className="section-copy">{timing.suggestedDay} at {timing.suggestedTime} — {timing.reason}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button className="secondary-btn" onClick={handleSuggestTiming}><HiSparkles className="inline mr-1" />Suggest Best Timing</button>
            <button className="primary-btn" onClick={handleCreateEvent}>Create Event</button>
          </div>
        </div>
      )}

      {/* Events grid */}
      {events.length === 0 ? (
        <div className="empty-state">
          <FiCalendar className="text-4xl mb-3" style={{ color: "var(--border)" }} />
          <p className="empty-state-text">No events yet. {isOrganizer ? "Create the first one!" : "Check back soon."}</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {events.map((event) => {
            const hasJoined = currentUser && event.attendees?.some((a) => a.userId === currentUser.id);
            const hasVolunteered = currentUser && event.volunteers?.some((v) => v.userId === currentUser.id);
            return (
              <article key={event.id} className="panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2" style={{ color: "var(--green)" }}>
                    {categoryIcons[event.category] || <MdPushPin className="text-xl" />}
                    <h3 className="card-title">{event.title}</h3>
                  </div>
                  <span className="chip chip-amber">{event.category}</span>
                </div>

                <p className="section-copy mt-2">{event.description}</p>

                <div className="mt-3 space-y-1 text-sm" style={{ color: "var(--ink-soft)" }}>
                  {event.date && <p className="flex items-center gap-2"><FiCalendar />{new Date(event.date).toLocaleDateString("en-CA", { weekday: "short", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>}
                  {event.location && <p className="flex items-center gap-2"><FiMapPin />{event.location}</p>}
                  {event.neighborhood && <p className="flex items-center gap-2"><FiHome />{event.neighborhood}</p>}
                </div>

                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="chip flex items-center gap-1"><FiUsers className="text-xs" />{event.attendees?.length || 0} attending</span>
                  <span className="chip flex items-center gap-1"><FiUserCheck className="text-xs" />{event.volunteers?.length || 0} volunteers</span>
                  {event.maxAttendees && <span className="chip">Max {event.maxAttendees}</span>}
                </div>

                {currentUser && (
                  <div className="mt-4 flex gap-2 flex-wrap">
                    <button className={hasJoined ? "secondary-btn" : "primary-btn"} onClick={() => !hasJoined && handleJoin(event.id)} disabled={hasJoined}>
                      {hasJoined ? <><FiCheck className="inline mr-1" />Joined</> : "Join Event"}
                    </button>
                    <button className="secondary-btn" onClick={() => !hasVolunteered && handleVolunteer(event.id)} disabled={hasVolunteered}>
                      {hasVolunteered ? <><FiCheck className="inline mr-1" />Volunteering</> : "Volunteer"}
                    </button>
                    {isOrganizer && (
                      <button className="secondary-btn flex items-center gap-1" onClick={() => handleMatchVolunteers(event)}>
                        <HiSparkles className="text-sm" />
                        {matchedVolunteers[event.id] ? "Hide Matches" : "Match Volunteers"}
                      </button>
                    )}
                  </div>
                )}

                {/* AI Volunteer Matches */}
                {matchedVolunteers[event.id] && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider flex items-center gap-1" style={{ color: "var(--green)" }}>
                      <HiSparkles /> AI Suggested Volunteers
                    </p>
                    {matchedVolunteers[event.id].map((v) => (
                      <div key={v.userId} className="rounded-lg p-2 text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">{v.userName}</span>
                          <span className="chip chip-green">{Math.round(v.matchScore * 100)}% match</span>
                        </div>
                        <p className="section-copy mt-1">{v.matchReason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}

      {/* Admin snapshot */}
      <div className="panel p-6">
        <p className="eyebrow mb-4">Admin Snapshot</p>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="metric-card">
            <span className="metric-value">{events.length}</span>
            <span className="metric-label">Total Events</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">{events.reduce((sum, e) => sum + (e.attendees?.length || 0), 0)}</span>
            <span className="metric-label">Total Attendees</span>
          </div>
          <div className="metric-card">
            <span className="metric-value">{events.reduce((sum, e) => sum + (e.volunteers?.length || 0), 0)}</span>
            <span className="metric-label">Total Volunteers</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EventsPanel;