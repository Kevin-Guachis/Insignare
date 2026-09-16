import { useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import "../styles/nota-grado.css";

function promedio(valores) {
  const validos = valores.filter((v) => v !== null);

  if (validos.length === 0) return null;

  return validos.reduce((a, b) => a + b, 0) / validos.length;
}

function formato(valor) {
  return valor === null ? "—" : valor.toFixed(2);
}

function obtenerNumero(valor) {
  if (valor === "") return null;

  const numero = parseFloat(valor);

  return Number.isNaN(numero) ? null : numero;
}

export default function NotaGrado() {
  const [notas, setNotas] = useState({
    bm5: "",
    bm6: "",
    bm7: "",
    bs8: "",
    bs9: "",
    bs10: "",
    bt1: "",
    bt2: "",
    bt3: "",
    participacion: "",
    examen: "",
  });

  const [cursandoBT, setCursandoBT] = useState(false);
  const [resultado, setResultado] = useState(null);

  const actualizarNota = (campo, valor) => {
    setNotas((actuales) => ({
      ...actuales,
      [campo]: valor,
    }));

    // Si cambia una nota, ocultamos el resultado anterior
    setResultado(null);
  };

  const obtenerPromedios = () => {
    return {
      bm: promedio([
        obtenerNumero(notas.bm5),
        obtenerNumero(notas.bm6),
        obtenerNumero(notas.bm7),
      ]),

      bs: promedio([
        obtenerNumero(notas.bs8),
        obtenerNumero(notas.bs9),
        obtenerNumero(notas.bs10),
      ]),

      bt: promedio([
        obtenerNumero(notas.bt1),
        obtenerNumero(notas.bt2),
        obtenerNumero(notas.bt3),
      ]),
    };
  };

  const calcular = () => {
    const { bm, bs, bt } = obtenerPromedios();

    const participacion = obtenerNumero(notas.participacion);
    const examen = obtenerNumero(notas.examen);

    const advertencias = [];

    if (bm === null) {
      advertencias.push("Ingresa al menos una nota de Básica Media.");
    }

    if (bs === null) {
      advertencias.push("Ingresa al menos una nota de Básica Superior.");
    }

    if (bt === null) {
      advertencias.push("Ingresa al menos una nota de Bachillerato.");
    }

    if (participacion === null) {
      advertencias.push(
        "Ingresa la nota de participación estudiantil (puede ser aproximada)."
      );
    }

    if (examen === null) {
      advertencias.push(
        "Ingresa la nota del examen de grado (puede ser aproximada)."
      );
    }

    const bmVal = bm ?? 0;
    const bsVal = bs ?? 0;
    const btVal = bt ?? 0;
    const partVal = participacion ?? 0;
    const examVal = examen ?? 0;

    const notaFinal =
      bmVal * 0.2 +
      bsVal * 0.3 +
      btVal * 0.3 +
      partVal * 0.1 +
      examVal * 0.1;

    setResultado({
      notaFinal,
      advertencias,
      bm,
      bs,
      bt,
      participacion,
      examen,
      esAproximado: cursandoBT,
    });

    setTimeout(() => {
      document
        .getElementById("resultado-nota-grado")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
    }, 50);
  };

  const { bm, bs } = obtenerPromedios();

  return (
    <>
      <Header />

      <main className="nota-grado-page">

        {/* ===== ENCABEZADO ===== */}

        <header className="nota-grado-header">
          <h1>Calculadora de Nota de Grado</h1>
          <p>Bachillerato · Cálculo del promedio final /10</p>
        </header>

        <div className="nota-grado-main">

          {/* ===== BÁSICA MEDIA ===== */}

          <section className="nota-card">
            <h2>1. Básica Media</h2>

            <p className="nota-desc">
              Quinto, sexto y séptimo año · pondera 20% de la nota final
            </p>

            <div className="nota-grid nota-grid-3">

              {[
                ["bm5", "Quinto año"],
                ["bm6", "Sexto año"],
                ["bm7", "Séptimo año"],
              ].map(([campo, label]) => (
                <div key={campo}>
                  <label htmlFor={campo}>{label}</label>

                  <input
                    id={campo}
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    placeholder="0.00"
                    value={notas[campo]}
                    onChange={(e) =>
                      actualizarNota(campo, e.target.value)
                    }
                  />
                </div>
              ))}

            </div>

            <div className="nota-subtotal">
              Promedio Básica Media: {formato(bm)}
            </div>
          </section>

          {/* ===== BÁSICA SUPERIOR ===== */}

          <section className="nota-card">
            <h2>2. Básica Superior</h2>

            <p className="nota-desc">
              Octavo, noveno y décimo año · pondera 30% de la nota final
            </p>

            <div className="nota-grid nota-grid-3">

              {[
                ["bs8", "Octavo año"],
                ["bs9", "Noveno año"],
                ["bs10", "Décimo año"],
              ].map(([campo, label]) => (
                <div key={campo}>
                  <label htmlFor={campo}>{label}</label>

                  <input
                    id={campo}
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    placeholder="0.00"
                    value={notas[campo]}
                    onChange={(e) =>
                      actualizarNota(campo, e.target.value)
                    }
                  />
                </div>
              ))}

            </div>

            <div className="nota-subtotal">
              Promedio Básica Superior: {formato(bs)}
            </div>
          </section>

          {/* ===== BACHILLERATO ===== */}

          <section className="nota-card">
            <h2>3. Bachillerato</h2>

            <p className="nota-desc">
              Primero, segundo y tercer año · pondera 30% de la nota final
            </p>

            <div className="nota-grid nota-grid-3">

              {[
                ["bt1", "Primero de bachillerato"],
                ["bt2", "Segundo de bachillerato"],
                ["bt3", "Tercero de bachillerato"],
              ].map(([campo, label]) => (
                <div key={campo}>
                  <label htmlFor={campo}>{label}</label>

                  <input
                    id={campo}
                    type="number"
                    min="0"
                    max="10"
                    step="0.01"
                    placeholder="0.00"
                    value={notas[campo]}
                    onChange={(e) =>
                      actualizarNota(campo, e.target.value)
                    }
                  />
                </div>
              ))}

            </div>

            <div className="nota-info">
              ¿Estás cursando actualmente tercero de bachillerato? Esa nota
              recién se asignará al final del año lectivo. Marca la casilla
              para ingresar un <strong>valor aproximado/estimado</strong>{" "}
              mientras tanto.
            </div>

            <div className="nota-checkbox">
              <input
                type="checkbox"
                id="cursandoBT"
                checked={cursandoBT}
                onChange={(e) => {
                  setCursandoBT(e.target.checked);
                  setResultado(null);
                }}
              />

              <label htmlFor="cursandoBT">
                Estoy cursando tercero de bachillerato (nota aproximada)
              </label>
            </div>
          </section>

          {/* ===== PARTICIPACIÓN Y EXAMEN ===== */}

          <section className="nota-card">
            <h2>4. Participación estudiantil y Examen de grado</h2>

            <p className="nota-desc">
              10% participación estudiantil + 10% examen final de grado
            </p>

            <div className="nota-grid nota-grid-2">

              <div>
                <label htmlFor="participacion">
                  Nota de participación estudiantil /10
                </label>

                <input
                  id="participacion"
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  placeholder="0.00"
                  value={notas.participacion}
                  onChange={(e) =>
                    actualizarNota("participacion", e.target.value)
                  }
                />
              </div>

              <div>
                <label htmlFor="examen">
                  Nota del examen de grado /10
                </label>

                <input
                  id="examen"
                  type="number"
                  min="0"
                  max="10"
                  step="0.01"
                  placeholder="0.00"
                  value={notas.examen}
                  onChange={(e) =>
                    actualizarNota("examen", e.target.value)
                  }
                />
              </div>

            </div>

            <div className="nota-info">
              Si aún no rindes el examen de grado o no conoces tu nota de
              participación estudiantil, puedes ingresar un{" "}
              <strong>valor aproximado</strong> como referencia; luego
              reemplázalo por la nota oficial cuando la tengas.
            </div>
          </section>

          {/* ===== BOTÓN ===== */}

          <button
            type="button"
            className="nota-calc-btn"
            onClick={calcular}
          >
            Calcular nota de grado
          </button>

          {/* ===== RESULTADO ===== */}

          {resultado && (
            <section
              id="resultado-nota-grado"
              className="nota-result-card"
            >
              <div className="nota-final-label">
                Nota de grado estimada
              </div>

              <div className="nota-final-score">
                {resultado.notaFinal.toFixed(2)}
              </div>

              <div className="nota-final-out">
                sobre 10 puntos
              </div>

              <div className="nota-breakdown">

                <div>
                  <span>Básica Media (20%)</span>
                  <strong>
                    {formato(resultado.bm)} →{" "}
                    {(resultado.bm ?? 0 * 0.2).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>Básica Superior (30%)</span>
                  <strong>
                    {formato(resultado.bs)} →{" "}
                    {(resultado.bs ?? 0 * 0.3).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>
                    Bachillerato (30%)
                    {resultado.esAproximado && " · aprox."}
                  </span>

                  <strong>
                    {formato(resultado.bt)} →{" "}
                    {((resultado.bt ?? 0) * 0.3).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>Participación estudiantil (10%)</span>

                  <strong>
                    {formato(resultado.participacion)} →{" "}
                    {((resultado.participacion ?? 0) * 0.1).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>Examen de grado (10%)</span>

                  <strong>
                    {formato(resultado.examen)} →{" "}
                    {((resultado.examen ?? 0) * 0.1).toFixed(2)}
                  </strong>
                </div>

              </div>

              {resultado.advertencias.length > 0 ? (
                <div className="nota-warning">
                  ⚠ {resultado.advertencias.join(" ")}
                </div>
              ) : resultado.esAproximado ? (
                <div className="nota-warning">
                  ⚠ Resultado calculado con al menos una nota aproximada.
                  Actualízalo cuando tengas las notas oficiales.
                </div>
              ) : null}

            </section>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}