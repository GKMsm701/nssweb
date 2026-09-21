import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useSiteData } from "../context/SiteContext";
import { NotificationCenter } from "./NotificationCenter";
import { VolunteerAuthModal } from "./VolunteerAuthModal";

const links = [
  ["/", "Home"],
  ["/about", "About"],
  ["/activities", "Activities"],
  ["/team", "Team"],
  ["/news", "News"],
  ["/gallery", "Gallery"],
  ["/achievements", "Achievements"],
  ["/contact", "Contact"],
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { currentVolunteer } = useSiteData();

  return (
    <header className="navbar">
      <VolunteerAuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <div className="container nav-inner">
        <NavLink to="/" className="brand" onClick={() => setOpen(false)}>
          <img className="brand-logo" src="/nss-logo.svg" alt="NSS Logo" />
          <span className="brand-text">
            <strong>National Service Scheme</strong>
            <small>NSS Unit 128 & 198</small>
          </span>
        </NavLink>

        <button className="menu-btn" onClick={() => setOpen(!open)} aria-label="Toggle navigation">
          ☰
        </button>

        <nav className={open ? "nav-links open" : "nav-links"}>
          {links.map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) => (isActive ? "active" : "")}
            >
              {label}
            </NavLink>
          ))}

          {/* Volunteer Portal CTA & Notification center */}
          <div className="nav-volunteer-group">
            {currentVolunteer ? (
              <div className="nav-volunteer-logged">
                <NotificationCenter />
                <Link
                  className="nav-volunteer-pill"
                  to="/volunteer"
                  onClick={() => setOpen(false)}
                  title={`Logged in as ${currentVolunteer.name} (${currentVolunteer.unit})`}
                >
                  <img
                    src={currentVolunteer.avatar}
                    alt={currentVolunteer.name}
                    className="nav-vol-avatar"
                  />
                  <div className="nav-vol-info">
                    <span className="nav-vol-name">{currentVolunteer.name.split(" ")[0]}</span>
                    <span className="nav-vol-unit">{currentVolunteer.unit}</span>
                  </div>
                </Link>
              </div>
            ) : (
              <Link
                className="nav-cta"
                to="/volunteer"
                onClick={() => setOpen(false)}
              >
                Volunteer Portal
              </Link>
            )}

            {/* Discreet Admin Studio Link */}
            <Link
              className="nav-admin-link"
              to="/admin"
              onClick={() => setOpen(false)}
              title="Admin Portal Studio (Passkey: nss2026)"
            >
              🛡️ Admin
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}