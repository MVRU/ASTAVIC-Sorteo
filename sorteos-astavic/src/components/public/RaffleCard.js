// src/components/public/RaffleCard.js
// ! DECISIÓN DE DISEÑO: Las tarjetas públicas aplican tokens de estado, superficie y tipografía coherentes con DESIGN.md.

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { formatDateEs, getTimeParts } from "../../utils/raffleUtils";
import rafflePropType from "./rafflePropType";
import RaffleDetailsModal from "./RaffleDetailsModal";

const CONFETTI_EMOJIS = ["\u{1F389}", "\u{1F38A}", "\u{2728}", "\u{1F388}"];
const CONFETTI_SLOTS = 14;
const VANISH_MS = 1000;

const RaffleCard = ({
  raffle,
  onMarkFinished,
  onRequestReminder,
  interactionMode,
}) => {
  const isPreviewMode = interactionMode === "preview";
  const [timeLeft, setTimeLeft] = useState(() => getTimeParts(raffle.datetime));
  const [isFinished, setIsFinished] = useState(
    () => raffle.finished || timeLeft.diff <= 0
  );
  const [isVanishing, setIsVanishing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showPrizeSide, setShowPrizeSide] = useState(false);
  const [flipHeight, setFlipHeight] = useState(null);

  const finishedRef = useRef(isFinished);
  const openButtonRef = useRef(null);
  const vanishTimerRef = useRef(null);
  const confettiTimerRef = useRef(null);
  const frontShellRef = useRef(null);
  const backShellRef = useRef(null);

  useEffect(() => {
    if (isPreviewMode || typeof window === "undefined") return undefined;

    const updateCountdown = () => {
      const parts = getTimeParts(raffle.datetime);
      setTimeLeft(parts);

      if (parts.diff <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        setIsFinished(true);
        setShowConfetti(true);
        setIsVanishing(true);

        if (onMarkFinished) {
          vanishTimerRef.current = window.setTimeout(() => {
            onMarkFinished(raffle.id);
          }, VANISH_MS);
        }
      }
    };

    updateCountdown();
    const timerId = window.setInterval(updateCountdown, 1000);
    return () => window.clearInterval(timerId);
  }, [isPreviewMode, raffle.datetime, raffle.id, onMarkFinished]);

  useEffect(() => {
    finishedRef.current = raffle.finished;
    setIsFinished(raffle.finished);
  }, [raffle.finished]);

  useEffect(() => {
    if (isPreviewMode || !showConfetti || typeof window === "undefined") {
      return undefined;
    }
    confettiTimerRef.current = window.setTimeout(
      () => setShowConfetti(false),
      1200
    );
    return () => {
      if (confettiTimerRef.current) {
        window.clearTimeout(confettiTimerRef.current);
      }
    };
  }, [isPreviewMode, showConfetti]);

  useEffect(
    () => () => {
      if (vanishTimerRef.current && typeof window !== "undefined") {
        window.clearTimeout(vanishTimerRef.current);
      }
      if (confettiTimerRef.current && typeof window !== "undefined") {
        window.clearTimeout(confettiTimerRef.current);
      }
    },
    []
  );

  useEffect(() => {
    const initialParts = getTimeParts(raffle.datetime);
    setTimeLeft(initialParts);
    const initialFinished = raffle.finished || initialParts.diff <= 0;
    finishedRef.current = initialFinished;
    setIsFinished(initialFinished);
    setIsVanishing(false);
    setShowConfetti(false);
    setModalOpen(false);
    setShowPrizeSide(false);
    setFlipHeight(null);
  }, [raffle.datetime, raffle.finished, raffle.id]);

  const participantsCount = useMemo(
    () => (Array.isArray(raffle.participants) ? raffle.participants.length : 0),
    [raffle.participants]
  );

  const countdownItems = useMemo(
    () => [
      { label: "días", value: timeLeft.days },
      { label: "horas", value: timeLeft.hours },
      { label: "min", value: timeLeft.minutes },
      { label: "seg", value: timeLeft.seconds },
    ],
    [timeLeft.days, timeLeft.hours, timeLeft.minutes, timeLeft.seconds]
  );

  const winners = useMemo(
    () => (Array.isArray(raffle.winners) ? raffle.winners : []),
    [raffle.winners]
  );

  const prizes = useMemo(
    () => (Array.isArray(raffle.prizes) ? raffle.prizes : []),
    [raffle.prizes]
  );

  const isSoon = useMemo(() => {
    if (isFinished) return false;
    return timeLeft.diff > 0 && timeLeft.diff <= 60 * 60 * 1000;
  }, [isFinished, timeLeft.diff]);

  const viewButtonClass = isFinished
    ? "button button--gold"
    : "button button--primary";
  const viewButtonStyle = isFinished ? undefined : { width: "100%" };

  const handleOpenModal = () => {
    if (isPreviewMode) return;
    setModalOpen(true);
  };
  const handleCloseModal = () => setModalOpen(false);

  const reminderButtonProps = isPreviewMode
    ? { disabled: true }
    : {
        onClick: () => onRequestReminder(raffle),
      };

  const viewButtonProps = isPreviewMode
    ? { disabled: true }
    : {
        onClick: handleOpenModal,
      };

  const handleFinishedCardClick = (event) => {
    if (!isFinished || isPreviewMode) return;
    const interactiveTarget = event.target.closest(
      "button, a, input, select, textarea, [data-prevent-flip='true']"
    );
    if (interactiveTarget && interactiveTarget !== event.currentTarget) {
      return;
    }
    setShowPrizeSide((previous) => !previous);
  };

  const handleFinishedCardKeyDown = (event) => {
    if (!isFinished || isPreviewMode) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setShowPrizeSide((previous) => !previous);
    }
  };

  const finishedInteractionProps =
    !isFinished || isPreviewMode
      ? {}
      : {
          onClick: handleFinishedCardClick,
          onKeyDown: handleFinishedCardKeyDown,
          role: "button",
          tabIndex: 0,
          "aria-pressed": showPrizeSide ? "true" : "false",
          "aria-label": showPrizeSide
            ? `Mostrar ganadores del sorteo ${raffle.title}`
            : `Mostrar premios del sorteo ${raffle.title}`,
        };

  const cardClassName = useMemo(() => {
    const classes = ["raffle-card"];
    if (!isFinished) {
      classes.unshift("card");
    }
    if (isFinished) {
      classes.push("raffle-card--finished");
    } else if (isSoon) {
      classes.push("raffle-card--soon");
    }
    if (isFinished && showPrizeSide) {
      classes.push("raffle-card--show-prizes");
    }
    if (isVanishing) {
      classes.push("raffle-card--vanish");
    }
    return classes.join(" ");
  }, [isFinished, isSoon, isVanishing, showPrizeSide]);

  const measureActiveSide = useCallback(() => {
    if (!isFinished) return;
    const activeShell = showPrizeSide
      ? backShellRef.current
      : frontShellRef.current;
    if (!activeShell) return;
    const nextHeight =
      activeShell.scrollHeight ||
      activeShell.offsetHeight ||
      activeShell.getBoundingClientRect?.().height ||
      0;
    if (!nextHeight) return;
    setFlipHeight((previous) =>
      previous === nextHeight ? previous : nextHeight
    );
  }, [isFinished, showPrizeSide]);

  useLayoutEffect(() => {
    if (!isFinished) return;
    measureActiveSide();
  }, [isFinished, measureActiveSide, showPrizeSide, winners, prizes]);

  useEffect(() => {
    if (!isFinished || typeof window === "undefined") {
      return undefined;
    }
    const handleResize = () => {
      measureActiveSide();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [isFinished, measureActiveSide]);

  return (
    <article
      aria-hidden={isPreviewMode ? "true" : undefined}
      className={cardClassName}
      {...finishedInteractionProps}
    >
      {isFinished ? (
        <div
          className="raffle-card__flip"
          data-testid="raffle-card-flip"
          data-active-face={showPrizeSide ? "back" : "front"}
          style={
            flipHeight
              ? {
                  height: `${flipHeight}px`,
                }
              : undefined
          }
        >
          <div className="raffle-card__flip-inner">
            <div
              className="raffle-card__side raffle-card__side--front"
              aria-hidden={showPrizeSide}
              role="group"
              aria-label={`Ganadores del sorteo ${raffle.title}`}
            >
              <div
                ref={frontShellRef}
                className="raffle-card__shell raffle-card__shell--finished"
                data-testid="raffle-card-shell"
              >
                <div className="raffle-card__side-content">
                  <div className="raffle-card__info">
                    <span
                      className="raffle-card__badge raffle-card__badge--finished"
                      aria-label={`Fecha y hora del sorteo: ${formatDateEs(
                        raffle.datetime
                      )}`}
                      style={{ marginBottom: "0.5rem" }}
                    >
                      <time dateTime={new Date(raffle.datetime).toISOString()}>
                        {formatDateEs(raffle.datetime)}
                      </time>
                    </span>

                    <h3
                      className="raffle-card__title"
                      style={{ marginTop: "0.35rem" }}
                    >
                      {raffle.title}
                    </h3>

                    {winners.length === 0 ? (
                      <div className="raffle-card__highlight-placeholder">
                        Próximamente publicaremos los ganadores.
                      </div>
                    ) : (
                      <ol className="raffle-card__highlight-list">
                        {winners.map((winner, index) => (
                          <li
                            key={`${winner}-${index}`}
                            className="raffle-card__highlight-item"
                          >
                            <span
                              className="raffle-card__highlight-leading"
                            >
                              <span
                                aria-hidden="true"
                                className={`raffle-card__position-pill ${
                                  index === 0
                                    ? "raffle-card__position-pill--top"
                                    : "raffle-card__position-pill--regular"
                                }`}
                                title={`Puesto ${index + 1}`}
                              >
                                {index + 1}
                              </span>
                              <span className="raffle-card__highlight-leading-text">
                                {winner}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>

                  <div className="raffle-card__cta">
                    <button
                      ref={!showPrizeSide ? openButtonRef : null}
                      type="button"
                      className={viewButtonClass}
                      style={viewButtonStyle}
                      title="Ver información del sorteo"
                      aria-label={`Ver detalles del sorteo ${raffle.title}`}
                      data-prevent-flip="true"
                      {...viewButtonProps}
                    >
                      Ver sorteo
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="raffle-card__side raffle-card__side--back"
              aria-hidden={!showPrizeSide}
              role="group"
              aria-label={`Premios del sorteo ${raffle.title}`}
            >
              <div
                ref={backShellRef}
                className="raffle-card__shell raffle-card__shell--finished"
                data-testid="raffle-card-shell"
              >
                <div className="raffle-card__side-content">
                  <div className="raffle-card__info">
                    <span
                      className="raffle-card__badge raffle-card__badge--finished"
                      aria-label={`Fecha y hora del sorteo: ${formatDateEs(
                        raffle.datetime
                      )}`}
                      style={{ marginBottom: "0.5rem" }}
                    >
                      <time dateTime={new Date(raffle.datetime).toISOString()}>
                        {formatDateEs(raffle.datetime)}
                      </time>
                    </span>

                    <h3
                      className="raffle-card__title"
                      style={{ marginTop: "0.35rem" }}
                    >
                      {raffle.title}
                    </h3>

                    {prizes.length === 0 ? (
                      <div className="raffle-card__highlight-placeholder">
                        No hay premios registrados para este sorteo.
                      </div>
                    ) : (
                      <ol className="raffle-card__highlight-list">
                        {prizes.map((prize, index) => (
                          <li
                            key={`${prize?.title ?? "premio"}-${index}`}
                            className="raffle-card__highlight-item"
                          >
                            <span
                              aria-hidden="true"
                              className={`raffle-card__position-pill ${
                                index === 0
                                  ? "raffle-card__position-pill--top"
                                  : "raffle-card__position-pill--regular"
                              }`}
                              title={`Premio ${index + 1}`}
                            >
                              {index + 1}
                            </span>

                            <span className="raffle-card__prize-name">
                              {prize?.title ?? "Premio sin nombre"}
                            </span>
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>

                  <div className="raffle-card__cta">
                    <button
                      ref={showPrizeSide ? openButtonRef : null}
                      type="button"
                      className={viewButtonClass}
                      style={viewButtonStyle}
                      title="Ver información del sorteo"
                      aria-label={`Ver detalles del sorteo ${raffle.title}`}
                      data-prevent-flip="true"
                      {...viewButtonProps}
                    >
                      Ver sorteo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="raffle-card__shell">
          <span
            className="raffle-card__badge"
            aria-label={`Fecha y hora del sorteo: ${formatDateEs(
              raffle.datetime
            )}`}
          >
            <time dateTime={new Date(raffle.datetime).toISOString()}>
              {formatDateEs(raffle.datetime)}
            </time>
          </span>

          <h3 className="raffle-card__title">{raffle.title}</h3>

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

          <span className="visually-hidden" aria-live="polite">
            Tiempo restante: {timeLeft.days} días, {timeLeft.hours} horas y{" "}
            {timeLeft.minutes} minutos.
          </span>

          <div
            className="card-actions"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: "0.6rem",
              alignItems: "stretch",
            }}
          >
            <button
              type="button"
              className="button button--ghost"
              style={{ width: "100%" }}
              title="Abrir formulario para recibir recordatorios por correo"
              aria-label={`Recibir recordatorio por email del sorteo ${raffle.title}`}
              {...reminderButtonProps}
            >
              Avisarme por email
            </button>

            <button
              ref={openButtonRef}
              type="button"
              className={viewButtonClass}
              style={viewButtonStyle}
              title="Ver información del sorteo"
              aria-label={`Ver detalles del sorteo ${raffle.title}`}
              {...viewButtonProps}
            >
              Ver sorteo
            </button>
          </div>
        </div>
      )}

      {!isPreviewMode && modalOpen && (
        <RaffleDetailsModal
          raffle={raffle}
          isFinished={isFinished}
          participantsCount={participantsCount}
          onClose={handleCloseModal}
          returnFocusRef={openButtonRef}
        />
      )}

      {!isPreviewMode && showConfetti && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: CONFETTI_SLOTS }).map((_, index) => (
            <span key={index} style={{ left: `${3 + index * 7}%` }}>
              {CONFETTI_EMOJIS[index % CONFETTI_EMOJIS.length]}
            </span>
          ))}
        </div>
      )}
    </article>
  );
};

RaffleCard.propTypes = {
  raffle: rafflePropType.isRequired,
  onMarkFinished: PropTypes.func,
  onRequestReminder: PropTypes.func.isRequired,
  interactionMode: PropTypes.oneOf(["active", "preview"]),
};

RaffleCard.defaultProps = {
  onMarkFinished: undefined,
  interactionMode: "active",
};

export default RaffleCard;
