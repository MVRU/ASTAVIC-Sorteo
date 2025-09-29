// ! DECISIÓN DE DISEÑO: La tarjeta se separa para facilitar pruebas unitarias y lectura.
import PropTypes from "prop-types";
import { formatReadableDate } from "./manageRafflesHelpers";

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
              {formatReadableDate(raffle.datetime)}
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

RaffleAdminCard.defaultProps = {
  onFinish: null,
};

export default RaffleAdminCard;
