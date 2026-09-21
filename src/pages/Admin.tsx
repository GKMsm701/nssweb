import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  useSiteData,
  Activity,
  NewsItem,
  GalleryItem,
  TeamMember,
  AchievementItem,
  Volunteer,
  ActivityDiaryEntry,
  PortalNotification,
} from "../context/SiteContext";

type AdminTab =
  | "activities"
  | "volunteers"
  | "diaries"
  | "reminders"
  | "news"
  | "gallery"
  | "team"
  | "achievements"
  | "settings";

export default function Admin() {
  const {
    activities,
    news,
    gallery,
    team,
    achievements,
    siteInfo,
    isAuthenticated,
    loginAdmin,
    logoutAdmin,
    addActivity,
    updateActivity,
    deleteActivity,
    addNews,
    updateNews,
    deleteNews,
    addGalleryItem,
    deleteGalleryItem,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    updateSiteInfo,
    resetToDefaults,

    // Volunteer & Selection Engine
    volunteers,
    registrations,
    runSelectionAlgorithm,
    updateRegistrationStatus,
    markActivityAttendance,
    adjustVolunteerHours,
    diaryEntries,
    verifyDiaryEntry,
    notifications,
    sendNotification,
  } = useSiteData();

  const [activeTab, setActiveTab] = useState<AdminTab>("activities");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal / Form States
  const [activityModal, setActivityModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data: Partial<Activity>;
    delayPreset: string;
  }>({
    open: false,
    mode: "add",
    data: {},
    delayPreset: "now",
  });

  // Applicants & Selection Engine Modal State
  const [applicantsModal, setApplicantsModal] = useState<{
    open: boolean;
    activityId: number;
    attendedSelected: string[];
  }>({
    open: false,
    activityId: 0,
    attendedSelected: [],
  });

  // Adjust Hours Modal State
  const [hoursModal, setHoursModal] = useState<{
    open: boolean;
    volunteer: Volunteer | null;
    campusDelta: number;
    communityDelta: number;
    reason: string;
  }>({
    open: false,
    volunteer: null,
    campusDelta: 0,
    communityDelta: 0,
    reason: "",
  });

  // Verify Diary Modal State
  const [verifyModal, setVerifyModal] = useState<{
    open: boolean;
    entry: ActivityDiaryEntry | null;
    remarks: string;
  }>({
    open: false,
    entry: null,
    remarks: "",
  });

  // Broadcast Reminder Modal State
  const [broadcastModal, setBroadcastModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    type: PortalNotification["type"];
    targetActivityId: number | "all";
  }>({
    open: false,
    title: "",
    message: "",
    type: "reminder",
    targetActivityId: "all",
  });

  const [newsModal, setNewsModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    data: Partial<NewsItem>;
  }>({
    open: false,
    mode: "add",
    data: {},
  });

  const [galleryModal, setGalleryModal] = useState<{
    open: boolean;
    data: GalleryItem;
  }>({
    open: false,
    data: { src: "", caption: "" },
  });

  const [teamModal, setTeamModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    index?: number;
    data: TeamMember;
  }>({
    open: false,
    mode: "add",
    data: { name: "", role: "", department: "", image: "" },
  });

  const [achievementModal, setAchievementModal] = useState<{
    open: boolean;
    mode: "add" | "edit";
    index?: number;
    data: AchievementItem;
  }>({
    open: false,
    mode: "add",
    data: { year: "", title: "", text: "" },
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(siteInfo);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (loginAdmin(passwordInput)) {
      setAuthError(false);
      setPasswordInput("");
      showToast("Welcome to NSS Admin Studio!");
    } else {
      setAuthError(true);
    }
  };

  // ───────── Authentication Gate ─────────
  if (!isAuthenticated) {
    return (
      <div className="admin-lock-screen">
        <div className="admin-lock-card">
          <div className="admin-lock-icon">
            <img src="/nss-logo.svg" alt="NSS Logo" width={56} height={56} />
          </div>
          <h2>NSS Admin Portal</h2>
          <p className="admin-lock-desc">
            Restricted management studio to configure drives, manage volunteer hours ledger, run candidate selections, and verify post-activity diaries.
          </p>

          <form onSubmit={handleLogin} className="admin-lock-form">
            <div className="form-group">
              <label>Passkey / Secret Key</label>
              <input
                type="password"
                placeholder="Enter admin password..."
                value={passwordInput}
                onChange={(e) => {
                  setPasswordInput(e.target.value);
                  setAuthError(false);
                }}
                required
                autoFocus
              />
            </div>
            {authError && (
              <div className="admin-error-badge">
                ⚠️ Invalid passkey. Hint: Default is <code>nss2026</code>
              </div>
            )}
            <button type="submit" className="btn primary admin-lock-btn">
              Unlock Portal Studio
            </button>
          </form>

          <div className="admin-lock-footer">
            <Link to="/" className="text-link">
              ← Return to Public Website
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active activity in applicants modal
  const selectedActivityForApplicants = activities.find(
    (a) => a.id === applicantsModal.activityId
  );
  const currentApplicants = registrations.filter(
    (r) => r.activityId === applicantsModal.activityId
  );

  // Total statistics for Volunteer Hours Ledger
  const totalCampusHours = volunteers.reduce((acc, v) => acc + (v.campusHours || 0), 0);
  const totalCommHours = volunteers.reduce((acc, v) => acc + (v.communityHours || 0), 0);
  const totalAllHours = volunteers.reduce((acc, v) => acc + (v.totalHours || 0), 0);

  // ───────── Authenticated Studio Dashboard ─────────
  return (
    <div className="admin-dashboard">
      {/* Toast Notification */}
      {toastMessage && <div className="admin-toast">{toastMessage}</div>}

      {/* Top Bar */}
      <header className="admin-topbar">
        <div className="container admin-topbar-inner">
          <div className="admin-brand">
            <img src="/nss-logo.svg" alt="NSS Logo" className="admin-logo-small" />
            <div>
              <strong>NSS Admin Studio</strong>
              <small>Live Content & Volunteer Hours Management</small>
            </div>
            <span className="admin-live-pill">● Confidential Hours Control Active</span>
          </div>

          <div className="admin-topbar-actions">
            <Link to="/volunteer" target="_blank" className="btn ghost admin-btn-sm">
              🧑‍🎓 Volunteer Portal ↗
            </Link>
            <Link to="/" target="_blank" className="btn ghost admin-btn-sm">
              🌐 Public Site ↗
            </Link>
            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to reset all portal data to initial defaults?")) {
                  resetToDefaults();
                  setSettingsForm(siteInfo);
                  showToast("All data reset to initial defaults.");
                }
              }}
              className="admin-btn-ghost-danger admin-btn-sm"
              title="Reset all content to original defaults"
            >
              ↺ Reset Defaults
            </button>
            <button onClick={logoutAdmin} className="btn ghost admin-btn-sm">
              Lock & Exit
            </button>
          </div>
        </div>
      </header>

      {/* Main Admin Area */}
      <div className="container admin-body">
        {/* Navigation Tabs */}
        <nav className="admin-tab-nav">
          <button
            className={`admin-tab-btn ${activeTab === "activities" ? "active" : ""}`}
            onClick={() => setActiveTab("activities")}
          >
            <span>📅 Activities & Selection</span>
            <span className="tab-count">{activities.length}</span>
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "volunteers" ? "active" : ""}`}
            onClick={() => setActiveTab("volunteers")}
          >
            <span>👥 Volunteer Hours Ledger</span>
            <span className="tab-count">{volunteers.length}</span>
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "diaries" ? "active" : ""}`}
            onClick={() => setActiveTab("diaries")}
          >
            <span>📝 Post-Activity Diaries</span>
            <span className="tab-count">{diaryEntries.length}</span>
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "reminders" ? "active" : ""}`}
            onClick={() => setActiveTab("reminders")}
          >
            <span>🔔 Broadcast Reminders</span>
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "news" ? "active" : ""}`}
            onClick={() => setActiveTab("news")}
          >
            <span>📢 News</span>
            <span className="tab-count">{news.length}</span>
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "gallery" ? "active" : ""}`}
            onClick={() => setActiveTab("gallery")}
          >
            <span>🖼️ Gallery</span>
            <span className="tab-count">{gallery.length}</span>
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "team" ? "active" : ""}`}
            onClick={() => setActiveTab("team")}
          >
            <span>👤 Officers & Team</span>
            <span className="tab-count">{team.length}</span>
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "achievements" ? "active" : ""}`}
            onClick={() => setActiveTab("achievements")}
          >
            <span>🏆 Awards</span>
            <span className="tab-count">{achievements.length}</span>
          </button>
          <button
            className={`admin-tab-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => {
              setSettingsForm(siteInfo);
              setActiveTab("settings");
            }}
          >
            <span>⚙️ Unit Settings</span>
          </button>
        </nav>

        {/* ───────── TAB 1: ACTIVITIES & SELECTION ───────── */}
        {activeTab === "activities" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Manage Activities, Capacities & Selection Algorithms</h2>
                <p className="lead-sm">
                  Publish campus & community drives, schedule delayed registration openings, specify volunteer limits, and execute automated selection.
                </p>
              </div>
              <button
                className="btn primary"
                onClick={() =>
                  setActivityModal({
                    open: true,
                    mode: "add",
                    delayPreset: "now",
                    data: {
                      title: "",
                      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                      isoDate: new Date().toISOString().split("T")[0],
                      time: "09:00 AM - 01:00 PM",
                      location: "College Campus",
                      category: "Community",
                      scope: "Campus",
                      description: "",
                      hours: 4, // Visible only to admin!
                      status: "Upcoming",
                      maxVolunteers: 3,
                      selectionMode: "LowestHours",
                      registrationStartsAt: new Date().toISOString(),
                      image: "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=1200&q=85",
                    },
                  })
                }
              >
                + Publish New Activity
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title & Scope</th>
                    <th>Date & Location</th>
                    <th>Capacity & Selection Mode</th>
                    <th>Registration Opening</th>
                    <th>Officer Credit</th>
                    <th>Applicants / Roster</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.map((a) => {
                    const actRegs = registrations.filter((r) => r.activityId === a.id);
                    const selectedCount = actRegs.filter((r) => r.status === "Selected" || r.status === "Attended").length;
                    const now = new Date();
                    const startsAt = new Date(a.registrationStartsAt);
                    const isRegOpen = now >= startsAt;

                    return (
                      <tr key={a.id}>
                        <td>
                          <div className="admin-item-title-cell">
                            <img src={a.image} alt={a.title} className="admin-thumb" />
                            <div>
                              <strong>{a.title}</strong>
                              <div style={{ display: "flex", gap: 6, marginTop: 4 }}>
                                <span className={`admin-tag-scope ${a.scope === "Campus" ? "scope-campus" : "scope-community"}`}>
                                  {a.scope === "Campus" ? "🏫 Campus" : "🌳 Community"}
                                </span>
                                <small className="admin-tag-category">{a.category}</small>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>📅 {a.date}</div>
                          <small className="admin-text-sub">📍 {a.location}</small>
                        </td>
                        <td>
                          <div>
                            <strong>{a.maxVolunteers} Volunteers</strong>
                          </div>
                          <span className="admin-selection-badge">
                            {a.selectionMode === "LowestHours"
                              ? `Lowest ${a.scope} Hours Priority`
                              : "First-Come First-Serve (FCFS)"}
                          </span>
                        </td>
                        <td>
                          {isRegOpen ? (
                            <span className="admin-reg-open-badge">🟢 Open Now</span>
                          ) : (
                            <div>
                              <span className="admin-reg-locked-badge">⏳ Unlocks:</span>
                              <div className="admin-text-sub">
                                {startsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })},{" "}
                                {startsAt.toLocaleDateString([], { month: "short", day: "numeric" })}
                              </div>
                            </div>
                          )}
                        </td>
                        <td>
                          {/* STRICTLY VISIBLE TO ADMIN */}
                          <div className="admin-hours-pill" title="Visible only to Programme Officer">
                            🔒 <strong>{a.hours} hrs</strong> credit
                          </div>
                        </td>
                        <td>
                          <button
                            className="btn ghost admin-applicants-btn"
                            onClick={() => {
                              const attended = actRegs
                                .filter((r) => r.status === "Selected" || r.status === "Attended")
                                .map((r) => r.volunteerId);
                              setApplicantsModal({
                                open: true,
                                activityId: a.id,
                                attendedSelected: attended,
                              });
                            }}
                          >
                            👥 {actRegs.length} Applied ({selectedCount}/{a.maxVolunteers} Selected)
                          </button>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="admin-action-btn edit"
                            onClick={() =>
                              setActivityModal({
                                open: true,
                                mode: "edit",
                                delayPreset: "custom",
                                data: { ...a },
                              })
                            }
                            title="Edit Activity"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            className="admin-action-btn delete"
                            onClick={() => {
                              if (window.confirm(`Delete activity "${a.title}" and associated registrations?`)) {
                                deleteActivity(a.id);
                                showToast("Activity deleted");
                              }
                            }}
                            title="Delete Activity"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ───────── TAB 2: VOLUNTEER HOURS LEDGER (ADMIN ONLY) ───────── */}
        {activeTab === "volunteers" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Confidential Volunteer Hours Ledger & Performance</h2>
                <p className="lead-sm">
                  Official administrative records of accumulated Campus and Community service hours. (Hidden from volunteers).
                </p>
              </div>
            </div>

            {/* Total Unit Ledger Summary */}
            <div className="admin-ledger-stats">
              <div className="ledger-stat-card">
                <span className="stat-icon">👥</span>
                <div>
                  <h3>{volunteers.length}</h3>
                  <small>Enrolled Volunteers</small>
                </div>
              </div>
              <div className="ledger-stat-card campus">
                <span className="stat-icon">🏫</span>
                <div>
                  <h3>{totalCampusHours} hrs</h3>
                  <small>Total Campus Service Logged</small>
                </div>
              </div>
              <div className="ledger-stat-card community">
                <span className="stat-icon">🌳</span>
                <div>
                  <h3>{totalCommHours} hrs</h3>
                  <small>Total Community Service Logged</small>
                </div>
              </div>
              <div className="ledger-stat-card total">
                <span className="stat-icon">⭐</span>
                <div>
                  <h3>{totalAllHours} hrs</h3>
                  <small>Cumulative NSS Service Delivered</small>
                </div>
              </div>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Volunteer & Roll Number</th>
                    <th>Unit & Department</th>
                    <th style={{ color: "#1d4ed8" }}>🏫 Campus Hours</th>
                    <th style={{ color: "#059669" }}>🌳 Community Hours</th>
                    <th>⭐ Total Hours</th>
                    <th>Attended Drives</th>
                    <th style={{ textAlign: "right" }}>Officer Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map((vol) => {
                    const attendedCount = registrations.filter(
                      (r) => r.volunteerId === vol.id && r.status === "Attended"
                    ).length;

                    return (
                      <tr key={vol.id}>
                        <td>
                          <div className="admin-item-title-cell">
                            <img src={vol.avatar} alt={vol.name} className="admin-avatar-thumb" />
                            <div>
                              <strong>{vol.name}</strong>
                              <div className="admin-text-sub">Roll: {vol.rollNumber} • {vol.bloodGroup}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>{vol.unit}</div>
                          <small className="admin-text-sub">{vol.department} ({vol.year})</small>
                        </td>
                        <td>
                          <strong style={{ color: "#2563eb", fontSize: "15px" }}>
                            {vol.campusHours || 0} hrs
                          </strong>
                        </td>
                        <td>
                          <strong style={{ color: "#059669", fontSize: "15px" }}>
                            {vol.communityHours || 0} hrs
                          </strong>
                        </td>
                        <td>
                          <strong style={{ fontSize: "16px", color: "var(--navy)" }}>
                            {vol.totalHours || 0} hrs
                          </strong>
                        </td>
                        <td>
                          <span className="admin-badge-status status-completed">
                            {attendedCount} drives
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            className="admin-action-btn edit"
                            onClick={() =>
                              setHoursModal({
                                open: true,
                                volunteer: vol,
                                campusDelta: 0,
                                communityDelta: 0,
                                reason: "",
                              })
                            }
                            title="Adjust service hours record"
                          >
                            ⚖️ Adjust Hours
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ───────── TAB 3: DIARIES & FEEDBACK ───────── */}
        {activeTab === "diaries" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Post-Activity Diary Entries & Volunteer Feedback</h2>
                <p className="lead-sm">
                  Review student field reflections, tasks performed, and approve official service logs.
                </p>
              </div>
            </div>

            {diaryEntries.length === 0 ? (
              <div className="empty-state-box">
                <span className="empty-icon">📖</span>
                <h4>No Diary Reflections Submitted Yet</h4>
                <p>When volunteers complete drives, their submitted feedback will appear here for verification.</p>
              </div>
            ) : (
              <div className="admin-diaries-grid">
                {diaryEntries.map((entry) => (
                  <article key={entry.id} className="admin-diary-review-card">
                    <div className="admin-diary-card-head">
                      <div>
                        <span className="diary-date-pill">📅 {entry.date}</span>
                        <h3>{entry.activityTitle}</h3>
                        <div className="admin-text-sub">
                          By <strong>{entry.volunteerName}</strong> ({entry.volunteerId})
                        </div>
                      </div>
                      <div className="diary-rating">
                        {"★".repeat(entry.rating)}
                        {"☆".repeat(5 - entry.rating)}
                      </div>
                    </div>

                    <div className="admin-diary-section">
                      <strong>Tasks & Field Duties:</strong>
                      <p>{entry.tasksDone}</p>
                    </div>

                    <div className="admin-diary-section">
                      <strong>Learnings & Social Impact:</strong>
                      <p>{entry.learnings}</p>
                    </div>

                    {entry.photoUrl && (
                      <div className="admin-diary-photo">
                        <img src={entry.photoUrl} alt="Activity proof" />
                      </div>
                    )}

                    <div className="admin-diary-footer">
                      {entry.verifiedByAdmin ? (
                        <div className="diary-verified-stamp">
                          <span>✅ Verified by Officer</span>
                          {entry.adminRemarks && <p>"{entry.adminRemarks}"</p>}
                        </div>
                      ) : (
                        <button
                          className="btn primary admin-btn-sm"
                          onClick={() =>
                            setVerifyModal({
                              open: true,
                              entry,
                              remarks: "Verified and commended for dedicated service.",
                            })
                          }
                        >
                          Verify & Commend Entry ✍️
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ───────── TAB 4: BROADCAST REMINDERS & NOTIFICATIONS ───────── */}
        {activeTab === "reminders" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Broadcast Reminders & Notifications</h2>
                <p className="lead-sm">
                  Send immediate in-app alerts, activity reminders, or announcements to volunteers.
                </p>
              </div>
              <button
                className="btn primary"
                onClick={() =>
                  setBroadcastModal({
                    open: true,
                    title: "",
                    message: "",
                    type: "reminder",
                    targetActivityId: "all",
                  })
                }
              >
                + Dispatch Notification
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Title & Message</th>
                    <th>Target Audience</th>
                    <th>Dispatched At</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map((n) => (
                    <tr key={n.id}>
                      <td>
                        <span className="notif-type-tag">
                          {n.type === "reminder" && "⏰ Reminder"}
                          {n.type === "registration_open" && "🔓 Reg Open"}
                          {n.type === "selection" && "🎉 Selection"}
                          {n.type === "diary_prompt" && "📝 Diary Prompt"}
                          {n.type === "announcement" && "📢 Announcement"}
                        </span>
                      </td>
                      <td>
                        <strong>{n.title}</strong>
                        <div className="admin-text-sub">{n.message}</div>
                      </td>
                      <td>
                        {n.volunteerId === "all" ? (
                          <span className="badge-all">All Volunteers</span>
                        ) : (
                          <span className="badge-specific">{n.volunteerId}</span>
                        )}
                      </td>
                      <td>
                        {new Date(n.createdAt).toLocaleDateString()} at{" "}
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td>
                        <span className="admin-live-pill">Delivered</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ───────── TAB 5: NEWS ───────── */}
        {activeTab === "news" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>News & Notice Board</h2>
                <p className="lead-sm">Manage notices and announcements displayed on the public portal.</p>
              </div>
              <button
                className="btn primary"
                onClick={() =>
                  setNewsModal({
                    open: true,
                    mode: "add",
                    data: {
                      title: "",
                      category: "Announcement",
                      date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                      text: "",
                    },
                  })
                }
              >
                + Add Notice
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title & Category</th>
                    <th>Date</th>
                    <th>Summary</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {news.map((n) => (
                    <tr key={n.id}>
                      <td>
                        <strong>{n.title}</strong>
                        <div><small className="admin-tag-category">{n.category}</small></div>
                      </td>
                      <td>{n.date}</td>
                      <td><p className="admin-table-desc">{n.text}</p></td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="admin-action-btn edit"
                          onClick={() =>
                            setNewsModal({
                              open: true,
                              mode: "edit",
                              data: { ...n },
                            })
                          }
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="admin-action-btn delete"
                          onClick={() => {
                            if (window.confirm(`Delete notice "${n.title}"?`)) {
                              deleteNews(n.id);
                              showToast("Notice deleted");
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ───────── TAB 6: GALLERY ───────── */}
        {activeTab === "gallery" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Photo Gallery</h2>
                <p className="lead-sm">Manage event photos displayed in the public gallery.</p>
              </div>
              <button
                className="btn primary"
                onClick={() =>
                  setGalleryModal({
                    open: true,
                    data: { src: "", caption: "" },
                  })
                }
              >
                + Add Photo
              </button>
            </div>

            <div className="admin-gallery-grid">
              {gallery.map((item, i) => (
                <div key={i} className="admin-gallery-card">
                  <img src={item.src} alt={item.caption} />
                  <div className="admin-gallery-card-body">
                    <p>{item.caption}</p>
                    <button
                      className="admin-action-btn delete"
                      onClick={() => {
                        if (window.confirm("Remove this photo from gallery?")) {
                          deleteGalleryItem(i);
                          showToast("Photo removed");
                        }
                      }}
                    >
                      🗑️ Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ───────── TAB 7: TEAM ───────── */}
        {activeTab === "team" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Officers & Student Coordinators</h2>
                <p className="lead-sm">Configure unit leadership and student coordinators.</p>
              </div>
              <button
                className="btn primary"
                onClick={() =>
                  setTeamModal({
                    open: true,
                    mode: "add",
                    data: { name: "", role: "Student Coordinator", department: "", image: "https://i.pravatar.cc/500?img=33" },
                  })
                }
              >
                + Add Member
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Department</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {team.map((m, i) => (
                    <tr key={i}>
                      <td>
                        <div className="admin-item-title-cell">
                          <img src={m.image} alt={m.name} className="admin-avatar-thumb" />
                          <strong>{m.name}</strong>
                        </div>
                      </td>
                      <td><span className="admin-badge-status status-upcoming">{m.role}</span></td>
                      <td>{m.department}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="admin-action-btn edit"
                          onClick={() =>
                            setTeamModal({
                              open: true,
                              mode: "edit",
                              index: i,
                              data: { ...m },
                            })
                          }
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="admin-action-btn delete"
                          onClick={() => {
                            if (window.confirm(`Remove ${m.name}?`)) {
                              deleteTeamMember(i);
                              showToast("Team member removed");
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ───────── TAB 8: ACHIEVEMENTS ───────── */}
        {activeTab === "achievements" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Achievements & Recognitions</h2>
                <p className="lead-sm">Unit awards, milestones, and university citations.</p>
              </div>
              <button
                className="btn primary"
                onClick={() =>
                  setAchievementModal({
                    open: true,
                    mode: "add",
                    data: { year: "2025–26", title: "", text: "" },
                  })
                }
              >
                + Add Achievement
              </button>
            </div>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Year</th>
                    <th>Award / Title</th>
                    <th>Citation</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {achievements.map((item, i) => (
                    <tr key={i}>
                      <td><strong>{item.year}</strong></td>
                      <td><strong>{item.title}</strong></td>
                      <td><p className="admin-table-desc">{item.text}</p></td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="admin-action-btn edit"
                          onClick={() =>
                            setAchievementModal({
                              open: true,
                              mode: "edit",
                              index: i,
                              data: { ...item },
                            })
                          }
                        >
                          ✏️ Edit
                        </button>
                        <button
                          className="admin-action-btn delete"
                          onClick={() => {
                            if (window.confirm(`Remove ${item.title}?`)) {
                              deleteAchievement(i);
                              showToast("Achievement removed");
                            }
                          }}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ───────── TAB 9: SETTINGS ───────── */}
        {activeTab === "settings" && (
          <section className="admin-panel">
            <div className="admin-panel-head">
              <div>
                <h2>Unit Information, Stats & Hero Banner</h2>
                <p className="lead-sm">Update college details, Programme Officer contact, and statistics.</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateSiteInfo(settingsForm);
                showToast("Site settings & stats updated successfully!");
              }}
              className="admin-settings-form"
            >
              <div className="admin-form-section">
                <h3>📊 Key Public Statistics</h3>
                <div className="admin-grid-2">
                  <div className="form-group">
                    <label>Volunteers Count</label>
                    <input
                      type="text"
                      value={settingsForm.stats.volunteers}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          stats: { ...settingsForm.stats, volunteers: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Activities Count</label>
                    <input
                      type="text"
                      value={settingsForm.stats.activities}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          stats: { ...settingsForm.stats, activities: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Service Hours</label>
                    <input
                      type="text"
                      value={settingsForm.stats.hours}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          stats: { ...settingsForm.stats, hours: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Recognitions / Awards</label>
                    <input
                      type="text"
                      value={settingsForm.stats.recognitions}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          stats: { ...settingsForm.stats, recognitions: e.target.value },
                        })
                      }
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="admin-form-section">
                <h3>📢 Hero Banner Content</h3>
                <div className="form-group">
                  <label>Hero Motto / Headline</label>
                  <input
                    type="text"
                    value={settingsForm.heroTagline}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, heroTagline: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Hero Subtitle / Description</label>
                  <textarea
                    rows={2}
                    value={settingsForm.heroSubtitle}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, heroSubtitle: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="admin-form-section">
                <h3>📍 Unit Officer & Contact Details</h3>
                <div className="admin-grid-2">
                  <div className="form-group">
                    <label>Programme Officer Name</label>
                    <input
                      type="text"
                      value={settingsForm.programmeOfficer}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, programmeOfficer: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>College Name</label>
                    <input
                      type="text"
                      value={settingsForm.collegeName}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, collegeName: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="admin-grid-2">
                  <div className="form-group">
                    <label>Official Phone Number</label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, phone: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Official Email Address</label>
                    <input
                      type="email"
                      value={settingsForm.email}
                      onChange={(e) =>
                        setSettingsForm({ ...settingsForm, email: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>College Campus Address</label>
                  <textarea
                    rows={2}
                    value={settingsForm.address}
                    onChange={(e) =>
                      setSettingsForm({ ...settingsForm, address: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn primary">
                Save Changes to Public Website
              </button>
            </form>
          </section>
        )}
      </div>

      {/* ───────── MODAL: APPLICANTS & SELECTION ENGINE ───────── */}
      {applicantsModal.open && selectedActivityForApplicants && (
        <div className="admin-modal-backdrop" onClick={() => setApplicantsModal({ ...applicantsModal, open: false })}>
          <div className="admin-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="eyebrow dark">ACTIVITY SELECTION ENGINE & ATTENDANCE</span>
                <h3>{selectedActivityForApplicants.title}</h3>
                <div className="admin-text-sub">
                  Scope: <strong>{selectedActivityForApplicants.scope}</strong> • Category: {selectedActivityForApplicants.category} • Capacity: <strong>{selectedActivityForApplicants.maxVolunteers} Volunteers</strong>
                </div>
              </div>
              <button
                className="cal-close-btn"
                onClick={() => setApplicantsModal({ ...applicantsModal, open: false })}
              >
                ✕
              </button>
            </div>

            {/* Selection Mode Info & Engine Trigger */}
            <div className="admin-selection-action-banner">
              <div>
                <strong>Selection Criteria: </strong>
                {selectedActivityForApplicants.selectionMode === "LowestHours" ? (
                  <span>
                    Priority awarded to candidates with the <strong>Lowest {selectedActivityForApplicants.scope} Activity Hours</strong> (Tie-breaker: earlier registration time).
                  </span>
                ) : (
                  <span>
                    <strong>First-Come, First-Served (FCFS)</strong> based on registration submission order.
                  </span>
                )}
              </div>

              <button
                className="btn primary"
                onClick={() => {
                  const res = runSelectionAlgorithm(selectedActivityForApplicants.id);
                  showToast(`Selection executed: ${res.selectedCount} selected, ${res.waitlistedCount} waitlisted.`);
                }}
              >
                ⚡ Execute Selection Algorithm
              </button>
            </div>

            {/* Applicants Table */}
            <div className="admin-table-wrapper" style={{ marginTop: 16 }}>
              {currentApplicants.length === 0 ? (
                <div className="empty-state-box">
                  <span className="empty-icon">👥</span>
                  <p>No volunteer registrations submitted yet for this drive.</p>
                </div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Volunteer Details</th>
                      <th>Registration Time</th>
                      {/* ADMIN-ONLY HOURS VISIBILITY */}
                      <th style={{ color: "#2563eb" }}>Campus Hrs</th>
                      <th style={{ color: "#059669" }}>Community Hrs</th>
                      <th>Total Hrs</th>
                      <th>Selection Status</th>
                      <th style={{ textAlign: "right" }}>Manual Override</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentApplicants.map((reg) => {
                      const vol = volunteers.find((v) => v.id === reg.volunteerId);
                      const isAttendedChecked = applicantsModal.attendedSelected.includes(reg.volunteerId);

                      return (
                        <tr key={reg.id} className={reg.status === "Selected" ? "row-selected" : ""}>
                          <td>
                            <input
                              type="checkbox"
                              checked={isAttendedChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setApplicantsModal({
                                    ...applicantsModal,
                                    attendedSelected: [...applicantsModal.attendedSelected, reg.volunteerId],
                                  });
                                } else {
                                  setApplicantsModal({
                                    ...applicantsModal,
                                    attendedSelected: applicantsModal.attendedSelected.filter((id) => id !== reg.volunteerId),
                                  });
                                }
                              }}
                              title="Check to mark as attended"
                            />
                          </td>
                          <td>
                            <strong>{reg.volunteerName}</strong>
                            <div className="admin-text-sub">{vol?.rollNumber} • {vol?.unit} ({vol?.department})</div>
                          </td>
                          <td>
                            <div>{new Date(reg.registeredAt).toLocaleDateString()}</div>
                            <small className="admin-text-sub">
                              {new Date(reg.registeredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </small>
                          </td>
                          <td>
                            <span className={selectedActivityForApplicants.scope === "Campus" ? "highlight-category-hours" : ""}>
                              {vol?.campusHours || 0} hrs
                            </span>
                          </td>
                          <td>
                            <span className={selectedActivityForApplicants.scope === "Community" ? "highlight-category-hours" : ""}>
                              {vol?.communityHours || 0} hrs
                            </span>
                          </td>
                          <td>
                            <strong>{vol?.totalHours || 0} hrs</strong>
                          </td>
                          <td>
                            <span
                              className={`admin-badge-status ${
                                reg.status === "Selected" || reg.status === "Attended"
                                  ? "status-upcoming"
                                  : "status-completed"
                              }`}
                            >
                              {reg.status}
                            </span>
                            {reg.selectionReason && (
                              <div className="admin-text-sub" style={{ fontSize: "11px", marginTop: 3 }}>
                                {reg.selectionReason}
                              </div>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {reg.status !== "Selected" ? (
                              <button
                                className="admin-action-btn edit"
                                onClick={() => {
                                  updateRegistrationStatus(reg.id, "Selected", "Manually selected by Officer");
                                  showToast(`${reg.volunteerName} marked as Selected.`);
                                }}
                              >
                                ✓ Select
                              </button>
                            ) : (
                              <button
                                className="admin-action-btn delete"
                                onClick={() => {
                                  updateRegistrationStatus(reg.id, "Waitlisted", "Manually waitlisted by Officer");
                                  showToast(`${reg.volunteerName} marked as Waitlisted.`);
                                }}
                              >
                                Waitlist
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Attendance & Credit Hours Bar */}
            <div className="admin-attendance-footer-bar">
              <div>
                <strong>Mark Completion & Award Service Credit:</strong>
                <p className="admin-text-sub">
                  Select attendees using the checkboxes above. Marking completion will credit <strong>{selectedActivityForApplicants.hours} hours</strong> to their confidential {selectedActivityForApplicants.scope} ledger and send diary submission prompts.
                </p>
              </div>

              <button
                className="btn primary"
                onClick={() => {
                  if (applicantsModal.attendedSelected.length === 0) {
                    alert("Please select at least one volunteer using the checkboxes.");
                    return;
                  }
                  if (
                    window.confirm(
                      `Confirm attendance for ${applicantsModal.attendedSelected.length} volunteers and credit ${selectedActivityForApplicants.hours} ${selectedActivityForApplicants.scope} hours?`
                    )
                  ) {
                    markActivityAttendance(
                      selectedActivityForApplicants.id,
                      applicantsModal.attendedSelected
                    );
                    showToast("Attendance confirmed and service hours successfully credited!");
                    setApplicantsModal({ ...applicantsModal, open: false });
                  }
                }}
              >
                🎓 Mark Attended & Credit Hours ({applicantsModal.attendedSelected.length})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ───────── MODAL: ADJUST HOURS (ADMIN LEDGER) ───────── */}
      {hoursModal.open && hoursModal.volunteer && (
        <div className="admin-modal-backdrop" onClick={() => setHoursModal({ ...hoursModal, open: false })}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="eyebrow dark">ADMIN HOURS ADJUSTMENT</span>
                <h3>Adjust Hours: {hoursModal.volunteer.name}</h3>
                <small>Roll: {hoursModal.volunteer.rollNumber} • {hoursModal.volunteer.unit}</small>
              </div>
              <button className="cal-close-btn" onClick={() => setHoursModal({ ...hoursModal, open: false })}>
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                adjustVolunteerHours(
                  hoursModal.volunteer!.id,
                  hoursModal.campusDelta,
                  hoursModal.communityDelta,
                  hoursModal.reason
                );
                showToast(`Hours updated for ${hoursModal.volunteer!.name}`);
                setHoursModal({ ...hoursModal, open: false });
              }}
              className="admin-modal-body"
            >
              <div className="admin-current-hours-box">
                <div>
                  <small>Current Campus Hours</small>
                  <strong>{hoursModal.volunteer.campusHours || 0} hrs</strong>
                </div>
                <div>
                  <small>Current Community Hours</small>
                  <strong>{hoursModal.volunteer.communityHours || 0} hrs</strong>
                </div>
                <div>
                  <small>Total Ledger</small>
                  <strong>{hoursModal.volunteer.totalHours || 0} hrs</strong>
                </div>
              </div>

              <div className="admin-grid-2">
                <div className="form-group">
                  <label>Campus Hours Delta (+ or -)</label>
                  <input
                    type="number"
                    value={hoursModal.campusDelta}
                    onChange={(e) => setHoursModal({ ...hoursModal, campusDelta: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Community Hours Delta (+ or -)</label>
                  <input
                    type="number"
                    value={hoursModal.communityDelta}
                    onChange={(e) => setHoursModal({ ...hoursModal, communityDelta: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Officer Remark / Audit Justification</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Camp leadership bonus or correction"
                  value={hoursModal.reason}
                  onChange={(e) => setHoursModal({ ...hoursModal, reason: e.target.value })}
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setHoursModal({ ...hoursModal, open: false })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save Adjusted Hours →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────── MODAL: VERIFY DIARY ENTRY ───────── */}
      {verifyModal.open && verifyModal.entry && (
        <div className="admin-modal-backdrop" onClick={() => setVerifyModal({ ...verifyModal, open: false })}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Verify Volunteer Diary Reflection</h3>
              <button className="cal-close-btn" onClick={() => setVerifyModal({ ...verifyModal, open: false })}>
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              <p>
                Author: <strong>{verifyModal.entry.volunteerName}</strong> ({verifyModal.entry.volunteerId})
              </p>
              <p>Activity: <strong>{verifyModal.entry.activityTitle}</strong></p>

              <div className="form-group" style={{ marginTop: 12 }}>
                <label>Programme Officer Endorsement / Remarks</label>
                <textarea
                  rows={3}
                  value={verifyModal.remarks}
                  onChange={(e) => setVerifyModal({ ...verifyModal, remarks: e.target.value })}
                  placeholder="Add evaluation remarks..."
                  required
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  className="btn ghost"
                  onClick={() => setVerifyModal({ ...verifyModal, open: false })}
                >
                  Cancel
                </button>
                <button
                  className="btn primary"
                  onClick={() => {
                    verifyDiaryEntry(verifyModal.entry!.id, verifyModal.remarks);
                    showToast("Diary entry verified!");
                    setVerifyModal({ ...verifyModal, open: false });
                  }}
                >
                  Confirm & Stamp Verified ✓
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ───────── MODAL: BROADCAST NOTIFICATION ───────── */}
      {broadcastModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setBroadcastModal({ ...broadcastModal, open: false })}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Dispatch Volunteer Alert or Reminder</h3>
              <button className="cal-close-btn" onClick={() => setBroadcastModal({ ...broadcastModal, open: false })}>
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendNotification({
                  volunteerId: broadcastModal.targetActivityId === "all" ? "all" : "all",
                  title: broadcastModal.title,
                  message: broadcastModal.message,
                  type: broadcastModal.type,
                  activityId: typeof broadcastModal.targetActivityId === "number" ? broadcastModal.targetActivityId : undefined,
                });
                showToast("Notification dispatched!");
                setBroadcastModal({ ...broadcastModal, open: false });
              }}
              className="admin-modal-body"
            >
              <div className="form-group">
                <label>Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandatory Briefing Tomorrow at 08:30 AM"
                  value={broadcastModal.title}
                  onChange={(e) => setBroadcastModal({ ...broadcastModal, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Notification Message</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Details and instructions for volunteers..."
                  value={broadcastModal.message}
                  onChange={(e) => setBroadcastModal({ ...broadcastModal, message: e.target.value })}
                />
              </div>

              <div className="admin-grid-2">
                <div className="form-group">
                  <label>Notification Type</label>
                  <select
                    value={broadcastModal.type}
                    onChange={(e) =>
                      setBroadcastModal({
                        ...broadcastModal,
                        type: e.target.value as PortalNotification["type"],
                      })
                    }
                  >
                    <option value="reminder">⏰ Activity Reminder</option>
                    <option value="registration_open">🔓 Registration Opening</option>
                    <option value="announcement">📢 General Announcement</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Target Activity</label>
                  <select
                    value={broadcastModal.targetActivityId}
                    onChange={(e) =>
                      setBroadcastModal({
                        ...broadcastModal,
                        targetActivityId: e.target.value === "all" ? "all" : Number(e.target.value),
                      })
                    }
                  >
                    <option value="all">All Volunteers (Broadcast)</option>
                    {activities.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setBroadcastModal({ ...broadcastModal, open: false })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Send Live Alert 🚀
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────── MODAL: ACTIVITY CREATE / EDIT ───────── */}
      {activityModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setActivityModal({ ...activityModal, open: false })}>
          <div className="admin-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{activityModal.mode === "add" ? "Publish New NSS Activity" : "Edit Activity"}</h3>
              <button className="cal-close-btn" onClick={() => setActivityModal({ ...activityModal, open: false })}>
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const d = activityModal.data;
                if (!d.title || !d.date) return;

                // Calculate registration opening timestamp based on delay preset
                let regTime = d.registrationStartsAt || new Date().toISOString();
                const nowMs = Date.now();
                if (activityModal.delayPreset === "now") {
                  regTime = new Date(nowMs - 1000 * 60).toISOString();
                } else if (activityModal.delayPreset === "15m") {
                  regTime = new Date(nowMs + 15 * 60 * 1000).toISOString();
                } else if (activityModal.delayPreset === "1h") {
                  regTime = new Date(nowMs + 60 * 60 * 1000).toISOString();
                } else if (activityModal.delayPreset === "6h") {
                  regTime = new Date(nowMs + 6 * 60 * 60 * 1000).toISOString();
                } else if (activityModal.delayPreset === "1d") {
                  regTime = new Date(nowMs + 24 * 60 * 60 * 1000).toISOString();
                } else if (activityModal.delayPreset === "3d") {
                  regTime = new Date(nowMs + 3 * 24 * 60 * 60 * 1000).toISOString();
                }

                if (activityModal.mode === "add") {
                  addActivity({
                    title: d.title,
                    date: d.date,
                    isoDate: d.isoDate || "2026-09-25",
                    time: d.time || "09:00 AM - 01:00 PM",
                    location: d.location || "College Campus",
                    category: d.category || "Community",
                    scope: d.scope || "Campus",
                    description: d.description || "",
                    hours: Number(d.hours) || 4, // Visible to admin
                    status: (d.status as "Upcoming" | "Completed") || "Upcoming",
                    maxVolunteers: Number(d.maxVolunteers) || 4,
                    selectionMode: (d.selectionMode as "FCFS" | "LowestHours") || "LowestHours",
                    publishedAt: new Date().toISOString(),
                    registrationStartsAt: regTime,
                    image: d.image || "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?auto=format&fit=crop&w=1200&q=85",
                  });
                  showToast("New activity published!");
                } else {
                  updateActivity(d.id!, {
                    ...d,
                    registrationStartsAt: regTime,
                  });
                  showToast("Activity updated!");
                }
                setActivityModal({ ...activityModal, open: false });
              }}
              className="admin-modal-body"
            >
              <div className="form-group">
                <label>Activity Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mega Blood Donation Drive"
                  value={activityModal.data.title || ""}
                  onChange={(e) =>
                    setActivityModal({
                      ...activityModal,
                      data: { ...activityModal.data, title: e.target.value },
                    })
                  }
                />
              </div>

              <div className="admin-grid-3">
                <div className="form-group">
                  <label>Display Date (e.g. 25 Sep 2026) *</label>
                  <input
                    type="text"
                    required
                    value={activityModal.data.date || ""}
                    onChange={(e) =>
                      setActivityModal({
                        ...activityModal,
                        data: { ...activityModal.data, date: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Calendar Date (YYYY-MM-DD)</label>
                  <input
                    type="date"
                    value={activityModal.data.isoDate || "2026-09-25"}
                    onChange={(e) =>
                      setActivityModal({
                        ...activityModal,
                        data: { ...activityModal.data, isoDate: e.target.value },
                      })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Timings</label>
                  <input
                    type="text"
                    placeholder="09:00 AM - 01:00 PM"
                    value={activityModal.data.time || ""}
                    onChange={(e) =>
                      setActivityModal({
                        ...activityModal,
                        data: { ...activityModal.data, time: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              <div className="admin-grid-3">
                <div className="form-group">
                  <label>Activity Scope (Category for Priority) *</label>
                  <select
                    value={activityModal.data.scope || "Campus"}
                    onChange={(e) =>
                      setActivityModal({
                        ...activityModal,
                        data: { ...activityModal.data, scope: e.target.value as "Campus" | "Community" },
                      })
                    }
                  >
                    <option value="Campus">🏫 Campus Service</option>
                    <option value="Community">🌳 Community Drive</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category Theme</label>
                  <select
                    value={activityModal.data.category || "Community"}
                    onChange={(e) =>
                      setActivityModal({
                        ...activityModal,
                        data: { ...activityModal.data, category: e.target.value },
                      })
                    }
                  >
                    <option value="Health">Health</option>
                    <option value="Environment">Environment</option>
                    <option value="Community">Community</option>
                    <option value="Awareness">Awareness</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={activityModal.data.location || ""}
                    onChange={(e) =>
                      setActivityModal({
                        ...activityModal,
                        data: { ...activityModal.data, location: e.target.value },
                      })
                    }
                  />
                </div>
              </div>

              {/* SELECTION MODE, CAPACITY & CONFIDENTIAL HOURS */}
              <div className="admin-form-highlight-box">
                <h4>🎯 Capacity, Selection Engine & Admin Ledger Hours</h4>
                <div className="admin-grid-3">
                  <div className="form-group">
                    <label>No. of Volunteers Required (Seats) *</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={activityModal.data.maxVolunteers || 3}
                      onChange={(e) =>
                        setActivityModal({
                          ...activityModal,
                          data: { ...activityModal.data, maxVolunteers: Number(e.target.value) },
                        })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Volunteer Selection Mode *</label>
                    <select
                      value={activityModal.data.selectionMode || "LowestHours"}
                      onChange={(e) =>
                        setActivityModal({
                          ...activityModal,
                          data: { ...activityModal.data, selectionMode: e.target.value as "FCFS" | "LowestHours" },
                        })
                      }
                    >
                      <option value="LowestHours">
                        Lowest {activityModal.data.scope || "Category"} Hours Priority
                      </option>
                      <option value="FCFS">First-Come, First-Served (FCFS)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Officer Service Hours (Confidential) *</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={activityModal.data.hours || 4}
                      onChange={(e) =>
                        setActivityModal({
                          ...activityModal,
                          data: { ...activityModal.data, hours: Number(e.target.value) },
                        })
                      }
                      required
                    />
                    <small className="admin-text-sub">Hours are concealed from volunteer views</small>
                  </div>
                </div>
              </div>

              {/* REGISTRATION OPENING SCHEDULE */}
              <div className="form-group">
                <label>⏰ Registration Opening Time (Delayed Activation after Publishing)</label>
                <div className="admin-grid-2">
                  <select
                    value={activityModal.delayPreset}
                    onChange={(e) =>
                      setActivityModal({
                        ...activityModal,
                        delayPreset: e.target.value,
                      })
                    }
                  >
                    <option value="now">Open Registration Immediately</option>
                    <option value="15m">Open in 15 Minutes after publishing</option>
                    <option value="1h">Open in 1 Hour after publishing</option>
                    <option value="6h">Open in 6 Hours after publishing</option>
                    <option value="1d">Open in 1 Day after publishing</option>
                    <option value="3d">Open in 3 Days after publishing</option>
                    <option value="custom">Custom Date & Time</option>
                  </select>

                  {activityModal.delayPreset === "custom" && (
                    <input
                      type="datetime-local"
                      value={
                        activityModal.data.registrationStartsAt
                          ? new Date(activityModal.data.registrationStartsAt).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setActivityModal({
                          ...activityModal,
                          data: {
                            ...activityModal.data,
                            registrationStartsAt: new Date(e.target.value).toISOString(),
                          },
                        })
                      }
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Cover Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={activityModal.data.image || ""}
                  onChange={(e) =>
                    setActivityModal({
                      ...activityModal,
                      data: { ...activityModal.data, image: e.target.value },
                    })
                  }
                />
              </div>

              <div className="form-group">
                <label>Description & Objectives</label>
                <textarea
                  rows={3}
                  placeholder="Summary of the activity, impact and instructions for volunteers..."
                  value={activityModal.data.description || ""}
                  onChange={(e) =>
                    setActivityModal({
                      ...activityModal,
                      data: { ...activityModal.data, description: e.target.value },
                    })
                  }
                />
              </div>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setActivityModal({ ...activityModal, open: false })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  {activityModal.mode === "add" ? "Publish Activity" : "Update Activity"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────── MODAL: NEWS ───────── */}
      {newsModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setNewsModal({ ...newsModal, open: false })}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{newsModal.mode === "add" ? "Post Notice" : "Edit Notice"}</h3>
              <button className="cal-close-btn" onClick={() => setNewsModal({ ...newsModal, open: false })}>
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newsModal.data.title) return;
                if (newsModal.mode === "add") {
                  addNews({
                    title: newsModal.data.title,
                    category: newsModal.data.category || "Announcement",
                    date: newsModal.data.date || new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                    text: newsModal.data.text || "",
                  });
                  showToast("Notice posted!");
                } else {
                  updateNews(newsModal.data.id!, newsModal.data);
                  showToast("Notice updated!");
                }
                setNewsModal({ ...newsModal, open: false });
              }}
              className="admin-modal-body"
            >
              <div className="form-group">
                <label>Notice Title</label>
                <input
                  type="text"
                  required
                  value={newsModal.data.title}
                  onChange={(e) => setNewsModal({ ...newsModal, data: { ...newsModal.data, title: e.target.value } })}
                />
              </div>

              <div className="admin-grid-2">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newsModal.data.category}
                    onChange={(e) => setNewsModal({ ...newsModal, data: { ...newsModal.data, category: e.target.value } })}
                  >
                    <option value="Announcement">Announcement</option>
                    <option value="Meeting">Meeting</option>
                    <option value="Programme">Programme</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="text"
                    value={newsModal.data.date}
                    onChange={(e) => setNewsModal({ ...newsModal, data: { ...newsModal.data, date: e.target.value } })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notice Text</label>
                <textarea
                  rows={3}
                  required
                  value={newsModal.data.text}
                  onChange={(e) => setNewsModal({ ...newsModal, data: { ...newsModal.data, text: e.target.value } })}
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn ghost" onClick={() => setNewsModal({ ...newsModal, open: false })}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────── MODAL: GALLERY ───────── */}
      {galleryModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setGalleryModal({ ...galleryModal, open: false })}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Add Photo to Gallery</h3>
              <button className="cal-close-btn" onClick={() => setGalleryModal({ ...galleryModal, open: false })}>
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!galleryModal.data.src) return;
                addGalleryItem(galleryModal.data);
                showToast("Photo added to gallery!");
                setGalleryModal({ ...galleryModal, open: false });
              }}
              className="admin-modal-body"
            >
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={galleryModal.data.src}
                  onChange={(e) => setGalleryModal({ ...galleryModal, data: { ...galleryModal.data, src: e.target.value } })}
                />
              </div>

              <div className="form-group">
                <label>Caption</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tree plantation drive volunteers"
                  value={galleryModal.data.caption}
                  onChange={(e) => setGalleryModal({ ...galleryModal, data: { ...galleryModal.data, caption: e.target.value } })}
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn ghost" onClick={() => setGalleryModal({ ...galleryModal, open: false })}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Add Photo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────── MODAL: TEAM ───────── */}
      {teamModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setTeamModal({ ...teamModal, open: false })}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{teamModal.mode === "add" ? "Add Team Member" : "Edit Member"}</h3>
              <button className="cal-close-btn" onClick={() => setTeamModal({ ...teamModal, open: false })}>
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!teamModal.data.name) return;
                if (teamModal.mode === "add") {
                  addTeamMember(teamModal.data);
                  showToast("Team member added!");
                } else if (teamModal.index !== undefined) {
                  updateTeamMember(teamModal.index, teamModal.data);
                  showToast("Team member updated!");
                }
                setTeamModal({ ...teamModal, open: false });
              }}
              className="admin-modal-body"
            >
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  required
                  value={teamModal.data.name}
                  onChange={(e) => setTeamModal({ ...teamModal, data: { ...teamModal.data, name: e.target.value } })}
                />
              </div>

              <div className="admin-grid-2">
                <div className="form-group">
                  <label>Role / Designation</label>
                  <input
                    type="text"
                    required
                    value={teamModal.data.role}
                    onChange={(e) => setTeamModal({ ...teamModal, data: { ...teamModal.data, role: e.target.value } })}
                  />
                </div>

                <div className="form-group">
                  <label>Department</label>
                  <input
                    type="text"
                    required
                    value={teamModal.data.department}
                    onChange={(e) => setTeamModal({ ...teamModal, data: { ...teamModal.data, department: e.target.value } })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Photo URL</label>
                <input
                  type="url"
                  value={teamModal.data.image}
                  onChange={(e) => setTeamModal({ ...teamModal, data: { ...teamModal.data, image: e.target.value } })}
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn ghost" onClick={() => setTeamModal({ ...teamModal, open: false })}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────── MODAL: ACHIEVEMENTS ───────── */}
      {achievementModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setAchievementModal({ ...achievementModal, open: false })}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>{achievementModal.mode === "add" ? "Add Milestone / Award" : "Edit Milestone"}</h3>
              <button className="cal-close-btn" onClick={() => setAchievementModal({ ...achievementModal, open: false })}>
                ✕
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!achievementModal.data.title) return;
                if (achievementModal.mode === "add") {
                  addAchievement(achievementModal.data);
                  showToast("Achievement added!");
                } else if (achievementModal.index !== undefined) {
                  updateAchievement(achievementModal.index, achievementModal.data);
                  showToast("Achievement updated!");
                }
                setAchievementModal({ ...achievementModal, open: false });
              }}
              className="admin-modal-body"
            >
              <div className="admin-grid-2">
                <div className="form-group">
                  <label>Year / Session</label>
                  <input
                    type="text"
                    required
                    value={achievementModal.data.year}
                    onChange={(e) => setAchievementModal({ ...achievementModal, data: { ...achievementModal.data, year: e.target.value } })}
                  />
                </div>

                <div className="form-group">
                  <label>Award / Title</label>
                  <input
                    type="text"
                    required
                    value={achievementModal.data.title}
                    onChange={(e) => setAchievementModal({ ...achievementModal, data: { ...achievementModal.data, title: e.target.value } })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description / Citation</label>
                <textarea
                  rows={3}
                  required
                  value={achievementModal.data.text}
                  onChange={(e) => setAchievementModal({ ...achievementModal, data: { ...achievementModal.data, text: e.target.value } })}
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="btn ghost" onClick={() => setAchievementModal({ ...achievementModal, open: false })}>
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
