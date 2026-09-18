import "bootstrap-icons/font/bootstrap-icons.css";
import { useEffect, useState } from "react";
import { getContacto } from "../../services/contacto";

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
      <div className="siov-contact-grid">
        <section aria-labelledby="siov-contact-title">
          <h4 id="siov-contact-title" className="font-display">Contacto</h4>
          <div className="siov-contact-links">
            {[data?.telefono1, data?.telefono2].map((phone, index) => phone && (
              <a className="siov-contact-button" href={'tel:' + phone.replace(/[^+0-9]/g, "")} key={index}>
                <i className="bi bi-telephone contact-icon" aria-hidden="true" />
                <span>{phone}</span>
              </a>
            ))}
            <a className="siov-contact-button" href="https://institutoinsignare.com" target="_blank" rel="noopener noreferrer">
              <i className="bi bi-globe contact-icon" aria-hidden="true" />
              <span>Sitio web</span>
            </a>
            <a className="siov-contact-button" href="https://aulainsignare.com" target="_blank" rel="noopener noreferrer">
              <i className="bi bi-laptop contact-icon" aria-hidden="true" />
              <span>Aula virtual</span>
            </a>
          </div>
        </section>
        <section aria-labelledby="siov-social-title">
          <h4 id="siov-social-title" className="font-display">Redes sociales</h4>
          <div className="siov-social-links">
            {[
              ["instagram", "Instagram"],
              ["tiktok", "TikTok"],
              ["facebook", "Facebook"],
            ].map(([network, label]) => data?.[network] && (
              <a className="siov-contact-button" href={data[network]} target="_blank" rel="noopener noreferrer" aria-label={`${label} del Instituto Politécnico Insignare (abre en otra pestaña)`} key={network}>
                <i className={'bi bi-' + network + ' contact-icon'} aria-hidden="true" />
                <span>{label}</span>
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
