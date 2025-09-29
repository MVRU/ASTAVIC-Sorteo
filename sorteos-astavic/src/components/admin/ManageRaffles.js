// ManageRaffles.jsx
// ! DECISIÓN DE DISEÑO: El flujo de edición/confirmación migra a modales reutilizables para mejorar accesibilidad y consistencia.
// ! DECISIÓN DE DISEÑO: Las fechas se validan localmente para evitar enviar payloads inconsistentes y proveer feedback accesible.
// ! DECISIÓN DE DISEÑO: Las acciones críticas disparan toasts globales para alinear el feedback entre vistas públicas y administrativas.
// ? Riesgo: La capa demo asume respuestas sincrónicas; al conectar backend será necesario manejar estados de carga y error.

/**
 * TODO: Validar datos críticos (fecha futura, premios, duplicados) en una capa de dominio compartida.
 */

import { useMemo, useState, useRef, useId, useCallback } from "react";
import { useEffect } from "react";
import PropTypes from "prop-types";
import AdminModal from "./AdminModal";
import { useToast } from "../../context/ToastContext";

// ========= Helpers =========
const composeFormState = (raffle) => {
  const datetimeResult = toLocalInputValue(raffle.datetime);
  return {
    form: {
      id: raffle.id,
      title: raffle.title || "",
      description: raffle.description || "",
      datetime: datetimeResult.value,
      winnersCount: raffle.winnersCount ?? 1,
      finished: !!raffle.finished,
      prizesText: (Array.isArray(raffle.prizes) ? raffle.prizes : [])
        .map((prize) => (prize?.title ? prize.title : ""))
        .filter(Boolean)
        .join("\n"),
      participantsText: (Array.isArray(raffle.participants)
        ? raffle.participants
        : []
      ).join("\n"),
    },
    alert: datetimeResult.error
      ? { message: datetimeResult.error, field: "datetime" }
      : null,
  };
};

// convierte ISO a valor aceptado por input datetime-local
function toLocalInputValue(isoLike) {
  if (!isoLike) {
    return { value: "", error: null };
  }
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) {
    return {
      value: "",
      error:
        "La fecha guardada del sorteo es inválida. Ingresá una nueva fecha antes de guardar.",
    };
  }
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return {
    value: `${yyyy}-${MM}-${dd}T${hh}:${mm}`,
    error: null,
  };
}

function fromLocalInputValue(local) {
  if (!local) {
    return {
      ok: false,
      error: "Ingresá una fecha válida antes de guardar.",
    };
  }
  const parsed = new Date(local);
  if (Number.isNaN(parsed.getTime())) {
    return {
      ok: false,
      error: "La fecha ingresada no es válida. Revisala antes de guardar.",
    };
  }
  return { ok: true, value: parsed.toISOString() };
}

function buildPayloadFromForm(form) {
  const title = form.title.trim();
  if (!title) {
    return {
      ok: false,
      error: "El título no puede quedar vacío.",
      field: "title",
    };
  }
  const datetimeResult = fromLocalInputValue(form.datetime);
  if (!datetimeResult.ok) {
    return {
      ok: false,
      error: datetimeResult.error,
      field: "datetime",
    };
  }
  const parsedWinners = Number.parseInt(form.winnersCount, 10);
  const winnersCount =
    Number.isFinite(parsedWinners) && parsedWinners > 0 ? parsedWinners : 1;

  return {
    ok: true,
    payload: {
      id: form.id,
      title,
      description: form.description.trim(),
      datetime: datetimeResult.value,
      winnersCount,
      finished: Boolean(form.finished),
      prizes: form.prizesText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .map((prizeTitle) => ({ title: prizeTitle })),
      participants: form.participantsText
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
    },
  };
}

function formatNiceDate(iso) {
  if (!iso) {
    return "Fecha no disponible";
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return "Fecha no disponible";
  }
  return parsed.toLocaleString();
}

// ========= Main =========
const ManageRaffles = ({
  raffles,
  onUpdateRaffle,
  onDeleteRaffle,
  onMarkFinished,
}) => {
  const { showToast } = useToast();
  const [tab, setTab] = useState("active");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [editState, setEditState] = useState(null); // { raffle, form }
  const [confirmState, setConfirmState] = useState(null); // { type, raffle }
  const [formAlert, setFormAlert] = useState(null);
  const titleInputRef = useRef(null);
  const editFormId = useId();
  const alertId = `${editFormId}-alert`;

  const emitOutcomeToast = useCallback(
    (result, { successMessage, errorMessage }) => {
      if (result?.ok === false) {
        showToast({
          status: "error",
          message: result.message || errorMessage,
        });
        return false;
      }
      showToast({
        status: "success",
        message: (result && result.message) || successMessage,
      });
      return true;
    },
    [showToast]
  );

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
    const mapped = composeFormState(raffle);
    setEditState({ raffle, form: mapped.form });
    setFormAlert(mapped.alert);
  };

  const closeEdit = () => {
    setEditState(null);
    setFormAlert(null);
  };

  const hasUnsavedChanges = useCallback(() => {
    if (!editState?.form || !editState?.raffle) return false;
    const initial = composeFormState(editState.raffle).form;
    const pick = (f) => ({
      title: f.title || "",
      description: f.description || "",
      datetime: f.datetime || "",
      winnersCount: Number(f.winnersCount || 0),
      finished: Boolean(f.finished),
      prizesText: f.prizesText || "",
      participantsText: f.participantsText || "",
    });
    const a = pick(initial);
    const b = pick(editState.form);
    return JSON.stringify(a) !== JSON.stringify(b);
  }, [editState]);

  const requestCloseEdit = useCallback(() => {
    if (hasUnsavedChanges()) {
      const ok = window.confirm(
        "Hay cambios sin guardar. ¿Deseás descartarlos?"
      );
      if (!ok) return;
    }
    closeEdit();
  }, [hasUnsavedChanges]);

  // Drawer UX: focus management, Esc to close, body scroll lock
  useEffect(() => {
    if (!editState) return undefined;
    const input = titleInputRef.current;
    if (input && typeof input.focus === "function") {
      input.focus();
    }
    const onKey = (e) => {
      if (e.key === "Escape") requestCloseEdit();
    };
    const { style } = document.body;
    const prevOverflow = style.overflow;
    style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      style.overflow = prevOverflow;
    };
  }, [editState, requestCloseEdit]);

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
    if (formAlert && (!formAlert.field || formAlert.field === name)) {
      setFormAlert(null);
    }
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editState?.form) return;
    const result = buildPayloadFromForm(editState.form);
    if (!result.ok) {
      setFormAlert({ message: result.error, field: result.field });
      showToast({
        status: "error",
        message: result.error || "Revisá los datos antes de guardar.",
      });
      return;
    }
    try {
      const response = await Promise.resolve(onUpdateRaffle(result.payload));
      const success = emitOutcomeToast(response, {
        successMessage: "Sorteo actualizado correctamente.",
        errorMessage: "No se pudo actualizar el sorteo. Intentá nuevamente.",
      });
      if (success) {
        closeEdit();
      }
    } catch (error) {
      showToast({
        status: "error",
        message:
          error?.message ||
          "Ocurrió un error inesperado al actualizar. Intentá nuevamente.",
      });
    }
  };

  const openConfirm = (type, raffle) => {
    setConfirmState({ type, raffle });
  };

  const closeConfirm = () => {
    setConfirmState(null);
  };

  const confirmAction = async () => {
    if (!confirmState?.raffle) return;
    const label = confirmState.raffle.title || "el sorteo";
    try {
      if (confirmState.type === "delete") {
        const response = await Promise.resolve(
          onDeleteRaffle(confirmState.raffle.id)
        );
        const success = emitOutcomeToast(response, {
          successMessage: `Sorteo "${label}" eliminado.`,
          errorMessage: "No se pudo eliminar el sorteo. Intentá nuevamente.",
        });
        if (success) closeConfirm();
      } else if (confirmState.type === "finish") {
        const response = await Promise.resolve(
          onMarkFinished(confirmState.raffle.id)
        );
        const success = emitOutcomeToast(response, {
          successMessage: `Sorteo "${label}" marcado como finalizado.`,
          errorMessage:
            "No se pudo marcar como finalizado. Intentá nuevamente.",
        });
        if (success) closeConfirm();
      } else {
        closeConfirm();
      }
    } catch (error) {
      showToast({
        status: "error",
        message:
          error?.message ||
          "Ocurrió un error inesperado al ejecutar la acción. Intentá nuevamente.",
      });
    }
  };

  const confirmCopy = buildConfirmCopy(confirmState);

  return (
    <section className="section-gap admin-manage">
      {/* ====== estilos locales para asegurar no overflow en el modal ====== */}
      <LocalStyles />

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
        <div className="manage-grid stagger is-on">
          {list.map((r) => (
            <div className="anim-up" key={r.id}>
              <RaffleAdminCard
                raffle={r}
                onEdit={() => startEdit(r)}
                onDelete={() => openConfirm("delete", r)}
                onFinish={r.finished ? null : () => openConfirm("finish", r)}
              />
            </div>
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

      {/* ====== Panel lateral de edición (drawer) ====== */}
      {Boolean(editState) && (
        <div
          className="drawer-layer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-drawer-title"
        >
          <div className="drawer-overlay" onClick={requestCloseEdit} />
          <aside className="drawer anim-scale-in">
            <header className="drawer__header">
              <div>
                <h2 id="edit-drawer-title" className="drawer__title">
                  Editar sorteo
                </h2>
                <p className="drawer__desc">
                  Actualizá los datos y guardá los cambios cuando estés listo.
                </p>
              </div>
              <button
                type="button"
                className="button button--ghost"
                aria-label="Cerrar panel"
                onClick={requestCloseEdit}
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </header>
            <div
              className="drawer__content"
              role="region"
              aria-label="Formulario de edición"
            >
              {editState ? (
                <RaffleEditForm
                  form={editState.form}
                  onChange={handleEditField}
                  onSubmit={handleEditSubmit}
                  formId={editFormId}
                  titleRef={titleInputRef}
                  alert={formAlert}
                  alertId={alertId}
                />
              ) : null}
            </div>
            <footer className="drawer__footer">
              <button
                type="button"
                className="button button--ghost"
                onClick={requestCloseEdit}
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
            </footer>
          </aside>
        </div>
      )}

      {/* ====== Modal de confirmación ====== */}
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
  const parsedDatetime = raffle.datetime ? new Date(raffle.datetime) : null;
  const datetimeAttribute =
    parsedDatetime && !Number.isNaN(parsedDatetime.getTime())
      ? parsedDatetime.toISOString()
      : undefined;

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
            <time dateTime={datetimeAttribute}>
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
const RaffleEditForm = ({
  form,
  onChange,
  onSubmit,
  formId,
  titleRef,
  alert,
  alertId,
}) => {
  const titleDescribedBy = [
    `${formId}-title-hint`,
    alert?.field === "title" ? alertId : null,
  ]
    .filter(Boolean)
    .join(" ");
  const datetimeDescribedBy = [alert?.field === "datetime" ? alertId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <form onSubmit={onSubmit} className="manage-edit" id={formId} noValidate>
      {alert ? (
        <div
          className="form-alert"
          role="alert"
          id={alertId}
          aria-live="assertive"
        >
          {alert.message}
        </div>
      ) : null}
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
          aria-describedby={titleDescribedBy || undefined}
          aria-invalid={alert?.field === "title" ? "true" : undefined}
        />
        <small id={`${formId}-title-hint`} className="hint">
          Un nombre claro facilita la búsqueda.
        </small>
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
            aria-describedby={datetimeDescribedBy || undefined}
            aria-invalid={alert?.field === "datetime" ? "true" : undefined}
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
            spellCheck="false"
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
            spellCheck="false"
          />
        </div>
      </div>
    </form>
  );
};

// ========= Vacio =========
const EmptyHint = ({ text }) => <div className="empty-hint">{text}</div>;

/**
 * Estilos locales críticos para:
 * - Evitar scroll horizontal (minmax(0,1fr), min-width: 0, word-wrap)
 * - Forzar scroll vertical sobre el contenido del modal
 * - Responsividad: columnas colapsan en pantallas angostas
 */
function LocalStyles() {
  return (
    <style>{`
      .modal-scroll-area{
        max-height: min(70vh, 720px);
        overflow-y: auto;
        overflow-x: hidden;
        padding-right: 4px; /* evita salto por scrollbar */
      }

      .manage-edit{
        display: grid;
        gap: 12px;
        max-width: 100%;
        box-sizing: border-box;
      }

      .manage-edit .form-group{
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 0; /* clave para que no se expanda y cause overflow */
      }

      .manage-edit .input{
        width: 100%;
        min-width: 0; /* evita overflow en grid */
        box-sizing: border-box;
      }

      .manage-edit textarea.input{
        resize: vertical;
        overflow-wrap: anywhere; /* por si pegan líneas larguísimas */
        white-space: pre-wrap;
      }

      .form-alert{
        background: var(--alert-danger-bg, #fee2e2);
        border-radius: 8px;
        color: var(--alert-danger-fg, #991b1b);
        padding: 12px;
        font-size: .9rem;
      }

      .form-row{
        display: grid;
        gap: 12px;
        grid-auto-rows: minmax(0, auto);
      }

      /* 2 columnas fluidas */
      .form-row--2{
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }

      /* 3 columnas fluidas para fecha/ganadores/checkbox */
      .form-row--3{
        grid-template-columns: 2fr 1fr auto;
        align-items: end;
      }

      .form-group--checkbox{
        display: flex;
        align-items: flex-end;
        min-width: 0;
      }

      .checkbox{
        display: inline-flex;
        gap: 8px;
        align-items: center;
        user-select: none;
        white-space: nowrap;
      }

      .hint{
        font-size: .8rem;
        color: var(--text-muted, #6b7280);
      }

      /* Responsivo: colapsar a una columna en pantallas angostas */
      @media (max-width: 720px){
        .form-row--2,
        .form-row--3{
          grid-template-columns: minmax(0, 1fr);
        }
        .form-group--checkbox{
          align-items: center;
        }
      }
    `}</style>
  );
}

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
  titleRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    .isRequired,
  alert: PropTypes.shape({
    message: PropTypes.string.isRequired,
    field: PropTypes.string,
  }),
  alertId: PropTypes.string.isRequired,
};

EmptyHint.propTypes = { text: PropTypes.string.isRequired };

ManageRaffles.propTypes = {
  raffles: PropTypes.array.isRequired,
  onUpdateRaffle: PropTypes.func.isRequired,
  onDeleteRaffle: PropTypes.func.isRequired,
  onMarkFinished: PropTypes.func.isRequired,
};

export default ManageRaffles;
