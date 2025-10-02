// src/components/admin/AdminHome.js
// ! DECISIÓN DE DISEÑO: Las acciones de administración consumen tokens semánticos para texto e íconos y facilitan su retematización.

import PropTypes from "prop-types";

// ! DECISIÓN DE DISEÑO: Este componente usa tokens neutrales para alinear iconografía y textos secundarios con la nueva guía de contraste.

const AdminHome = ({ onLogout }) => {
  return (
    <section className="section-gap" aria-labelledby="admin-home">
      <LocalStyles />

      <div className="container admin-home">
        {/* Barra superior */}
        <header className="admin-toolbar">
          <div className="admin-toolbar__titles">
            <h1 id="admin-home" className="section-title admin-title">
              Panel de Administración
            </h1>
            <p className="section-subtitle admin-subtitle">
              Elegí qué acción realizar.
            </p>
          </div>

          <div className="admin-toolbar__actions">
            <button
              type="button"
              className="button button--ghost admin-logout"
              onClick={onLogout}
              title="Cerrar la sesión actual"
            >
              <span className="admin-logout__label">Cerrar sesión</span>
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className="admin-logout__icon"
              >
                <path
                  fill="currentColor"
                  d="M10 17v-2h4v-6h-4V7h6v10h-6Zm-6-1V8l4 4-4 4Z"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Acciones principales */}
        <nav aria-label="Acciones de administración" className="admin-actions">
          <a href="#/admin/crear" className="admin-action">
            <div className="admin-action__icon admin-action__icon--primary">
              {/* Ícono “plus” */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M11 11V5h2v6h6v2h-6v6h-2v-6H5v-2h6Z"
                />
              </svg>
            </div>
            <div className="admin-action__text">
              <span className="admin-action__title">Crear sorteo</span>
              <span className="admin-action__desc">
                Configurá título, fecha, premios y participantes.
              </span>
            </div>
          </a>

          <a
            href="#/admin/gestionar"
            className="admin-action admin-action--ghost"
          >
            <div className="admin-action__icon">
              {/* Ícono “dashboard/lista” */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fill="currentColor"
                  d="M4 6h16v2H4V6Zm0 5h10v2H4v-2Zm0 5h16v2H4v-2Z"
                />
              </svg>
            </div>
            <div className="admin-action__text">
              <span className="admin-action__title">Gestionar sorteos</span>
              <span className="admin-action__desc">
                Editá, finalizá o eliminá sorteos existentes.
              </span>
            </div>
          </a>
        </nav>
      </div>
    </section>
  );
};

function LocalStyles() {
  return (
    <style>{`
      /* ====== Layout general ====== */
      .admin-home {
        display: grid;
        gap: 1.25rem;
      }

      .admin-title {
        margin: 0;
        font-size: clamp(1.4rem, 1.1rem + 1vw, 1.8rem);
        letter-spacing: -0.01em;
      }

      .admin-subtitle {
        margin: .25rem 0 0 0;
        color: var(--text-secondary, #6b7280);
        font-size: .95rem;
      }

      /* ====== Toolbar ====== */
      .admin-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: .75rem 1rem;
        border: 1px solid var(--surface-border, #e5e7eb);
        background: var(--surface, #ffffff);
        border-radius: 14px;
        box-shadow: 0 2px 10px rgba(0,0,0,.04);
      }

      .admin-toolbar__titles {
        min-width: 0;
      }

      .admin-toolbar__actions {
        display: flex;
        align-items: center;
        gap: .5rem;
        margin-left: auto; /* empuja el bloque hacia la derecha */
      }

      /* ====== Logout ====== */
      .admin-logout {
        display: inline-flex;
        align-items: center;
        gap: .5rem;
        border-radius: 10px;
        padding: .55rem .9rem;
        transition: transform .06s ease, box-shadow .2s ease;
      }
      .admin-logout:hover {
        transform: translateY(-1px);
        box-shadow: 0 6px 14px rgba(0,0,0,.06);
      }
      .admin-logout__icon {
        opacity: .9;
      }

      /* ====== Acciones ====== */
      .admin-actions {
        display: grid;
        grid-template-columns: repeat(2, minmax(220px, 1fr));
        gap: 1rem;
      }

      .admin-action {
        display: grid;
        grid-template-columns: 48px 1fr;
        gap: .9rem;
        align-items: center;
        padding: 1rem 1.1rem;
        border: 1px solid var(--surface-border, #e5e7eb);
        border-radius: 14px;
        background: var(--surface, #ffffff);
        text-decoration: none;
        color: inherit;
        box-shadow: 0 2px 10px rgba(0,0,0,.04);
        transition: border-color .2s ease, box-shadow .2s ease, transform .06s ease;
      }
      .admin-action:hover {
        border-color: rgba(59,130,246,.35);
        box-shadow: 0 10px 24px rgba(0,0,0,.08);
        transform: translateY(-1px);
      }
      .admin-action--ghost{
        background: linear-gradient(180deg, #fff, #fafafa);
      }

      .admin-action__icon {
        display: grid;
        place-items: center;
        width: 48px;
        height: 48px;
        border-radius: 12px;
        background: #f3f4f6;
        color: var(--icon-muted, #4b5563);
      }
      .admin-action__icon--primary {
        background: rgba(59,130,246,.1);
        color: var(--brand-600, #2563eb);
      }

      .admin-action__text {
        min-width: 0;
        display: grid;
        gap: .2rem;
      }
      .admin-action__title {
        font-weight: 600;
        letter-spacing: .1px;
      }
      .admin-action__desc {
        color: var(--text-muted, #6b7280);
        font-size: .92rem;
        line-height: 1.25rem;
      }

      /* ====== Responsivo ====== */
      @media (max-width: 700px){
        .admin-actions{
          grid-template-columns: 1fr;
        }
        .admin-toolbar{
          padding: .65rem .8rem;
          gap: .75rem;
        }
        .admin-logout{
          padding: .5rem .75rem;
        }
      }
    `}</style>
  );
}

AdminHome.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default AdminHome;
