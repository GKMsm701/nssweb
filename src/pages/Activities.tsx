import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSiteData } from "../context/SiteContext";
import { ActivityCalendar } from "../components/ActivityCalendar";

export default function Activities() {
  const { activities } = useSiteData();
  const navigate = useNavigate();

  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid");
  const [filter, setFilter] = useState("All");

  const filters = [
    "All",
    "Upcoming",
    "Completed",
    "Campus",
    "Community",
    "Health",
    "Environment",
    "Awareness",
  ];

  const visible = activities.filter((a) => {
    if (filter === "All") return true;
    if (filter === "Campus" || filter === "Community") return a.scope === filter;
    return a.status === filter || a.category === filter;
  });

  return (
    <section className="page">
      <div className="container">
        <div className="activities-hero-row">
          <div>
            <span className="eyebrow dark">OUR WORK</span>
            <h1>Activities & Service Drives</h1>
            <p className="lead">
              Explore scheduled initiatives, browse by scope, and participate in community building.
            </p>
          </div>

          <div className="activities-top-actions">
            {/* View switcher */}
            <div className="view-toggle-group">
              <button
                className={`view-toggle-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                🗂️ Grid View
              </button>
              <button
                className={`view-toggle-btn ${viewMode === "calendar" ? "active" : ""}`}
                onClick={() => setViewMode("calendar")}
              >
                📅 Calendar View
              </button>
            </div>

            <Link to="/volunteer" className="btn primary">
              Volunteer Portal →
            </Link>
          </div>
        </div>

        {viewMode === "calendar" ? (
          <div className="activities-calendar-container">
            <ActivityCalendar
              onRegisterClick={() => {
                navigate("/volunteer?tab=activities");
              }}
            />
          </div>
        ) : (
          <>
            <div className="filters">
              {filters.map((f) => (
                <button
                  key={f}
                  className={filter === f ? "selected" : ""}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>

            {visible.length === 0 ? (
              <p style={{ color: "var(--muted)", margin: "40px 0" }}>
                No activities found matching "{filter}".
              </p>
            ) : (
              <div className="card-grid three">
                {visible.map((a) => {
                  const now = new Date();
                  const startsAt = new Date(a.registrationStartsAt);
                  const isRegOpen = now >= startsAt;

                  return (
                    <article className="activity-card" key={a.id}>
                      <div className="activity-media-container">
                        <img src={a.image} alt={a.title} />
                        <span className={`act-scope-pill ${a.scope.toLowerCase()}`}>
                          {a.scope === "Campus" ? "🏫 Campus" : "🌳 Community"}
                        </span>
                      </div>

                      <div className="activity-body">
                        <div className="tag-row">
                          <span className="tag">{a.category}</span>
                          <span className={`status status-${a.status.toLowerCase()}`}>
                            {a.status}
                          </span>
                        </div>

                        <h3>{a.title}</h3>
                        <p>{a.description}</p>

                        <div className="meta">
                          <span>📅 {a.date}</span>
                          <span>📍 {a.location}</span>
                          {/* NOTE: Activity hours are intentionally excluded from volunteer/public view per instructions */}
                        </div>

                        <div className="activity-card-action-bar">
                          {a.status === "Completed" ? (
                            <span className="status-badge-done">✅ Drive Completed</span>
                          ) : !isRegOpen ? (
                            <span className="status-badge-locked">
                              ⏳ Registration opens {startsAt.toLocaleDateString([], { month: "short", day: "numeric" })}
                            </span>
                          ) : (
                            <span className="status-badge-open">
                              🟢 Registration Open ({a.maxVolunteers} seats)
                            </span>
                          )}

                          <Link
                            to="/volunteer?tab=activities"
                            className="btn ghost volunteer-btn-sm"
                          >
                            Register →
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}