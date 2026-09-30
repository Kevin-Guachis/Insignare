import { imageSize } from "../services/api";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useNews } from "../hooks/useNews";
import { refreshNews } from "../services/news";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import NewsMeta from "../components/ui/NewsMeta";
import WhatsAppButton from "../components/ui/WhatsAppButton";
import NotFound from "./NotFound";
import { ContentImage } from "../components/university/GallerySection";

function NewsDetail() {
  const { slug } = useParams();
  const { news, loading, error } = useNews();
  const story = news.find((item) => item.slug === slug);
  const [galleryPosition, setGalleryPosition] = useState({ slug: null, index: 0 });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    document.title = story ? `${story.title} | Instituto Politécnico Insignare` : "Página no encontrada | Instituto Politécnico Insignare";
    return () => { document.title = "Instituto Politécnico Insignare"; };
  }, [story]);

  if (loading || error) return <><Header /><main className="news-detail"><div className="container">{loading ? <p role="status">Cargando noticia...</p> : <p role="alert">{error} <button type="button" onClick={refreshNews}>Reintentar</button></p>}</div></main><Footer /></>;
  if (!story) return <NotFound />;
  const attachments = (story.attachments ?? []).filter((attachment) => attachment.url);
  const images = story.additional_images ?? [];
  const imageIndex = galleryPosition.slug === slug ? Math.min(galleryPosition.index, Math.max(0, images.length - 1)) : 0;
  function moveImage(direction) {
    setGalleryPosition({ slug, index: (imageIndex + direction + images.length) % images.length });
  }

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
            {story.image && <span className="image-size-wrapper" style={{width:`${imageSize(story.tamano_imagen)}%`}}><ContentImage className="news-detail__image" src={story.image} alt={story.title} /></span>}
            <div className="news-detail__body">
              <span className="news-category">{story.category}</span>
              <h1>{story.title}</h1>
              <NewsMeta date={story.date} dateLabel={story.dateLabel} />
              {story.content.length > 0 && (
                <div className="news-detail__content">
                  {story.content.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                </div>
              )}
              {images.length > 0 && <section className="news-image-carousel" aria-label="Galería de la noticia" aria-roledescription="carrusel">
                <div className="news-image-carousel__image">
                  <ContentImage key={images[imageIndex].id} src={images[imageIndex].imagen} alt={`${story.title}: imagen adicional ${imageIndex + 1}`} loading="lazy" />
                </div>
                <div className="news-image-carousel__controls">
                  <button type="button" onClick={() => moveImage(-1)} disabled={images.length < 2} aria-label="Imagen anterior">‹</button>
                  <span role="status" aria-atomic="true">{imageIndex + 1} / {images.length}</span>
                  <button type="button" onClick={() => moveImage(1)} disabled={images.length < 2} aria-label="Imagen siguiente">›</button>
                </div>
              </section>}
              {attachments.map((attachment) => (
                <section className="news-attachment" key={attachment.url} aria-label={attachment.name}>
                  <div className="news-attachment__header">
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer">Documento adjunto: {attachment.name}</a>
                    <a className="news-attachment__download" href={attachment.url} target="_blank" rel="noopener noreferrer">Ver documento PDF</a>
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
