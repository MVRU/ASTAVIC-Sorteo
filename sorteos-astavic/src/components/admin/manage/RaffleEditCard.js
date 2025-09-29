// ! DECISIÓN DE DISEÑO: El formulario delega cabecera y acciones al contenedor para sostener la visibilidad del drawer.
import PropTypes from "prop-types";

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
    `}</style>
);

const RaffleEditCard = ({
  form,
  onChange,
  onSubmit,
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

  return (
    <form
      onSubmit={onSubmit}
      className="manage-edit"
      id={formId}
      noValidate
      aria-describedby={describedBy}
    >
      {alert ? (
        <div className="form-alert" role="alert" id={alertId} aria-live="assertive">
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

RaffleEditCard.propTypes = {
  form: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    datetime: PropTypes.string.isRequired,
    winnersCount: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
    finished: PropTypes.bool.isRequired,
    prizesText: PropTypes.string.isRequired,
    participantsText: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  formId: PropTypes.string.isRequired,
  titleRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) })
    .isRequired,
  alert: PropTypes.shape({
    message: PropTypes.string.isRequired,
    field: PropTypes.string,
  }),
  alertId: PropTypes.string,
};

RaffleEditCard.defaultProps = {
  alert: null,
  alertId: undefined,
};

export default RaffleEditCard;
