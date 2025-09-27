import { useEffect, useState } from "react";
import PropTypes from "prop-types";

const NAV_ITEMS = [
  { target: "public", href: "#/", label: "Inicio" },
  { target: "finished", href: "#/finalizados", label: "Sorteos finalizados" },
  { target: "admin", href: "#/admin", label: "Administración" }, // se mantiene acá
];

const MOBILE_QUERY = "(max-width: 768px)";

const Header = ({ currentRoute, onNavigate, logoSrc = "/Logo.png" }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(MOBILE_QUERY).matches
      : false
  );
  const menuId = "primary-menu";

  const DESKTOP_ITEMS = NAV_ITEMS.filter((i) => i.target !== "admin"); // ⟵ clave

  const handleNavigate = (target) => (event) => {
    event.preventDefault();
    setMenuOpen(false);
    onNavigate(target);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [currentRoute]);

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const onChange = (e) => {
      setIsMobile(e.matches);
      if (!e.matches) setMenuOpen(false);
    };
    mql.addEventListener
      ? mql.addEventListener("change", onChange)
      : mql.addListener(onChange);
    setIsMobile(mql.matches);
    return () => {
      mql.removeEventListener
        ? mql.removeEventListener("change", onChange)
        : mql.removeListener(onChange);
    };
  }, []);

  return (
    <header className="app-header app-header--brand" role="banner">
      <div className="container app-header__content">
        <a
          href="#/"
          aria-label="Inicio"
          className="app-header__brand"
          onClick={handleNavigate("public")}
        >
          {logoError ? (
            <span className="app-header__logo-placeholder" aria-hidden="true">
              ASTAVIC
            </span>
          ) : (
            <img
              src={logoSrc}
              alt="ASTAVIC"
              height={48}
              width={48}
              onError={() => setLogoError(true)}
            />
          )}
          {!isMobile && (
            <span className="app-header__brand-text">
              <span className="app-header__brand-title">
                Sorteos de ASTAVIC
              </span>
              <span className="app-header__brand-subtitle">
                Premiamos tu esfuerzo, reconocemos tu apoyo
              </span>
            </span>
          )}
        </a>

        {/* Desktop: sin "Administración" en el nav */}
        {!isMobile && (
          <nav
            className="app-header__nav app-nav"
            aria-label="Navegación principal"
          >
            {DESKTOP_ITEMS.map(({ target, href, label }) => (
              <a
                key={target}
                href={href}
                className={`nav-link${
                  currentRoute === target ? " is-active" : ""
                }`}
                aria-current={currentRoute === target ? "page" : undefined}
                onClick={handleNavigate(target)}
              >
                {label}
              </a>
            ))}
          </nav>
        )}

        <div className="app-header__actions">
          {/* Desktop: botón de Administración aparte */}
          {!isMobile && (
            <a
              href="#/admin"
              className={`button button--ghost app-header__admin-link${
                currentRoute === "admin" ? " is-active" : ""
              }`}
              aria-current={currentRoute === "admin" ? "page" : undefined}
              onClick={handleNavigate("admin")}
            >
              Administración
            </a>
          )}

          {/* Mobile: hamburguesa */}
          {isMobile && (
            <button
              type="button"
              className="app-header__burger button button--icon"
              aria-label="Abrir menú"
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((p) => !p)}
            >
              <BurgerIcon open={menuOpen} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile: el menú incluye TODOS los items, incluida Administración */}
      {isMobile && (
        <div
          id={menuId}
          className={`app-header__mobile${menuOpen ? " is-open" : ""}`}
          hidden={!menuOpen}
        >
          <nav aria-label="Navegación móvil" className="app-header__mobile-nav">
            {NAV_ITEMS.map(({ target, href, label }) => (
              <a
                key={`mobile-${target}`}
                href={href}
                className="app-header__mobile-link"
                aria-current={currentRoute === target ? "page" : undefined}
                onClick={handleNavigate(target)}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

const BurgerIcon = ({ open }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    {open ? (
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    ) : (
      <path
        d="M4 6h16M4 12h16M4 18h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    )}
  </svg>
);

BurgerIcon.propTypes = { open: PropTypes.bool };
BurgerIcon.defaultProps = { open: false };

Header.propTypes = {
  currentRoute: PropTypes.oneOf(["public", "finished", "admin"]).isRequired,
  onNavigate: PropTypes.func.isRequired,
  logoSrc: PropTypes.string,
};

export default Header;
