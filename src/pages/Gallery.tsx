import { gallery } from "../data/site";
export default function Gallery() {
    return (
        <section className="page">
            <div className="container">
                <span className="eyebrow dark">OUR MOMENTS</span>
                <h1>Photo gallery</h1>
                <p className="lead">A glimpse of our volunteers in action.</p>
                <div className="gallery-grid gallery-large">
                    {gallery.map((g, i) => (
                        <figure key={i}>
                            <img src={g.src} alt={g.caption} />
                            <figcaption>{g.caption}</figcaption>
                        </figure>
                    ))}
                </div>
            </div>
        </section>
    );
}   