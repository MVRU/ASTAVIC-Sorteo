import { useEffect } from "react";
import PropTypes from "prop-types";

const LiveDrawModal = ({ open, raffle, message, winners, onClose }) => {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open || !raffle) return null;

  const hasWinners = Array.isArray(winners) && winners.length > 0;

  return (
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="live-draw-title"
    >
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__content">
        <div className="modal__header">
          <div>
            <h3 id="live-draw-title" className="modal__title">
              Sorteo &mdash; {raffle.title}
            </h3>
            {raffle.description && (
              <p className="legend" style={{ margin: 0 }}>
                {raffle.description}
              </p>
            )}
          </div>
          <button
            type="button"
            className="button button--ghost"
            aria-label="Cerrar modal"
            onClick={onClose}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        {/* Mensaje opcional (estado o info) */}
        {message && <div className="live-stage">{message}</div>}

        {/* Ganadores provistos por backend */}
        {hasWinners && (
          <ul className="live-winners">
            {winners.map((winner, index) => {
              const prize = Array.isArray(raffle.prizes)
                ? raffle.prizes[index]
                : null;
              const prizeTitle = prize && prize.title ? prize.title : null;
              return (
                <li key={`${winner}-${index}`}>
                  Ganador {index + 1}: {winner}
                  {prizeTitle && (
                    <span className="winner-prize">
                      Puesto {index + 1} - {prizeTitle}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        <div className="modal__footer">
          <button
            type="button"
            className="button button--primary"
            onClick={onClose}
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};

LiveDrawModal.propTypes = {
  open: PropTypes.bool.isRequired,
  raffle: PropTypes.shape({
    title: PropTypes.string,
    description: PropTypes.string,
    winnersCount: PropTypes.number,
    participants: PropTypes.arrayOf(PropTypes.string),
    prizes: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
      })
    ),
  }),
  // Ya no generamos ganadores en el cliente; solo mostramos lo que viene del backend.
  message: PropTypes.string,
  winners: PropTypes.arrayOf(PropTypes.string),
  onClose: PropTypes.func.isRequired,
};

LiveDrawModal.defaultProps = {
  raffle: null,
  message: "",
  winners: [],
};

export default LiveDrawModal;
