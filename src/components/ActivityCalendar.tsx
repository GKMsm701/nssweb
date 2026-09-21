import React, { useState } from "react";
import { Activity, useSiteData } from "../context/SiteContext";

interface ActivityCalendarProps {
  onSelectActivity?: (activity: Activity) => void;
  onRegisterClick?: (activityId: number) => void;
  highlightVolunteerRegistrations?: boolean;
}

export const ActivityCalendar: React.FC<ActivityCalendarProps> = ({
  onSelectActivity,
  onRegisterClick,
  highlightVolunteerRegistrations = true,
}) => {
  const { activities, currentVolunteer, registrations } = useSiteData();

  // Current viewed month & year (initialized to Sep 2026 to match seed data or current date)
  const [currentDate, setCurrentDate] = useState(() => {
    // Check if any activity is in 2026, default to Sep 2026
    return new Date(2026, 8, 1); // Month is 0-indexed: 8 = September
  });

  const [selectedDayActivities, setSelectedDayActivities] = useState<Activity[] | null>(null);
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");
  const [activeScopeFilter, setActiveScopeFilter] = useState<"All" | "Campus" | "Community">("All");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDayActivities(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDayActivities(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date(2026, 8, 21)); // Sep 2026
    setSelectedDayActivities(null);
  };

  // Map activities by date string "YYYY-MM-DD"
  const getActivitiesForDate = (d: number): Activity[] => {
    const dStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    return activities.filter((act) => {
      // Check isoDate or fallback match
      const matchesScope = activeScopeFilter === "All" || act.scope === activeScopeFilter;
      if (!matchesScope) return false;

      if (act.isoDate && act.isoDate === dStr) return true;

      // Also try parsing formatted date strings like "25 Sep 2026"
      try {
        const parsed = new Date(act.date);
        if (!isNaN(parsed.getTime())) {
          return (
            parsed.getFullYear() === year &&
            parsed.getMonth() === month &&
            parsed.getDate() === d
          );
        }
      } catch {
        return false;
      }
      return false;
    });
  };

  // Generate day cells
  const days = [];

  // Previous month padding
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    days.push({
      day: prevMonthDays - i,
      isCurrentMonth: false,
      dateStr: "",
      activities: [] as Activity[],
    });
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const acts = getActivitiesForDate(d);
    const dStr = `${d} ${monthNames[month]} ${year}`;
    days.push({
      day: d,
      isCurrentMonth: true,
      dateStr: dStr,
      activities: acts,
    });
  }

  // Total cells to fill grid (multiple of 7)
  const remaining = 35 - days.length >= 0 ? 35 - days.length : 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({
      day: i,
      isCurrentMonth: false,
      dateStr: "",
      activities: [] as Activity[],
    });
  }

  // Check if current volunteer is registered for an activity
  const isVolunteerRegistered = (actId: number) => {
    if (!currentVolunteer || !highlightVolunteerRegistrations) return false;
    return registrations.some(
      (r) => r.activityId === actId && r.volunteerId === currentVolunteer.id
    );
  };

  return (
    <div className="activity-calendar-wrapper">
      {/* Calendar Navigation & Filter Bar */}
      <div className="calendar-header-bar">
        <div className="calendar-month-selector">
          <button onClick={prevMonth} className="cal-nav-btn" aria-label="Previous Month">
            ◀
          </button>
          <h2 className="calendar-title">
            {monthNames[month]} {year}
          </h2>
          <button onClick={nextMonth} className="cal-nav-btn" aria-label="Next Month">
            ▶
          </button>
          <button onClick={goToToday} className="cal-today-btn">
            Jump to Active Month
          </button>
        </div>

        <div className="calendar-scope-filters">
          <span className="cal-filter-label">Filter Scope:</span>
          <button
            className={`cal-scope-pill ${activeScopeFilter === "All" ? "active" : ""}`}
            onClick={() => setActiveScopeFilter("All")}
          >
            All Events
          </button>
          <button
            className={`cal-scope-pill campus ${activeScopeFilter === "Campus" ? "active" : ""}`}
            onClick={() => setActiveScopeFilter("Campus")}
          >
            🏫 Campus
          </button>
          <button
            className={`cal-scope-pill community ${activeScopeFilter === "Community" ? "active" : ""}`}
            onClick={() => setActiveScopeFilter("Community")}
          >
            🌳 Community
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <span className="legend-item">
          <span className="dot campus"></span> Campus Service
        </span>
        <span className="legend-item">
          <span className="dot community"></span> Community Drive
        </span>
        <span className="legend-item">
          <span className="dot registered"></span> My Registered Drive
        </span>
        <span className="legend-item">
          <span className="dot completed"></span> Completed
        </span>
      </div>

      {/* Calendar Grid */}
      <div className="calendar-grid">
        {/* Day of week headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((dayName) => (
          <div key={dayName} className="cal-weekday-header">
            {dayName}
          </div>
        ))}

        {/* Day Cells */}
        {days.map((cell, idx) => {
          const hasEvents = cell.activities.length > 0;
          return (
            <div
              key={idx}
              className={`cal-day-cell ${cell.isCurrentMonth ? "in-month" : "out-month"} ${
                hasEvents ? "has-events" : ""
              }`}
              onClick={() => {
                if (hasEvents) {
                  setSelectedDayActivities(cell.activities);
                  setSelectedDateStr(cell.dateStr);
                }
              }}
            >
              <div className="cal-day-num">{cell.day}</div>

              {hasEvents && (
                <div className="cal-event-chips">
                  {cell.activities.map((act) => {
                    const registered = isVolunteerRegistered(act.id);
                    return (
                      <div
                        key={act.id}
                        className={`cal-event-chip ${
                          act.scope === "Campus" ? "chip-campus" : "chip-community"
                        } ${act.status === "Completed" ? "chip-completed" : ""} ${
                          registered ? "chip-registered" : ""
                        }`}
                        title={`${act.title} (${act.category} - ${act.scope})`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onSelectActivity) {
                            onSelectActivity(act);
                          } else {
                            setSelectedDayActivities([act]);
                            setSelectedDateStr(act.date);
                          }
                        }}
                      >
                        {registered && <span className="chip-check">✓ </span>}
                        <span className="chip-text">{act.title}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Day Drawer / Popover Modal when a marked date is clicked */}
      {selectedDayActivities && (
        <div className="calendar-modal-backdrop" onClick={() => setSelectedDayActivities(null)}>
          <div className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="calendar-modal-header">
              <div>
                <span className="eyebrow dark">SCHEDULED ACTIVITIES</span>
                <h3>📅 {selectedDateStr}</h3>
              </div>
              <button
                className="cal-close-btn"
                onClick={() => setSelectedDayActivities(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div className="calendar-modal-activities-list">
              {selectedDayActivities.map((act) => {
                const isRegistered = isVolunteerRegistered(act.id);
                const regInfo = currentVolunteer
                  ? registrations.find(
                      (r) => r.activityId === act.id && r.volunteerId === currentVolunteer.id
                    )
                  : null;

                const now = new Date();
                const startsAt = new Date(act.registrationStartsAt);
                const isRegOpen = now >= startsAt;

                return (
                  <div key={act.id} className="cal-act-card">
                    <img src={act.image} alt={act.title} className="cal-act-thumb" />
                    <div className="cal-act-details">
                      <div className="cal-act-badges">
                        <span className={`cal-badge ${act.scope === "Campus" ? "campus" : "community"}`}>
                          {act.scope === "Campus" ? "🏫 Campus" : "🌳 Community"}
                        </span>
                        <span className="cal-badge category">{act.category}</span>
                        <span className={`cal-badge status-${act.status.toLowerCase()}`}>
                          {act.status}
                        </span>
                      </div>

                      <h4>{act.title}</h4>
                      <p className="cal-act-desc">{act.description}</p>

                      <div className="cal-act-meta">
                        <span>📍 {act.location}</span>
                        {act.time && <span>⏰ {act.time}</span>}
                        <span>👥 Capacity: {act.maxVolunteers} volunteers</span>
                        <span className="cal-selection-pill">
                          🎯 Mode: {act.selectionMode === "LowestHours" ? `Lowest ${act.scope} Hours Priority` : "First-Come First-Serve"}
                        </span>
                      </div>

                      {/* Registration Actions */}
                      <div className="cal-act-actions">
                        {act.status === "Completed" ? (
                          <span className="cal-status-completed-text">
                            ✅ Drive Completed
                          </span>
                        ) : isRegistered ? (
                          <div className="cal-registered-badge">
                            <span>✅ You are {regInfo?.status || "Registered"}</span>
                            {regInfo?.selectionReason && (
                              <small>({regInfo.selectionReason})</small>
                            )}
                          </div>
                        ) : !isRegOpen ? (
                          <div className="cal-locked-pill">
                            ⏳ Registration opens: {startsAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}, {startsAt.toLocaleDateString()}
                          </div>
                        ) : (
                          <button
                            className="btn primary cal-reg-btn"
                            onClick={() => {
                              setSelectedDayActivities(null);
                              if (onRegisterClick) {
                                onRegisterClick(act.id);
                              }
                            }}
                          >
                            Register for Activity →
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
