export default function About() {
  return (
    <section className="page">
      <div className="container narrow">
        <span className="eyebrow dark">ABOUT NSS</span>
        <h1>Service before self.</h1>
        <p className="lead">The National Service Scheme provides students with opportunities to understand communities, contribute through service and develop a strong sense of social responsibility.</p>
        <div className="info-grid">
          <div className="info-card"><span>01</span><h3>Vision</h3><p>Build a generation of responsible, empathetic and socially aware citizens.</p></div>
          <div className="info-card"><span>02</span><h3>Mission</h3><p>Connect students with communities through practical service, awareness and leadership.</p></div>
          <div className="info-card"><span>03</span><h3>Motto</h3><p><strong>“Not Me But You”</strong> — placing community and collective wellbeing at the heart of service.</p></div>
        </div>
        <h2>Objectives of our unit</h2>
        <ul className="check-list">
          <li>Develop a sense of social and civic responsibility.</li>
          <li>Understand community needs through direct engagement.</li>
          <li>Build leadership, teamwork and communication skills.</li>
          <li>Promote health, environment and social awareness.</li>
          <li>Create sustainable community-focused initiatives.</li>
        </ul>
      </div>
    </section>
  );
}