import React, { useState, useRef, useEffect } from "react";
import { useSiteData } from "../context/SiteContext";
import { Link } from "react-router-dom";

export const NotificationCenter: React.FC = () => {
  const {
    notifications,
    currentVolunteer,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useSiteData();

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter notifications for current volunteer + broadcast ("all")
  const volunteerNotifs = notifications.filter(
    (n) => n.volunteerId === "all" || (currentVolunteer && n.volunteerId === currentVolunteer.id)
  );

  const unreadCount = volunteerNotifs.filter((n) => !n.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "registration_open":
        return "🔓";
      case "selection":
        return "🎉";
      case "reminder":
        return "⏰";
      case "diary_prompt":
        return "📝";
      default:
        return "📢";
    }
  };

  return (
    <div className="notif-center-wrapper" ref={dropdownRef}>
      <button
        className={`notif-bell-btn ${unreadCount > 0 ? "has-unread" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications & Reminders"
        title="Notifications & Reminders"
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {isOpen && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <div className="notif-title-row">
              <strong>🔔 Notifications & Reminders</strong>
              {unreadCount > 0 && (
                <span className="notif-unread-pill">{unreadCount} new</span>
              )}
            </div>
            {unreadCount > 0 && currentVolunteer && (
              <button
                className="notif-mark-read-btn"
                onClick={() => markAllNotificationsAsRead(currentVolunteer.id)}
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="notif-list">
            {volunteerNotifs.length === 0 ? (
              <div className="notif-empty">
                <span>📭</span>
                <p>No notifications or reminders right now.</p>
              </div>
            ) : (
              volunteerNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className={`notif-item ${notif.read ? "read" : "unread"}`}
                  onClick={() => markNotificationAsRead(notif.id)}
                >
                  <span className="notif-item-icon">{getIcon(notif.type)}</span>
                  <div className="notif-item-content">
                    <div className="notif-item-top">
                      <strong className="notif-item-title">{notif.title}</strong>
                      <span className="notif-item-time">
                        {new Date(notif.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p className="notif-item-msg">{notif.message}</p>
                    {notif.link && (
                      <Link
                        to={notif.link}
                        className="notif-action-link"
                        onClick={() => setIsOpen(false)}
                      >
                        Go to Action →
                      </Link>
                    )}
                  </div>
                  <button
                    className="notif-del-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    title="Dismiss"
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="notif-footer">
            <Link
              to="/volunteer?tab=notifications"
              className="notif-view-all-link"
              onClick={() => setIsOpen(false)}
            >
              View Notification History →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
