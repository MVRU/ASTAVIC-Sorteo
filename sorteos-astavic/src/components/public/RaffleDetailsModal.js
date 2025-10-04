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
import "./RaffleDetailsModal.css";

const DEFAULT_COMPACT_COUNT = 24;

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

  const statusKind = isFinal ? "ok" : "info";

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
      >
        <header className="modal__header raffle-modal__header">
          <div className="raffle-modal__title-block">
            <h3 id={titleId} className="modal__title">
              {raffle.title}
            </h3>
            <div className="raffle-modal__meta">
              <span
                aria-hidden="true"
                className={`raffle-modal__status raffle-modal__status--${statusKind}`}
              >
                {isFinal ? "Finalizado" : "Activo"}
              </span>
              <span className="legend raffle-modal__meta-item">
                <Icon
                  name="calendarCheck"
                  decorative
                  size={18}
                  strokeWidth={1.9}
                  className="raffle-modal__meta-icon"
                />
                <time dateTime={new Date(raffle.datetime).toISOString()}>
                  {formatDateEs(raffle.datetime)}
                </time>
              </span>
              <span className="legend raffle-modal__meta-item">
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

        <div className="modal__body raffle-modal__body" id={descId}>
          <section className="modal__section">
            <h4 className="raffle-modal__section-title">Descripción</h4>
            <p className="modal__text">
              {raffle.description || "Sin descripción disponible."}
            </p>
          </section>

          {hasWinners && (
            <section className="modal__section">
              <h4 className="raffle-modal__section-title">Ganadores</h4>
              <div className="raffle-modal__winners-list">
                {raffle.winners.map((winner, index) => {
                  const prize = Array.isArray(raffle.prizes)
                    ? raffle.prizes[index]
                    : null;
                  const prizeTitle = prize && prize.title ? prize.title : null;
                  return (
                    <div
                      key={`${winner}-${index}`}
                      className="raffle-modal__winner-card"
                    >
                      <div className="raffle-modal__winner-content">
                        <strong className="raffle-modal__winner-name">
                          {index + 1}. {winner}
                        </strong>
                        {prizeTitle && (
                          <span className="raffle-modal__prize-pill">
                            {prizeTitle}
                          </span>
                        )}
                      </div>
                      <Icon
                        name="trophy"
                        decorative
                        size={22}
                        strokeWidth={1.6}
                        className="raffle-modal__winner-icon"
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <section className="modal__section">
            <div className="raffle-modal__participants-header">
              <h4 className="raffle-modal__participants-title">
                Participantes ({filteredParticipants.length})
              </h4>
              <div className="raffle-modal__participants-actions">
                <input
                  className="input raffle-modal__search"
                  type="search"
                  placeholder="Buscar participante…"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
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

            <div className="raffle-modal__participants-shell">
              {visibleParticipants.length > 0 ? (
                <ul className="modal__list raffle-modal__participants-list">
                  {visibleParticipants.map((participant) => (
                    <li key={participant}>{participant}</li>
                  ))}
                </ul>
              ) : (
                <p className="modal__text modal__text--muted raffle-modal__empty">
                  {query ? "No hay coincidencias." : "Sin participantes aún."}
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="modal__footer raffle-modal__footer">
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
