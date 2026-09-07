import logo from "../../assets/images/logo-insignare.png";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__columns">
          <div className="site-footer__about">
            <div className="site-footer__brand">
              <img className="site-footer__logo" src={logo} alt="" width="1460" height="1600" />
              <span className="site-footer__brand-name">INSTITUTO<br />POLITÉCNICO<br />INSIGNARE</span>
            </div>
            <p>
              Somos un equipo de profesionales politécnicos especializados en la
              formación académica de estudiantes, comprometidos con brindar una
              educación de calidad que fortalezca sus habilidades y conocimientos
              para afrontar los desafíos académicos.
            </p>
          </div>

          <section className="site-footer__contact" aria-labelledby="footer-contact-title">
            <h2 id="footer-contact-title">Información de contacto</h2>
            <address>
              <ul className="site-footer__contact-list">
                <li>
                  <span className="site-footer__icon site-footer__pin" aria-hidden="true" />
                  <span>Juan Genaro Jaramillo 764 &amp; Río Frío. Sangolquí, Ecuador</span>
                </li>
                <li>
                  <span className="site-footer__icon" aria-hidden="true">☎</span>
                  <div className="site-footer__phones">
                    <a href="tel:+593962759826">+593 96 275 9826</a>
                    <a href="tel:+593969069558">+593 96 906 9558</a>
                  </div>
                </li>
                <li>
                  <span className="site-footer__icon" aria-hidden="true">✉</span>
                  <a href="mailto:instituto.politecnico.insignare@gmail.com">
                    instituto.politecnico.insignare@gmail.com
                  </a>
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
