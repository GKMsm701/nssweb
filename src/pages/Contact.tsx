import { FormEvent, useState } from "react";
import { useSiteData } from "../context/SiteContext";

export default function Contact() {
  const { siteInfo } = useSiteData();
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <section className="page">
      <div className="container contact-grid">
        <div>
          <span className="eyebrow dark">GET IN TOUCH</span>
          <h1>Contact our NSS Unit</h1>
          <p className="lead">
            Have a question, partnership idea or volunteering enquiry? Send us a message.
          </p>
          <div className="contact-details">
            <p>📍 {siteInfo.address}</p>
            <p>✉ {siteInfo.email}</p>
            <p>☎ {siteInfo.phone}</p>
            <p>👤 Programme Officer: {siteInfo.programmeOfficer}</p>
          </div>
        </div>
        <form className="contact-form" onSubmit={submit}>
          <label>
            Name
            <input required placeholder="Your name" />
          </label>
          <label>
            Email
            <input required type="email" placeholder="you@example.com" />
          </label>
          <label>
            Message
            <textarea required rows={5} placeholder="How can we help?" />
          </label>
          <button className="btn primary" type="submit">
            Send message
          </button>
          {sent && (
            <p className="success">Thanks! Your message has been captured in this frontend demo.</p>
          )}
        </form>
      </div>
    </section>
  );
}