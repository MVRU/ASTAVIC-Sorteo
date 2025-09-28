// src/components/public/RaffleCard.js
import React, { useEffect, useRef, useState, useMemo } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import { formatDateEs, getTimeParts } from "../../utils/raffleUtils";

const emojiSet = ["\u{1F389}", "\u{1F38A}", "\u{2728}", "\u{1F388}"];

// Duración de la animación de salida (coordina con CSS .raffle-card--vanish)
const VANISH_MS = 1000;

const RaffleCard = ({ raffle, onLive, onMarkFinished, onRequestReminder }) => {
  const [timeLeft, setTimeLeft] = useState(() => getTimeParts(raffle.datetime));
  const [isFinished, setIsFinished] = useState(
    () => raffle.finished || timeLeft.diff <= 0
  );
  const [showConfetti, setShowConfetti] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Estado para animar la salida antes de que el padre quite la card
  const [isVanishing, setIsVanishing] = useState(false);

  const finishedRef = useRef(isFinished);
  const openBtnRef = useRef(null);
  const vanishTimerRef = useRef(null);
  const confettiTimerRef = useRef(null);

  // Actualizar countdown y marcar finalizado cuando corresponda
  useEffect(() => {
    const update = () => {
      const parts = getTimeParts(raffle.datetime);
      setTimeLeft(parts);
      if (parts.diff <= 0 && !finishedRef.current) {
        finishedRef.current = true;
        setIsFinished(true);

        // 1) Mostrar confetti
        setShowConfetti(true);

        // 2) Animar salida
        setIsVanishing(true);

        // 3) Al terminar la animación, informar al padre para mover a "finalizados"
        if (onMarkFinished) {
          vanishTimerRef.current = window.setTimeout(() => {
            onMarkFinished(raffle.id);
          }, VANISH_MS);
        }
      }
    };
    update();
    const timerId = window.setInterval(update, 1000);
    return () => window.clearInterval(timerId);
  }, [raffle.id, raffle.datetime, onMarkFinished]);

  // Mantener sincronía con estado externo
  useEffect(() => {
    finishedRef.current = raffle.finished;
    setIsFinished(raffle.finished);
  }, [raffle.finished]);

  // Ocultar confetti
  useEffect(() => {
    if (!showConfetti) return undefined;
    confettiTimerRef.current = window.setTimeout(
      () => setShowConfetti(false),
      1200
    );
    return () => {
      if (confettiTimerRef.current)
        window.clearTimeout(confettiTimerRef.current);
    };
  }, [showConfetti]);

  // Cerrar modal si cambia de sorteo
  useEffect(() => {
    setModalOpen(false);
  }, [raffle.id]);

  // Limpieza de timers
  useEffect(() => {
    return () => {
      if (vanishTimerRef.current) window.clearTimeout(vanishTimerRef.current);
      if (confettiTimerRef.current)
        window.clearTimeout(confettiTimerRef.current);
    };
  }, []);

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

  // Botón "Ver sorteo": dorado/premium si finalizado
  const viewBtnClass = isFinished
    ? "button button--gold"
    : "button button--primary";
  const viewBtnStyle = isFinished
    ? {
        width: "100%",
        background: "linear-gradient(180deg, #f7d774 0%, #e9b949 100%)",
        color: "#3b2f0b",
        boxShadow:
          "0 10px 24px rgba(233,185,73,0.28), inset 0 1px 0 rgba(255,255,255,0.38)",
        border: "1px solid rgba(185,141,35,0.35)",
      }
    : { width: "100%" };

  // Lista de ganadores para cards finalizadas
  const WinnersInline = () => {
    const winners = Array.isArray(raffle.winners) ? raffle.winners : [];
    if (winners.length === 0) {
      return (
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
      );
    }

    return (
      <ol
        style={{
          listStyle: "none",
          margin: "0.6rem 0 0",
          padding: 0,
          display: "grid",
          gap: "0.6rem",
        }}
      >
        {winners.map((name, idx) => (
          <li
            key={`${name}-${idx}`}
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
                    idx === 0
                      ? "linear-gradient(180deg,#f7d774 0%, #e9b949 100%)"
                      : "linear-gradient(180deg,#fff1a6 0%, #ffe476 100%)",
                  border:
                    idx === 0
                      ? "1px solid rgba(185,141,35,0.45)"
                      : "1px solid rgba(185,141,35,0.32)",
                  color: "#3b2f0b",
                  fontSize: "0.9rem",
                  fontWeight: 800,
                }}
                title={`Puesto ${idx + 1}`}
              >
                {idx + 1}
              </span>
              {name}
            </span>
          </li>
        ))}
      </ol>
    );
  };

  // ======== RENDER ========
  const finishedHorizontalStyles = isFinished
    ? {
        // fondo premium dorado sutil
        background:
          "linear-gradient(90deg, rgba(247,215,116,0.14) 0%, rgba(255,255,255,0.92) 100%)",
        border: "1px solid rgba(185,141,35,0.28)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
      }
    : {};

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
        ...(finishedHorizontalStyles || {}),
        padding: isFinished ? "1rem" : undefined,
      }}
    >
      {/** LAYOUT HORIZONTAL para finalizados */}
      {isFinished ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "stretch",
            gap: "1rem",
          }}
        >
          {/* COLUMNA IZQUIERDA: fecha, título, ganadores */}
          <div style={{ flex: "1 1 260px", minWidth: "220px" }}>
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

            <h3 className="raffle-card__title" style={{ marginTop: "0.35rem" }}>
              {raffle.title}
            </h3>

            {/* Lista premium de ganadores */}
            <WinnersInline />
          </div>

          {/* COLUMNA DERECHA: botón dorado */}
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
              ref={openBtnRef}
              type="button"
              className={viewBtnClass}
              style={viewBtnStyle}
              onClick={() => setModalOpen(true)}
              title="Ver información del sorteo"
              aria-label={`Ver detalles del sorteo ${raffle.title}`}
            >
              Ver sorteo
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* LAYOUT VERTICAL para activos */}
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

          {/* Countdown */}
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
              ref={openBtnRef}
              type="button"
              className={viewBtnClass}
              style={viewBtnStyle}
              onClick={() => setModalOpen(true)}
              title="Ver información del sorteo"
              aria-label={`Ver detalles del sorteo ${raffle.title}`}
            >
              Ver sorteo
            </button>
          </div>
        </>
      )}

      {/* MODAL */}
      {modalOpen && (
        <MemoizedRaffleDetailsModal
          raffle={raffle}
          isFinished={isFinished}
          participantsCount={participantsCount}
          onClose={() => setModalOpen(false)}
          returnFocusRef={openBtnRef}
        />
      )}

      {/* CONFETTI */}
      {showConfetti && (
        <div className="confetti" aria-hidden="true">
          {Array.from({ length: 14 }).map((_, index) => (
            <span key={index} style={{ left: `${3 + index * 7}%` }}>
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
    const triggerEl = returnFocusRef?.current;

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const prev = previousBodyStyle.current;
      document.body.style.overflow = prev.overflow;
      document.body.style.position = prev.position;
      document.body.style.top = prev.top;
      document.body.style.width = prev.width;
      window.scrollTo({ top: lastScrollY.current });

      if (triggerEl && typeof triggerEl.focus === "function") triggerEl.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 👈 vacío para no re-ejecutar al re-renderizar

  // ¿Finalizado?
  const isFinal = raffle.finished || isFinished;

  // Ganadores desde backend (solo mostrar si finalizado y hay winners)
  const hasWinners =
    isFinal && Array.isArray(raffle.winners) && raffle.winners.length > 0;

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
                style={stateBadgeStyle(isFinal ? "ok" : "info")}
              >
                {isFinal ? "Finalizado" : "Activo"}
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
          {/* Descripción */}
          <section className="modal__section">
            <h4 style={{ marginTop: 0 }}>Descripción</h4>
            <p className="modal__text">
              {raffle.description || "Sin descripción disponible."}
            </p>
          </section>

          {/* Ganadores si está finalizado */}
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

          {/* Premios si NO está finalizado */}
          {!isFinal && (
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
          )}

          {/* Participantes (siempre) */}
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
