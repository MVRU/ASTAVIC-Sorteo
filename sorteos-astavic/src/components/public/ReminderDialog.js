// src/components/public/ReminderDialog.js
// ! DECISIÓN DE DISEÑO: Extraemos el modal para reutilizarlo y encapsular manejo de foco, accesibilidad y eventos de teclado.
// * Usamos portal a document.body para evitar problemas de stacking context y lectores de pantalla.
// -!- Riesgo: Requiere un entorno con document.body; en SSR debe renderizarse de forma condicional.
import { useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import rafflePropType from "./rafflePropType";

const ReminderDialog = ({
  open,
  raffle,
  email,
  submitting,
  isEmailValid,
  emailFieldRef,
  onClose,
  onSubmit,
  onEmailChange,
  onResetRaffle,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const handleKey = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  useEffect(() => {
    if (open && emailFieldRef?.current) {
      emailFieldRef.current.focus();
    }
  }, [open, emailFieldRef]);

  if (!open) return null;

  return createPortal(
    <div
      className="modal anim-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reminder-title"
      onClick={onClose}
    >
      <div className="modal__overlay" />
      <div className="modal__content anim-scale-in" onClick={(event) => event.stopPropagation()}>
        <div className="modal__header">
          <div className="anim-up">
            <h3 id="reminder-title" className="modal__title">
              Recibí recordatorios y resultados
            </h3>
            <p className="modal__desc">
              Te avisamos cuando empiece el sorteo y compartimos el listado de ganadores.
            </p>
            {raffle ? (
              <>
                <p className="legend" style={{ margin: 0 }}>
                  Aplicaremos este recordatorio para<strong> {raffle.title}</strong>.
                </p>
                <button
                  type="button"
                  className="button button--ghost"
                  style={{ marginTop: "0.5rem", padding: "0.25rem 0.5rem" }}
                  onClick={onResetRaffle}
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
            onClick={onClose}
            aria-label="Cerrar recordatorio"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        <form className="form-card anim-up" onSubmit={onSubmit} noValidate>
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
              onChange={onEmailChange}
              aria-invalid={email.length > 0 && !isEmailValid}
              aria-describedby="email-help"
              inputMode="email"
              autoComplete="email"
            />
            <span id="email-help" className="legend">
              Usalo para un solo recordatorio por sorteo.
            </span>
            {email.length > 0 && !isEmailValid && (
              <span className="error-text" role="alert" style={{ display: "block", marginTop: "0.25rem" }}>
                Ingresá un correo con formato válido (ej.: nombre@dominio.com).
              </span>
            )}
          </div>
          <div className="card-actions" style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <button type="submit" className="button button--primary" disabled={submitting} aria-live="polite">
              {submitting
                ? "Guardando..."
                : raffle
                ? "Avisarme para este sorteo"
                : "Quiero recibir novedades"}
            </button>
            <span className="legend">Podés darte de baja cuando quieras.</span>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

ReminderDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  raffle: rafflePropType,
  email: PropTypes.string.isRequired,
  submitting: PropTypes.bool.isRequired,
  isEmailValid: PropTypes.bool.isRequired,
  emailFieldRef: PropTypes.shape({ current: PropTypes.any }),
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onEmailChange: PropTypes.func.isRequired,
  onResetRaffle: PropTypes.func.isRequired,
};

ReminderDialog.defaultProps = {
  raffle: null,
  emailFieldRef: null,
};

export default ReminderDialog;
