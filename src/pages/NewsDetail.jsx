import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { news } from "../data/news";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import NewsMeta from "../components/ui/NewsMeta";
import WhatsAppButton from "../components/ui/WhatsAppButton";
import NotFound from "./NotFound";

function NewsDetail() {
  const { slug } = useParams();
  const story = news.find((item) => item.slug === slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = story ? `${story.title} | Instituto Politécnico Insignare` : "Página no encontrada | Instituto Politécnico Insignare";
    return () => { document.title = "Instituto Politécnico Insignare"; };
  }, [story]);

  if (!story) return <NotFound />;
  const attachments = (story.attachments ?? []).filter((attachment) => attachment.url);

  return (
    <>
      <Header />
      <main className="news-detail">
        <div className="container">
          <nav className="news-breadcrumb" aria-label="Ruta de navegación">
            <ol>
              <li><Link to="/">Inicio</Link></li>
              <li><Link to="/#noticias">Noticias</Link></li>
              <li aria-current="page">{story.title}</li>
            </ol>
          </nav>
          <article className="news-detail__card">
            {story.image && <img className="news-detail__image" src={story.image} alt={story.title} />}
            <div className="news-detail__body">
              <span className="news-category">{story.category}</span>
              <h1>{story.title}</h1>
              <NewsMeta date={story.date} dateLabel={story.dateLabel} />
              {story.content.length > 0 && (
                <div className="news-detail__content">
                  {story.content.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                </div>
              )}
              {attachments.map((attachment) => (
                <section className="news-attachment" key={attachment.url} aria-label={attachment.name}>
                  <div className="news-attachment__header">
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer">{attachment.name}</a>
                    <a className="news-attachment__download" href={attachment.url} download>Descargar</a>
                  </div>
                  {attachment.type === "pdf" && (
                    <object className="news-attachment__viewer" data={attachment.url} type="application/pdf" title={attachment.name}>
                      <p>Si el documento no se muestra, puedes <a href={attachment.url} target="_blank" rel="noopener noreferrer">abrir el PDF</a> o descargarlo.</p>
                    </object>
                  )}
                </section>
              ))}
            </div>
          </article>
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

export default NewsDetail;
