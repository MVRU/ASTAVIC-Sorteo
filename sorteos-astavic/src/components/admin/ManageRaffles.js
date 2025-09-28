// src/components/admin/ManageRaffles.js
// ! DECISIÓN DE DISEÑO: El helper compartido de validación garantiza consistencia y bloquea envíos inválidos en el editor embebido.

/*
 * TODO:
 *  - [ ] Mejorar UI/UX del editor embebido (scroll, tamaño, etc)
 *  - [x] Validar que la fecha no sea en el pasado
 *  - [x] Validar que haya al menos un premio
 *  - [x] Validar que no haya participantes repetidos
 */

import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { validateRaffleDraft } from "../../utils/raffleValidation";

// ========= Helpers =========
const emptyForm = (r) => ({
  id: r.id,
  title: r.title || "",
  description: r.description || "",
  datetime: toLocalInputValue(r.datetime),
  winnersCount: r.winnersCount ?? 1,
  finished: !!r.finished,
  prizesText: (Array.isArray(r.prizes) ? r.prizes : [])
    .map((p) => (p?.title ? p.title : ""))
    .filter(Boolean)
    .join("\n"),
  participantsText: (Array.isArray(r.participants) ? r.participants : []).join(
    "\n"
  ),
});

// convierte ISO a valor aceptado por input datetime-local
function toLocalInputValue(isoLike) {
  const d = new Date(isoLike);
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}

function fromLocalInputValue(local) {
  // conserva zona local; la app ya compara por Date()
  return new Date(local).toISOString();
}

function formatNiceDate(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleString();
  } catch {
    return iso;
  }
}

// ========= Main =========
const ManageRaffles = ({
  raffles,
  onUpdateRaffle,
  onDeleteRaffle,
  onMarkFinished,
}) => {
  const [editing, setEditing] = useState(null); // id en edición
  const [form, setForm] = useState(null); // datos del form
  const [formError, setFormError] = useState(null); // mensaje de error accesible
  const [tab, setTab] = useState("active"); // 'active' | 'finished'
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("date_desc"); // 'date_desc' | 'date_asc' | 'title_asc'

  const activeAll = useMemo(
    () => raffles.filter((r) => !r.finished),
    [raffles]
  );
  const finishedAll = useMemo(
    () => raffles.filter((r) => r.finished),
    [raffles]
  );

  const list = useMemo(() => {
    const src = tab === "active" ? activeAll : finishedAll;
    const query = q.trim().toLowerCase();
    let out = !query
      ? src
      : src.filter((r) => {
          const bag = `${r.title || ""} ${r.description || ""}`.toLowerCase();
          return bag.includes(query);
        });

    if (sort === "date_asc") {
      out = [...out].sort(
        (a, b) => new Date(a.datetime) - new Date(b.datetime)
      );
    } else if (sort === "date_desc") {
      out = [...out].sort(
        (a, b) => new Date(b.datetime) - new Date(a.datetime)
      );
    } else if (sort === "title_asc") {
      out = [...out].sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    }
    return out;
  }, [tab, activeAll, finishedAll, q, sort]);

  const startEdit = (r) => {
    setFormError(null);
    setForm(emptyForm(r));
    setEditing(r.id);
  };

  const cancelEdit = () => {
    setEditing(null);
    setForm(null);
    setFormError(null);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormError(null);
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!form) return;

    const prizeLines = form.prizesText.split("\n");
    const participantLines = form.participantsText.split("\n");

    const validationErrors = validateRaffleDraft({
      title: form.title,
      datetime: form.datetime,
      winnersCount: form.winnersCount,
      prizes: prizeLines.map((line) => ({ title: line })),
      participants: participantLines,
    });

    if (validationErrors.length > 0) {
      setFormError(validationErrors[0]);
      return;
    }

    let isoDatetime;
    try {
      isoDatetime = fromLocalInputValue(form.datetime);
    } catch {
      setFormError("La fecha/hora no es válida.");
      return;
    }

    const winnersCount = Math.max(1, Number(form.winnersCount || 1));
    const payload = {
      id: form.id,
      title: form.title.trim(),
      description: form.description.trim(),
      datetime: isoDatetime,
      winnersCount,
      finished: !!form.finished,
      prizes: prizeLines
        .map((line) => line.trim())
        .filter(Boolean)
        .map((title) => ({ title })),
      participants: participantLines
        .map((line) => line.trim())
        .filter(Boolean),
    };

    onUpdateRaffle(payload);
    cancelEdit();
  };

  const askDelete = (r) => {
    const ok = window.confirm(`¿Eliminar definitivamente "${r.title}"?`);
    if (ok) onDeleteRaffle(r.id);
  };

  const askFinish = (r) => {
    const ok = window.confirm(`¿Marcar como finalizado "${r.title}"?`);
    if (ok) onMarkFinished(r.id);
  };

  return (
    <section className="section-gap admin-manage">
      {/* Toolbar / Header */}
      <div className="container">
        <header className="manage-toolbar">
          <div className="manage-toolbar__left">
            <h1 className="section-title" style={{ margin: 0 }}>
              Gestionar sorteos
            </h1>
            <div className="manage-stats">
              <span className="pill pill--ok">Activos: {activeAll.length}</span>
              <span className="pill pill--muted">
                Finalizados: {finishedAll.length}
              </span>
            </div>
          </div>

          <div className="manage-toolbar__right">
            <div className="tabs">
              <button
                className={`tab${tab === "active" ? " is-active" : ""}`}
                onClick={() => setTab("active")}
                type="button"
              >
                Activos
              </button>
              <button
                className={`tab${tab === "finished" ? " is-active" : ""}`}
                onClick={() => setTab("finished")}
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
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Buscar sorteos"
              />
              <select
                className="input input--sm"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
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

      {/* Grid */}
      <div className="container">
        <div className="manage-grid">
          {list.map((r) =>
            editing === r.id ? (
              <EditCard
                key={r.id}
                form={form}
                onChange={handleChange}
                onSave={handleSave}
                onCancel={cancelEdit}
                error={formError}
              />
            ) : (
              <RaffleAdminCard
                key={r.id}
                raffle={r}
                onEdit={() => startEdit(r)}
                onDelete={() => askDelete(r)}
                onFinish={
                  r.finished ? null : () => askFinish(r) // no mostrar si ya está finalizado
                }
              />
            )
          )}
          {list.length === 0 && (
            <EmptyHint
              text={
                q
                  ? "Sin resultados para tu búsqueda."
                  : tab === "active"
                  ? "No hay sorteos activos."
                  : "No hay sorteos finalizados."
              }
            />
          )}
        </div>
      </div>
    </section>
  );
};

// ========= Card visual mejorada =========
const RaffleAdminCard = ({ raffle, onEdit, onDelete, onFinish }) => {
  const participantsCount = Array.isArray(raffle.participants)
    ? raffle.participants.length
    : 0;

  return (
    <article className="manage-card">
      <header className="manage-card__header">
        <div className="manage-card__badges">
          <span
            className={`admin-tag ${
              raffle.finished ? "admin-tag--finished" : "admin-tag--active"
            }`}
          >
            {raffle.finished ? "Finalizado" : "Activo"}
          </span>
          <span className="admin-tag admin-tag--date">
            <time dateTime={new Date(raffle.datetime).toISOString()}>
              {formatNiceDate(raffle.datetime)}
            </time>
          </span>
        </div>
        <strong className="manage-card__title">{raffle.title}</strong>
        {raffle.description && (
          <p className="manage-card__desc">{raffle.description}</p>
        )}
      </header>

      <dl className="manage-card__meta">
        <div className="meta-row">
          <dt>Participantes</dt>
          <dd>{participantsCount}</dd>
        </div>
        <div className="meta-row">
          <dt>Ganadores</dt>
          <dd>{raffle.winnersCount ?? 1}</dd>
        </div>
      </dl>

      <footer className="manage-card__actions">
        {!raffle.finished && onFinish && (
          <button
            type="button"
            className="button button--subtle"
            onClick={onFinish}
            title="Marcar como finalizado"
          >
            Finalizar
          </button>
        )}
        <button
          type="button"
          className="button button--ghost"
          onClick={onEdit}
          title="Editar sorteo"
        >
          Editar
        </button>
        <button
          type="button"
          className="button button--danger"
          onClick={onDelete}
          title="Eliminar sorteo"
        >
          Eliminar
        </button>
      </footer>
    </article>
  );
};

// ========= Editor embebido (card) =========
const EditCard = ({ form, onChange, onSave, onCancel, error }) => {
  const errorId = error ? `manage-edit-error-${form.id}` : undefined;
  return (
    <form
      onSubmit={onSave}
      className="manage-edit"
      aria-describedby={errorId}
    >
      <header className="manage-edit__header">
        <strong>Editar sorteo</strong>
      </header>

      {error && (
        <p
          id={errorId}
          role="alert"
          aria-live="assertive"
          className="manage-edit__error"
          style={{
            margin: "0 1.5rem 1rem",
            color: "var(--danger)",
            fontWeight: 600,
          }}
        >
          {error}
        </p>
      )}

      <div className="form-group">
        <label>Título</label>
        <input
          className="input"
          name="title"
          value={form.title}
          onChange={onChange}
          aria-label="Título"
          required
        />
      </div>

      <div className="form-group">
        <label>Descripción</label>
        <textarea
          className="input"
          name="description"
          value={form.description}
          onChange={onChange}
          aria-label="Descripción"
          rows={3}
        />
      </div>

      <div className="form-row form-row--3">
        <div className="form-group">
          <label>Fecha y hora</label>
          <input
            className="input"
            type="datetime-local"
            name="datetime"
            value={form.datetime}
            onChange={onChange}
            aria-label="Fecha y hora"
            required
          />
        </div>
        <div className="form-group">
          <label>Ganadores</label>
          <input
            className="input"
            type="number"
            min={1}
            name="winnersCount"
            value={form.winnersCount}
            onChange={onChange}
            aria-label="Ganadores"
          />
        </div>
        <div className="form-group form-group--checkbox">
          <label className="checkbox">
            <input
              type="checkbox"
              name="finished"
              checked={form.finished}
              onChange={onChange}
              aria-label="Finalizado"
            />
            Finalizado
          </label>
        </div>
      </div>

      <div className="form-row form-row--2">
        <div className="form-group">
          <label>Premios (uno por línea)</label>
          <textarea
            className="input"
            name="prizesText"
            value={form.prizesText}
            onChange={onChange}
            aria-label="Premios (uno por línea)"
            rows={4}
          />
        </div>
        <div className="form-group">
          <label>Participantes (uno por línea)</label>
          <textarea
            className="input"
            name="participantsText"
            value={form.participantsText}
            onChange={onChange}
            aria-label="Participantes (uno por línea)"
            rows={4}
          />
        </div>
      </div>

      <footer className="manage-edit__actions">
        <button
          type="button"
          className="button button--ghost"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button type="submit" className="button button--primary">
          Guardar cambios
        </button>
      </footer>
    </form>
  );
};

// ========= Vacio =========
const EmptyHint = ({ text }) => <div className="empty-hint">{text}</div>;

// ========= PropTypes =========
RaffleAdminCard.propTypes = {
  raffle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string,
    description: PropTypes.string,
    datetime: PropTypes.string.isRequired,
    winnersCount: PropTypes.number,
    finished: PropTypes.bool,
    participants: PropTypes.arrayOf(PropTypes.string),
    prizes: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string })),
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onFinish: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([null])]),
};

EditCard.propTypes = {
  form: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  error: PropTypes.string,
};

EmptyHint.propTypes = { text: PropTypes.string.isRequired };

ManageRaffles.propTypes = {
  raffles: PropTypes.array.isRequired,
  onUpdateRaffle: PropTypes.func.isRequired,
  onDeleteRaffle: PropTypes.func.isRequired,
  onMarkFinished: PropTypes.func.isRequired,
};

export default ManageRaffles;
