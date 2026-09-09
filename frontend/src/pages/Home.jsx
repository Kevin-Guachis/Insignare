import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import TopStories from "../components/home/TopStories";
import FeaturedNews from "../components/home/FeaturedNews";
import WhatsAppButton from "../components/ui/WhatsAppButton";
import { useNews } from "../hooks/useNews";
import { refreshNews } from "../services/news";

function Home() {
  const { news, loading, error } = useNews();
  return (
    <>
      <Header />
      <main className="home">
        <div className="container">
          <h1 className="visually-hidden">Instituto Politécnico Insignare</h1>
          <TopStories />
          {loading && <p role="status">Cargando noticias...</p>}
          {error && <p role="alert">{error} <button type="button" onClick={refreshNews}>Reintentar</button></p>}
          {!loading && !error && !news.length && <p role="status">No hay noticias publicadas por el momento.</p>}
          <FeaturedNews stories={news} />
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

export default Home;
