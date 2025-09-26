import { useEffect } from 'react';
import PropTypes from 'prop-types';

const LiveDrawModal = ({ open, raffle, message, winners, onClose }) => {
  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const handleKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open || !raffle) {
    return null;
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="live-draw-title">
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__content">
        <div className="modal__header">
          <div>
            <h3 id="live-draw-title" className="modal__title">
              Sorteo en vivo &mdash; {raffle.title}
            </h3>
            <p className="modal__desc">
              Seleccionando {raffle.winnersCount} ganador(es) entre {raffle.participants.length} participante(s).
            </p>
          </div>
          <button type="button" className="button button--ghost" onClick={onClose} aria-label="Cerrar modal">
            Cerrar
          </button>
        </div>
        <div className="live-stage">{message}</div>
        <ul className="live-winners">
          {winners.map((winner, index) => (
            <li key={winner}>
              Ganador {index + 1}: {winner}
            </li>
          ))}
        </ul>
        <div className="modal__footer">
          <button type="button" className="button button--primary" onClick={onClose}>
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
    winnersCount: PropTypes.number,
    participants: PropTypes.arrayOf(PropTypes.string),
  }),
  message: PropTypes.string,
  winners: PropTypes.arrayOf(PropTypes.string),
  onClose: PropTypes.func.isRequired,
};

LiveDrawModal.defaultProps = {
  raffle: null,
  message: '',
  winners: [],
};

export default LiveDrawModal;
