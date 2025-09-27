// src/components/admin/AdminHome.js
import PropTypes from "prop-types";

const AdminHome = ({ onLogout }) => {
  return (
    <section className="section-gap" aria-labelledby="admin-home">
      <div className="container">
        <h1
          id="admin-home"
          className="section-title"
          style={{ fontSize: "1.6rem" }}
        >
          Panel de Administración
        </h1>
        <p className="section-subtitle" style={{ marginBottom: "1.5rem" }}>
          Elegí qué acción realizar.
        </p>

        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <a
            href="#/admin/crear"
            className="button button--primary"
            style={{ flex: "1 1 220px" }}
          >
            Crear sorteo
          </a>
          <a
            href="#/admin/gestionar"
            className="button button--ghost"
            style={{ flex: "1 1 220px" }}
          >
            Gestionar sorteos
          </a>
        </div>

        <div style={{ marginTop: "2rem" }}>
          <button
            type="button"
            className="button button--ghost app-header__admin-link"
            onClick={onLogout}
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </section>
  );
};

AdminHome.propTypes = {
  onLogout: PropTypes.func.isRequired,
};

export default AdminHome;
