// ! DECISIÓN DE DISEÑO: El formulario delega cabecera y acciones al contenedor para sostener la visibilidad del drawer.
import PropTypes from "prop-types";
import EditableList from "./EditableList";

export const RaffleEditCardStyles = () => (
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

      /* Ajustes para evitar overflow en grid */
      .manage-edit .input { min-width: 0; }
      .manage-edit textarea.input {
        overflow-wrap: anywhere;
        white-space: pre-wrap;
      }

      .editable-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
        background: var(--surface-subtle, #f9fafb);
        padding: 12px;
        border-radius: 10px;
        border: 1px solid var(--surface-border, #e5e7eb);
      }

      .editable-list:focus-within {
        border-color: var(--focus-ring, #6366f1);
        box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.15);
      }

      .editable-list__header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }

      .editable-list__label {
        font-weight: 600;
        color: var(--text-strong, #111827);
      }

      .editable-list__helper {
        margin: 0;
        font-size: 0.85rem;
        color: var(--text-muted, #6b7280);
      }

      .editable-list__items {
        display: grid;
        gap: 10px;
        padding: 0;
        margin: 0;
        list-style: none;
      }

      .editable-list__item {
        display: grid;
        gap: 4px;
      }

      .editable-list__item-controls {
        display: flex;
        gap: 8px;
        align-items: center;
      }

      .editable-list__item-label {
        font-size: 0.8rem;
        color: var(--text-muted, #6b7280);
      }

      .editable-list__input {
        flex: 1;
        min-width: 0;
      }

      .editable-list__input--invalid {
        border-color: var(--alert-danger-fg, #991b1b);
        box-shadow: 0 0 0 1px rgba(153, 27, 27, 0.2);
      }

      .editable-list__empty {
        font-size: 0.85rem;
        color: var(--text-muted, #6b7280);
        padding: 8px;
        border-radius: 6px;
        background: rgba(107, 114, 128, 0.08);
      }

      .editable-list__add,
      .editable-list__remove {
        font-size: 0.85rem;
        padding: 6px 12px;
      }

      .editable-list__remove {
        line-height: 1;
      }

      @media (max-width: 720px) {
        .editable-list {
          padding: 10px;
        }
        .editable-list__item-controls {
          flex-direction: column;
          align-items: stretch;
        }
        .editable-list__remove {
          align-self: flex-end;
        }
      }

    `}</style>
);

const RaffleEditCard = ({
  form,
  onChange,
  onSubmit,
  onPrizesChange,
  onParticipantsChange,
  formId,
  titleRef,
  alert,
  alertId,
}) => {
  const describedBy = alert ? alertId : undefined;
  const titleDescribedBy = [
    `${formId}-title-hint`,
    alert?.field === "title" ? alertId : null,
  ]
    .filter(Boolean)
    .join(" ");
  const datetimeDescribedBy = [alert?.field === "datetime" ? alertId : null]
    .filter(Boolean)
    .join(" ");

  const prizesInvalidIndexes = alert?.field === "prizes" ? alert.indexes || [] : [];
  const participantsInvalidIndexes =
    alert?.field === "participants" ? alert.indexes || [] : [];

  return (
    <form
      onSubmit={onSubmit}
      className="manage-edit"
      id={formId}
      noValidate
      aria-describedby={describedBy}
    >
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
        <div className="form-group form-group--checkbox">
          <label className="checkbox" htmlFor={`${formId}-finished`}>
            <input
              id={`${formId}-finished`}
              type="checkbox"
              name="finished"
              checked={form.finished}
              onChange={onChange}
            />
            Finalizado
          </label>
        </div>
      </div>

      <div className="form-row form-row--2">
        <EditableList
          id={`${formId}-prizes`}
          label="Premio"
          values={form.prizes}
          onChange={onPrizesChange}
          addButtonLabel="Agregar premio"
          placeholder="Ej.: Gift card, remera edición limitada"
          helperText="Los premios se mostrarán en el orden indicado."
          invalidIndexes={prizesInvalidIndexes}
          describedBy={alert?.field === "prizes" ? alertId : undefined}
        />
        <EditableList
          id={`${formId}-participants`}
          label="Participante"
          values={form.participants}
          onChange={onParticipantsChange}
          addButtonLabel="Agregar participante"
          placeholder="Ej.: Ana Gómez"
          helperText="Podés repetir participantes si corresponden a varios cupones."
          invalidIndexes={participantsInvalidIndexes}
          describedBy={alert?.field === "participants" ? alertId : undefined}
        />
      </div>
    </form>
  );
};

RaffleEditCard.propTypes = {
  form: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    datetime: PropTypes.string.isRequired,
    winnersCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    finished: PropTypes.bool.isRequired,
    prizes: PropTypes.arrayOf(PropTypes.string).isRequired,
    participants: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onPrizesChange: PropTypes.func.isRequired,
  onParticipantsChange: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,
  titleRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    .isRequired,
  alert: PropTypes.shape({
    message: PropTypes.string.isRequired,
    field: PropTypes.string,
    indexes: PropTypes.arrayOf(PropTypes.number),
  }),
  alertId: PropTypes.string,
};

RaffleEditCard.defaultProps = {
  alert: null,
  alertId: undefined,
};

export default RaffleEditCard;
