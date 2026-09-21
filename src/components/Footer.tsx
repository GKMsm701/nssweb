import { Link } from "react-router-dom";
import { useSiteData } from "../context/SiteContext";

export default function Footer() {
  const { siteInfo } = useSiteData();

  return (
    <footer className="footer" id="contact">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <img className="footer-brand-logo" src="/nss-logo.svg" alt="NSS Logo" />
            <div>
              <strong>National Service Scheme</strong>
              <small>Not Me But You</small>
            </div>
          </div>
          <p>
            Building socially responsible students through community service, leadership and
            meaningful action.
          </p>
        </div>
        <div>
          <h4>Quick Links</h4>
          <Link to="/about">About NSS</Link>
          <Link to="/activities">Activities</Link>
          <Link to="/gallery">Gallery</Link>
        </div>
        <div>
          <h4>Our Unit</h4>
          <p>
            Programme Officer
            <br />
            {siteInfo.programmeOfficer}
            <br />
            {siteInfo.phone}
            <br />
            {siteInfo.email}
          </p>
        </div>
        <div>
          <h4>Address</h4>
          <p>{siteInfo.address}</p>
        </div>
      </div>
      <div className="footer-bottom">
        © 2026 NSS Units 128 & 198. All rights reserved.{" "}
        <Link
          to="/admin"
          title="Admin Portal (or press Ctrl+Shift+A)"
          style={{ opacity: 0.25, fontSize: "11px", marginLeft: "8px", textDecoration: "none" }}
        >
          🔒
        </Link>
      </div>
    </footer>
  );
}