import { useSiteData } from "../context/SiteContext";

export default function Team() {
  const { team } = useSiteData();

  return (
    <section className="page">
      <div className="container">
        <span className="eyebrow dark">OUR PEOPLE</span>
        <h1>Programme team</h1>
        <p className="lead">Meet the people who coordinate and lead our NSS activities.</p>
        {team.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: "40px 0" }}>No team members listed.</p>
        ) : (
          <div className="team-grid">
            {team.map((t, idx) => (
              <article className="person-card" key={idx}>
                <img src={t.image} alt={t.name} />
                <div>
                  <span>{t.role}</span>
                  <h3>{t.name}</h3>
                  <p>{t.department}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}