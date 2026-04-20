export const roles = [
  {
    id: "resident",
    name: "Resident",
    badge: "Local news, help requests, emergency alerts",
    description:
      "Share neighborhood updates, ask for help, and receive alerts tailored to nearby residents.",
  },
  {
    id: "business_owner",
    name: "Business Owner",
    badge: "Listings, deals, customer engagement",
    description:
      "Promote offers, manage reviews, and learn how the community feels about your business.",
  },
  {
    id: "community_organizer",
    name: "Community Organizer",
    badge: "Events, volunteers, engagement insights",
    description:
      "Plan community events, predict the best timing, and match volunteers to the right causes.",
  },
];

export const localNews = [
  {
    title: "Park cleanup draws record turnout",
    tag: "Environment",
    summary:
      "AI Summary: Residents coordinated a weekend cleanup, collected 40 bags of litter, and proposed a monthly stewardship group.",
    discussionCount: 28,
  },
  {
    title: "Traffic calming requested near Riverdale School",
    tag: "Safety",
    summary:
      "AI Summary: Parents reported speeding during drop-off hours and asked the city for a crosswalk attendant and clearer signage.",
    discussionCount: 19,
  },
];

export const helpRequests = [
  {
    title: "Need a pet sitter for the weekend",
    location: "Maple Crescent",
    aiMatch: "Matched with 3 nearby volunteers who previously helped with pet care.",
  },
  {
    title: "Looking for snow shoveling support",
    location: "Eastview Apartments",
    aiMatch: "Suggested volunteers based on proximity, availability, and senior support interests.",
  },
];

export const emergencyAlerts = [
  {
    title: "Missing golden retriever seen near Cedar Trail",
    time: "10 mins ago",
    impact: "Nearby residents notified in real time.",
  },
  {
    title: "Water outage on Birch Avenue",
    time: "34 mins ago",
    impact: "Residents in a 2 km radius received service updates.",
  },
];

export const businessListings = [
  {
    name: "Harvest Table Cafe",
    offer: "20% off community breakfast on Saturday",
    sentiment: "Positive sentiment trend: friendly staff and cozy atmosphere.",
  },
  {
    name: "Northside Bikes",
    offer: "Free safety check with spring tune-up",
    sentiment: "Neutral-to-positive sentiment: great service, longer wait times.",
  },
];

export const events = [
  {
    title: "Neighbourhood Tech Workshop",
    date: "April 27",
    aiInsight: "Best turnout predicted for 6:30 PM based on past RSVPs.",
    volunteers: "AI matched 8 mentors with coding and teaching experience.",
  },
  {
    title: "Community Garden Kickoff",
    date: "May 4",
    aiInsight: "Saturday mornings show strongest local engagement.",
    volunteers: "Volunteer suggestions prioritize sustainability and family activity interests.",
  },
];

export const insights = [
  "Community interest is trending toward safety, pet care, and local family events.",
  "Businesses with same-day replies to reviews show stronger repeat engagement.",
  "Weekend events perform best when scheduled before 11:00 AM or after 6:00 PM.",
];
