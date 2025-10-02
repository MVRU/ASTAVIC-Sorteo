// src/components/public/RaffleDetailsModal.js
// ! DECISIÓN DE DISEÑO: El modal reutiliza tokens de overlay, foco y tipografía para ofrecer detalle accesible del sorteo.

import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { formatDateEs } from "../../utils/raffleUtils";
import rafflePropType from "./rafflePropType";
import Icon from "../ui/Icon";
import useFocusTrap from "../../hooks/useFocusTrap";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";

const DEFAULT_COMPACT_COUNT = 24;
const MODAL_CONTENT_STYLE = {
  width: "min(720px, 100%)",
  maxHeight: "90vh",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  overscrollBehavior: "contain",
};
const STICKY_HEADER_STYLE = {
  position: "sticky",
  top: 0,
  zIndex: 2,
  background: "var(--color-bg-surface)",
  borderBottom: "1px solid rgba(15,40,105,0.08)",
};
const STICKY_FOOTER_STYLE = {
  position: "sticky",
  bottom: 0,
  zIndex: 2,
  background: "var(--color-bg-surface)",
  borderTop: "1px solid rgba(15,40,105,0.08)",
};
const MODAL_SCROLL_STYLE = {
  flex: 1,
  overflow: "auto",
  paddingRight: "2px",
  overscrollBehavior: "contain",
};
const HEADER_INFO_STYLE = {
  display: "flex",
  flexWrap: "wrap",
  gap: "0.5rem",
  alignItems: "center",
};
const PARTICIPANTS_SCROLL_STYLE = {
  maxHeight: "260px",
  overflow: "auto",
  paddingRight: "0.25rem",
  borderRadius: "0.65rem",
  border: "1px solid var(--color-border)",
  background: "var(--color-bg-surface)",
  overscrollBehavior: "contain",
};
const WINNERS_LIST_STYLE = { display: "grid", gap: "0.5rem" };
const WINNER_CARD_STYLE = {
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
const PRIZE_PILL_STYLE = {
  fontSize: "0.75rem",
  padding: "0.25rem 0.5rem",
  borderRadius: "999px",
  background: "var(--brand-50)",
  color: "var(--brand-700)",
  border: "1px solid rgba(13,71,161,0.18)",
  whiteSpace: "nowrap",
};

const RaffleDetailsModal = ({
  raffle,
  isFinished,
  participantsCount,
  onClose,
  returnFocusRef,
}) => {
  const panelRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);
  const [query, setQuery] = useState("");
  const [showAllParticipants, setShowAllParticipants] = useState(false);
  const titleId = `raffle-modal-title-${raffle.id}`;
  const descId = `raffle-modal-desc-${raffle.id}`;

  useBodyScrollLock(true);
  useFocusTrap(panelRef, true);

  useEffect(() => {
    if (typeof document === "undefined") {
      return undefined;
    }

    const triggerNode = returnFocusRef?.current || null;
    const activeElement = document.activeElement;
    previousFocusRef.current =
      activeElement && typeof activeElement.focus === "function"
        ? activeElement
        : null;

    closeButtonRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      const focusTarget = triggerNode || previousFocusRef.current;
      if (focusTarget && typeof focusTarget.focus === "function") {
        focusTarget.focus();
      }
      previousFocusRef.current = null;
    };
  }, [onClose, returnFocusRef]);

  const isFinal = raffle.finished || isFinished;
  const hasWinners = useMemo(
    () => isFinal && Array.isArray(raffle.winners) && raffle.winners.length > 0,
    [isFinal, raffle.winners]
  );

  const participants = useMemo(
    () => (Array.isArray(raffle.participants) ? raffle.participants : []),
    [raffle.participants]
  );

  const filteredParticipants = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return participants;
    return participants.filter((participant) =>
      String(participant).toLowerCase().includes(normalizedQuery)
    );
  }, [participants, query]);

  const visibleParticipants = useMemo(() => {
    if (showAllParticipants) return filteredParticipants;
    return filteredParticipants.slice(0, DEFAULT_COMPACT_COUNT);
  }, [filteredParticipants, showAllParticipants]);

  if (typeof document === "undefined") {
    return null;
  }

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
        onClick={(event) => event.stopPropagation()}
        style={MODAL_CONTENT_STYLE}
      >
        <header
          className="modal__header"
          style={{ ...STICKY_HEADER_STYLE, alignItems: "center" }}
        >
          <div style={{ display: "grid", gap: "0.25rem" }}>
            <h3 id={titleId} className="modal__title" style={{ margin: 0 }}>
              {raffle.title}
            </h3>
            <div style={HEADER_INFO_STYLE}>
              <span
                aria-hidden="true"
                style={stateBadgeStyle(isFinal ? "ok" : "info")}
              >
                {isFinal ? "Finalizado" : "Activo"}
              </span>
              <span
                className="legend"
                style={{
                  color: "var(--color-fg-secondary)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                }}
              >
                <Icon
                  name="calendarCheck"
                  decorative
                  size={18}
                  strokeWidth={1.9}
                />
                <time dateTime={new Date(raffle.datetime).toISOString()}>
                  {formatDateEs(raffle.datetime)}
                </time>
              </span>
              <span
                className="legend"
                style={{ color: "var(--color-fg-secondary)" }}
              >
                Participantes: {participantsCount}
              </span>
            </div>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="button button--ghost modal__close"
            aria-label="Cerrar detalles del sorteo"
            onClick={onClose}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </header>

        <div
          className="modal__body"
          id={descId}
          style={{
            display: "grid",
            gap: "0.9rem",
            paddingTop: "0.75rem",
            ...MODAL_SCROLL_STYLE,
          }}
        >
          <section className="modal__section">
            <h4 style={{ marginTop: 0 }}>Descripción</h4>
            <p className="modal__text">
              {raffle.description || "Sin descripción disponible."}
            </p>
          </section>

          {hasWinners && (
            <section className="modal__section">
              <h4 style={{ marginTop: 0 }}>Ganadores</h4>
              <div style={WINNERS_LIST_STYLE}>
                {raffle.winners.map((winner, index) => {
                  const prize = Array.isArray(raffle.prizes)
                    ? raffle.prizes[index]
                    : null;
                  const prizeTitle = prize && prize.title ? prize.title : null;
                  return (
                    <div key={`${winner}-${index}`} style={WINNER_CARD_STYLE}>
                      <div style={{ display: "grid", gap: "0.2rem" }}>
                        <strong style={{ fontSize: "0.95rem" }}>
                          {index + 1}. {winner}
                        </strong>
                        {prizeTitle && (
                          <span style={PRIZE_PILL_STYLE}>{prizeTitle}</span>
                        )}
                      </div>
                      <Icon
                        name="trophy"
                        decorative
                        size={22}
                        strokeWidth={1.6}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

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
                  onChange={(event) => setQuery(event.target.value)}
                  style={{ width: "220px" }}
                  aria-label="Buscar participante"
                />
                {filteredParticipants.length > DEFAULT_COMPACT_COUNT && (
                  <button
                    type="button"
                    className="button button--subtle"
                    onClick={() =>
                      setShowAllParticipants((current) => !current)
                    }
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

            <div style={{ marginTop: "0.6rem", ...PARTICIPANTS_SCROLL_STYLE }}>
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

        <div
          className="modal__footer"
          style={{ ...STICKY_FOOTER_STYLE, justifyContent: "flex-end" }}
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

RaffleDetailsModal.propTypes = {
  raffle: rafflePropType.isRequired,
  isFinished: PropTypes.bool,
  participantsCount: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  returnFocusRef: PropTypes.shape({ current: PropTypes.any }),
};

RaffleDetailsModal.defaultProps = {
  isFinished: false,
  returnFocusRef: null,
};

export default RaffleDetailsModal;
