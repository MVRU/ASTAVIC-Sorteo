// src/components/admin/AdminHome.js
// ! DECISIÓN DE DISEÑO: Las acciones de administración consumen tokens semánticos para texto e íconos y facilitan su retematización.

import PropTypes from "prop-types";
import Icon from "../ui/Icon";
import "./AdminHome.css";

// ! DECISIÓN DE DISEÑO: Este componente usa tokens neutrales para alinear iconografía y textos secundarios con la nueva guía de contraste.

const AdminHome = ({ onLogout }) => {
  return (
    <section className="section-gap" aria-labelledby="admin-home">
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
              <Icon
                name="logOut"
                decorative
                size={20}
                strokeWidth={1.75}
                className="admin-logout__icon"
              />
            </button>
          </div>
        </header>

        {/* Acciones principales */}
        <nav aria-label="Acciones de administración" className="admin-actions">
          <a href="#/admin/crear" className="admin-action">
            <div className="admin-action__icon admin-action__icon--primary">
              <Icon
                name="plus"
                decorative
                size={24}
                strokeWidth={1.75}
              />
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
              <Icon
                name="list"
                decorative
                size={24}
                strokeWidth={1.75}
              />
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

AdminHome.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default AdminHome;
