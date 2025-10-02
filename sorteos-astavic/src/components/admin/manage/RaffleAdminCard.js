// src/components/admin/manage/RaffleAdminCard.js

import PropTypes from "prop-types";
import { formatReadableDate } from "./manageRafflesHelpers";

const sanitizeDomId = (value) =>
  `raffle-${
    String(value ?? "item")
      .toLowerCase()
      .replace(/[^a-z0-9_-]+/g, "-")
      .replace(/^-+|-+$/g, "") || "item"
  }`;

const buildDatetimeAttribute = (value) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
};

const RaffleAdminCard = ({ raffle, onEdit, onDelete, onFinish }) => {
  const participantsCount = Array.isArray(raffle.participants)
    ? raffle.participants.length
    : 0;
  const cardState = raffle.finished ? "finished" : "active";
  const baseId = sanitizeDomId(raffle.id);
  const titleId = `${baseId}-title`;
  const descriptionId = raffle.description ? `${baseId}-desc` : null;
  const metaId = `${baseId}-stats`;
  const describedBy =
    [descriptionId, metaId].filter(Boolean).join(" ") || undefined;
  const actionsLabel =
    cardState === "finished"
      ? "Acciones del sorteo finalizado"
      : "Acciones del sorteo activo";

  return (
    <article
      className="manage-card"
      data-state={cardState}
      aria-labelledby={titleId}
      aria-describedby={describedBy}
    >
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
            <time dateTime={buildDatetimeAttribute(raffle.datetime)}>
              {formatReadableDate(raffle.datetime)}
            </time>
          </span>
        </div>
        <strong id={titleId} className="manage-card__title">
          {raffle.title}
        </strong>
        {raffle.description && (
          <p id={descriptionId ?? undefined} className="manage-card__desc">
            {raffle.description}
          </p>
        )}
      </header>

      <dl id={metaId} className="manage-card__meta">
        <div className="meta-row">
          <dt>Participantes</dt>
          <dd>{participantsCount}</dd>
        </div>
        <div className="meta-row">
          <dt>Ganadores</dt>
          <dd>{raffle.winnersCount ?? 1}</dd>
        </div>
      </dl>

      <footer
        className="manage-card__actions"
        role="group"
        aria-label={actionsLabel}
      >
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
