// ! DECISIÓN DE DISEÑO: El flujo de edición/confirmación migra a modales reutilizables para mejorar accesibilidad y consistencia.
// ? Riesgo: La capa demo asume respuestas sincrónicas; al conectar backend será necesario manejar estados de carga y error.

/**
 * TODO: Validar datos críticos (fecha futura, premios, duplicados) en una capa de dominio compartida.
 */

import { useMemo, useState, useRef, useId } from "react";
import PropTypes from "prop-types";
import AdminModal from "./AdminModal";

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
  const [tab, setTab] = useState("active");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [editState, setEditState] = useState(null); // { raffle, form }
  const [confirmState, setConfirmState] = useState(null); // { type, raffle }
  const titleInputRef = useRef(null);
  const editFormId = useId();

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

  const startEdit = (raffle) => {
    setEditState({ raffle, form: emptyForm(raffle) });
  };

  const closeEdit = () => {
    setEditState(null);
  };

  const handleEditField = (event) => {
    const { name, value, type, checked } = event.target;
    setEditState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        form: {
          ...prev.form,
          [name]: type === "checkbox" ? checked : value,
        },
      };
    });
  };

  const handleEditSubmit = (event) => {
    event.preventDefault();
    if (!editState?.form) return;
    const payload = {
      id: editState.form.id,
      title: editState.form.title.trim(),
      description: editState.form.description.trim(),
      datetime: fromLocalInputValue(editState.form.datetime),
      winnersCount: Math.max(1, Number(editState.form.winnersCount || 1)),
      finished: !!editState.form.finished,
      prizes: editState.form.prizesText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((title) => ({ title })),
      participants: editState.form.participantsText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };
    onUpdateRaffle(payload);
    closeEdit();
  };

  const openConfirm = (type, raffle) => {
    setConfirmState({ type, raffle });
  };

  const closeConfirm = () => {
    setConfirmState(null);
  };

  const confirmAction = () => {
    if (!confirmState?.raffle) return;
    if (confirmState.type === "delete") {
      onDeleteRaffle(confirmState.raffle.id);
    } else if (confirmState.type === "finish") {
      onMarkFinished(confirmState.raffle.id);
    }
    closeConfirm();
  };

  const confirmCopy = buildConfirmCopy(confirmState);

  return (
    <section className="section-gap admin-manage">
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

      <div className="container">
        <div className="manage-grid">
          {list.map((r) => (
            <RaffleAdminCard
              key={r.id}
              raffle={r}
              onEdit={() => startEdit(r)}
              onDelete={() => openConfirm("delete", r)}
              onFinish={
                r.finished ? null : () => openConfirm("finish", r)
              }
            />
          ))}
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

      <AdminModal
        open={Boolean(editState)}
        title="Editar sorteo"
        description="Actualizá los datos y guardá los cambios cuando estés listo."
        onClose={closeEdit}
        footer={
          <>
            <button
              type="button"
              className="button button--ghost"
              onClick={closeEdit}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button button--primary"
              form={editFormId}
            >
              Guardar cambios
            </button>
          </>
        }
        initialFocusRef={titleInputRef}
      >
        {editState ? (
          <RaffleEditForm
            form={editState.form}
            onChange={handleEditField}
            onSubmit={handleEditSubmit}
            formId={editFormId}
            titleRef={titleInputRef}
          />
        ) : null}
      </AdminModal>

      <AdminModal
        open={Boolean(confirmState)}
        title={confirmCopy.title}
        description={confirmCopy.description}
        onClose={closeConfirm}
        footer={
          <>
            <button
              type="button"
              className="button button--ghost"
              onClick={closeConfirm}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={
                confirmState?.type === "delete"
                  ? "button button--danger"
                  : "button button--primary"
              }
              onClick={confirmAction}
            >
              {confirmCopy.cta}
            </button>
          </>
        }
      >
        <p className="modal__text">{confirmCopy.body}</p>
      </AdminModal>
    </section>
  );
};

const buildConfirmCopy = (state) => {
  if (!state?.raffle) {
    return {
      title: "Confirmar acción",
      description: undefined,
      body: "Confirmá para continuar.",
      cta: "Confirmar",
    };
  }
  const title = state.raffle.title || "este sorteo";
  if (state.type === "delete") {
    return {
      title: "Eliminar sorteo",
      description: "Esta acción no se puede deshacer.",
      body: `¿Seguro que querés eliminar "${title}"?`,
      cta: "Eliminar",
    };
  }
  return {
    title: "Finalizar sorteo",
    description: "El sorteo dejará de mostrarse como activo.",
    body: `¿Confirmás marcar como finalizado "${title}"?`,
    cta: "Finalizar",
  };
};

// ========= Card visual =========
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

// ========= Formulario =========
const RaffleEditForm = ({ form, onChange, onSubmit, formId, titleRef }) => (
  <form onSubmit={onSubmit} className="manage-edit" id={formId}>
    <div className="form-group">
      <label htmlFor={`${formId}-title`}>Título</label>
      <input
        className="input"
        id={`${formId}-title`}
        name="title"
        value={form.title}
        onChange={onChange}
        required
        ref={titleRef}
        data-modal-autofocus="true"
      />
    </div>

    <div className="form-group">
      <label htmlFor={`${formId}-description`}>Descripción</label>
      <textarea
        className="input"
        id={`${formId}-description`}
        name="description"
        value={form.description}
        onChange={onChange}
        rows={3}
      />
    </div>

    <div className="form-row form-row--3">
      <div className="form-group">
        <label htmlFor={`${formId}-datetime`}>Fecha y hora</label>
        <input
          className="input"
          type="datetime-local"
          id={`${formId}-datetime`}
          name="datetime"
          value={form.datetime}
          onChange={onChange}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor={`${formId}-winners`}>Ganadores</label>
        <input
          className="input"
          type="number"
          min={1}
          id={`${formId}-winners`}
          name="winnersCount"
          value={form.winnersCount}
          onChange={onChange}
        />
      </div>
      <div className="form-group form-group--checkbox">
        <label className="checkbox" htmlFor={`${formId}-finished`}>
          <input
            type="checkbox"
            id={`${formId}-finished`}
            name="finished"
            checked={form.finished}
            onChange={onChange}
          />
          Finalizado
        </label>
      </div>
    </div>

    <div className="form-row form-row--2">
      <div className="form-group">
        <label htmlFor={`${formId}-prizes`}>Premios (uno por línea)</label>
        <textarea
          className="input"
          id={`${formId}-prizes`}
          name="prizesText"
          value={form.prizesText}
          onChange={onChange}
          rows={4}
        />
      </div>
      <div className="form-group">
        <label htmlFor={`${formId}-participants`}>
          Participantes (uno por línea)
        </label>
        <textarea
          className="input"
          id={`${formId}-participants`}
          name="participantsText"
          value={form.participantsText}
          onChange={onChange}
          rows={4}
        />
      </div>
    </div>
  </form>
);

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

RaffleEditForm.propTypes = {
  form: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,
  titleRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }).isRequired,
};

EmptyHint.propTypes = { text: PropTypes.string.isRequired };

ManageRaffles.propTypes = {
  raffles: PropTypes.array.isRequired,
  onUpdateRaffle: PropTypes.func.isRequired,
  onDeleteRaffle: PropTypes.func.isRequired,
  onMarkFinished: PropTypes.func.isRequired,
};

export default ManageRaffles;
