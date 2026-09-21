import { useSiteData } from "../context/SiteContext";

export default function Achievements() {
  const { achievements } = useSiteData();

  return (
    <section className="page">
      <div className="container narrow">
        <span className="eyebrow dark">OUR IMPACT</span>
        <h1>Achievements</h1>
        <p className="lead">
          Milestones made possible by volunteers, coordinators and community partners.
        </p>
        {achievements.length === 0 ? (
          <p style={{ color: "var(--muted)", margin: "40px 0" }}>No achievements recorded yet.</p>
        ) : (
          <div className="achievement-list">
            {achievements.map((a, i) => (
              <article key={i}>
                <div className="award">★</div>
                <div>
                  <span>{a.year}</span>
                  <h2>{a.title}</h2>
                  <p>{a.text}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}