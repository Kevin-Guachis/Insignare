import { useSiteSettings } from "../../hooks/useSiteSettings";
import logo from "../../assets/images/logo-insignare.png";

function Footer() {
  const settings = useSiteSettings();
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__columns">
          <div className="site-footer__about">
            <div className="site-footer__brand">
              <img className="site-footer__logo" src={settings.logo || logo} alt="" width="1460" height="1600" />
              <span className="site-footer__brand-name">INSTITUTO<br />POLITÉCNICO<br />INSIGNARE</span>
            </div>
            <p>{settings.descripcion}</p>
          </div>

          <section className="site-footer__contact" aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title">Información de contacto</h2>
            <address>
              <ul className="site-footer__contact-list">
                <li>
                  <span className="site-footer__icon site-footer__pin" aria-hidden="true" />
                  <span>{settings.direccion}</span>
                </li>
                <li>
                  <span className="site-footer__icon" aria-hidden="true">☎</span>
                  <div className="site-footer__phones">
                    <a href={`tel:${settings.telefono1.replace(/[^+0-9]/g, "")}`}>{settings.telefono1}</a>
                    {settings.telefono2 && <a href={`tel:${settings.telefono2.replace(/[^+0-9]/g, "")}`}>{settings.telefono2}</a>}
                  </div>
                </li>
                <li>
                  <span className="site-footer__icon" aria-hidden="true">✉</span>
                  <a href={`mailto:${settings.correo}`}>{settings.correo}</a>
                </li>
              </ul>
            </address>
          </section>

          <section className="site-footer__services" aria-labelledby="footer-services-title">
            <h2 id="footer-services-title">Servicios</h2>
            <ul className="site-footer__service-list">
              <li>Ingreso a la universidad</li>
              <li>Material gratuito</li>
              <li>Calculadoras</li>
            </ul>
          </section>
        </div>
        <p className="site-footer__copyright">
          Copyright © 2026 Instituto Politécnico Insignare. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
