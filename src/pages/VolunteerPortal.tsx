import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { useSiteData, Activity, ActivityRegistration } from "../context/SiteContext";
import { ActivityCalendar } from "../components/ActivityCalendar";
import { VolunteerAuthModal } from "../components/VolunteerAuthModal";
import { NotificationCenter } from "../components/NotificationCenter";

type PortalTab = "profile" | "activities" | "calendar" | "registrations" | "diary" | "notifications";

export default function VolunteerPortal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get("tab") as PortalTab) || "activities";
  const [activeTab, setActiveTab] = useState<PortalTab>(initialTab);

  const {
    currentVolunteer,
    volunteers,
    switchVolunteer,
    logoutVolunteer,
    updateVolunteerProfile,
    activities,
    registrations,
    registerForActivity,
    cancelRegistration,
    diaryEntries,
    submitDiaryEntry,
    notifications,
    sendNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useSiteData();

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Filters for activities tab
  const [scopeFilter, setScopeFilter] = useState<"All" | "Campus" | "Community">("All");
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Upcoming" | "Completed">("All");

  // Diary submission modal state
  const [diaryModal, setDiaryModal] = useState<{
    open: boolean;
    activityId: number;
    activityTitle: string;
    tasksDone: string;
    learnings: string;
    rating: number;
    photoUrl: string;
  }>({
    open: false,
    activityId: 0,
    activityTitle: "",
    tasksDone: "",
    learnings: "",
    rating: 5,
    photoUrl: "",
  });

  // Edit Profile modal state
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    phone: "",
    email: "",
    bloodGroup: "",
  });

  // Keep search params in sync with active tab
  useEffect(() => {
    const tab = searchParams.get("tab") as PortalTab;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const switchTab = (tab: PortalTab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Live timer tick for registration countdowns
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper for countdown
  const getCountdownString = (startsAtStr: string) => {
    const diff = new Date(startsAtStr).getTime() - Date.now();
    if (diff <= 0) return "Registration Open Now!";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      const remHours = hours % 24;
      return `${days}d ${remHours}h ${mins}m`;
    }
    return `${String(hours).padStart(2, "0")}h ${String(mins).padStart(2, "0")}m ${String(secs).padStart(2, "0")}s`;
  };

  // Registration handler
  const handleRegister = (activityId: number) => {
    if (!currentVolunteer) {
      setAuthModalOpen(true);
      return;
    }
    const result = registerForActivity(activityId, currentVolunteer.id);
    showToast(result.message);
  };

  // Set reminder handler
  const handleSetReminder = (activity: Activity) => {
    if (!currentVolunteer) {
      setAuthModalOpen(true);
      return;
    }
    sendNotification({
      volunteerId: currentVolunteer.id,
      title: `Reminder Scheduled: ${activity.title}`,
      message: `You will be alerted when registration unlocks on ${new Date(activity.registrationStartsAt).toLocaleString()}.`,
      type: "reminder",
      activityId: activity.id,
    });
    showToast("Reminder scheduled! You will receive an in-portal alert.");
  };

  // If volunteer is not logged in
  if (!currentVolunteer) {
    return (
      <div className="volunteer-guest-screen">
        <VolunteerAuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
        <div className="container narrow volunteer-guest-card">
          <div className="guest-icon-badge">
            <img src="/nss-logo.svg" alt="NSS Logo" width={64} height={64} />
          </div>
          <h1>NSS Volunteer Portal</h1>
          <p className="lead">
            Access your student volunteer profile, browse service drives, track your registration status, mark activities on your calendar, and submit post-activity diaries.
          </p>

          <div className="guest-actions">
            <button className="btn primary btn-lg" onClick={() => setAuthModalOpen(true)}>
              Sign In or Select Volunteer →
            </button>
            <Link to="/activities" className="btn ghost">
              View Public Activities ↗
            </Link>
          </div>

          <div className="guest-quick-profiles">
            <h4>Quick Volunteer Access for Testing:</h4>
            <div className="guest-profiles-grid">
              {volunteers.slice(0, 3).map((v) => (
                <div
                  key={v.id}
                  className="guest-profile-card"
                  onClick={() => switchVolunteer(v.id)}
                >
                  <img src={v.avatar} alt={v.name} />
                  <div>
                    <strong>{v.name}</strong>
                    <small>{v.rollNumber} • {v.unit}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Filtered registrations for current volunteer
  const myRegistrations = registrations.filter(
    (r) => r.volunteerId === currentVolunteer.id
  );

  // Attended activities for diary prompts
  const attendedRegs = myRegistrations.filter((r) => r.status === "Attended");
  const myDiaryEntries = diaryEntries.filter(
    (d) => d.volunteerId === currentVolunteer.id
  );
  const pendingDiaryActivities = attendedRegs.filter(
    (r) => !myDiaryEntries.some((d) => d.activityId === r.activityId)
  );

  // Filtered notifications
  const myNotifications = notifications.filter(
    (n) => n.volunteerId === "all" || n.volunteerId === currentVolunteer.id
  );
  const unreadCount = myNotifications.filter((n) => !n.read).length;

  // Filtered activities list
  const filteredActivities = activities.filter((act) => {
    if (scopeFilter !== "All" && act.scope !== scopeFilter) return false;

    const now = new Date();
    const startsAt = new Date(act.registrationStartsAt);
    const isRegOpen = now >= startsAt && act.status === "Upcoming";
    const isUpcomingReg = now < startsAt && act.status === "Upcoming";

    if (statusFilter === "Open") return isRegOpen;
    if (statusFilter === "Upcoming") return isUpcomingReg;
    if (statusFilter === "Completed") return act.status === "Completed";

    return true;
  });

  return (
    <div className="volunteer-portal-page">
      {/* Toast popup */}
      {toastMsg && <div className="admin-toast">{toastMsg}</div>}

      {/* Auth & Switcher Modal */}
      <VolunteerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Top Volunteer Header Bar */}
      <header className="volunteer-topbar">
        <div className="container volunteer-topbar-inner">
          <div className="volunteer-identity-snippet">
            <img
              src={currentVolunteer.avatar}
              alt={currentVolunteer.name}
              className="volunteer-header-avatar"
            />
            <div>
              <div className="volunteer-name-row">
                <strong>{currentVolunteer.name}</strong>
                <span className="unit-pill">{currentVolunteer.unit}</span>
                <span className="status-pill active">● Active Volunteer</span>
              </div>
              <small className="volunteer-meta-sub">
                Roll No: {currentVolunteer.rollNumber} | {currentVolunteer.department} ({currentVolunteer.year})
              </small>
            </div>
          </div>

          <div className="volunteer-topbar-actions">
            {/* Quick Switcher Trigger */}
            <button
              className="btn ghost volunteer-btn-sm"
              onClick={() => setAuthModalOpen(true)}
              title="Switch between different volunteer accounts"
            >
              🔄 Switch Account
            </button>

            {/* In-app Notification Bell */}
            <NotificationCenter />

            {/* Logout */}
            <button
              className="volunteer-btn-logout"
              onClick={logoutVolunteer}
              title="Log out of Volunteer Portal"
            >
              Logout ↩
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="container volunteer-main-layout">
        {/* Navigation Tabs */}
        <nav className="volunteer-nav-tabs">
          <button
            className={`vtab-btn ${activeTab === "activities" ? "active" : ""}`}
            onClick={() => switchTab("activities")}
          >
            <span>🎯 Explore Drives</span>
            <span className="vtab-count">{activities.filter((a) => a.status === "Upcoming").length}</span>
          </button>
          <button
            className={`vtab-btn ${activeTab === "calendar" ? "active" : ""}`}
            onClick={() => switchTab("calendar")}
          >
            <span>📅 Activity Calendar</span>
          </button>
          <button
            className={`vtab-btn ${activeTab === "registrations" ? "active" : ""}`}
            onClick={() => switchTab("registrations")}
          >
            <span>📋 My Registrations</span>
            <span className="vtab-count">{myRegistrations.length}</span>
          </button>
          <button
            className={`vtab-btn ${activeTab === "diary" ? "active" : ""}`}
            onClick={() => switchTab("diary")}
          >
            <span>📝 Service Diary & Feedback</span>
            {pendingDiaryActivities.length > 0 && (
              <span className="vtab-count alert">{pendingDiaryActivities.length} pending</span>
            )}
          </button>
          <button
            className={`vtab-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => switchTab("profile")}
          >
            <span>🪪 Volunteer Profile</span>
          </button>
          <button
            className={`vtab-btn ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => switchTab("notifications")}
          >
            <span>🔔 Reminders</span>
            {unreadCount > 0 && <span className="vtab-count alert">{unreadCount}</span>}
          </button>
        </nav>

        {/* ───────── TAB 1: ACTIVITIES ───────── */}
        {activeTab === "activities" && (
          <section className="vtab-content">
            <div className="vtab-header-row">
              <div>
                <h2>NSS Service Activities & Drives</h2>
                <p className="lead-sm">
                  Browse campus and community drives, check opening times, and register.
                </p>
              </div>

              {/* Filters */}
              <div className="vtab-filter-bar">
                <div className="vtab-filter-group">
                  <span className="filter-label">Scope:</span>
                  {(["All", "Campus", "Community"] as const).map((sc) => (
                    <button
                      key={sc}
                      className={`filter-btn ${scopeFilter === sc ? "active" : ""}`}
                      onClick={() => setScopeFilter(sc)}
                    >
                      {sc === "Campus" ? "🏫 Campus" : sc === "Community" ? "🌳 Community" : "All Scopes"}
                    </button>
                  ))}
                </div>

                <div className="vtab-filter-group">
                  <span className="filter-label">Status:</span>
                  {(["All", "Open", "Upcoming", "Completed"] as const).map((st) => (
                    <button
                      key={st}
                      className={`filter-btn ${statusFilter === st ? "active" : ""}`}
                      onClick={() => setStatusFilter(st)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Note about Selection Engine */}
            <div className="vtab-info-banner">
              <span>💡</span>
              <p>
                <strong>Selection Policy:</strong> The NSS Unit coordinates volunteer participation via two fair models: <strong>First-Come, First-Served (FCFS)</strong> or <strong>Lowest Activity Hours Priority</strong> (Campus vs Community) so all dedicated volunteers gain balanced service exposure.
              </p>
            </div>

            {/* Activity Cards Grid */}
            <div className="card-grid two">
              {filteredActivities.map((act) => {
                const now = new Date();
                const startsAt = new Date(act.registrationStartsAt);
                const isRegOpen = now >= startsAt;
                const isCompleted = act.status === "Completed";

                const myReg = myRegistrations.find((r) => r.activityId === act.id);
                const isRegistered = !!myReg;
                const registeredCount = registrations.filter(
                  (r) => r.activityId === act.id && r.status !== "Waitlisted"
                ).length;

                return (
                  <article key={act.id} className="volunteer-act-card">
                    <div className="act-card-media">
                      <img src={act.image} alt={act.title} />
                      <div className="act-media-tags">
                        <span className={`act-badge-scope ${act.scope.toLowerCase()}`}>
                          {act.scope === "Campus" ? "🏫 Campus" : "🌳 Community"}
                        </span>
                        <span className="act-badge-cat">{act.category}</span>
                        <span className={`act-badge-status status-${act.status.toLowerCase()}`}>
                          {act.status}
                        </span>
                      </div>
                    </div>

                    <div className="act-card-body">
                      <h3>{act.title}</h3>
                      <p className="act-desc">{act.description}</p>

                      <div className="act-details-meta">
                        <div className="meta-item">
                          <span className="meta-icon">📅</span>
                          <span>{act.date}</span>
                        </div>
                        {act.time && (
                          <div className="meta-item">
                            <span className="meta-icon">⏰</span>
                            <span>{act.time}</span>
                          </div>
                        )}
                        <div className="meta-item">
                          <span className="meta-icon">📍</span>
                          <span>{act.location}</span>
                        </div>
                        <div className="meta-item">
                          <span className="meta-icon">👥</span>
                          <span>{act.maxVolunteers} Volunteers Required</span>
                        </div>
                      </div>

                      {/* Selection Mode & Capacity Banner */}
                      <div className="act-selection-info">
                        <div className="selection-mode-tag">
                          <span>🎯 Mode: </span>
                          <strong>
                            {act.selectionMode === "LowestHours"
                              ? `Lowest ${act.scope} Hours Priority`
                              : "First-Come First-Served (FCFS)"}
                          </strong>
                        </div>
                        <div className="capacity-status">
                          <span>{registeredCount} / {act.maxVolunteers} seats confirmed</span>
                        </div>
                      </div>

                      {/* Registration Actions & Countdown */}
                      <div className="act-card-footer">
                        {isCompleted ? (
                          <div className="act-completed-state">
                            <span>✅ Drive Concluded</span>
                            {myReg?.status === "Attended" && (
                              <button
                                className="btn primary volunteer-btn-sm"
                                onClick={() => {
                                  setDiaryModal({
                                    open: true,
                                    activityId: act.id,
                                    activityTitle: act.title,
                                    tasksDone: "",
                                    learnings: "",
                                    rating: 5,
                                    photoUrl: "",
                                  });
                                }}
                              >
                                📝 Write Diary Entry
                              </button>
                            )}
                          </div>
                        ) : isRegistered ? (
                          <div className="act-registered-state">
                            <div className="reg-status-badge">
                              <span>Status: </span>
                              <strong className={`badge-state-${myReg.status.toLowerCase()}`}>
                                {myReg.status === "Selected" && "✅ Selected for Drive"}
                                {myReg.status === "Waitlisted" && "⏳ On Waitlist"}
                                {myReg.status === "Pending" && "🕒 Pending Selection"}
                                {myReg.status === "Attended" && "🎓 Completed & Attended"}
                              </strong>
                              {myReg.selectionReason && (
                                <small className="reg-reason-sub">{myReg.selectionReason}</small>
                              )}
                            </div>
                            {myReg.status !== "Attended" && (
                              <button
                                className="btn-withdraw"
                                onClick={() => {
                                  if (window.confirm("Cancel your registration for this activity?")) {
                                    cancelRegistration(myReg.id);
                                    showToast("Registration cancelled.");
                                  }
                                }}
                              >
                                Withdraw
                              </button>
                            )}
                          </div>
                        ) : !isRegOpen ? (
                          <div className="act-locked-state">
                            <div className="countdown-pill">
                              <span className="countdown-icon">⏳</span>
                              <div>
                                <small>Registration Unlocks In:</small>
                                <strong>{getCountdownString(act.registrationStartsAt)}</strong>
                              </div>
                            </div>
                            <button
                              className="btn ghost volunteer-btn-sm"
                              onClick={() => handleSetReminder(act)}
                              title="Notify me when registration unlocks"
                            >
                              🔔 Remind Me
                            </button>
                          </div>
                        ) : (
                          <button
                            className="btn primary w-100"
                            onClick={() => handleRegister(act.id)}
                          >
                            Register as Volunteer →
                          </button>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* ───────── TAB 2: CALENDAR ───────── */}
        {activeTab === "calendar" && (
          <section className="vtab-content">
            <div className="vtab-header-row">
              <div>
                <h2>Interactive Activity Calendar</h2>
                <p className="lead-sm">
                  Track schedule dates, category marks (Campus vs Community), and your confirmed registrations. Click on any date or chip to preview activity details.
                </p>
              </div>
            </div>

            <ActivityCalendar
              onRegisterClick={(actId) => {
                handleRegister(actId);
              }}
              highlightVolunteerRegistrations={true}
            />
          </section>
        )}

        {/* ───────── TAB 3: MY REGISTRATIONS ───────── */}
        {activeTab === "registrations" && (
          <section className="vtab-content">
            <div className="vtab-header-row">
              <div>
                <h2>My Activity Registrations</h2>
                <p className="lead-sm">
                  Live status of your registered drives and selections.
                </p>
              </div>
            </div>

            {myRegistrations.length === 0 ? (
              <div className="empty-state-box">
                <span className="empty-icon">📋</span>
                <h3>No Drive Registrations Yet</h3>
                <p>Explore upcoming campus and community drives to register.</p>
                <button className="btn primary" onClick={() => switchTab("activities")}>
                  Explore Drives Now →
                </button>
              </div>
            ) : (
              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Activity</th>
                      <th>Scope & Category</th>
                      <th>Registered At</th>
                      <th>Selection Status</th>
                      <th style={{ textAlign: "right" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myRegistrations.map((reg) => {
                      const act = activities.find((a) => a.id === reg.activityId);
                      return (
                        <tr key={reg.id}>
                          <td>
                            <strong>{act?.title || `Activity #${reg.activityId}`}</strong>
                            <div className="admin-text-sub">📅 {act?.date} • 📍 {act?.location}</div>
                          </td>
                          <td>
                            <span className={`cal-badge ${act?.scope === "Campus" ? "campus" : "community"}`}>
                              {act?.scope || "Campus"}
                            </span>
                            <small style={{ marginLeft: 6 }}>{act?.category}</small>
                          </td>
                          <td>
                            <div>{new Date(reg.registeredAt).toLocaleDateString()}</div>
                            <small className="admin-text-sub">
                              {new Date(reg.registeredAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </small>
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
                              <div className="reg-reason-sub">{reg.selectionReason}</div>
                            )}
                          </td>
                          <td style={{ textAlign: "right" }}>
                            {reg.status === "Attended" ? (
                              <button
                                className="btn primary volunteer-btn-sm"
                                onClick={() => {
                                  setDiaryModal({
                                    open: true,
                                    activityId: reg.activityId,
                                    activityTitle: act?.title || "Activity",
                                    tasksDone: "",
                                    learnings: "",
                                    rating: 5,
                                    photoUrl: "",
                                  });
                                }}
                              >
                                📝 Submit Diary
                              </button>
                            ) : (
                              <button
                                className="admin-action-btn delete"
                                onClick={() => {
                                  if (window.confirm("Withdraw your registration?")) {
                                    cancelRegistration(reg.id);
                                    showToast("Registration cancelled.");
                                  }
                                }}
                              >
                                Withdraw
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ───────── TAB 4: SERVICE DIARY & FEEDBACK ───────── */}
        {activeTab === "diary" && (
          <section className="vtab-content">
            <div className="vtab-header-row">
              <div>
                <h2>Post-Activity Service Diary & Feedback</h2>
                <p className="lead-sm">
                  Document your on-ground service contributions, personal reflections, and community impact after each completed drive.
                </p>
              </div>
            </div>

            {/* Pending Diary Prompts */}
            {pendingDiaryActivities.length > 0 && (
              <div className="pending-diary-section">
                <h3>📝 Pending Reflections ({pendingDiaryActivities.length})</h3>
                <p className="admin-text-sub">
                  You completed the following activities. Please submit your diary entry to document your service:
                </p>

                <div className="pending-diary-cards">
                  {pendingDiaryActivities.map((reg) => {
                    const act = activities.find((a) => a.id === reg.activityId);
                    return (
                      <div key={reg.id} className="pending-diary-card">
                        <div>
                          <strong>{act?.title || "Activity"}</strong>
                          <div className="admin-text-sub">📅 {act?.date} • 📍 {act?.location}</div>
                        </div>
                        <button
                          className="btn primary"
                          onClick={() => {
                            setDiaryModal({
                              open: true,
                              activityId: reg.activityId,
                              activityTitle: act?.title || "Activity",
                              tasksDone: "",
                              learnings: "",
                              rating: 5,
                              photoUrl: "",
                            });
                          }}
                        >
                          Write Diary Entry ✍️
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Submitted Diary Entries */}
            <div className="submitted-diary-section">
              <h3>📖 My Service Journal & Reflections</h3>

              {myDiaryEntries.length === 0 ? (
                <div className="empty-state-box">
                  <span className="empty-icon">✍️</span>
                  <h4>No Diary Entries Submitted Yet</h4>
                  <p>When you participate in drives, your submitted reflections will appear in your official NSS journal.</p>
                </div>
              ) : (
                <div className="diary-entries-grid">
                  {myDiaryEntries.map((entry) => (
                    <article key={entry.id} className="diary-entry-card">
                      <div className="diary-entry-header">
                        <div>
                          <span className="diary-date-pill">📅 {entry.date}</span>
                          <h4>{entry.activityTitle}</h4>
                        </div>
                        <div className="diary-rating">
                          {"★".repeat(entry.rating)}
                          {"☆".repeat(5 - entry.rating)}
                        </div>
                      </div>

                      <div className="diary-entry-section">
                        <strong>Tasks & Responsibilities:</strong>
                        <p>{entry.tasksDone}</p>
                      </div>

                      <div className="diary-entry-section">
                        <strong>Key Learnings & Impact:</strong>
                        <p>{entry.learnings}</p>
                      </div>

                      {entry.photoUrl && (
                        <div className="diary-entry-photo">
                          <img src={entry.photoUrl} alt="Activity photo" />
                        </div>
                      )}

                      <div className="diary-entry-footer">
                        {entry.verifiedByAdmin ? (
                          <div className="diary-verified-stamp">
                            <span>✅ Verified by Programme Officer</span>
                            {entry.adminRemarks && <p>"{entry.adminRemarks}"</p>}
                          </div>
                        ) : (
                          <span className="diary-pending-badge">⏳ Pending Officer Verification</span>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ───────── TAB 5: VOLUNTEER PROFILE ───────── */}
        {activeTab === "profile" && (
          <section className="vtab-content">
            <div className="vtab-header-row">
              <div>
                <h2>Digital Volunteer Identity & Record</h2>
                <p className="lead-sm">
                  Official credentials and authenticated service participation.
                </p>
              </div>
              <button
                className="btn ghost"
                onClick={() => {
                  setProfileForm({
                    phone: currentVolunteer.phone,
                    email: currentVolunteer.email,
                    bloodGroup: currentVolunteer.bloodGroup,
                  });
                  setEditProfileModal(true);
                }}
              >
                ✏️ Edit Contact Info
              </button>
            </div>

            {/* Official NSS Identity Card */}
            <div className="volunteer-id-card">
              <div className="id-card-top">
                <div className="id-card-brand">
                  <img src="/nss-logo.svg" alt="NSS Logo" className="id-logo" />
                  <div>
                    <h3>National Service Scheme</h3>
                    <small>{currentVolunteer.unit} • NSS College of Engineering</small>
                  </div>
                </div>
                <div className="id-card-badge">
                  <span className="badge-official">OFFICIAL VOLUNTEER PASS</span>
                </div>
              </div>

              <div className="id-card-body">
                <div className="id-card-photo-col">
                  <img src={currentVolunteer.avatar} alt={currentVolunteer.name} className="id-photo" />
                  <span className="id-status-pill">Active Member</span>
                </div>

                <div className="id-card-details-col">
                  <div className="id-volunteer-name">
                    <h2>{currentVolunteer.name}</h2>
                    <span className="id-roll">Roll No: {currentVolunteer.rollNumber}</span>
                  </div>

                  <div className="id-info-grid">
                    <div>
                      <small>Department</small>
                      <strong>{currentVolunteer.department}</strong>
                    </div>
                    <div>
                      <small>Academic Year</small>
                      <strong>{currentVolunteer.year}</strong>
                    </div>
                    <div>
                      <small>NSS Unit</small>
                      <strong>{currentVolunteer.unit}</strong>
                    </div>
                    <div>
                      <small>Blood Group</small>
                      <strong>{currentVolunteer.bloodGroup}</strong>
                    </div>
                    <div>
                      <small>College Email</small>
                      <span>{currentVolunteer.email}</span>
                    </div>
                    <div>
                      <small>Phone Number</small>
                      <span>{currentVolunteer.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="id-card-footer">
                <span>Enrolled: {currentVolunteer.joinedDate}</span>
                <span className="id-motto">"NOT ME BUT YOU"</span>
              </div>
            </div>

            {/* Service Summary (CONFIDENTIALITY: STRICTLY NO ACTIVITY HOURS DISPLAYED) */}
            <div className="volunteer-metrics-row">
              <div className="metric-box">
                <span className="metric-icon">📋</span>
                <div className="metric-data">
                  <strong>{myRegistrations.length}</strong>
                  <span>Drives Registered</span>
                </div>
              </div>
              <div className="metric-box">
                <span className="metric-icon">🎖️</span>
                <div className="metric-data">
                  <strong>{attendedRegs.length}</strong>
                  <span>Activities Attended</span>
                </div>
              </div>
              <div className="metric-box">
                <span className="metric-icon">📖</span>
                <div className="metric-data">
                  <strong>{myDiaryEntries.length}</strong>
                  <span>Diary Reflections Logged</span>
                </div>
              </div>
              <div className="metric-box">
                <span className="metric-icon">⭐</span>
                <div className="metric-data">
                  <strong>Good Standing</strong>
                  <span>NSS Unit Conduct</span>
                </div>
              </div>
            </div>

            {/* Privacy note */}
            <div className="vtab-privacy-notice">
              <span>🔒</span>
              <div>
                <strong>Confidential Service Credit Ledger:</strong>
                <p>
                  Official service hours credit is logged confidentially under administrative control by the Programme Officers for certificate issuance and university accreditation.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* ───────── TAB 6: NOTIFICATIONS & REMINDERS ───────── */}
        {activeTab === "notifications" && (
          <section className="vtab-content">
            <div className="vtab-header-row">
              <div>
                <h2>Notifications & Activity Reminders</h2>
                <p className="lead-sm">
                  Scheduled alerts, selection updates, and registration announcements.
                </p>
              </div>
              {unreadCount > 0 && (
                <button
                  className="btn ghost"
                  onClick={() => markAllNotificationsAsRead(currentVolunteer.id)}
                >
                  Mark All Read
                </button>
              )}
            </div>

            {myNotifications.length === 0 ? (
              <div className="empty-state-box">
                <span className="empty-icon">🔔</span>
                <h4>No Notifications</h4>
                <p>You have no notifications or reminders at this time.</p>
              </div>
            ) : (
              <div className="notifications-full-list">
                {myNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`notif-card ${notif.read ? "read" : "unread"}`}
                    onClick={() => markNotificationAsRead(notif.id)}
                  >
                    <div className="notif-card-icon">
                      {notif.type === "reminder" && "⏰"}
                      {notif.type === "registration_open" && "🔓"}
                      {notif.type === "selection" && "🎉"}
                      {notif.type === "diary_prompt" && "📝"}
                      {notif.type === "announcement" && "📢"}
                    </div>

                    <div className="notif-card-body">
                      <div className="notif-card-top">
                        <h4>{notif.title}</h4>
                        <span className="notif-date">
                          {new Date(notif.createdAt).toLocaleDateString()} at{" "}
                          {new Date(notif.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <p>{notif.message}</p>
                      {notif.link && (
                        <Link to={notif.link} className="notif-link-btn">
                          Take Action →
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      {/* ───────── DIARY SUBMISSION MODAL ───────── */}
      {diaryModal.open && (
        <div className="volunteer-modal-backdrop" onClick={() => setDiaryModal({ ...diaryModal, open: false })}>
          <div className="volunteer-modal-card wide" onClick={(e) => e.stopPropagation()}>
            <div className="volunteer-modal-header">
              <div>
                <span className="eyebrow dark">POST-ACTIVITY REFLECTION</span>
                <h3>Diary Entry: {diaryModal.activityTitle}</h3>
              </div>
              <button
                className="cal-close-btn"
                onClick={() => setDiaryModal({ ...diaryModal, open: false })}
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!diaryModal.tasksDone.trim() || !diaryModal.learnings.trim()) {
                  alert("Please provide both the tasks completed and key learnings.");
                  return;
                }

                submitDiaryEntry({
                  activityId: diaryModal.activityId,
                  activityTitle: diaryModal.activityTitle,
                  volunteerId: currentVolunteer.id,
                  volunteerName: currentVolunteer.name,
                  date: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
                  tasksDone: diaryModal.tasksDone,
                  learnings: diaryModal.learnings,
                  rating: diaryModal.rating,
                  photoUrl: diaryModal.photoUrl,
                });

                setDiaryModal({ ...diaryModal, open: false });
                showToast("Diary entry submitted for Officer verification!");
                switchTab("diary");
              }}
              className="diary-form"
            >
              <div className="form-group">
                <label>Tasks Performed & Responsibilities Handled *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe what specific duties you performed on-site (e.g. registration desk, logistics, waste collection, public interaction)..."
                  value={diaryModal.tasksDone}
                  onChange={(e) => setDiaryModal({ ...diaryModal, tasksDone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Key Learnings, Social Impact & Personal Reflection *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="What did this activity teach you? How did it benefit the target community or campus environment?..."
                  value={diaryModal.learnings}
                  onChange={(e) => setDiaryModal({ ...diaryModal, learnings: e.target.value })}
                />
              </div>

              <div className="admin-grid-2">
                <div className="form-group">
                  <label>Service Experience Rating (1 to 5 Stars)</label>
                  <select
                    value={diaryModal.rating}
                    onChange={(e) => setDiaryModal({ ...diaryModal, rating: Number(e.target.value) })}
                  >
                    <option value={5}>5 Stars - Outstanding & Impactful</option>
                    <option value={4}>4 Stars - Very Good Experience</option>
                    <option value={3}>3 Stars - Satisfactory</option>
                    <option value={2}>2 Stars - Needs Better Logistics</option>
                    <option value={1}>1 Star - Poor Organization</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Activity Photo URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={diaryModal.photoUrl}
                    onChange={(e) => setDiaryModal({ ...diaryModal, photoUrl: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="btn ghost"
                  onClick={() => setDiaryModal({ ...diaryModal, open: false })}
                >
                  Cancel
                </button>
                <button type="submit" className="btn primary">
                  Submit Official Diary Entry →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ───────── EDIT PROFILE MODAL ───────── */}
      {editProfileModal && (
        <div className="volunteer-modal-backdrop" onClick={() => setEditProfileModal(false)}>
          <div className="volunteer-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="volunteer-modal-header">
              <h3>Edit Contact Information</h3>
              <button className="cal-close-btn" onClick={() => setEditProfileModal(false)}>
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateVolunteerProfile(currentVolunteer.id, profileForm);
                setEditProfileModal(false);
                showToast("Profile details updated!");
              }}
              className="volunteer-form"
            >
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Blood Group</label>
                <select
                  value={profileForm.bloodGroup}
                  onChange={(e) => setProfileForm({ ...profileForm, bloodGroup: e.target.value })}
                >
                  <option>A+</option>
                  <option>A-</option>
                  <option>B+</option>
                  <option>B-</option>
                  <option>O+</option>
                  <option>O-</option>
                  <option>AB+</option>
                  <option>AB-</option>
                </select>
              </div>

              <button type="submit" className="btn primary w-100">
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
