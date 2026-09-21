import React, { useState } from "react";
import { useSiteData } from "../context/SiteContext";

interface VolunteerAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const VolunteerAuthModal: React.FC<VolunteerAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    volunteers,
    currentVolunteer,
    loginVolunteer,
    switchVolunteer,
    registerVolunteer,
  } = useSiteData();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [identifier, setIdentifier] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Register form fields
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [year, setYear] = useState("1st Year");
  const [unit, setUnit] = useState("Unit 128");
  const [bloodGroup, setBloodGroup] = useState("O+");

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!identifier.trim()) {
      setErrorMsg("Please enter your Roll Number or Email ID.");
      return;
    }

    if (loginVolunteer(identifier)) {
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setErrorMsg("Volunteer record not found. Try one of the quick profiles below or register.");
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!name.trim() || !rollNumber.trim() || !email.trim()) {
      setErrorMsg("Please fill in all mandatory fields.");
      return;
    }

    registerVolunteer({
      name,
      rollNumber,
      email,
      phone: phone || "+91 98765 00000",
      department,
      year,
      unit,
      bloodGroup,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      joinedDate: new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: "Active",
    });

    onClose();
    if (onSuccess) onSuccess();
  };

  return (
    <div className="volunteer-modal-backdrop" onClick={onClose}>
      <div className="volunteer-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="volunteer-modal-header">
          <div className="volunteer-modal-title">
            <img src="/nss-logo.svg" alt="NSS Logo" className="modal-logo" />
            <div>
              <h3>NSS Volunteer Portal</h3>
              <small>Unit 128 & 198 Service Hub</small>
            </div>
          </div>
          <button className="cal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Quick Demo Switcher */}
        <div className="volunteer-quick-switch-section">
          <div className="quick-switch-head">
            <span>⚡ Quick Switch Volunteer Profile:</span>
            <small>Instantly test different volunteer profiles</small>
          </div>
          <div className="quick-switch-chips">
            {volunteers.map((v) => (
              <button
                key={v.id}
                className={`quick-switch-chip ${currentVolunteer?.id === v.id ? "active" : ""}`}
                onClick={() => {
                  switchVolunteer(v.id);
                  onClose();
                  if (onSuccess) onSuccess();
                }}
              >
                <img src={v.avatar} alt={v.name} className="chip-avatar" />
                <div className="chip-info">
                  <strong>{v.name}</strong>
                  <small>{v.rollNumber} • {v.unit}</small>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tabs: Login vs Register */}
        <div className="volunteer-auth-tabs">
          <button
            className={`auth-tab-btn ${mode === "login" ? "active" : ""}`}
            onClick={() => {
              setMode("login");
              setErrorMsg("");
            }}
          >
            Volunteer Sign In
          </button>
          <button
            className={`auth-tab-btn ${mode === "register" ? "active" : ""}`}
            onClick={() => {
              setMode("register");
              setErrorMsg("");
            }}
          >
            Enroll New Volunteer
          </button>
        </div>

        {errorMsg && <div className="admin-error-badge">{errorMsg}</div>}

        {mode === "login" ? (
          <form onSubmit={handleLoginSubmit} className="volunteer-form">
            <div className="form-group">
              <label>College Roll Number or Registered Email</label>
              <input
                type="text"
                placeholder="e.g. 23CS1042 or rahul.sharma@college.edu.in"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoFocus
              />
            </div>
            <button type="submit" className="btn primary w-100">
              Access Volunteer Portal →
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} className="volunteer-form register-grid">
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Kavya R"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>College Roll Number *</label>
              <input
                type="text"
                placeholder="e.g. 24IT1088"
                value={rollNumber}
                onChange={(e) => setRollNumber(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>College Email *</label>
              <input
                type="email"
                placeholder="kavya@college.edu.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                placeholder="+91 98765 00000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Department</label>
              <select value={department} onChange={(e) => setDepartment(e.target.value)}>
                <option>Computer Science & Engineering</option>
                <option>Electronics & Communication</option>
                <option>Mechanical Engineering</option>
                <option>Civil Engineering</option>
                <option>Electrical Engineering</option>
                <option>Information Technology</option>
              </select>
            </div>
            <div className="form-group">
              <label>Current Year</label>
              <select value={year} onChange={(e) => setYear(e.target.value)}>
                <option>1st Year</option>
                <option>2nd Year</option>
                <option>3rd Year</option>
                <option>4th Year</option>
              </select>
            </div>
            <div className="form-group">
              <label>NSS Unit</label>
              <select value={unit} onChange={(e) => setUnit(e.target.value)}>
                <option>Unit 128</option>
                <option>Unit 198</option>
              </select>
            </div>
            <div className="form-group">
              <label>Blood Group</label>
              <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
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
            <button type="submit" className="btn primary w-100 grid-full">
              Complete Enrollment & Login →
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
