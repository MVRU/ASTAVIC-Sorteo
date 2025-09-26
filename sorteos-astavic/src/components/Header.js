import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";

const Header = ({ currentRoute, onNavigate, logoSrc = "/Logo.png" }) => {
  const [open, setOpen] = useState(false);
  const navRef = useRef(null);

  const navigate = (target) => (e) => {
    e.preventDefault();
    setOpen(false);
    onNavigate(target);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header
      className="app-header"
      role="banner"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "#031735",
        color: "#EAF4FF",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
      }}
    >
      {/* ✅ Estilos locales para hover rojo sin fondo ni bordes */}
      <style>{`
        .nav-link {
          color: #EAF4FF;
          text-decoration: none;
          font-weight: 600;
          padding: .4rem .6rem; /* mantiene click-area cómoda sin fondo */
          border-radius: 0;     /* sin bordes redondeados para que no haya "píldora" */
          transition: color .15s ease;
        }
        .nav-link:hover,
        .nav-link:focus-visible {
          color: #e64747; /* rojo ASTAVIC-like */
          text-decoration: none;
          outline: none; /* si prefieres foco visible, agrega text-decoration: underline; */
        }
        .nav-link[aria-current="page"] {
          /* estado actual: mismo color normal (sin resaltar) */
          color: #EAF4FF;
        }
      `}</style>

      <div
        className="container app-header__content"
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr auto",
          alignItems: "center",
          gap: "1rem",
          minHeight: 72,
          paddingTop: 6,
          paddingBottom: 6,
        }}
      >
        {/* Brand */}
        <a
          href="#/"
          aria-label="Inicio"
          onClick={navigate("public")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <img
            src={logoSrc}
            alt="ASTAVIC"
            height={48}
            width={48}
            style={{
              display: "block",
              height: 48,
              width: 48,
              objectFit: "contain",
            }}
            onError={(e) => {
              e.currentTarget.replaceWith(
                Object.assign(document.createElement("span"), {
                  textContent: "ASTAVIC",
                  style:
                    "font-size:14px;font-weight:800;letter-spacing:.5px;color:#EAF4FF;",
                })
              );
            }}
          />
          <span style={{ lineHeight: 1 }}>
            <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
              Sorteos de ASTAVIC
            </span>
          </span>
        </a>

        {/* Navegación */}
        <nav
          className="app-nav"
          aria-label="Navegación principal"
          ref={navRef}
          style={{
            justifySelf: "center",
            display: "flex",
            alignItems: "center",
            gap: "1.25rem",
          }}
        >
          <a
            href="#/"
            className="nav-link"
            aria-current={currentRoute === "public" ? "page" : undefined}
            onClick={navigate("public")}
          >
            Inicio
          </a>
          <a href="#/" className="nav-link" onClick={navigate("public")}>
            Sorteos finalizados
          </a>
        </nav>

        {/* Acciones: botón Administración */}
        <div style={{ display: "flex", alignItems: "center", gap: ".5rem" }}>
          <a
            href="#/admin"
            onClick={navigate("admin")}
            aria-current={currentRoute === "admin" ? "page" : undefined}
            title="Ir a Administración"
            style={adminBtnStyle}
          >
            Administración
          </a>

          {/* Hamburguesa opcional para mobile (actívala con media query) */}
          <button
            type="button"
            aria-label="Abrir menú"
            aria-expanded={open}
            aria-controls="primary-menu"
            onClick={() => setOpen((v) => !v)}
            style={{ ...iconBtnStyle, display: "none" }}
          >
            <BurgerIcon open={open} />
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      <div
        id="primary-menu"
        hidden={!open}
        style={{
          display: open ? "block" : "none",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          background: "#031735",
        }}
      >
        <div className="container" style={{ padding: "0.5rem 0 0.75rem" }}>
          <div style={{ display: "grid", gap: ".35rem", fontSize: "0.95rem" }}>
            <a href="#/" onClick={navigate("public")} style={mobileLinkStyle}>
              Inicio
            </a>
            <a href="#/" onClick={navigate("public")} style={mobileLinkStyle}>
              Sorteos
            </a>
            <a
              href="#/admin"
              onClick={navigate("admin")}
              style={mobileLinkStyle}
            >
              Administración
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

/* ---------- estilos helpers ---------- */

const adminBtnStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: ".4rem",
  padding: ".45rem .75rem",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.22)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))",
  color: "#EAF4FF",
  textDecoration: "none",
  fontWeight: 600,
  letterSpacing: ".2px",
  transition: "background .2s ease, transform .15s ease, color .2s ease",
};

const iconBtnStyle = {
  width: 36,
  height: 36,
  display: "grid",
  placeItems: "center",
  borderRadius: 8,
  border: "1px solid rgba(255,255,255,0.15)",
  background: "transparent",
  color: "#EAF4FF",
  cursor: "pointer",
  transition: "background .2s ease, transform .15s ease",
};

const mobileLinkStyle = {
  display: "block",
  padding: ".55rem 0",
  color: "#EAF4FF",
  textDecoration: "none",
  borderRadius: 6,
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
  currentRoute: PropTypes.oneOf(["public", "admin"]).isRequired,
  onNavigate: PropTypes.func.isRequired,
  logoSrc: PropTypes.string,
};

export default Header;
