import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import RaffleCard from "./RaffleCard";

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const raffleShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  datetime: PropTypes.string.isRequired,
  winnersCount: PropTypes.number.isRequired,
  participants: PropTypes.arrayOf(PropTypes.string).isRequired,
  prizes: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
    })
  ),
  finished: PropTypes.bool,
});

const PublicView = ({
  activeRaffles,
  finishedRaffles,
  onStartLive,
  onMarkFinished,
  onRegisterSubscriber,
  route,
}) => {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reminder, setReminder] = useState({ open: false, raffle: null });
  const emailFieldRef = useRef(null);
  const toastTimerRef = useRef(null);
  const isEmailValid = emailRegex.test(email.trim());
  const isFinishedRoute = route === "finished";
  const visibleRaffles = isFinishedRoute ? finishedRaffles : activeRaffles;
  const visibleCount = visibleRaffles.length;
  const sectionTitle = isFinishedRoute
    ? "Sorteos finalizados"
    : "Sorteos activos";
  const sectionSubtitle = isFinishedRoute
    ? "Revisá premios y ganadores de sorteos anteriores."
    : "Participá en los sorteos vigentes y pedí recordatorios por correo.";
  const emptyTitle = isFinishedRoute
    ? "Todavía no hay sorteos finalizados."
    : "No hay sorteos publicados en este momento.";
  const emptySubtitle = isFinishedRoute
    ? "Ni bien cerremos un sorteo, vas a ver el listado completo acá."
    : "Publicaremos nuevos sorteos en cuanto estén disponibles.";

  const handleCloseReminder = useCallback(() => {
    setReminder({ open: false, raffle: null });
    setToast(null);
  }, []);

  const handleReminder = useCallback((raffle) => {
    setReminder({ open: true, raffle: raffle || null });
    setToast(null);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const duration = toast.ok ? 3200 : 4200;
    toastTimerRef.current = window.setTimeout(() => setToast(null), duration);
    return () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    };
  }, [toast]);

  useEffect(() => {
    if (!reminder.open) {
      return undefined;
    }
    const handleKey = (event) => {
      if (event.key === "Escape") {
        handleCloseReminder();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [reminder.open, handleCloseReminder]);

  useEffect(() => {
    if (reminder.open) {
      const input = emailFieldRef.current;
      if (input) {
        input.focus();
      }
    }
  }, [reminder.open]);

  const showToast = useCallback((payload) => {
    setToast(payload);
  }, []);

  const handleSubmitSubscription = async (event) => {
    event.preventDefault();
    if (!isEmailValid) {
      showToast({ ok: false, message: "Ingresá un correo válido." });
      return;
    }
    try {
      setSubmitting(true);
      const result = await onRegisterSubscriber(email.trim(), reminder.raffle);
      showToast(result);
      if (result?.ok && !result?.reuse) setEmail("");
    } finally {
      setSubmitting(false);
    }
  };

  const renderRaffleGrid = (
    source,
    { allowMarkFinished } = { allowMarkFinished: true }
  ) => {
    if (source.length === 0) {
      return (
        <div
          className="empty-state card"
          role="status"
          style={{
            textAlign: "center",
            padding: "1.75rem",
            display: "grid",
            gap: "0.5rem",
            justifyItems: "center",
          }}
        >
          <p style={{ margin: 0 }}>{emptyTitle}</p>
          <p style={{ margin: 0, color: "var(--text-3,#666)" }}>
            {emptySubtitle}
          </p>
        </div>
      );
    }

    return (
      <div
        className="grid-raffles"
        role="list"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "0.9rem",
        }}
      >
        {source.map((raffle) => (
          <div role="listitem" key={raffle.id}>
            <RaffleCard
              raffle={raffle}
              onLive={onStartLive}
              onMarkFinished={allowMarkFinished ? onMarkFinished : undefined}
              onRequestReminder={handleReminder}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <>
      <section className="section-gap" aria-labelledby="raffles-heading">
        <div className="container">
          <div className="public-toolbar">
            <div>
              <h1 id="raffles-heading" className="section-title">
                {sectionTitle}
              </h1>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>
                {sectionSubtitle}
              </p>
            </div>
            <div className="public-toolbar__actions">
              <span className="tag tag--neutral">
                {visibleCount} {visibleCount === 1 ? "sorteo" : "sorteos"}
              </span>
              <button
                type="button"
                className="button button--ghost"
                onClick={() => handleReminder(null)}
              >
                Recordatorios por email
              </button>
            </div>
          </div>
          {renderRaffleGrid(visibleRaffles, {
            allowMarkFinished: !isFinishedRoute,
          })}
        </div>
      </section>{" "}
      {reminder.open &&
        createPortal(
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reminder-title"
            onClick={handleCloseReminder}
          >
            <div className="modal__overlay" />
            <div
              className="modal__content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal__header">
                <div>
                  <h3 id="reminder-title" className="modal__title">
                    Recibí recordatorios y resultados
                  </h3>
                  <p className="modal__desc">
                    Te avisamos cuando empiece el sorteo y compartimos el
                    listado de ganadores.
                  </p>
                  {reminder.raffle ? (
                    <>
                      <p className="legend" style={{ margin: 0 }}>
                        Aplicaremos este recordatorio para
                        <strong> {reminder.raffle.title}</strong>.
                      </p>
                      <button
                        type="button"
                        className="button button--ghost"
                        style={{
                          marginTop: "0.5rem",
                          padding: "0.25rem 0.5rem",
                        }}
                        onClick={() => {
                          setReminder({ open: true, raffle: null });
                          setToast(null);
                        }}
                      >
                        Recibir novedades generales
                      </button>
                    </>
                  ) : (
                    <p className="legend" style={{ margin: 0 }}>
                      Te enviaremos novedades generales de los próximos sorteos.
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={handleCloseReminder}
                  aria-label="Cerrar recordatorio"
                >
                  Cerrar
                </button>
              </div>
              <form
                className="form-card"
                onSubmit={handleSubmitSubscription}
                noValidate
              >
                <div className="form-group">
                  <label htmlFor="subscriber-email">Correo electrónico</label>
                  <input
                    id="subscriber-email"
                    ref={emailFieldRef}
                    className="input"
                    type="email"
                    required
                    placeholder="tu@correo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={email.length > 0 && !isEmailValid}
                    aria-describedby="email-help"
                    inputMode="email"
                    autoComplete="email"
                  />
                  <span id="email-help" className="legend">
                    Usalo para un solo recordatorio por sorteo.
                  </span>
                  {email.length > 0 && !isEmailValid && (
                    <span
                      className="error-text"
                      role="alert"
                      style={{ display: "block", marginTop: "0.25rem" }}
                    >
                      Ingresá un correo con formato válido (ej.:
                      nombre@dominio.com).
                    </span>
                  )}
                </div>
                <div
                  className="card-actions"
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                  }}
                >
                  <button
                    type="submit"
                    className="button button--primary"
                    disabled={submitting}
                    aria-live="polite"
                  >
                    {submitting
                      ? "Guardando..."
                      : reminder.raffle
                      ? "Avisarme para este sorteo"
                      : "Quiero recibir novedades"}
                  </button>
                  <span className="legend">
                    Podés darte de baja cuando quieras.
                  </span>
                </div>
              </form>
              {toast && (
                <div
                  className={`toast${toast.ok ? "" : " toast--error"}`}
                  role={toast.ok ? "status" : "alert"}
                  aria-live={toast.ok ? "polite" : "assertive"}
                  style={{
                    marginTop: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "0.75rem",
                  }}
                >
                  <span>{toast.message}</span>
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => setToast(null)}
                    title="Cerrar notificacion"
                    aria-label="Cerrar notificacion"
                    style={{ padding: "0.25rem 0.5rem" }}
                  >
                    Cerrar
                  </button>
                </div>
              )}{" "}
            </div>
          </div>,
          document.body
        )}
    </>
  );
};

PublicView.propTypes = {
  activeRaffles: PropTypes.arrayOf(raffleShape).isRequired,
  finishedRaffles: PropTypes.arrayOf(raffleShape).isRequired,
  onStartLive: PropTypes.func.isRequired,
  onMarkFinished: PropTypes.func,
  onRegisterSubscriber: PropTypes.func.isRequired,
  route: PropTypes.oneOf(["public", "finished"]),
};

PublicView.defaultProps = {
  onMarkFinished: undefined,
  route: "public",
};

export default PublicView;
