import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import MaterialFilters from "../components/material/MaterialFilters";
import PreparationModal from "../components/material/PreparationModal";
import {
  listMaterialResources,
  filterMaterials,
  materialFileUrl,
} from "../services/materialResources";
import { listUniversities } from "../services/universities";
import "../styles/material-filtrado.css";

const PAGE_SIZE = 6;

export default function MaterialFiltrado() {
  const [rows, setRows] = useState([]);
  const [universities, setUniversities] = useState([]);

  const [filters, setFilters] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [retry, setRetry] = useState(0);
  const [modal, setModal] = useState(false);

  const [page, setPage] = useState(1);

  useEffect(() => {
    let active = true;

    Promise.all([
      listMaterialResources(),
      listUniversities(),
    ])
      .then(([resources, items]) => {
        if (active) {
          setRows(resources);
          setUniversities(items);
          setError("");
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [retry]);

  /*
   * FILTRADO
   */
  const filtered = filterMaterials(rows, filters);

  /*
   * PAGINACIÓN
   */
  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  const startIndex = (currentPage - 1) * PAGE_SIZE;

  const visibleRows = filtered.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  /*
   * Cuando cambia cualquier filtro,
   * regresamos automáticamente a la primera página.
   */
  function handleFiltersChange(newFilters) {
    setFilters(newFilters);
    setPage(1);
  }

  /*
   * Cambio de página
   */
  function changePage(newPage) {
    const nextPage = Math.max(
      1,
      Math.min(newPage, totalPages)
    );

    setPage(nextPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  /*
   * REINTENTAR
   */
  function retryRequest() {
    setLoading(true);
    setRetry((value) => value + 1);
  }

  return (
    <>
      <Header />

      <main className="material-page">
        <div className="container">

          {/* =========================
              ENCABEZADO
          ========================== */}

          <header className="material-heading">
            <h1>Material Filtrado</h1>

            <p>
              Pruebas y material gratuito para tu
              preparación académica.
            </p>
          </header>


          {/* =========================
              FILTROS
          ========================== */}

          <MaterialFilters
            filters={filters}
            onChange={handleFiltersChange}
            universities={universities}
            rows={rows}
            detailed
          />


          {/* =========================
              CONTENIDO
          ========================== */}

          {loading ? (

            <p
              className="material-status"
              role="status"
            >
              Cargando recursos...
            </p>

          ) : error ? (

            <div
              className="material-error"
              role="alert"
            >
              <p>{error}</p>

              <button
                type="button"
                className="material-button"
                onClick={retryRequest}
              >
                Reintentar
              </button>
            </div>

          ) : filtered.length ? (

            <>

              {/* =========================
                  INFORMACIÓN DE RESULTADOS
              ========================== */}

              <div
                className="material-results-info"
                aria-live="polite"
              >
                Mostrando{" "}
                <strong>
                  {startIndex + 1}-
                  {Math.min(
                    startIndex + PAGE_SIZE,
                    filtered.length
                  )}
                </strong>{" "}
                de{" "}
                <strong>{filtered.length}</strong>{" "}
                recursos.
              </div>


              {/* =========================
                  GRID DE RECURSOS
              ========================== */}

              <div className="material-grid">

                {visibleRows.map((row) => (

                  <article
                    className="material-card"
                    key={row.id}
                  >

                    <p className="material-university">
                      {row.university_name}
                    </p>


                    <div className="material-tags">

                      <span>
                        {row.type === "prueba"
                          ? "Prueba"
                          : "Material gratuito"}
                      </span>

                      {row.subject && (
                        <span>
                          {row.subject}
                        </span>
                      )}

                      <span>
                        {row.year}
                      </span>

                    </div>


                    <h2>
                      {row.title}
                    </h2>


                    <p className="material-description">
                      {row.description}
                    </p>


                    <div className="material-actions">

                      <a
                        className="material-button"
                        href={materialFileUrl(row.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ver PDF
                      </a>


                      <a
                        className="material-button material-button--secondary"
                        href={materialFileUrl(
                          row.id,
                          true
                        )}
                        download={row.file_name}
                      >
                        Descargar
                      </a>

                    </div>

                  </article>

                ))}

              </div>


              {/* =========================
                  PAGINACIÓN
              ========================== */}

              {totalPages > 1 && (

                <nav
                  className="material-pagination"
                  aria-label="Paginación del material"
                >

                  {/* ANTERIOR */}

                  <button
                    type="button"
                    className="material-pagination-button"
                    onClick={() =>
                      changePage(currentPage - 1)
                    }
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                  >
                    ‹
                  </button>


                  {/* NÚMEROS */}

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((number) => (

                    <button
                      type="button"
                      key={number}
                      className={`material-pagination-button ${
                        number === currentPage
                          ? "is-active"
                          : ""
                      }`}
                      onClick={() =>
                        changePage(number)
                      }
                      aria-current={
                        number === currentPage
                          ? "page"
                          : undefined
                      }
                    >
                      {number}
                    </button>

                  ))}


                  {/* SIGUIENTE */}

                  <button
                    type="button"
                    className="material-pagination-button"
                    onClick={() =>
                      changePage(currentPage + 1)
                    }
                    disabled={
                      currentPage === totalPages
                    }
                    aria-label="Página siguiente"
                  >
                    ›
                  </button>

                </nav>

              )}

            </>

          ) : (

            <p
              className="material-status"
              role="status"
            >
              No hay recursos para los filtros
              seleccionados. Prueba con otra universidad,
              tipo, materia o año.
            </p>

          )}


          {/* =========================
              CTA SIMULADOR
          ========================== */}

          <section className="material-cta">

            <h2>
              ¿Quieres prepararte para tu prueba
              de admisión?
            </h2>

            <p>
              Prepárate con nuestros simuladores y
              fortalece tus conocimientos antes de
              presentar tu examen de admisión.
            </p>

            <button
              type="button"
              className="material-button"
              onClick={() => setModal(true)}
            >
              Quiero prepararme
            </button>

          </section>

        </div>
      </main>


      <Footer />


      {modal && (
        <PreparationModal
          onClose={() => setModal(false)}
        />
      )}
    </>
  );
}