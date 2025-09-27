import React, { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { formatDateEs, getTimeParts } from "../../utils/raffleUtils"; // sin generación de ganadores

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

  // Actualizar countdown y marcar finalizado cuando corresponda
  useEffect(() => {
    const update = () => {
      const parts = getTimeParts(raffle.datetime);
      setTimeLeft(parts);
      if (parts.diff <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        setIsFinished(true);
        setShowConfetti(true);
        if (onMarkFinished) onMarkFinished(raffle.id);
      }
    };
    update();
    const timerId = window.setInterval(update, 1000);
    return () => window.clearInterval(timerId);
  }, [raffle.id, raffle.datetime, onMarkFinished]);

  // Mantener sincronía con estado de backend
  useEffect(() => {
    finishedRef.current = raffle.finished;
    setIsFinished(raffle.finished);
  }, [raffle.finished]);

  // Ocultar confetti
  useEffect(() => {
    if (!showConfetti) return undefined;
    const timeoutId = window.setTimeout(() => setShowConfetti(false), 900);
    return () => window.clearTimeout(timeoutId);
  }, [showConfetti]);

  // Cerrar modal si cambia de sorteo
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

  // Estado visual “soon” para sorteos que comienzan en < 60 minutos
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

      {/* Contador (solo presentacional) */}
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

      {/* Resumen accesible (no anuncia cada segundo) */}
      <span className="visually-hidden" aria-live="polite">
        Tiempo restante: {timeLeft.days} días, {timeLeft.hours} horas y{" "}
        {timeLeft.minutes} minutos.
      </span>

      {/* Acciones apiladas */}
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
          ref={openBtnRef}
          type="button"
          className="button button--ghost"
          style={{ width: "100%" }}
          onClick={() => setModalOpen(true)}
          title="Ver información del sorteo"
          aria-label={`Ver detalles del sorteo ${raffle.title}`}
        >
          Ver sorteo
        </button>

        <button
          type="button"
          className="button button--primary"
          style={{ width: "100%" }}
          onClick={() => onRequestReminder(raffle)}
          title="Abrir formulario para recibir recordatorios por correo"
          aria-label={`Recibir recordatorio por email del sorteo ${raffle.title}`}
        >
          Avisarme por email
        </button>
      </div>

      {modalOpen && (
        <MemoizedRaffleDetailsModal
          raffle={raffle} // objeto estable
          isFinished={isFinished}
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
  isFinished,
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

  // --------- ESTADOS UI AVANZADOS ----------
  const [query, setQuery] = useState("");
  const [showAllParticipants, setShowAllParticipants] = useState(false);

  // Foco + bloqueo de scroll (solo al montar/desmontar)
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
      if (trigger && typeof trigger.focus === "function") trigger.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 👈 vacío para no re-ejecutar al re-renderizar

  // Ganadores desde backend (solo mostrar si finalizado y hay winners)
  const hasWinners =
    (raffle.finished || isFinished) &&
    Array.isArray(raffle.winners) &&
    raffle.winners.length > 0;

  // Filtro de participantes (case-insensitive, trim)
  const filteredParticipants = useMemo(() => {
    const base = Array.isArray(raffle.participants) ? raffle.participants : [];
    const q = query.trim().toLowerCase();
    if (!q) return base;
    return base.filter((p) => String(p).toLowerCase().includes(q));
  }, [raffle.participants, query]);

  // Compactar lista: mostrar primeros N por defecto
  const DEFAULT_COMPACT_COUNT = 24;
  const visibleParticipants = useMemo(() => {
    if (showAllParticipants) return filteredParticipants;
    return filteredParticipants.slice(0, DEFAULT_COMPACT_COUNT);
  }, [filteredParticipants, showAllParticipants]);

  // ---- ESTILOS INLINE ----
  // Contenedor del modal en columna, con header/footer fijos y body scrollable
  const modalContentStyle = {
    width: "min(720px, 100%)",
    maxHeight: "90vh",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    overscrollBehavior: "contain",
  };
  const stickyHeaderStyle = {
    position: "sticky",
    top: 0,
    zIndex: 2,
    background: "var(--surface, #fff)",
    borderBottom: "1px solid rgba(15,40,105,0.08)",
  };
  const stickyFooterStyle = {
    position: "sticky",
    bottom: 0,
    zIndex: 2,
    background: "var(--surface, #fff)",
    borderTop: "1px solid rgba(15,40,105,0.08)",
  };
  const modalScrollAreaStyle = {
    flex: 1,
    overflow: "auto",
    paddingRight: "2px",
    overscrollBehavior: "contain",
  };
  const modalHeaderInfoStyle = {
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
    alignItems: "center",
  };
  const stateBadgeStyle = (kind) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: "0.4rem",
    padding: "0.25rem 0.6rem",
    borderRadius: "999px",
    fontSize: "0.75rem",
    border:
      kind === "ok"
        ? "1px solid rgba(33, 150, 83, 0.35)"
        : "1px solid rgba(13, 71, 161, 0.25)",
    background: kind === "ok" ? "rgba(33,150,83,0.08)" : "rgba(13,71,161,0.06)",
    color: kind === "ok" ? "#1f9d5a" : "var(--brand-700)",
    whiteSpace: "nowrap",
  });
  const bodyGridStyle = {
    display: "grid",
    gap: "0.9rem",
    paddingTop: "0.75rem",
  };
  const participantsScroll = {
    maxHeight: "260px",
    overflow: "auto",
    paddingRight: "0.25rem",
    borderRadius: "0.65rem",
    border: "1px solid var(--border)",
    background: "var(--surface)",
    overscrollBehavior: "contain",
  };
  const winnersListStyle = { display: "grid", gap: "0.5rem" };
  const winnerCardStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.6rem 0.75rem",
    borderRadius: "0.75rem",
    background:
      "linear-gradient(180deg, rgba(234,244,255,0.7) 0%, rgba(255,255,255,1) 100%)",
    border: "1px solid rgba(13,71,161,0.12)",
  };
  const prizePillStyle = {
    fontSize: "0.75rem",
    padding: "0.25rem 0.5rem",
    borderRadius: "999px",
    background: "var(--brand-50)",
    color: "var(--brand-700)",
    border: "1px solid rgba(13,71,161,0.18)",
    whiteSpace: "nowrap",
  };

  return createPortal(
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={descId}
    >
      <div className="modal__overlay" onClick={onClose} />

      <div
        className="modal__content raffle-modal"
        role="document"
        ref={panelRef}
        onClick={(e) => e.stopPropagation()}
        style={modalContentStyle}
      >
        {/* HEADER FIJO */}
        <header
          className="modal__header"
          style={{ ...stickyHeaderStyle, alignItems: "center" }}
        >
          <div style={{ display: "grid", gap: "0.25rem" }}>
            <h3 id={titleId} className="modal__title" style={{ margin: 0 }}>
              {raffle.title}
            </h3>
            <div style={modalHeaderInfoStyle}>
              <span
                aria-hidden="true"
                style={stateBadgeStyle(
                  raffle.finished || isFinished ? "ok" : "info"
                )}
              >
                {raffle.finished || isFinished ? "Finalizado" : "Activo"}
              </span>
              <span
                className="legend"
                style={{
                  color: "var(--text-secondary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <span aria-hidden="true">🗓️</span>
                <time dateTime={new Date(raffle.datetime).toISOString()}>
                  {formatDateEs(raffle.datetime)}
                </time>
              </span>
              <span
                className="legend"
                style={{ color: "var(--text-secondary)" }}
              >
                Participantes: {participantsCount}
              </span>
            </div>
          </div>
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

        {/* ÁREA SCROLLABLE */}
        <div
          className="modal__body"
          id={descId}
          style={{ ...bodyGridStyle, ...modalScrollAreaStyle }}
        >
          {hasWinners && (
            <section className="modal__section">
              <h4 style={{ marginTop: 0 }}>Ganadores</h4>
              <div style={winnersListStyle}>
                {raffle.winners.map((winner, index) => {
                  const prize = Array.isArray(raffle.prizes)
                    ? raffle.prizes[index]
                    : null;
                  const prizeTitle = prize && prize.title ? prize.title : null;
                  return (
                    <div key={`${winner}-${index}`} style={winnerCardStyle}>
                      <div style={{ display: "grid", gap: "0.2rem" }}>
                        <strong style={{ fontSize: "0.95rem" }}>
                          {index + 1}. {winner}
                        </strong>
                        {prizeTitle && (
                          <span
                            className="legend"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            Premio: {prizeTitle}
                          </span>
                        )}
                      </div>
                      {prizeTitle && (
                        <span style={prizePillStyle}>Puesto {index + 1}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="modal__section">
            <h4 style={{ marginTop: 0 }}>Descripción</h4>
            <p className="modal__text">
              {raffle.description || "Sin descripción disponible."}
            </p>
          </section>

          <section className="modal__section">
            <h4 style={{ marginTop: 0 }}>Premios</h4>
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
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.6rem",
              }}
            >
              <h4 style={{ margin: 0 }}>
                Participantes ({filteredParticipants.length})
              </h4>
              <div
                style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              >
                <input
                  className="input"
                  type="search"
                  placeholder="Buscar participante…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ width: "220px" }}
                  aria-label="Buscar participante"
                />
                {filteredParticipants.length > DEFAULT_COMPACT_COUNT && (
                  <button
                    type="button"
                    className="button button--subtle"
                    onClick={() => setShowAllParticipants((s) => !s)}
                    aria-pressed={showAllParticipants}
                    aria-label={
                      showAllParticipants
                        ? "Mostrar menos participantes"
                        : "Mostrar todos los participantes"
                    }
                  >
                    {showAllParticipants ? "Mostrar menos" : "Mostrar todos"}
                  </button>
                )}
              </div>
            </div>

            <div style={{ marginTop: "0.6rem", ...participantsScroll }}>
              {visibleParticipants.length > 0 ? (
                <ul
                  className="modal__list"
                  style={{
                    margin: 0,
                    padding: "0.5rem 0.6rem",
                    display: "grid",
                    gap: "0.35rem",
                  }}
                >
                  {visibleParticipants.map((participant) => (
                    <li key={participant}>{participant}</li>
                  ))}
                </ul>
              ) : (
                <p
                  className="modal__text modal__text--muted"
                  style={{ padding: "0.5rem 0.6rem" }}
                >
                  {query ? "No hay coincidencias." : "Sin participantes aún."}
                </p>
              )}
            </div>
          </section>
        </div>

        {/* FOOTER FIJO */}
        <div
          className="modal__footer"
          style={{ ...stickyFooterStyle, justifyContent: "flex-end" }}
        >
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

// Evitar re-renders innecesarios del modal
const MemoizedRaffleDetailsModal = React.memo(
  RaffleDetailsModal,
  (prev, next) =>
    prev.raffle?.id === next.raffle?.id &&
    prev.isFinished === next.isFinished &&
    prev.participantsCount === next.participantsCount
);

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
    winners: PropTypes.arrayOf(PropTypes.string), // provistos por backend
  }).isRequired,
  onLive: PropTypes.func, // compatibilidad
  onMarkFinished: PropTypes.func,
  onRequestReminder: PropTypes.func.isRequired,
};

RaffleCard.defaultProps = {
  onLive: undefined,
  onMarkFinished: undefined,
};

export default RaffleCard;
