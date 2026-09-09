import { useEffect, useRef, useState } from "react";

const REFERENCE_SITE = "https://lightcoral-reindeer-735935.hostingersite.com";
const navigation = [
  {
    id: "admissions",
    label: "INGRESO A LA U",
    submenu: [
      { label: "EPN", path: "/epn-2/" },
      { label: "UCE", path: "/uce/" },
      { label: "ESPE", path: "/espe/" },
    ],
  },
  {
    id: "students",
    label: "ALUMNOS",
    path: "/testimonials/",
  },
  {
    id: "contact",
    label: "CONTACTO",
    path: "/contact-3/",
  },
  {
    id: "resources",
    label: "MATERIAL GRATIS",
    path: "/about-3/",
  },
  {
    id: "calculators",
    label: "CALCULADORAS",
    submenu: [
      { label: "Nota de postulación", path: "/why-choose-me-2/" },
      { label: "Nota de grado", path: "/privacy-policy/" },
    ],
  },
  {
    id: "siov",
    label: "SIOV",
    path: "/siov/index.html",
    local: true,
  },
];

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const navRef = useRef(null);
  const toggleRef = useRef(null);

  useEffect(() => {
    function closeOutside(event) {
      if (!navRef.current?.contains(event.target)) {
        setOpenSubmenu(null);
        setIsOpen(false);
      }
    }
    document.addEventListener("pointerdown", closeOutside);
    return () => document.removeEventListener("pointerdown", closeOutside);
  }, []);

  function handleKeyDown(event) {
    if (event.key !== "Escape") return;
    if (openSubmenu) {
      navRef.current?.querySelector(`#nav-trigger-${openSubmenu}`)?.focus();
      setOpenSubmenu(null);
    } else if (isOpen) {
      setIsOpen(false);
      toggleRef.current?.focus();
    }
  }

  function closeNavigation() {
    setOpenSubmenu(null);
    setIsOpen(false);
  }

  return (
    <nav
      className="site-nav"
      ref={navRef}
      aria-label="Navegación principal"
      onKeyDown={handleKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) closeNavigation();
      }}
    >
      <button
        className="site-nav__toggle"
        type="button"
        ref={toggleRef}
        aria-expanded={isOpen}
        aria-controls="primary-navigation"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        onClick={() => {
          setIsOpen(!isOpen);
          setOpenSubmenu(null);
        }}
      >
        <span className="site-nav__hamburger" aria-hidden="true" />
        <span>Menú</span>
      </button>
      <ul id="primary-navigation" className={`site-nav__list${isOpen ? " site-nav__list--open" : ""}`}>
        {navigation.map(({ id, label, path, submenu, local }) => (
          <li className="site-nav__item" key={id}>
            {submenu ? (
              <>
                <button
                  className="site-nav__link"
                  type="button"
                  id={`nav-trigger-${id}`}
                  aria-expanded={openSubmenu === id}
                  aria-controls={`nav-submenu-${id}`}
                  onClick={() => setOpenSubmenu(openSubmenu === id ? null : id)}
                >
                  {label}
                  <span className="site-nav__chevron" aria-hidden="true" />
                </button>

                <ul
                  className="site-nav__submenu"
                  id={`nav-submenu-${id}`}
                  hidden={openSubmenu !== id}
                >
                  {submenu.map((item) => (
                    <li key={item.path}>
                      <a
                        href={REFERENCE_SITE + item.path}
                        onClick={closeNavigation}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <a
                className="site-nav__link"
                href={local ? path : REFERENCE_SITE + path}
                onClick={closeNavigation}
              >
                {label}
              </a>
            )}
          </li>
        ))}
      </ul>
      <a className="site-nav__classroom" href="http://aulainsignare.com" onClick={closeNavigation}>
        Aula Insignare
      </a>
    </nav>
  );
}

export default Navbar;
