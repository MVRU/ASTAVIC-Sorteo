// src/components/admin/manage/RaffleEditCard.js
// * DECISIÓN: Apilamos las listas de premios y participantes para priorizar
//   la lectura vertical en desktop y evitar competencia visual entre columnas.

import PropTypes from "prop-types";
import EditableList from "./EditableList";
import "./RaffleEditCard.css";

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

  const prizesInvalidIndexes =
    alert?.field === "prizes" ? alert.indexes || [] : [];
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

      <div className="manage-edit__lists">
        <div className="manage-edit__lists-item">
          <EditableList
            id={`${formId}-prizes`}
            label="Premios"
            itemLabel="Premio"
            values={form.prizes}
            onChange={onPrizesChange}
            addButtonLabel="Agregar premio"
            placeholder="Ej.: Gift card, remera edición limitada"
            helperText="Los premios se mostrarán en el orden indicado."
            invalidIndexes={prizesInvalidIndexes}
            describedBy={alert?.field === "prizes" ? alertId : undefined}
          />
        </div>
        <div className="manage-edit__lists-item">
          <EditableList
            id={`${formId}-participants`}
            label="Participantes"
            itemLabel="Participante"
            values={form.participants}
            onChange={onParticipantsChange}
            addButtonLabel="Agregar participante"
            placeholder="Ej.: Ana Gómez"
            helperText="Podés repetir participantes si corresponden a varios cupones."
            invalidIndexes={participantsInvalidIndexes}
            describedBy={alert?.field === "participants" ? alertId : undefined}
          />
        </div>
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
