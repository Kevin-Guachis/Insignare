import { useEffect, useState } from "react";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import { getContacto, telephoneLink } from "../services/contacto";
import "../styles/contacto.css";

const message =
  "Hola, Instituto Politécnico Insignare. Me gustaría obtener información sobre sus cursos y servicios. ¿Podrían ayudarme?";

const networks = [
  ["instagram", "Instagram", "bi-instagram"],
  ["tiktok", "TikTok", "bi-tiktok"],
  ["facebook", "Facebook", "bi-facebook"],
  ["youtube", "YouTube", "bi-youtube"],
];

export default function Contacto() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;

    function load() {
      getContacto()
        .then((row) => {
          if (active) {
            setData(row);
            setError("");
          }
        })
        .catch((e) => {
          if (active) {
            setError(e.message);
          }
        });
    }

    load();

    window.addEventListener("contacto-updated", load);
    window.addEventListener("focus", load);

    return () => {
      active = false;
      window.removeEventListener("contacto-updated", load);
      window.removeEventListener("focus", load);
    };
  }, [retry]);

  const channels = data
    ? [
        ...["telefono1", "telefono2"]
          .filter((key) => data[key])
          .map((key, index) => ({
            key,
            href: telephoneLink(data[key]),
            icon: "bi-telephone-fill",
            label: "TELÉFONO",
            title: data[key],
            text: "Haz clic para llamar",
            aria: `Teléfono ${index + 1}`,
          })),

        ...["whatsapp1", "whatsapp2"]
          .filter((key) => data[key])
          .map((key, index) => ({
            key,
            href:
              "https://wa.me/" +
              data[key] +
              "?text=" +
              encodeURIComponent(message),
            icon: "bi-whatsapp",
            label: "WHATSAPP",
            title: "WhatsApp",
            text: "Escríbenos directamente",
            external: true,
            aria: "WhatsApp " + (index + 1),
          })),

        {
          key: "correo",
          href: "mailto:" + data.correo,
          icon: "bi-envelope-fill",
          label: "CORREO ELECTRÓNICO",
          title: "Correo",
          text: data.correo,
          aria: "Correo electrónico",
        },
      ]
    : [];

  return (
    <>
      <Header />

      <main className="contacto-page">

        {/* =====================================================
            HERO
        ====================================================== */}

        <section className="contacto-hero">
          <div className="contacto-container">
            <span className="contacto-eyebrow">
              INSTITUTO POLITÉCNICO INSIGNARE
            </span>

            <h1>Encuéntranos</h1>

            <p>
              Visítanos o comunícate con nosotros a través de
              nuestros diferentes canales de atención.
            </p>
          </div>
        </section>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="contacto-container contacto-error" role="alert">
            <p>{error}</p>

            <button
              className="contacto-map-button"
              onClick={() => setRetry((n) => n + 1)}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Reintentar
            </button>
          </div>
        )}

        {/* =====================================================
            CARGANDO
        ====================================================== */}

        {!data && !error && (
          <p className="contacto-container contacto-loading" role="status">
            Cargando información de contacto...
          </p>
        )}

        {data && (
          <>

            {/* =====================================================
                UBICACIÓN
            ====================================================== */}

            <section className="contacto-location">
              <div className="contacto-container">

                <div className="contacto-section-title">

                  <span className="contacto-icon-title">
                    <i className="bi bi-geo-alt-fill"></i>
                  </span>

                  <div>
                    <span className="contacto-small-title">
                      NUESTRA UBICACIÓN
                    </span>

                    <h2>¿Dónde estamos?</h2>
                  </div>

                </div>

                <div className="contacto-location-grid">

                  {/* MAPA */}

                  <div className="contacto-map-wrapper">
                    <iframe
                      title="Ubicación del Instituto Politécnico Insignare"
                      src={data.mapa_url}
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>

                  {/* INFORMACIÓN */}

                  <div className="contacto-location-info">

                    <div className="contacto-info-block">

                      <span className="contacto-info-icon">
                        <i className="bi bi-geo-alt-fill"></i>
                      </span>

                      <div>
                        <h3>Dirección</h3>

                        <p>{data.direccion}</p>
                      </div>

                    </div>

                    <a
                      className="contacto-map-button"
                      href={
                        "https://www.google.com/maps/search/?api=1&query=" +
                        encodeURIComponent(data.direccion)
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <i className="bi bi-geo-alt-fill"></i>
                      Cómo llegar
                    </a>

                  </div>

                </div>

              </div>
            </section>

            {/* =====================================================
                CANALES DE CONTACTO
            ====================================================== */}

            <section className="contacto-channels">
              <div className="contacto-container">

                <div className="contacto-section-title centered">

                  <div>

                    <span className="contacto-small-title">
                      ESTAMOS PARA AYUDARTE
                    </span>

                    <h2>Comunícate con nosotros</h2>

                    <p>
                      Elige el medio que prefieras para ponerte
                      en contacto con el Instituto Politécnico
                      Insignare.
                    </p>

                  </div>

                </div>

                <div className="contacto-cards">

                  {channels.map((channel) => (

                    <a
                      key={channel.key}
                      href={channel.href}
                      className="contacto-card"
                      target={
                        channel.external ? "_blank" : undefined
                      }
                      rel={
                        channel.external
                          ? "noopener noreferrer"
                          : undefined
                      }
                      aria-label={channel.aria}
                    >

                      <span className="contacto-card-icon">
                        <i
                          className={`bi ${channel.icon}`}
                          aria-hidden="true"
                        ></i>
                      </span>

                      <div>

                        <span className="contacto-card-label">
                          {channel.label}
                        </span>

                        <h3>{channel.title}</h3>

                        <p>{channel.text}</p>

                      </div>

                    </a>

                  ))}

                </div>

              </div>
            </section>

            {/* =====================================================
                REDES SOCIALES
            ====================================================== */}

            {networks.some(([key]) => data[key]) && (

              <section className="contacto-social">

                <div className="contacto-container">

                  <div className="contacto-social-box">

                    <div>

                      <span className="contacto-small-title">
                        SÍGUENOS
                      </span>

                      <h2>Estamos en redes sociales</h2>

                      <p>
                        Conoce nuestras novedades, actividades
                        y contenido académico.
                      </p>

                    </div>

                    <div className="contacto-social-links">

                      {networks
                        .filter(([key]) => data[key])
                        .map(([key, label, icon]) => (

                          <a
                            key={key}
                            href={data[key]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="social-link"
                            aria-label={label}
                          >

                            <i
                              className={`bi ${icon}`}
                              aria-hidden="true"
                            ></i>

                            <strong>{label}</strong>

                          </a>

                        ))}

                    </div>

                  </div>

                </div>

              </section>

            )}

          </>
        )}

      </main>

      <Footer />
    </>
  );
}