// ! DECISIÓN DE DISEÑO: Toolbar segregada para reducir el tamaño del componente principal.
import PropTypes from "prop-types";

const ManageRafflesToolbar = ({
  tab,
  onTabChange,
  query,
  onQueryChange,
  sort,
  onSortChange,
  stats,
}) => (
  <div className="container">
    <header className="manage-toolbar">
      <div className="manage-toolbar__left">
        <h1 className="section-title" style={{ margin: 0 }}>
          Gestionar sorteos
        </h1>
        <div className="manage-stats">
          <span className="pill pill--ok">Activos: {stats.activeCount}</span>
          <span className="pill pill--muted">
            Finalizados: {stats.finishedCount}
          </span>
        </div>
      </div>

      <div className="manage-toolbar__right">
        <div className="tabs">
          <button
            className={`tab${tab === "active" ? " is-active" : ""}`}
            onClick={() => onTabChange("active")}
            type="button"
          >
            Activos
          </button>
          <button
            className={`tab${tab === "finished" ? " is-active" : ""}`}
            onClick={() => onTabChange("finished")}
            type="button"
          >
            Finalizados
          </button>
        </div>

        <div className="filters">
          <input
            className="input input--sm"
            type="search"
            placeholder="Buscar por título o descripción…"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            aria-label="Buscar sorteos"
          />
          <select
            className="input input--sm"
            value={sort}
            onChange={(event) => onSortChange(event.target.value)}
            aria-label="Ordenar resultados"
          >
            <option value="date_desc">Más recientes primero</option>
            <option value="date_asc">Más antiguos primero</option>
            <option value="title_asc">Título (A→Z)</option>
          </select>
        </div>
      </div>
    </header>
  </div>
);

ManageRafflesToolbar.propTypes = {
  tab: PropTypes.oneOf(["active", "finished"]).isRequired,
  onTabChange: PropTypes.func.isRequired,
  query: PropTypes.string.isRequired,
  onQueryChange: PropTypes.func.isRequired,
  sort: PropTypes.oneOf(["date_desc", "date_asc", "title_asc"]).isRequired,
  onSortChange: PropTypes.func.isRequired,
  stats: PropTypes.shape({
    activeCount: PropTypes.number.isRequired,
    finishedCount: PropTypes.number.isRequired,
  }).isRequired,
};

export default ManageRafflesToolbar;
