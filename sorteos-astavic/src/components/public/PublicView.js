import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import RaffleCard from "./RaffleCard";

const filters = [
  { value: "activos", label: "Activos" },
  { value: "finalizados", label: "Finalizados" },
  { value: "todos", label: "Todos" },
];

// Validación simple de email (UX rápida, el servidor/handler es la última línea de defensa)
const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const PublicView = ({
  raffles,
  filter,
  onFilterChange,
  onStartLive,
  onMarkFinished,
  onRegisterSubscriber,
  route,
}) => {
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState(null); // { ok:boolean, message:string }
  const [submitting, setSubmitting] = useState(false);
  const [reminder, setReminder] = useState({ open: false, raffle: null });
  const emailFieldRef = useRef(null);
  const isEmailValid = emailRegex.test(email.trim());
  const toastTimerRef = useRef(null);

  // Contador visible según filtro (para micro-feedback)
  const visibleCount = raffles.length;
  const isFinishedRoute = route === "finished";
  const toolbarTitle = isFinishedRoute ? "Sorteos finalizados" : "Sorteos";

  const handleCloseReminder = useCallback(() => {
    setReminder({ open: false, raffle: null });
    setToast(null);
  }, []);

  const handleReminder = useCallback((raffle) => {
    setReminder({ open: true, raffle: raffle || null });
    setToast(null);
  }, []);

  // Limpia timers del toast al desmontar/cambiar
  useEffect(() => {
    if (!toast) return;
    // Diferenciamos duración por tipo: errores duran un poco más
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

  const handleFilter = useCallback(
    (event) => {
      onFilterChange(event.target.value);
    },
    [onFilterChange]
  );

  const showToast = (payload) => {
    setToast(payload);
  };

  const handleSubmitSubscription = async (event) => {
    event.preventDefault();
    if (!isEmailValid) {
      showToast({ ok: false, message: "Ingresá un correo válido." });
      return;
    }
    try {
      setSubmitting(true);
      const targetRaffle = reminder.raffle;
      const result = await onRegisterSubscriber(email.trim(), targetRaffle);
      showToast(result);
      if (result?.ok && !result?.reuse) setEmail("");
    } finally {
      setSubmitting(false);
    }
  };


  // Toolbar de filtros (sticky) + contador
  const FilterToolbar = useMemo(
    () => (
      <div
        className="controls-row"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 2,
          background: "var(--surface, #fff)",
          padding: "0.5rem 0",
          borderBottom: "1px solid var(--line-1, #e6e6ea)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "0.75rem",
        }}
      >
        <div
          style={{ display: "flex", alignItems: "baseline", gap: "0.75rem" }}
        >
          <h1 className="section-title" style={{ margin: 0 }}>
            {toolbarTitle}
          </h1>
          <span
            className="tag"
            style={{
              fontSize: "0.85rem",
              background: "var(--surface-2, #f5f6f8)",
              border: "1px solid var(--line-1, #e6e6ea)",
              borderRadius: "999px",
              padding: "0.15rem 0.5rem",
              color: "var(--text-2,#444)",
            }}
          >
            {visibleCount} {visibleCount === 1 ? "resultado" : "resultados"}
          </span>
        </div>

        <div
          className="select-field"
          style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
        >
          <label htmlFor="raffle-filter" style={{ whiteSpace: "nowrap" }}>
            Filtro
          </label>
          <select
            id="raffle-filter"
            className="select"
            value={filter}
            onChange={handleFilter}
            aria-label="Filtrar sorteos por estado"
            disabled={isFinishedRoute}
            title={
              isFinishedRoute
                ? "El filtro se encuentra fijado en finalizados"
                : undefined
            }
          >
            {filters.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button button--ghost"
            onClick={() => handleReminder(null)}
            style={{ whiteSpace: "nowrap" }}
            aria-label="Abrir formulario de recordatorios por email"
          >
            Recordatorios por email
          </button>
        </div>
      </div>
    ),
    [filter, visibleCount, handleFilter, handleReminder, isFinishedRoute, toolbarTitle]
  );

  return (
    <>
      <section className="section-gap" aria-labelledby="sorteos-title">
      <div className="container" id="sorteos-title">
        {FilterToolbar}

        {/* Lista de sorteos */}
        {raffles.length === 0 ? (
          <div
            className="empty-state card"
            role="status"
            style={{
              textAlign: "center",
              padding: "2rem",
              display: "grid",
              gap: "0.5rem",
              justifyItems: "center",
            }}
          >
            <div style={{ fontSize: "2rem" }} aria-hidden>
              🔎
            </div>
            <p style={{ margin: 0 }}>
              No hay sorteos para el filtro seleccionado.
            </p>
            <p style={{ margin: 0, color: "var(--text-3,#666)" }}>
              Probá cambiando a <strong>Todos</strong> o a otro estado.
            </p>
          </div>
        ) : (
          <div
            className="grid-raffles"
            role="list"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "1rem",
            }}
          >
            {raffles.map((raffle) => (
              <div role="listitem" key={raffle.id}>
                <RaffleCard
                  raffle={raffle}
                  onLive={onStartLive}
                  onMarkFinished={onMarkFinished}
                  onRequestReminder={handleReminder}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
    {reminder.open && (
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="reminder-title"
      >
        <div className="modal__overlay" onClick={handleCloseReminder} />
        <div className="modal__content">
          <div className="modal__header">
            <div>
              <h3 id="reminder-title" className="modal__title">
                Recibí recordatorios y resultados
              </h3>
              <p className="modal__desc">
                Te avisamos cuando empiece el sorteo y compartimos el listado de
                ganadores.
                <br />
                <em style={{ color: "var(--text-3,#666)" }}>Demo sin envío real.</em>
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
                    style={{ marginTop: "0.5rem", padding: "0.25rem 0.5rem" }}
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
                  Ingresá un correo con formato válido (ej.: nombre@dominio.com).
                </span>
              )}
            </div>
            <div
              className="card-actions"
              style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
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
                Podés darte de baja cuando quieras (demo).
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
                title="Cerrar notificación"
                aria-label="Cerrar notificación"
                style={{ padding: "0.25rem 0.5rem" }}
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    )}
  </>
  );
};

PublicView.propTypes = {
  raffles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      datetime: PropTypes.string.isRequired,
      winnersCount: PropTypes.number.isRequired,
      participants: PropTypes.arrayOf(PropTypes.string).isRequired,
      prizes: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string,
          description: PropTypes.string,
        })
      ),
      finished: PropTypes.bool,
    })
  ).isRequired,
  filter: PropTypes.oneOf(["activos", "finalizados", "todos"]).isRequired,
  onFilterChange: PropTypes.func.isRequired,
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
