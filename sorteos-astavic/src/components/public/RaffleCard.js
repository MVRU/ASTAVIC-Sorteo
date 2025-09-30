// src/components/public/RaffleCard.js
// ! DECISIÓN DE DISEÑO: Centralizamos la tarjeta y su modal para mantener consistencia entre público y administración.
// * Separamos efectos intensivos (countdown, transición y modal) en helpers locales para mejorar legibilidad y mantenimiento.
// -!- Riesgo: Los temporizadores dependen de window; en SSR deben aislarse antes de montar en cliente.
import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { formatDateEs, getTimeParts } from "../../utils/raffleUtils";
import rafflePropType from "./rafflePropType";
import RaffleDetailsModal from "./RaffleDetailsModal";

const CONFETTI_EMOJIS = ["\u{1F389}", "\u{1F38A}", "\u{2728}", "\u{1F388}"];
const CONFETTI_SLOTS = 14;
const VANISH_MS = 1000;

const RaffleCard = ({ raffle, onMarkFinished, onRequestReminder }) => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeParts(raffle.datetime));
  const [isFinished, setIsFinished] = useState(() =>
    raffle.finished || timeLeft.diff <= 0
  );
  const [isVanishing, setIsVanishing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const finishedRef = useRef(isFinished);
  const openButtonRef = useRef(null);
  const vanishTimerRef = useRef(null);
  const confettiTimerRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

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
  }, [raffle.datetime, raffle.id, onMarkFinished]);

  useEffect(() => {
    finishedRef.current = raffle.finished;
    setIsFinished(raffle.finished);
  }, [raffle.finished]);

  useEffect(() => {
    if (!showConfetti || typeof window === "undefined") return undefined;
    confettiTimerRef.current = window.setTimeout(() => setShowConfetti(false), 1200);
    return () => {
      if (confettiTimerRef.current) {
        window.clearTimeout(confettiTimerRef.current);
      }
    };
  }, [showConfetti]);

  useEffect(() => () => {
    if (vanishTimerRef.current && typeof window !== "undefined") {
      window.clearTimeout(vanishTimerRef.current);
    }
    if (confettiTimerRef.current && typeof window !== "undefined") {
      window.clearTimeout(confettiTimerRef.current);
    }
  }, []);

  useEffect(() => {
    const initialParts = getTimeParts(raffle.datetime);
    setTimeLeft(initialParts);
    const initialFinished = raffle.finished || initialParts.diff <= 0;
    finishedRef.current = initialFinished;
    setIsFinished(initialFinished);
    setIsVanishing(false);
    setShowConfetti(false);
    setModalOpen(false);
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

  const isSoon = useMemo(() => {
    if (isFinished) return false;
    return timeLeft.diff > 0 && timeLeft.diff <= 60 * 60 * 1000;
  }, [isFinished, timeLeft.diff]);

  const viewButtonClass = isFinished
    ? "button button--gold"
    : "button button--primary";
  const viewButtonStyle = isFinished
    ? {
        width: "100%",
        background: "linear-gradient(180deg, #f7d774 0%, #e9b949 100%)",
        color: "#3b2f0b",
        boxShadow:
          "0 10px 24px rgba(233,185,73,0.28), inset 0 1px 0 rgba(255,255,255,0.38)",
        border: "1px solid rgba(185,141,35,0.35)",
      }
    : { width: "100%" };

  const handleOpenModal = () => setModalOpen(true);
  const handleCloseModal = () => setModalOpen(false);

  return (
    <article
      className={`card raffle-card${
        isFinished
          ? " raffle-card--finished raffle-card--finished-horizontal"
          : isSoon
          ? " raffle-card--soon"
          : ""
      }${isVanishing ? " raffle-card--vanish" : ""}`}
      style={{
        ...(isFinished
          ? {
              background:
                "linear-gradient(90deg, rgba(247,215,116,0.14) 0%, rgba(255,255,255,0.92) 100%)",
              border: "1px solid rgba(185,141,35,0.28)",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              padding: "1rem",
            }
          : {}),
      }}
    >
      {isFinished ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "stretch",
            gap: "1rem",
          }}
        >
          <div style={{ flex: "1 1 260px", minWidth: "220px" }}>
            <span
              className="raffle-card__badge raffle-card__badge--finished"
              aria-label={`Fecha y hora del sorteo: ${formatDateEs(raffle.datetime)}`}
              style={{ marginBottom: "0.5rem" }}
            >
              <time dateTime={new Date(raffle.datetime).toISOString()}>
                {formatDateEs(raffle.datetime)}
              </time>
            </span>

            <h3 className="raffle-card__title" style={{ marginTop: "0.35rem" }}>
              {raffle.title}
            </h3>

            {winners.length === 0 ? (
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "0.75rem",
                  borderRadius: "0.85rem",
                  border: "1px dashed rgba(185,141,35,0.35)",
                  background:
                    "linear-gradient(180deg, rgba(247,215,116,0.12) 0%, rgba(255,255,255,0.6) 100%)",
                  color: "var(--text-secondary)",
                  textAlign: "center",
                  fontSize: "0.95rem",
                }}
              >
                Próximamente publicaremos los ganadores.
              </div>
            ) : (
              <ol
                style={{
                  listStyle: "none",
                  margin: "0.6rem 0 0",
                  padding: 0,
                  display: "grid",
                  gap: "0.6rem",
                }}
              >
                {winners.map((winner, index) => (
                  <li
                    key={`${winner}-${index}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: "0.6rem",
                      padding: "0.55rem 0.7rem",
                      borderRadius: "0.85rem",
                      background:
                        "linear-gradient(180deg, rgba(247,215,116,0.18) 0%, rgba(255,255,255,0.85) 100%)",
                      border: "1px solid rgba(185,141,35,0.28)",
                      boxShadow:
                        "0 3px 10px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.65)",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        fontWeight: 700,
                        color: "var(--brand-700)",
                      }}
                    >
                      <span
                        aria-hidden="true"
                        style={{
                          display: "inline-grid",
                          placeItems: "center",
                          width: "28px",
                          height: "28px",
                          borderRadius: 999,
                          background:
                            index === 0
                              ? "linear-gradient(180deg,#f7d774 0%, #e9b949 100%)"
                              : "linear-gradient(180deg,#fff1a6 0%, #ffe476 100%)",
                          border:
                            index === 0
                              ? "1px solid rgba(185,141,35,0.45)"
                              : "1px solid rgba(185,141,35,0.32)",
                          color: "#3b2f0b",
                          fontSize: "0.9rem",
                          fontWeight: 800,
                        }}
                        title={`Puesto ${index + 1}`}
                      >
                        {index + 1}
                      </span>
                      {winner}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div
            style={{
              flex: "0 0 180px",
              minWidth: "180px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              gap: "0.6rem",
            }}
          >
            <button
              ref={openButtonRef}
              type="button"
              className={viewButtonClass}
              style={viewButtonStyle}
              onClick={handleOpenModal}
              title="Ver información del sorteo"
              aria-label={`Ver detalles del sorteo ${raffle.title}`}
            >
              Ver sorteo
            </button>
          </div>
        </div>
      ) : (
        <>
          <span
            className="raffle-card__badge"
            aria-label={`Fecha y hora del sorteo: ${formatDateEs(raffle.datetime)}`}
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
            Tiempo restante: {timeLeft.days} días, {timeLeft.hours} horas y {" "}
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
              onClick={() => onRequestReminder(raffle)}
              title="Abrir formulario para recibir recordatorios por correo"
              aria-label={`Recibir recordatorio por email del sorteo ${raffle.title}`}
            >
              Avisarme por email
            </button>

            <button
              ref={openButtonRef}
              type="button"
              className={viewButtonClass}
              style={viewButtonStyle}
              onClick={handleOpenModal}
              title="Ver información del sorteo"
              aria-label={`Ver detalles del sorteo ${raffle.title}`}
            >
              Ver sorteo
            </button>
          </div>
        </>
      )}

      {modalOpen && (
        <RaffleDetailsModal
          raffle={raffle}
          isFinished={isFinished}
          participantsCount={participantsCount}
          onClose={handleCloseModal}
          returnFocusRef={openButtonRef}
        />
      )}

      {showConfetti && (
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
};

RaffleCard.defaultProps = {
  onMarkFinished: undefined,
};

export default RaffleCard;
