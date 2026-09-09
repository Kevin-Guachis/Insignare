import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getNewsPath } from "../../data/news";

const FEATURED_INTERVAL = 5000;

function FeaturedNews({ stories = [] }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (stories.length < 2) return;
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % stories.length);
    }, FEATURED_INTERVAL);
    return () => clearInterval(timer);
  }, [index, stories.length]);

  if (!stories.length) return null;
  const story = stories[index % stories.length];
  const path = getNewsPath(story);

  return (
    <section className="featured-news" id="noticias" aria-label="Noticias destacadas" aria-roledescription="carrusel">
      <article key={story.id} className="featured-news__card featured-news__card--enter">
        <Link className="featured-news__image-link" to={path} aria-label={`Leer ${story.title}`}>
          {story.image ? (
            <img className="featured-news__image" src={story.image} alt={story.title} />
          ) : (
            <span className="featured-news__placeholder">{story.university}</span>
          )}
        </Link>
        <div className="featured-news__body">
          <span className="news-category">{story.category}</span>
          <h2><Link to={path}>{story.title}</Link></h2>
          <p className="featured-news__excerpt">{story.excerpt}</p>
          <Link className="featured-news__read-more" to={path}>Seguir leyendo <span aria-hidden="true">›</span></Link>
        </div>
      </article>
      {stories.length > 1 && (
        <div className="featured-news__controls">
          <button type="button" aria-label="Noticia anterior" onClick={() => setIndex((current) => (current - 1 + stories.length) % stories.length)}>
            <span aria-hidden="true">‹</span>
          </button>
          <button type="button" aria-label="Noticia siguiente" onClick={() => setIndex((current) => (current + 1) % stories.length)}>
            <span aria-hidden="true">›</span>
          </button>
        </div>
      )}
      <p className="visually-hidden" role="status" aria-live="polite">
        {index % stories.length + 1} de {stories.length}: {story.title}
      </p>
    </section>
  );
}

export default FeaturedNews;
