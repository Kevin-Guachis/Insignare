import { Link } from "react-router-dom";
import { getNewsPath } from "../../data/news";
import { useState } from "react";

// Cubre el contenedor máximo incluso usando las tarjetas móviles de 180 px.
const MAX_VIEWPORT_WIDTH = 1520;
const MIN_STORY_WIDTH = 180;

function TopStories({ stories = [] }) {
  const [isPlaying, setIsPlaying] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const canAnimate = stories.length > 1;
  const copyCount = canAnimate
    ? Math.ceil(MAX_VIEWPORT_WIDTH / (stories.length * MIN_STORY_WIDTH)) + 1
    : 1;

  return (
    <section className="top-stories" aria-labelledby="top-stories-title" aria-roledescription="cinta de noticias">
      <h2 className="top-stories__heading" id="top-stories-title">
        <span className="top-stories__dot" aria-hidden="true" />
        Historias principales
      </h2>
      <div className="top-stories__viewport">
        <div className={`top-stories__track${isPlaying && canAnimate ? "" : " top-stories__track--paused"}`}>
          {Array.from({ length: copyCount }, (_, copyIndex) => (
            <ul className="top-stories__list" key={copyIndex} aria-hidden={copyIndex > 0 ? true : undefined}>
              {stories.map((story) => (
                <li className="top-stories__item" key={story.id}>
                  <Link className="top-stories__link" to={getNewsPath(story)} tabIndex={copyIndex > 0 ? -1 : undefined}>
                    {story.image ? (
                      <img className="top-stories__thumbnail" src={story.image} alt="" width="40" height="40" />
                    ) : (
                      <span className="top-stories__placeholder" aria-hidden="true">{story.university}</span>
                    )}
                    <div className="top-stories__copy">
                      <h3>{story.title}</h3>
                      <time dateTime={story.date}>{story.dateLabel}</time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
      <button
        className="top-stories__pause"
        type="button"
        disabled={!canAnimate}
        aria-label={isPlaying && canAnimate ? "Pausar historias" : "Reanudar historias"}
        onClick={() => setIsPlaying((current) => !current)}
      >
        <span aria-hidden="true">{isPlaying && canAnimate ? "⏸" : "▶"}</span>
      </button>
    </section>
  );
}

export default TopStories;
