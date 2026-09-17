import { useEffect, useState } from "react";
import { getContacto, telephoneLink } from "../../services/contacto";

export default function SiovContact() {
  const [data, setData] = useState(null);

  useEffect(() => {
    let active = true;

    function loadContact() {
      getContacto()
        .then((row) => {
          if (active) setData(row);
        })
        .catch(() => {
          // Si falla la información dinámica,
          // simplemente no mostramos esos enlaces.
        });
    }

    loadContact();

    window.addEventListener("contacto-updated", loadContact);

    return () => {
      active = false;
      window.removeEventListener("contacto-updated", loadContact);
    };
  }, []);

  return (
    <div className="contact-footer no-print mb-4">
      <h4 className="font-display">📞 Contáctanos</h4>

      <div className="row g-3">
        <div className="col-md-6">

          {data?.telefono1 && (
            <div className="contact-item">
              <span className="contact-icon">📱</span>{" "}
              <a href={telephoneLink(data.telefono1)}>
                {data.telefono1}
              </a>
            </div>
          )}

          {data?.telefono2 && (
            <div className="contact-item">
              <span className="contact-icon">📱</span>{" "}
              <a href={telephoneLink(data.telefono2)}>
                {data.telefono2}
              </a>
            </div>
          )}

          <div className="contact-item">
            <span className="contact-icon">🌐</span>{" "}
            <a
              href="https://institutoinsignare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="siov-static-9"
            >
              institutoinsignare.com
            </a>
          </div>

          <div className="contact-item">
            <span className="contact-icon">💻</span>{" "}
            <a
              href="https://aulainsignare.com"
              target="_blank"
              rel="noopener noreferrer"
              className="siov-static-10"
            >
              aulainsignare.com
            </a>{" "}
            (Aula Virtual)
          </div>
        </div>

        <div className="col-md-6">

          {data?.facebook && (
            <div className="contact-item">
              <span className="contact-icon">📘</span>{" "}
              Facebook:{" "}
              <a
                href={data.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                Instituto Politécnico Insignare
              </a>
            </div>
          )}

          {data?.instagram && (
            <div className="contact-item">
              <span className="contact-icon">📸</span>{" "}
              Instagram:{" "}
              <a
                href={data.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                inst_insignare
              </a>
            </div>
          )}

          {data?.tiktok && (
            <div className="contact-item">
              <span className="contact-icon">🎵</span>{" "}
              TikTok:{" "}
              <a
                href={data.tiktok}
                target="_blank"
                rel="noopener noreferrer"
              >
                inst_insignare
              </a>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}