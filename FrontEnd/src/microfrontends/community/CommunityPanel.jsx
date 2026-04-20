import { useState, useEffect } from "react";
import { gql } from "@apollo/client";
import { communityClient, businessClient, aiClient } from "../../apolloClient";
import { FiPlus, FiMessageSquare, FiAlertTriangle, FiHelpCircle, FiBriefcase, FiX, FiStar, FiTag, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";
import { MdOutlineNewspaper } from "react-icons/md";

/* ── GraphQL ── */
const GET_POSTS = gql`query GetPosts { getPosts { id title content category authorName neighborhood likes comments { authorName content } } }`;
const GET_HELP_REQUESTS = gql`query GetHelpRequests { getHelpRequests { id title description category authorName neighborhood status } }`;
const GET_EMERGENCY_ALERTS = gql`query GetEmergencyAlerts { getEmergencyAlerts { id title description type neighborhood createdAt } }`;
const GET_BUSINESSES = gql`query GetBusinesses { getBusinesses { id name description category neighborhood address phone website ownerId } }`;
const GET_DEALS = gql`query GetDeals { getDeals { id title description discount businessName active expiresAt } }`;
const GET_REVIEWS = gql`query GetReviews($businessId: String!) { getReviews(businessId: $businessId) { id authorName rating content ownerReply createdAt } }`;
const SUMMARIZE_TEXT = gql`query SummarizeText($text: String!) { summarizeText(text: $text) { summary } }`;
const ANALYZE_SENTIMENT = gql`query AnalyzeSentiment($text: String!) { analyzeSentiment(text: $text) { sentiment score } }`;
const MATCH_VOLUNTEERS = gql`query MatchVolunteers($helpRequestCategory: String!, $neighborhood: String!) { matchVolunteers(helpRequestCategory: $helpRequestCategory, neighborhood: $neighborhood) { userId userName matchScore matchReason } }`;

const CREATE_POST = gql`mutation CreatePost($title: String!, $content: String!, $category: String, $neighborhood: String) { createPost(title: $title, content: $content, category: $category, neighborhood: $neighborhood) { id } }`;
const ADD_COMMENT = gql`mutation AddComment($postId: ID!, $content: String!) { addComment(postId: $postId, content: $content) { id comments { authorName content } } }`;
const CREATE_HELP_REQUEST = gql`mutation CreateHelpRequest($title: String!, $description: String!, $category: String, $neighborhood: String) { createHelpRequest(title: $title, description: $description, category: $category, neighborhood: $neighborhood) { id } }`;
const CREATE_EMERGENCY_ALERT = gql`mutation CreateEmergencyAlert($title: String!, $description: String!, $type: String, $neighborhood: String!) { createEmergencyAlert(title: $title, description: $description, type: $type, neighborhood: $neighborhood) { id } }`;
const CREATE_BUSINESS = gql`mutation CreateBusiness($name: String!, $description: String!, $category: String, $neighborhood: String, $address: String, $phone: String, $website: String) { createBusiness(name: $name, description: $description, category: $category, neighborhood: $neighborhood, address: $address, phone: $phone, website: $website) { id } }`;
const CREATE_DEAL = gql`mutation CreateDeal($title: String!, $description: String!, $discount: String, $businessId: String!, $businessName: String!, $expiresAt: String) { createDeal(title: $title, description: $description, discount: $discount, businessId: $businessId, businessName: $businessName, expiresAt: $expiresAt) { id } }`;
const CREATE_REVIEW = gql`mutation CreateReview($businessId: String!, $rating: Int!, $content: String!) { createReview(businessId: $businessId, rating: $rating, content: $content) { id } }`;
const REPLY_TO_REVIEW = gql`mutation ReplyToReview($reviewId: ID!, $reply: String!) { replyToReview(reviewId: $reviewId, reply: $reply) { id ownerReply } }`;

const sentimentColor = (s) => s === "positive" ? "var(--green)" : s === "negative" ? "#dc2626" : "var(--ink-soft)";
const roleLabel = (r) => r === "business_owner" ? "Business Owner" : r === "community_organizer" ? "Community Organizer" : "Resident";

function StarRating({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map((s) => (
        <button key={s} type="button" onClick={() => onChange && onChange(s)}
          style={{ color: s <= value ? "#f59e0b" : "var(--border)", fontSize: "1.25rem", background: "none", border: "none", cursor: onChange ? "pointer" : "default" }}>
          ★
        </button>
      ))}
    </div>
  );
}

function CommunityPanel({ activeRole, currentUser }) {
  const [posts, setPosts] = useState([]);
  const [helpRequests, setHelpRequests] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [deals, setDeals] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [sentiments, setSentiments] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // expanded state per post (comments)
  const [expandedPost, setExpandedPost] = useState(null);
  const [commentInputs, setCommentInputs] = useState({});

  // expanded state per business (reviews)
  const [expandedBusiness, setExpandedBusiness] = useState(null);
  const [businessReviews, setBusinessReviews] = useState({});
  const [reviewSentiments, setReviewSentiments] = useState({});
  const [replyInputs, setReplyInputs] = useState({});

  // volunteer matching per help request
  const [matchedVolunteers, setMatchedVolunteers] = useState({});

  // forms
  const [showPostForm, setShowPostForm] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", content: "", category: "news", neighborhood: "" });

  const [showHelpForm, setShowHelpForm] = useState(false);
  const [helpForm, setHelpForm] = useState({ title: "", description: "", category: "other", neighborhood: "" });

  const [showAlertForm, setShowAlertForm] = useState(false);
  const [alertForm, setAlertForm] = useState({ title: "", description: "", type: "other", neighborhood: "" });

  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [businessForm, setBusinessForm] = useState({ name: "", description: "", category: "other", neighborhood: "", address: "", phone: "", website: "" });

  const [showDealForm, setShowDealForm] = useState(false);
  const [dealForm, setDealForm] = useState({ title: "", description: "", discount: "", businessId: "", businessName: "", expiresAt: "" });

  const [reviewForm, setReviewForm] = useState({ businessId: "", rating: 5, content: "" });
  const [showReviewForm, setShowReviewForm] = useState(null); // businessId

  const isBusinessOwner = activeRole === "business_owner";

  const fetchAll = async () => {
    setLoading(true); setError("");
    try {
      const [postsRes, helpRes, alertsRes, businessRes, dealsRes] = await Promise.all([
        communityClient.query({ query: GET_POSTS, fetchPolicy: "network-only" }),
        communityClient.query({ query: GET_HELP_REQUESTS, fetchPolicy: "network-only" }),
        communityClient.query({ query: GET_EMERGENCY_ALERTS, fetchPolicy: "network-only" }),
        businessClient.query({ query: GET_BUSINESSES, fetchPolicy: "network-only" }),
        businessClient.query({ query: GET_DEALS, fetchPolicy: "network-only" }),
      ]);
      setPosts(postsRes.data.getPosts);
      setHelpRequests(helpRes.data.getHelpRequests);
      setAlerts(alertsRes.data.getEmergencyAlerts);
      setBusinesses(businessRes.data.getBusinesses);
      setDeals(dealsRes.data.getDeals);

      // AI sentiment on businesses
      const sentimentResults = {};
      for (const biz of businessRes.data.getBusinesses) {
        try {
          const s = await aiClient.query({ query: ANALYZE_SENTIMENT, variables: { text: biz.description } });
          sentimentResults[biz.id] = s.data.analyzeSentiment;
        } catch { sentimentResults[biz.id] = { sentiment: "neutral", score: 0 }; }
      }
      setSentiments(sentimentResults);

      // AI summarization on long posts
      const summaryResults = {};
      for (const post of postsRes.data.getPosts) {
        if (post.content.split(" ").length > 30) {
          try {
            const s = await aiClient.query({ query: SUMMARIZE_TEXT, variables: { text: post.content } });
            summaryResults[post.id] = s.data.summarizeText.summary;
          } catch { summaryResults[post.id] = post.content; }
        }
      }
      setSummaries(summaryResults);
    } catch { setError("Failed to load community data. Make sure you are logged in."); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleCreatePost = async () => {
    try { await communityClient.mutate({ mutation: CREATE_POST, variables: postForm }); setShowPostForm(false); setPostForm({ title: "", content: "", category: "news", neighborhood: "" }); fetchAll(); }
    catch (err) { setError(err.message); }
  };

  const handleAddComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;
    try {
      await communityClient.mutate({ mutation: ADD_COMMENT, variables: { postId, content } });
      setCommentInputs({ ...commentInputs, [postId]: "" });
      fetchAll();
    } catch (err) { setError(err.message); }
  };

  const handleCreateHelpRequest = async () => {
    try { await communityClient.mutate({ mutation: CREATE_HELP_REQUEST, variables: helpForm }); setShowHelpForm(false); setHelpForm({ title: "", description: "", category: "other", neighborhood: "" }); fetchAll(); }
    catch (err) { setError(err.message); }
  };

  const handleMatchVolunteers = async (req) => {
    try {
      const { data } = await aiClient.query({ query: MATCH_VOLUNTEERS, variables: { helpRequestCategory: req.category, neighborhood: req.neighborhood || "general" } });
      setMatchedVolunteers({ ...matchedVolunteers, [req.id]: data.matchVolunteers });
    } catch (err) { setError(err.message); }
  };

  const handleCreateAlert = async () => {
    try { await communityClient.mutate({ mutation: CREATE_EMERGENCY_ALERT, variables: alertForm }); setShowAlertForm(false); setAlertForm({ title: "", description: "", type: "other", neighborhood: "" }); fetchAll(); }
    catch (err) { setError(err.message); }
  };

  const handleCreateBusiness = async () => {
    try { await businessClient.mutate({ mutation: CREATE_BUSINESS, variables: businessForm }); setShowBusinessForm(false); setBusinessForm({ name: "", description: "", category: "other", neighborhood: "", address: "", phone: "", website: "" }); fetchAll(); }
    catch (err) { setError(err.message); }
  };

  const handleCreateDeal = async () => {
    try { await businessClient.mutate({ mutation: CREATE_DEAL, variables: dealForm }); setShowDealForm(false); setDealForm({ title: "", description: "", discount: "", businessId: "", businessName: "", expiresAt: "" }); fetchAll(); }
    catch (err) { setError(err.message); }
  };

  const handleLoadReviews = async (bizId) => {
    if (expandedBusiness === bizId) { setExpandedBusiness(null); return; }
    setExpandedBusiness(bizId);
    try {
      const { data } = await businessClient.query({ query: GET_REVIEWS, variables: { businessId: bizId }, fetchPolicy: "network-only" });
      setBusinessReviews({ ...businessReviews, [bizId]: data.getReviews });

      // AI sentiment on each review
      const rs = {};
      for (const review of data.getReviews) {
        try {
          const s = await aiClient.query({ query: ANALYZE_SENTIMENT, variables: { text: review.content } });
          rs[review.id] = s.data.analyzeSentiment;
        } catch { rs[review.id] = { sentiment: "neutral", score: 0 }; }
      }
      setReviewSentiments({ ...reviewSentiments, ...rs });
    } catch (err) { setError(err.message); }
  };

  const handleCreateReview = async (bizId) => {
    try {
      await businessClient.mutate({ mutation: CREATE_REVIEW, variables: { ...reviewForm, businessId: bizId } });
      setShowReviewForm(null);
      setReviewForm({ businessId: "", rating: 5, content: "" });
      handleLoadReviews(bizId);
    } catch (err) { setError(err.message); }
  };

  const handleReplyToReview = async (reviewId, bizId) => {
    const reply = replyInputs[reviewId];
    if (!reply?.trim()) return;
    try {
      await businessClient.mutate({ mutation: REPLY_TO_REVIEW, variables: { reviewId, reply } });
      setReplyInputs({ ...replyInputs, [reviewId]: "" });
      handleLoadReviews(bizId);
    } catch (err) { setError(err.message); }
  };

  if (loading) return (
    <div className="loading-wrap"><div className="flex gap-2">
      <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
    </div></div>
  );

  return (
    <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
      <div className="space-y-6">
        {error && <div className="banner-error">{error}</div>}

        {/* ── News & Discussions ── */}
        <div className="panel">
          <div className="flex items-center justify-between border-b p-5" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <MdOutlineNewspaper className="text-xl" style={{ color: "var(--green)" }} />
              <div>
                <p className="eyebrow">Local News & Discussions</p>
                <h2 className="section-title">Activity Feed</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="chip chip-strong">{roleLabel(activeRole)}</span>
              <button className="primary-btn" onClick={() => setShowPostForm(!showPostForm)}>
                {showPostForm ? <FiX /> : <><FiPlus className="inline mr-1" />Post</>}
              </button>
            </div>
          </div>

          {showPostForm && (
            <div className="p-5 border-b space-y-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <label className="field"><span>Title</span><input type="text" value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} /></label>
              <label className="field"><span>Content</span><textarea rows={3} value={postForm.content} onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--border)" }} /></label>
              <div className="grid grid-cols-2 gap-3">
                <label className="field"><span>Category</span>
                  <select value={postForm.category} onChange={(e) => setPostForm({ ...postForm, category: e.target.value })}>
                    <option value="news">News</option><option value="discussion">Discussion</option><option value="announcement">Announcement</option>
                  </select>
                </label>
                <label className="field"><span>Neighbourhood</span><input type="text" value={postForm.neighborhood} onChange={(e) => setPostForm({ ...postForm, neighborhood: e.target.value })} /></label>
              </div>
              <button className="primary-btn" onClick={handleCreatePost}>Submit Post</button>
            </div>
          )}

          <div className="grid gap-4 p-5 md:grid-cols-2">
            {posts.length === 0 ? (
              <div className="empty-state col-span-2">
                <MdOutlineNewspaper className="text-4xl mb-2" style={{ color: "var(--border)" }} />
                <p className="empty-state-text">No posts yet. Be the first to share something!</p>
              </div>
            ) : posts.map((post) => (
              <article key={post.id} className="card">
                <div className="flex items-center justify-between gap-3">
                  <span className="chip">{post.category}</span>
                  <span className="stat flex items-center gap-1"><FiMessageSquare className="text-xs" />{post.comments?.length || 0}</span>
                </div>
                <h3 className="card-title mt-2">{post.title}</h3>
                <p className="section-copy">{summaries[post.id] || post.content}</p>
                {summaries[post.id] && <span className="chip chip-teal mt-2 flex items-center gap-1 w-fit"><HiSparkles className="text-xs" /> AI Summary</span>}

                {/* Comments */}
                <button className="mt-3 text-xs font-medium flex items-center gap-1" style={{ color: "var(--green)", background: "none", border: "none", cursor: "pointer" }}
                  onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}>
                  {expandedPost === post.id ? <FiChevronUp /> : <FiChevronDown />}
                  {expandedPost === post.id ? "Hide comments" : "View comments"}
                </button>

                {expandedPost === post.id && (
                  <div className="mt-3 space-y-2">
                    {post.comments?.length === 0 && <p className="text-xs" style={{ color: "var(--ink-soft)" }}>No comments yet.</p>}
                    {post.comments?.map((c, i) => (
                      <div key={i} className="rounded-lg p-2 text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                        <span className="font-semibold">{c.authorName}: </span>{c.content}
                      </div>
                    ))}
                    {currentUser && (
                      <div className="flex gap-2 mt-2">
                        <input type="text" placeholder="Write a comment..." value={commentInputs[post.id] || ""}
                          onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                          className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none" style={{ borderColor: "var(--border)" }} />
                        <button className="primary-btn !px-3 !py-1.5" onClick={() => handleAddComment(post.id)}>Post</button>
                      </div>
                    )}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* ── Help Requests & Alerts ── */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Help Requests */}
          <div className="panel">
            <div className="flex items-center justify-between border-b p-5" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <FiHelpCircle style={{ color: "var(--green)" }} />
                <h3 className="section-title" style={{ marginTop: 0 }}>Help Requests</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip chip-teal flex items-center gap-1"><HiSparkles className="text-xs" />AI Matching</span>
                <button className="primary-btn !px-3 !py-2" onClick={() => setShowHelpForm(!showHelpForm)}>{showHelpForm ? <FiX /> : <FiPlus />}</button>
              </div>
            </div>

            {showHelpForm && (
              <div className="p-4 border-b space-y-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <label className="field"><span>Title</span><input type="text" value={helpForm.title} onChange={(e) => setHelpForm({ ...helpForm, title: e.target.value })} /></label>
                <label className="field"><span>Description</span><input type="text" value={helpForm.description} onChange={(e) => setHelpForm({ ...helpForm, description: e.target.value })} /></label>
                <label className="field"><span>Category</span>
                  <select value={helpForm.category} onChange={(e) => setHelpForm({ ...helpForm, category: e.target.value })}>
                    {["pet_care","moving","groceries","repairs","tutoring","other"].map(c => <option key={c} value={c}>{c.replace("_"," ")}</option>)}
                  </select>
                </label>
                <label className="field"><span>Neighbourhood</span><input type="text" value={helpForm.neighborhood} onChange={(e) => setHelpForm({ ...helpForm, neighborhood: e.target.value })} /></label>
                <button className="primary-btn" onClick={handleCreateHelpRequest}>Submit Request</button>
              </div>
            )}

            <div className="p-5 space-y-3">
              {helpRequests.length === 0 ? (
                <div className="empty-state"><FiHelpCircle className="text-3xl mb-2" style={{ color: "var(--border)" }} /><p className="empty-state-text">No help requests yet.</p></div>
              ) : helpRequests.map((req) => (
                <article key={req.id} className="card">
                  <p className="eyebrow">{req.neighborhood}</p>
                  <h4 className="card-title">{req.title}</h4>
                  <p className="section-copy">{req.description}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`chip ${req.status === "open" ? "chip-green" : ""}`}>{req.status}</span>
                    <button className="chip chip-teal flex items-center gap-1 cursor-pointer" style={{ border: "none" }} onClick={() => handleMatchVolunteers(req)}>
                      <HiSparkles className="text-xs" /> Find Volunteers
                    </button>
                  </div>
                  {matchedVolunteers[req.id] && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--green)" }}>AI Matched Volunteers</p>
                      {matchedVolunteers[req.id].map((v) => (
                        <div key={v.userId} className="rounded-lg p-2 text-sm" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                          <div className="flex justify-between">
                            <span className="font-semibold">{v.userName}</span>
                            <span className="chip chip-green">{Math.round(v.matchScore * 100)}% match</span>
                          </div>
                          <p className="section-copy mt-1">{v.matchReason}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
          </div>

          {/* Emergency Alerts */}
          <div className="panel">
            <div className="flex items-center justify-between border-b p-5" style={{ borderColor: "var(--border)" }}>
              <div className="flex items-center gap-2">
                <FiAlertTriangle style={{ color: "#dc2626" }} />
                <h3 className="section-title" style={{ marginTop: 0 }}>Emergency Alerts</h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="chip chip-alert">Real-time</span>
                <button className="primary-btn !px-3 !py-2" onClick={() => setShowAlertForm(!showAlertForm)}>{showAlertForm ? <FiX /> : <FiPlus />}</button>
              </div>
            </div>

            {showAlertForm && (
              <div className="p-4 border-b space-y-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <label className="field"><span>Title</span><input type="text" value={alertForm.title} onChange={(e) => setAlertForm({ ...alertForm, title: e.target.value })} /></label>
                <label className="field"><span>Description</span><input type="text" value={alertForm.description} onChange={(e) => setAlertForm({ ...alertForm, description: e.target.value })} /></label>
                <label className="field"><span>Type</span>
                  <select value={alertForm.type} onChange={(e) => setAlertForm({ ...alertForm, type: e.target.value })}>
                    {["missing_pet","safety","weather","infrastructure","other"].map(t => <option key={t} value={t}>{t.replace("_"," ")}</option>)}
                  </select>
                </label>
                <label className="field"><span>Neighbourhood</span><input type="text" value={alertForm.neighborhood} onChange={(e) => setAlertForm({ ...alertForm, neighborhood: e.target.value })} /></label>
                <button className="danger-btn" onClick={handleCreateAlert}>Report Alert</button>
              </div>
            )}

            <div className="p-5 space-y-3">
              {alerts.length === 0 ? (
                <div className="empty-state"><FiAlertTriangle className="text-3xl mb-2" style={{ color: "var(--border)" }} /><p className="empty-state-text">No active alerts.</p></div>
              ) : alerts.map((alert) => (
                <article key={alert.id} className="card" style={{ borderColor: "#fecaca", background: "#fef2f2" }}>
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="card-title">{alert.title}</h4>
                    <span className="stat">{new Date(parseInt(alert.createdAt)).toLocaleTimeString()}</span>
                  </div>
                  <p className="section-copy">{alert.description}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Business Sidebar ── */}
      <aside className="space-y-6">
        <div className="panel">
          <div className="flex items-center justify-between border-b p-5" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <FiBriefcase style={{ color: "var(--green)" }} />
              <div>
                <p className="eyebrow">Business Owner Tools</p>
                <h2 className="section-title">Local Businesses</h2>
              </div>
            </div>
            {isBusinessOwner && (
              <button className="primary-btn !px-3 !py-2" onClick={() => setShowBusinessForm(!showBusinessForm)}>{showBusinessForm ? <FiX /> : <FiPlus />}</button>
            )}
          </div>

          {showBusinessForm && isBusinessOwner && (
            <div className="p-4 border-b space-y-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <h3 className="card-title">New Business Listing</h3>
              <label className="field"><span>Business Name</span><input type="text" value={businessForm.name} onChange={(e) => setBusinessForm({ ...businessForm, name: e.target.value })} /></label>
              <label className="field"><span>Description</span><textarea rows={2} value={businessForm.description} onChange={(e) => setBusinessForm({ ...businessForm, description: e.target.value })} className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--border)" }} /></label>
              <label className="field"><span>Category</span>
                <select value={businessForm.category} onChange={(e) => setBusinessForm({ ...businessForm, category: e.target.value })}>
                  {["restaurant","retail","service","health","education","other"].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
                </select>
              </label>
              <label className="field"><span>Neighbourhood</span><input type="text" value={businessForm.neighborhood} onChange={(e) => setBusinessForm({ ...businessForm, neighborhood: e.target.value })} /></label>
              <label className="field"><span>Address</span><input type="text" value={businessForm.address} onChange={(e) => setBusinessForm({ ...businessForm, address: e.target.value })} /></label>
              <label className="field"><span>Phone</span><input type="text" value={businessForm.phone} onChange={(e) => setBusinessForm({ ...businessForm, phone: e.target.value })} /></label>
              <label className="field"><span>Website</span><input type="text" value={businessForm.website} onChange={(e) => setBusinessForm({ ...businessForm, website: e.target.value })} /></label>
              <button className="primary-btn" onClick={handleCreateBusiness}>Create Listing</button>
            </div>
          )}

          <div className="p-5 space-y-4">
            {businesses.length === 0 ? (
              <div className="empty-state"><FiBriefcase className="text-3xl mb-2" style={{ color: "var(--border)" }} /><p className="empty-state-text">No business listings yet.{isBusinessOwner ? " Create yours!" : ""}</p></div>
            ) : businesses.map((biz) => (
              <article key={biz.id} className="card">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="card-title">{biz.name}</h3>
                  <span className="chip">{biz.category}</span>
                </div>
                <p className="section-copy">{biz.description}</p>
                {biz.address && <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>📍 {biz.address}</p>}

                {sentiments[biz.id] && (
                  <div className="sentiment-box mt-3">
                    <p className="text-xs font-semibold flex items-center gap-1 uppercase tracking-wider" style={{ color: "var(--green)" }}><HiSparkles /> AI Sentiment</p>
                    <p className="text-sm mt-1 font-medium" style={{ color: sentimentColor(sentiments[biz.id].sentiment) }}>
                      {sentiments[biz.id].sentiment} (score: {sentiments[biz.id].score.toFixed(2)})
                    </p>
                  </div>
                )}

                <div className="mt-3 flex flex-wrap gap-2">
                  <button className="chip cursor-pointer flex items-center gap-1" style={{ border: "none" }} onClick={() => handleLoadReviews(biz.id)}>
                    <FiStar className="text-xs" />
                    {expandedBusiness === biz.id ? "Hide Reviews" : "View Reviews"}
                  </button>
                  {!isBusinessOwner && currentUser && (
                    <button className="chip chip-green cursor-pointer" style={{ border: "none" }} onClick={() => setShowReviewForm(showReviewForm === biz.id ? null : biz.id)}>
                      + Write Review
                    </button>
                  )}
                </div>

                {/* Write Review Form */}
                {showReviewForm === biz.id && (
                  <div className="mt-3 space-y-2 rounded-lg p-3" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                    <p className="text-sm font-semibold">Your Review</p>
                    <StarRating value={reviewForm.rating} onChange={(v) => setReviewForm({ ...reviewForm, rating: v })} />
                    <label className="field"><span>Comment</span>
                      <textarea rows={2} value={reviewForm.content} onChange={(e) => setReviewForm({ ...reviewForm, content: e.target.value })}
                        className="w-full rounded-lg border px-3 py-2 text-sm outline-none" style={{ borderColor: "var(--border)" }} />
                    </label>
                    <button className="primary-btn" onClick={() => handleCreateReview(biz.id)}>Submit Review</button>
                  </div>
                )}

                {/* Reviews List */}
                {expandedBusiness === biz.id && (
                  <div className="mt-3 space-y-2">
                    {(businessReviews[biz.id] || []).length === 0
                      ? <p className="text-xs" style={{ color: "var(--ink-soft)" }}>No reviews yet.</p>
                      : (businessReviews[biz.id] || []).map((review) => (
                        <div key={review.id} className="rounded-lg p-3 space-y-1" style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold">{review.authorName}</span>
                            <StarRating value={review.rating} />
                          </div>
                          <p className="section-copy">{review.content}</p>

                          {reviewSentiments[review.id] && (
                            <p className="text-xs font-medium flex items-center gap-1" style={{ color: sentimentColor(reviewSentiments[review.id].sentiment) }}>
                              <HiSparkles /> {reviewSentiments[review.id].sentiment}
                            </p>
                          )}

                          {review.ownerReply && (
                            <div className="rounded p-2 text-sm mt-1" style={{ background: "var(--green-light)", border: "1px solid var(--green-mid)" }}>
                              <span className="font-semibold">Owner reply: </span>{review.ownerReply}
                            </div>
                          )}

                          {/* Owner reply input */}
                          {isBusinessOwner && currentUser?.id === biz.ownerId && !review.ownerReply && (
                            <div className="flex gap-2 mt-2">
                              <input type="text" placeholder="Reply to this review..." value={replyInputs[review.id] || ""}
                                onChange={(e) => setReplyInputs({ ...replyInputs, [review.id]: e.target.value })}
                                className="flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none" style={{ borderColor: "var(--border)" }} />
                              <button className="primary-btn !px-3 !py-1.5" onClick={() => handleReplyToReview(review.id, biz.id)}>Reply</button>
                            </div>
                          )}
                        </div>
                      ))
                    }
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>

        {/* ── Deals ── */}
        <div className="panel">
          <div className="flex items-center justify-between border-b p-5" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2">
              <FiTag style={{ color: "var(--amber)" }} />
              <div>
                <p className="eyebrow">Local Deals</p>
                <h2 className="section-title">Current Offers</h2>
              </div>
            </div>
            {isBusinessOwner && (
              <button className="primary-btn !px-3 !py-2" onClick={() => setShowDealForm(!showDealForm)}>{showDealForm ? <FiX /> : <FiPlus />}</button>
            )}
          </div>

          {showDealForm && isBusinessOwner && (
            <div className="p-4 border-b space-y-3" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
              <h3 className="card-title">Post a Deal</h3>
              <label className="field"><span>Deal Title</span><input type="text" value={dealForm.title} onChange={(e) => setDealForm({ ...dealForm, title: e.target.value })} /></label>
              <label className="field"><span>Description</span><input type="text" value={dealForm.description} onChange={(e) => setDealForm({ ...dealForm, description: e.target.value })} /></label>
              <label className="field"><span>Discount (e.g. 20% off)</span><input type="text" value={dealForm.discount} onChange={(e) => setDealForm({ ...dealForm, discount: e.target.value })} /></label>
              <label className="field"><span>Business</span>
                <select value={dealForm.businessId} onChange={(e) => {
                  const biz = businesses.find(b => b.id === e.target.value);
                  setDealForm({ ...dealForm, businessId: e.target.value, businessName: biz?.name || "" });
                }}>
                  <option value="">Select your business</option>
                  {businesses.filter(b => b.ownerId === currentUser?.id).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </label>
              <label className="field"><span>Expires</span><input type="date" value={dealForm.expiresAt} onChange={(e) => setDealForm({ ...dealForm, expiresAt: e.target.value })} /></label>
              <button className="primary-btn" onClick={handleCreateDeal}>Post Deal</button>
            </div>
          )}

          <div className="p-5 space-y-3">
            {deals.length === 0 ? (
              <div className="empty-state"><FiTag className="text-3xl mb-2" style={{ color: "var(--border)" }} /><p className="empty-state-text">No active deals right now.</p></div>
            ) : deals.map((deal) => (
              <article key={deal.id} className="card">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="card-title">{deal.title}</h3>
                  {deal.discount && <span className="chip chip-amber">{deal.discount}</span>}
                </div>
                <p className="section-copy">{deal.description}</p>
                <p className="text-xs mt-1 font-medium" style={{ color: "var(--green)" }}>from {deal.businessName}</p>
                {deal.expiresAt && <p className="text-xs mt-1" style={{ color: "var(--ink-soft)" }}>Expires: {new Date(deal.expiresAt).toLocaleDateString()}</p>}
              </article>
            ))}
          </div>
        </div>
      </aside>
    </section>
  );
}

export default CommunityPanel;