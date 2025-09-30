// ! DECISIÓN DE DISEÑO: Modal de sorteo en vivo con gestión centralizada de foco y scroll bloqueado.
// * Reutilizamos hooks de infraestructura para focus trap y scroll lock, garantizando experiencia consistente.
// -!- Riesgo: La restauración del foco depende de que el disparador siga montado al cerrar el modal.
import { useEffect, useId, useRef } from "react";
import PropTypes from "prop-types";
import useFocusTrap from "../hooks/useFocusTrap";
import useBodyScrollLock from "../hooks/useBodyScrollLock";

const LiveDrawModal = ({ open, raffle, message, winners, onClose }) => {
  const headingId = useId();
  const titleId = `${headingId}-title`;
  const descId = raffle?.description ? `${headingId}-desc` : undefined;
  const messageId = message ? `${headingId}-message` : undefined;
  const describedBy = [descId, messageId].filter(Boolean).join(" ") || undefined;
  const contentRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useBodyScrollLock(open);
  useFocusTrap(contentRef, open);

  useEffect(() => {
    if (!open) return undefined;
    if (typeof document !== "undefined") {
      const activeElement = document.activeElement;
      previousFocusRef.current =
        activeElement && typeof activeElement.focus === "function"
          ? activeElement
          : null;
    }
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleKey = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKey);
    closeButtonRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", handleKey);
      const focusTarget = previousFocusRef.current;
      if (focusTarget && typeof focusTarget.focus === "function") {
        focusTarget.focus();
      }
      previousFocusRef.current = null;
    };
  }, [open, onClose]);

  if (!open || !raffle) return null;

  const hasWinners = Array.isArray(winners) && winners.length > 0;

  return (
    <div
      className="modal anim-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={describedBy}
    >
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__content anim-scale-in" ref={contentRef}>
        <div className="modal__header">
          <div>
            <h3 id={titleId} className="modal__title">
              Sorteo &mdash; {raffle.title}
            </h3>
            {raffle.description && (
              <p id={descId} className="legend" style={{ margin: 0 }}>
                {raffle.description}
              </p>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="button button--ghost"
            aria-label="Cerrar modal"
            onClick={onClose}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        {/* Mensaje opcional (estado o info) */}
        {message && (
          <div id={messageId} className="live-stage anim-blur-in">
            {message}
          </div>
        )}

        {/* Ganadores provistos por backend */}
        {hasWinners && (
          <ul className="live-winners stagger is-on">
            {winners.map((winner, index) => {
              const prize = Array.isArray(raffle.prizes)
                ? raffle.prizes[index]
                : null;
              const prizeTitle = prize && prize.title ? prize.title : null;
              return (
                <li key={`${winner}-${index}`} className="anim-up">
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
