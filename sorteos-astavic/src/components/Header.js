// ! DECISIÓN DE DISEÑO: El header bloquea foco y scroll en el menú móvil para garantizar contexto accesible.
// * El menú restaura el foco en el disparador tras cerrar y prioriza el primer enlace al abrirse en mobile.
// * El contenedor móvil se porta al body para evitar el clipping generado por el backdrop-filter del header.
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import useBodyScrollLock from "../hooks/useBodyScrollLock";
import useFocusTrap from "../hooks/useFocusTrap";

const MOBILE_NAV_ITEMS = [
  { target: "public", href: "#/", label: "Inicio" },
  { target: "all", href: "#/todos", label: "Todos los sorteos" },
  { target: "finished", href: "#/finalizados", label: "Sorteos finalizados" },
  // "Administración" ya no se lista acá para desktop; en mobile se maneja aparte según isAdmin
];

const MOBILE_QUERY = "(max-width: 768px)";

const Header = ({
  currentRoute,
  onNavigate,
  logoSrc = "/Logo.png",
  isAdmin,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    if (typeof window.matchMedia !== "function") return false;
    const mediaQueryList = window.matchMedia(MOBILE_QUERY);
    return typeof mediaQueryList?.matches === "boolean"
      ? mediaQueryList.matches
      : false;
  });
  const mobileMenuRef = useRef(null);
  const burgerButtonRef = useRef(null);
  const menuWasOpenRef = useRef(false);
  const menuId = "primary-menu";

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
    if (typeof window === "undefined") return undefined;
    if (typeof window.matchMedia !== "function") return undefined;

    const mql = window.matchMedia(MOBILE_QUERY);
    if (!mql) return undefined;
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

  useBodyScrollLock(menuOpen && isMobile);
  useFocusTrap(mobileMenuRef, menuOpen && isMobile);

  useEffect(() => {
    if (!isMobile) return;
    if (menuOpen) {
      menuWasOpenRef.current = true;
      const container = mobileMenuRef.current;
      if (!container) return;
      const firstFocusable = container.querySelector(
        "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
      );
      firstFocusable?.focus();
      return;
    }
    if (menuWasOpenRef.current) {
      burgerButtonRef.current?.focus();
      menuWasOpenRef.current = false;
    }
  }, [menuOpen, isMobile]);

  const closeMenu = () => setMenuOpen(false);
  const burgerLabel = menuOpen ? "Cerrar menú" : "Abrir menú";

  const portalTarget =
    typeof document !== "undefined" ? document.body : null;

  const mobileLayer =
    isMobile && portalTarget
      ? createPortal(
          <div
            className={`app-header__mobile-layer${menuOpen ? " is-open" : ""}`}
            data-testid="header-mobile-layer"
            hidden={!menuOpen}
            aria-hidden={!menuOpen}
          >
            <div
              className={`app-header__mobile-overlay${
                menuOpen ? " is-visible" : ""
              }`}
              aria-hidden="true"
              onClick={closeMenu}
              data-testid="header-mobile-overlay"
            />
            <div
              id={menuId}
              className={`app-header__mobile${menuOpen ? " is-open" : ""}`}
              role="dialog"
              aria-modal="true"
              aria-label="Menú de navegación móvil"
              ref={mobileMenuRef}
            >
              <div className="app-header__mobile-top">
                <p className="app-header__mobile-title">Menú</p>
                <button
                  type="button"
                  className="app-header__mobile-close"
                  onClick={closeMenu}
                >
                  Cerrar menú
                </button>
              </div>
              <nav aria-label="Navegación móvil" className="app-header__mobile-nav">
                {MOBILE_NAV_ITEMS.map(({ target, href, label }) => (
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

                <a
                  href="#/admin"
                  className="app-header__mobile-link"
                  aria-current={currentRoute === "admin" ? "page" : undefined}
                  onClick={handleNavigate("admin")}
                >
                  Administración
                </a>
              </nav>
            </div>
          </div>,
          portalTarget
        )
      : null;

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

        {/* Desktop nav */}
        {/* Desktop: sin enlaces redundantes cuando los controla PublicView */}

        <div className="app-header__actions">
          {/* Desktop: acciones admin a la derecha */}
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

          {/* Mobile burger igual que antes */}
          {isMobile && (
            <button
              type="button"
              className="app-header__burger button button--icon"
              aria-label={burgerLabel}
              aria-expanded={menuOpen}
              aria-controls={menuId}
              onClick={() => setMenuOpen((p) => !p)}
              ref={burgerButtonRef}
            >
              <BurgerIcon open={menuOpen} />
            </button>
          )}
        </div>
      </div>
      {mobileLayer}
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
  currentRoute: PropTypes.oneOf(["public", "finished", "admin", "all"]).isRequired,
  onNavigate: PropTypes.func.isRequired,
  logoSrc: PropTypes.string,
  isAdmin: PropTypes.bool, // <- NUEVO
};

Header.defaultProps = {
  logoSrc: "/Logo.png",
  isAdmin: false,
};

export default Header;
