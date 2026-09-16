import { useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "../styles/nota-postulacion.css";

const paleta = [
  "#2563eb",
  "#16a34a",
  "#db2777",
  "#ea580c",
  "#7c3aed",
  "#0891b2",
  "#ca8a04",
  "#dc2626",
  "#059669",
  "#4338ca",
];

const archivosLogo = {
  EPN: "EPN LOGO.png",
  UNL: "UNL LOGO.png",
  ESPOL: "ESPOL LOGO.png",
  ESPE: "ESPE LOGO.png",
  UEA: "UEA LOGO.png",
  UNESUM: "UNESUM LOGO.png",
  UTC: "UTC LOGO.png",
  UNAE: "UNAE LOGO.png",
  UTLVT: "UTLVT LOGO.png",
  UTN: "UTN LOGO.png",
  UTMACH: "UTMACH LOGO.png",
  UNACH: "UNACH LOGO.png",
  UPEC: "UPEC LOGO.png",
  "U Guayaquil": "U GUAYAQUIL LOGO.png",
  UNEMI: "UNEMI LOGO.png",
  ULEAM: "ULEAM LOGO.png",
  UPSE: "UPSE LOGO.png",
  UTEQ: "UTEQ LOGO.png",
  UTB: "UTB LOGO.png",
  ESPAM: "ESPAM LOGO.png",
  AMAWTAYWASI: "AMAWTAYWASI LOGO.png",
  IKIAM: "IKIAM LOGO.png",
  ESPOCH: "ESPOCH LOGO.png",
  UEB: "UEB LOGO.png",
  UTA: "UTA LOGO.png",
  UAE: "UAE LOGO.png",
  UTM: "UTM LOGO.png",
  Yachay: "YACHAY LOGO.png",
  USECIPOL: "USECIPOL LOGO.png",
  "U Cuenca": "U CUENCA LOGO.png",
};

const grupos = [
  {
    titulo: "25% Grado / 75% Prueba",
    pGrado: 0.25,
    pPrueba: 0.75,
    universidades: ["EPN", "UNL", "ESPOL"],
  },
  {
    titulo: "50% Grado / 50% Prueba",
    pGrado: 0.5,
    pPrueba: 0.5,
    universidades: [
      "UCE",
      "ESPE",
      "UEA",
      "UNESUM",
      "UTC",
      "UNAE",
      "UTLVT",
      "UTN",
      "UTMACH",
      "UNACH",
      "UPEC",
      "U Guayaquil",
      "UNEMI",
      "ULEAM",
      "UPSE",
      "UTEQ",
      "UTB",
      "ESPAM",
      "AMAWTAYWASI",
      "IKIAM",
      "ESPOCH",
      "UEB",
      "UTA",
      "UAE",
      "UTM",
      "Yachay",
    ],
  },
  {
    titulo: "40% Grado / 60% Prueba",
    pGrado: 0.4,
    pPrueba: 0.6,
    universidades: ["USECIPOL", "U Cuenca"],
  },
];

function colorPara(nombre) {
  let hash = 0;

  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash);
  }

  return paleta[Math.abs(hash) % paleta.length];
}

function siglas(nombre) {
  const limpio = nombre
    .replace(/[^A-Za-zÁÉÍÓÚÑ ]/g, "")
    .trim();

  const partes = limpio.split(" ").filter(Boolean);

  if (partes.length === 1) {
    return partes[0].substring(0, 3).toUpperCase();
  }

  return partes
    .map((p) => p[0])
    .join("")
    .substring(0, 3)
    .toUpperCase();
}

function archivoLogo(nombre) {
  return (
    archivosLogo[nombre] ||
    `${nombre.toUpperCase()} LOGO.png`
  );
}

export default function NotaPostulacion() {
  const [notaGrado, setNotaGrado] = useState("");
  const [notaPrueba, setNotaPrueba] = useState("");
  const [error, setError] = useState("");
  const [resultados, setResultados] = useState([]);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  function calcular() {
    const grado = parseFloat(notaGrado);
    const prueba = parseFloat(notaPrueba);

    if (Number.isNaN(grado) || Number.isNaN(prueba)) {
      setError(
        "Por favor ingresa la nota de grado y la nota de la prueba."
      );
      setResultados([]);
      setMostrarResultado(false);
      return;
    }

    if (
      grado < 0 ||
      grado > 10 ||
      prueba < 0 ||
      prueba > 1000
    ) {
      setError(
        "La nota de grado debe estar entre 0 y 10, y la nota de la prueba entre 0 y 1000."
      );
      setResultados([]);
      setMostrarResultado(false);
      return;
    }

    setError("");

    const gradoEscalado = grado * 100;

    const nuevosResultados = grupos.map((grupo) => ({
      ...grupo,
      nota:
        gradoEscalado * grupo.pGrado +
        prueba * grupo.pPrueba,
    }));

    setResultados(nuevosResultados);
    setMostrarResultado(true);

    setTimeout(() => {
      document
        .getElementById("resultado-postulacion")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 50);
  }

  return (
    <>
      <Header />

      <main className="nota-postulacion-page">

        {/* ===== ENCABEZADO ===== */}

        <header className="nota-postulacion-header">
          <h1>Calculadora de Nota de Postulación</h1>

          <p>
            Calcula tu nota de postulación según el
            ponderado de cada universidad
          </p>
        </header>

        <div className="nota-postulacion-main">

          {/* ===== DATOS ===== */}

          <form
            className="postulacion-card"
            onSubmit={(e) => {
              e.preventDefault();
              calcular();
            }}
          >

            <div className="postulacion-inputs">

              <div className="postulacion-input-group">
                <label htmlFor="notaGrado">
                  Nota de Grado (0 - 10)
                </label>

                <input
                  id="notaGrado"
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  placeholder="Ej: 9.5"
                  value={notaGrado}
                  onChange={(e) => {
                    setNotaGrado(e.target.value);
                    setError("");
                    setMostrarResultado(false);
                  }}
                />
              </div>

              <div className="postulacion-input-group">
                <label htmlFor="notaPrueba">
                  Nota de la Prueba (0 - 1000)
                </label>

                <input
                  id="notaPrueba"
                  type="number"
                  min="0"
                  max="1000"
                  step="0.01"
                  placeholder="Ej: 800"
                  value={notaPrueba}
                  onChange={(e) => {
                    setNotaPrueba(e.target.value);
                    setError("");
                    setMostrarResultado(false);
                  }}
                />
              </div>

            </div>

            <button
              type="submit"
              className="postulacion-calc-btn"
            >
              Calcular
            </button>

            {error && (
              <div className="postulacion-error">
                {error}
              </div>
            )}

          </form>

          {/* ===== RESULTADOS ===== */}

          {mostrarResultado && (
            <section
              id="resultado-postulacion"
              className="postulacion-results-section"
            >

              <div className="postulacion-results">

                {resultados.map((grupo) => (
                  <article
                    className="postulacion-result-card"
                    key={grupo.titulo}
                  >

                    <h2>{grupo.titulo}</h2>

                    <div className="postulacion-percent">
                      {(grupo.pGrado * 100).toFixed(0)}% Grado +{" "}
                      {(grupo.pPrueba * 100).toFixed(0)}% Prueba
                    </div>

                    <div className="postulacion-score">
                      {grupo.nota.toFixed(2)}
                    </div>

                    <ul className="postulacion-universities">

                      {grupo.universidades.map((universidad) => (
                        <li key={universidad}>

                          <span
                            className="postulacion-badge"
                            style={{
                              background: colorPara(universidad),
                            }}
                          >
                            {siglas(universidad)}
                          </span>

                          <img
                            className="postulacion-logo"
                            src={`/LOGOS/${archivoLogo(
                              universidad
                            )}`}
                            alt={`Logo de ${universidad}`}
                            onError={(event) => {
                              event.currentTarget.style.display =
                                "none";

                              const badge =
                                event.currentTarget
                                  .previousElementSibling;

                              if (badge) {
                                badge.style.display = "flex";
                              }
                            }}
                          />

                          <span className="postulacion-uni-name">
                            {universidad}
                          </span>

                        </li>
                      ))}

                    </ul>

                  </article>
                ))}

              </div>

              <div className="postulacion-special">
                <strong>Nota importante:</strong> los resultados
                corresponden al cálculo del ponderado de la nota
                de grado y la nota de la prueba. Los procesos de
                admisión pueden considerar condiciones adicionales.
              </div>

              <div className="postulacion-final">
                Esta es la nota sin acciones afirmativas
              </div>

            </section>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}