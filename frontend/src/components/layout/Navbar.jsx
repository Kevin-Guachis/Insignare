import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useUniversities } from "../../hooks/useUniversities";



function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState(null);
  const navRef = useRef(null);
  const toggleRef = useRef(null);

  const { universities } = useUniversities();

  const navigation = [
    {
      id: "admissions",
      label: "INGRESO A LA U",
      path: "/ingreso-a-la-u",
      submenu: universities.map((university) => ({
        label: university.nombre,
        path: `/ingreso-a-la-u/${university.slug}`,
      })),
    },
    {
      id: "students",
      label: "ALUMNOS",
      path: "/testimonials/",
    },
    {
      id: "contact",
      label: "CONTACTO",
      path: "/contacto",
    },
    {
      id: "resources",
      label: "MATERIAL GRATIS",
      path: "/about-3/",
    },
    {
      id: "calculators",
      label: "CALCULADORAS",
      path: "/calculadoras",
      submenu: [
        {
          label: "Nota de postulación",
          path: "/calculadoras/nota-postulacion",
        },
        {
          label: "Nota de grado",
          path: "/calculadoras/nota-grado",
        },
      ],
    },
    {
      id: "siov",
      label: "SIOV",
      path: "/siov"
    },
  ];

  useEffect(() => {
    function closeOutside(event) {
      if (!navRef.current?.contains(event.target)) {
        setOpenSubmenu(null);
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", closeOutside);

    return () => {
      document.removeEventListener("pointerdown", closeOutside);
    };
  }, []);

  function handleKeyDown(event) {
    if (event.key !== "Escape") return;

    if (openSubmenu) {
      navRef.current
        ?.querySelector(`#nav-trigger-${openSubmenu}`)
        ?.focus();

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
        if (!event.currentTarget.contains(event.relatedTarget)) {
          closeNavigation();
        }
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

      <ul
        id="primary-navigation"
        className={`site-nav__list${isOpen ? " site-nav__list--open" : ""}`}
      >
        {navigation.map(({ id, label, path, submenu }) => (
          <li className="site-nav__item" key={id}>
            {submenu ? (
              <>
                <div className="site-nav__link-group">
                  {path ? (
                    <Link
                      className="site-nav__link"
                      to={path}
                      onClick={closeNavigation}
                    >
                      {label}
                    </Link>
                  ) : (
                    <button
                      className="site-nav__link"
                      type="button"
                      aria-expanded={openSubmenu === id}
                      aria-controls={`nav-submenu-${id}`}
                      onClick={() => setOpenSubmenu(openSubmenu === id ? null : id)}
                    >
                      {label}
                    </button>
                  )}

                  <button
                    className="site-nav__submenu-toggle"
                    type="button"
                    id={`nav-trigger-${id}`}
                    aria-expanded={openSubmenu === id}
                    aria-controls={`nav-submenu-${id}`}
                    aria-label={`Abrir ${label}`}
                    onClick={() =>
                      setOpenSubmenu(
                        openSubmenu === id ? null : id
                      )
                    }
                  >
                    <span
                      className="site-nav__chevron"
                      aria-hidden="true"
                    />
                  </button>
                </div>

                <ul
                  className="site-nav__submenu"
                  id={`nav-submenu-${id}`}
                  hidden={openSubmenu !== id}
                >
                  {submenu.map((item) => (
                    <li key={item.path}>
                      <Link
                        to={item.path}
                        onClick={closeNavigation}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <Link
                className="site-nav__link"
                to={path}
                onClick={closeNavigation}
              >
                {label}
              </Link>
            )}
          </li>
        ))}
      </ul>

      <a
        className="site-nav__classroom"
        href="http://aulainsignare.com"
        onClick={closeNavigation}
      >
        Aula Insignare
      </a>
    </nav>
  );
}

export default Navbar;