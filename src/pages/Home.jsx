import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import TopStories from "../components/home/TopStories";
import FeaturedNews from "../components/home/FeaturedNews";
import WhatsAppButton from "../components/ui/WhatsAppButton";
import { topStories, featuredNews } from "../data/news";

function Home() {
  return (
    <>
      <Header />
      <main className="home">
        <div className="container">
          <h1 className="visually-hidden">Instituto Politécnico Insignare</h1>
          <TopStories stories={topStories} />
          <FeaturedNews stories={featuredNews} />
        </div>
      </main>
      <Footer />
      <WhatsAppButton />
    </>
  );
}

export default Home;
