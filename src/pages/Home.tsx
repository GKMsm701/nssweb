import { Link } from "react-router-dom";
import { useSiteData, Activity } from "../context/SiteContext";

export default function Home() {
  const { activities, news, gallery, siteInfo } = useSiteData();
  const upcoming = activities.filter((a) => a.status === "Upcoming");

  // Format hero tagline
  const mottoLines = siteInfo.heroTagline.split("\n");

  return (
    <>
      <section className="hero">
        <div className="hero-orb orb-one" />
        <div className="hero-orb orb-two" />
        <div className="hero-orb orb-three" />
        <div className="container hero-content">
          <span className="eyebrow">NATIONAL SERVICE SCHEME</span>
          <h1>
            {mottoLines[0]}
            {mottoLines.length > 1 && (
              <>
                <br />
                <span>{mottoLines.slice(1).join(" ")}</span>
              </>
            )}
          </h1>
          <p>{siteInfo.heroSubtitle}</p>
          <div className="hero-actions">
            <Link className="btn primary" to="/activities">
              Explore Activities
            </Link>
            <Link className="btn ghost" to="/about">
              Discover Our Unit
            </Link>
          </div>
        </div>
        <div className="hero-stats container">
          <div>
            <strong>{siteInfo.stats.volunteers}</strong>
            <span>Volunteers</span>
          </div>
          <div>
            <strong>{siteInfo.stats.activities}</strong>
            <span>Activities</span>
          </div>
          <div>
            <strong>{siteInfo.stats.hours}</strong>
            <span>Service Hours</span>
          </div>
          <div>
            <strong>{siteInfo.stats.recognitions}</strong>
            <span>Recognitions</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container intro-grid">
          <div>
            <span className="eyebrow dark">ABOUT OUR UNITS</span>
            <h2>Students serving society, one action at a time.</h2>
          </div>
          <p className="lead">
            Our NSS Unit gives students opportunities to work with communities, develop leadership skills and turn social responsibility into real-world action.
          </p>
        </div>
      </section>

      <section className="section muted">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow dark">GET INVOLVED</span>
              <h2>Upcoming activities</h2>
            </div>
            <Link to="/activities" className="text-link">
              View all →
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p style={{ color: "var(--muted)" }}>No upcoming activities scheduled at the moment.</p>
          ) : (
            <div className="card-grid three">
              {upcoming.map((a) => (
                <ActivityCard key={a.id} a={a} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow dark">LATEST</span>
              <h2>News & announcements</h2>
            </div>
            <Link to="/news" className="text-link">
              All news →
            </Link>
          </div>
          <div className="news-grid">
            {news.slice(0, 3).map((n) => (
              <article className="news-card" key={n.id}>
                <span>{n.category}</span>
                <small>{n.date}</small>
                <h3>{n.title}</h3>
                <p>{n.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section gallery-section">
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow dark">MOMENTS</span>
              <h2>From our activities</h2>
            </div>
            <Link to="/gallery" className="text-link">
              View gallery →
            </Link>
          </div>
          <div className="gallery-grid">
            {gallery.slice(0, 6).map((g, i) => (
              <img key={i} src={g.src} alt={g.caption} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

function ActivityCard({ a }: { a: Activity }) {
  return (
    <article className="activity-card">
      <img src={a.image} alt={a.title} />
      <div className="activity-body">
        <div className="tag-row">
          <span className="tag">{a.category}</span>
          <span className="status">{a.status}</span>
        </div>
        <h3>{a.title}</h3>
        <p>{a.description}</p>
        <div className="meta">
          <span>📅 {a.date}</span>
          <span>📍 {a.location}</span>
        </div>
      </div>
    </article>
  );
}