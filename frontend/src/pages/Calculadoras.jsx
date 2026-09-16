import { Link } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "../styles/universities.css";

export default function Calculadoras() {
  return (
    <>
      <Header />
      <main className="universities-page">
        <div className="container">
          <h1>Calculadoras</h1>
          <div className="universities-grid">
            <article className="university-card">
              <h2>Nota de grado</h2>
              <p className="university-card__description">Calcula tu nota de grado con tus calificaciones.</p>
              <Link className="university-button" to="/calculadoras/nota-grado">Ir a Nota de grado</Link>
            </article>
            <article className="university-card">
              <h2>Nota de postulación</h2>
              <p className="university-card__description">Accede a la calculadora de nota de postulación.</p>
              <Link className="university-button" to="/calculadoras/nota-postulacion">Ir a Nota de postulación</Link>
            </article>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}