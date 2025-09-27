import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { formatDateEs, getTimeParts } from "../../utils/raffleUtils";

const emojiSet = ["\u{1F389}", "\u{1F38A}", "\u{2728}", "\u{1F388}"];

const RaffleCard = ({ raffle, onLive, onMarkFinished, onRequestReminder }) => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeParts(raffle.datetime));
  const [isFinished, setIsFinished] = useState(
    () => raffle.finished || timeLeft.diff <= 0
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const finishedRef = useRef(isFinished);
  const openBtnRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const parts = getTimeParts(raffle.datetime);
      setTimeLeft(parts);
      if (parts.diff <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        setIsFinished(true);
        setShowConfetti(true);
        if (onMarkFinished) {
          onMarkFinished(raffle.id);
        }
      }
    };
    update();
    const timerId = window.setInterval(update, 1000);
    return () => window.clearInterval(timerId);
  }, [raffle.id, raffle.datetime, onMarkFinished]);

  useEffect(() => {
    finishedRef.current = raffle.finished;
    setIsFinished(raffle.finished);
  }, [raffle.finished]);

  useEffect(() => {
    if (!showConfetti) {
      return undefined;
    }
    const timeoutId = window.setTimeout(() => setShowConfetti(false), 900);
    return () => window.clearTimeout(timeoutId);
  }, [showConfetti]);

  useEffect(() => {
    setModalOpen(false);
  }, [raffle.id]);

  const participantsCount = Array.isArray(raffle.participants)
    ? raffle.participants.length
    : 0;

  const countdownItems = [
    { label: "días", value: timeLeft.days },
    { label: "horas", value: timeLeft.hours },
    { label: "min", value: timeLeft.minutes },
    { label: "seg", value: timeLeft.seconds },
  ];

  // NUEVO: estado visual “soon” para sorteos que comienzan en < 60 minutos
  const isSoon =
    !isFinished && timeLeft.diff > 0 && timeLeft.diff <= 60 * 60 * 1000;

  return (
    <article
      className={`card raffle-card${
        isFinished
          ? " raffle-card--finished"
          : isSoon
          ? " raffle-card--soon"
          : ""
      }`}
    >
      {/* NUEVO: fecha semántica con <time> y aria-label descriptivo */}
      <span
        className={`raffle-card__badge${
          isFinished ? " raffle-card__badge--finished" : ""
        }`}
        aria-label={`Fecha y hora del sorteo: ${formatDateEs(raffle.datetime)}`}
      >
        <time dateTime={new Date(raffle.datetime).toISOString()}>
          {formatDateEs(raffle.datetime)}
        </time>
      </span>

      <h3 className="raffle-card__title">{raffle.title}</h3>

      {/* NUEVO: el grid visual del contador es presentacional para SR */}
      <div className="countdown" aria-hidden="true">
        {countdownItems.map((item) => (
          <div key={item.label} className="countdown__item">
            <div className="countdown__value">
              {String(item.value).padStart(2, "0")}
            </div>
            <div className="countdown__label">{item.label}</div>
          </div>
        ))}
      </div>

      {/* NUEVO: resumen accesible del tiempo restante (no anuncia cada segundo) */}
      <span className="visually-hidden" aria-live="polite">
        Tiempo restante: {timeLeft.days} días, {timeLeft.hours} horas y{" "}
        {timeLeft.minutes} minutos.
      </span>

      <div className="card-actions">
        <button
          ref={openBtnRef}
          type="button"
          className="button button--ghost"
          onClick={() => setModalOpen(true)}
          title="Ver información del sorteo"
          aria-label={`Ver detalles del sorteo ${raffle.title}`}
        >
          Ver sorteo
        </button>

        <button
          type="button"
          className="button button--primary"
          onClick={() => onRequestReminder(raffle)}
          title="Abrir formulario para recibir recordatorios por correo"
          aria-label={`Recibir recordatorio por email del sorteo ${raffle.title}`}
        >
          Avisarme por email
        </button>

        {isFinished && onLive && (
          <button
            type="button"
            className="button"
            onClick={() => onLive(raffle)}
            title="Ver sorteo en vivo"
            aria-label={`Ver transmisión en vivo del sorteo ${raffle.title}`}
          >
            Ver en vivo
          </button>
        )}
      </div>

      {modalOpen && (
        <RaffleDetailsModal
          raffle={raffle}
          participantsCount={participantsCount}
          onClose={() => setModalOpen(false)}
          returnFocusRef={openBtnRef}
        />
      )}

      {showConfetti && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} style={{ left: `${5 + index * 7}%` }}>
              {emojiSet[index % emojiSet.length]}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};

function RaffleDetailsModal({
  raffle,
  participantsCount,
  onClose,
  returnFocusRef,
}) {
  const panelRef = useRef(null);
  const closeRef = useRef(null);
  const lastScrollY = useRef(0);
  const previousBodyStyle = useRef({});

  const titleId = `raffle-modal-title-${raffle.id}`;
  const descId = `raffle-modal-desc-${raffle.id}`;

  useEffect(() => {
    closeRef.current?.focus();

    lastScrollY.current = window.scrollY || 0;
    previousBodyStyle.current = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${lastScrollY.current}px`;
    document.body.style.width = "100%";

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === "Tab" && panelRef.current) {
        const focusables = Array.from(
          panelRef.current.querySelectorAll(
            'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) {
          return;
        }
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (!event.shiftKey && active === last) {
          event.preventDefault();
          first.focus();
        } else if (event.shiftKey && active === first) {
          event.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const prev = previousBodyStyle.current;
      document.body.style.overflow = prev.overflow;
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.width = prev.width;
      window.scrollTo({ top: lastScrollY.current });
      const trigger = returnFocusRef?.current;
      if (trigger && typeof trigger.focus === "function") {
        trigger.focus();
      }
    };
  }, [onClose, returnFocusRef]);

  return createPortal(
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onClick={onClose}
    >
      <div className="modal__overlay" />
      <div
        className="modal__content raffle-modal"
        role="document"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="modal__header">
          <h3 id={titleId} className="modal__title">
            {raffle.title}
          </h3>
          <button
            ref={closeRef}
            type="button"
            className="button button--ghost modal__close"
            aria-label="Cerrar detalles del sorteo"
            onClick={onClose}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </header>

        <div className="modal__body" id={descId}>
          <section className="modal__section">
            <h4>Descripción</h4>
            <p className="modal__text">
              {raffle.description || "Sin descripción disponible."}
            </p>
          </section>

          <section className="modal__section">
            <h4>Premios</h4>
            {Array.isArray(raffle.prizes) && raffle.prizes.length > 0 ? (
              <ol className="modal__list">
                {raffle.prizes.map((prize, index) => (
                  <li key={(prize && prize.title) || index}>
                    {prize?.title || `Premio ${index + 1}`}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="modal__text modal__text--muted">
                No hay premios cargados.
              </p>
            )}
          </section>

          <section className="modal__section">
            <h4>Participantes ({participantsCount})</h4>
            {Array.isArray(raffle.participants) &&
            raffle.participants.length > 0 ? (
              <ul className="modal__list">
                {raffle.participants.map((participant) => (
                  <li key={participant}>{participant}</li>
                ))}
              </ul>
            ) : (
              <p className="modal__text modal__text--muted">
                Sin participantes aún.
              </p>
            )}
          </section>
        </div>

        <div className="modal__footer">
          <button
            type="button"
            className="button button--primary"
            onClick={onClose}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

RaffleCard.propTypes = {
  raffle: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string,
    datetime: PropTypes.string.isRequired,
    winnersCount: PropTypes.number.isRequired,
    participants: PropTypes.arrayOf(PropTypes.string).isRequired,
    prizes: PropTypes.arrayOf(
      PropTypes.shape({
        title: PropTypes.string,
      })
    ),
    finished: PropTypes.bool,
  }).isRequired,
  onLive: PropTypes.func.isRequired,
  onMarkFinished: PropTypes.func,
  onRequestReminder: PropTypes.func.isRequired,
};

RaffleCard.defaultProps = {
  onMarkFinished: undefined,
};

export default RaffleCard;
