// ! DECISIÓN DE DISEÑO: Formulario desacoplado para garantizar cohesión y reutilización.
import PropTypes from "prop-types";

const RaffleEditCard = ({ form, onChange, onSave, onCancel, error }) => {
  const errorId = error ? `manage-edit-error-${form.id}` : undefined;
  return (
    <form onSubmit={onSave} className="manage-edit" aria-describedby={errorId}>
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

RaffleEditCard.propTypes = {
  form: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    datetime: PropTypes.string.isRequired,
    winnersCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    finished: PropTypes.bool.isRequired,
    prizesText: PropTypes.string.isRequired,
    participantsText: PropTypes.string.isRequired,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  error: PropTypes.string,
};

RaffleEditCard.defaultProps = {
  error: undefined,
};

export default RaffleEditCard;
