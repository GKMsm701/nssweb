import { useSiteData } from "../context/SiteContext";

export default function News() {
  const { news } = useSiteData();

  return (
    <section className="page">
      <div className="container narrow">
        <span className="eyebrow dark">UPDATES</span>
        <h1>News & announcements</h1>
        <p className="lead">Stay informed about programmes, meetings and important NSS updates.</p>
        <div className="news-list">
          {news.length === 0 ? (
            <p style={{ color: "var(--muted)", margin: "40px 0" }}>
              No announcements published yet.
            </p>
          ) : (
            news.map((n) => (
              <article key={n.id}>
                <div className="news-date">{n.date}</div>
                <div>
                  <span>{n.category}</span>
                  <h2>{n.title}</h2>
                  <p>{n.text}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}