// src/components/admin/manage/ManageRafflesToolbar.js

import { useId } from "react";
import PropTypes from "prop-types";

const preventFiltersSubmit = (event) => {
  event.preventDefault();
};

const ManageRafflesToolbar = ({
  tab,
  onTabChange,
  query,
  onQueryChange,
  sort,
  onSortChange,
  stats,
}) => {
  const titleId = useId();
  const searchFieldId = useId();
  const sortFieldId = useId();

  return (
    <header className="manage-toolbar" aria-labelledby={titleId}>
      <div className="manage-toolbar__left">
        <div className="manage-toolbar__headline">
          <h1 className="section-title" id={titleId}>
            Gestionar sorteos
          </h1>
          <p className="section-subtitle manage-toolbar__subtitle">
            Revisa tus sorteos, filtralos y mantené las acciones a mano.
          </p>
        </div>
        <div className="manage-stats manage-toolbar__stats" aria-live="polite">
          <span className="pill pill--ok">Activos: {stats.activeCount}</span>
          <span className="pill pill--muted">
            Finalizados: {stats.finishedCount}
          </span>
        </div>
      </div>

      <div className="manage-toolbar__right">
        <div
          className="tabs manage-toolbar__tabs"
          role="group"
          aria-label="Estado de los sorteos"
        >
          <button
            className={`tab${tab === "active" ? " is-active" : ""}`}
            onClick={() => onTabChange("active")}
            type="button"
            aria-pressed={tab === "active"}
          >
            Activos
          </button>
          <button
            className={`tab${tab === "finished" ? " is-active" : ""}`}
            onClick={() => onTabChange("finished")}
            type="button"
            aria-pressed={tab === "finished"}
          >
            Finalizados
          </button>
        </div>

        <form
          className="filters manage-toolbar__filters"
          role="search"
          onSubmit={preventFiltersSubmit}
        >
          <div className="manage-toolbar__field">
            <label className="visually-hidden" htmlFor={searchFieldId}>
              Buscar sorteos
            </label>
            <input
              className="input input--sm manage-toolbar__control"
              type="search"
              id={searchFieldId}
              placeholder="Buscar por título o descripción…"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              aria-label="Buscar sorteos"
              enterKeyHint="search"
            />
          </div>
          <div className="manage-toolbar__field">
            <label className="visually-hidden" htmlFor={sortFieldId}>
              Ordenar resultados
            </label>
            <select
              className="input input--sm manage-toolbar__control"
              id={sortFieldId}
              value={sort}
              onChange={(event) => onSortChange(event.target.value)}
              aria-label="Ordenar resultados"
            >
              <option value="date_desc">Más recientes primero</option>
              <option value="date_asc">Más antiguos primero</option>
              <option value="title_asc">Título (A→Z)</option>
            </select>
          </div>
        </form>
      </div>
    </header>
  );
};

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
