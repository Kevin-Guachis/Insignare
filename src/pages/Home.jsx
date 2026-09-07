import Header from "../components/layout/Header";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

function Home() {
  return (
    <>
      <Header />

      <Navbar />

      <main>
        <section>
          <h1>Instituto Preuniversitario Insignare</h1>
          <p>Preparación para tu ingreso a la universidad.</p>
        </section>

        <section id="cursos">
          <h2>Nuestros cursos</h2>
          <p>Próximamente mostraremos aquí los cursos disponibles.</p>
        </section>

        <section id="nosotros">
          <h2>Nosotros</h2>
          <p>Información del instituto.</p>
        </section>

        <section id="contacto">
          <h2>Contacto</h2>
          <p>Información de contacto.</p>
        </section>
      </main>

      <Footer />
    </>
  );
}

export default Home;