// src/components/public/PublicView.js
// ! DECISIÓN DE DISEÑO: Los feedback del público utilizan el ToastContext para brindar mensajes consistentes y accesibles.
// * Separamos responsabilidades en componentes auxiliares para mantener este contenedor declarativo.
// -!- Riesgo: En producción debería persistirse la suscripción en un backend confiable y con doble opt-in.
import { useCallback, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import RaffleGrid from "./RaffleGrid";
import ReminderDialog from "./ReminderDialog";
import rafflePropType from "./rafflePropType";
import { useToast } from "../../context/ToastContext";
import { isValidEmail, sanitizeEmail } from "../../utils/validation";

const PublicView = ({
  activeRaffles,
  finishedRaffles,
  onMarkFinished,
  onRegisterSubscriber,
  route,
}) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reminder, setReminder] = useState({ open: false, raffle: null });
  const emailFieldRef = useRef(null);
  const { showToast } = useToast();
  const normalizedEmail = useMemo(() => sanitizeEmail(email), [email]);
  const isEmailValid = useMemo(
    () => isValidEmail(normalizedEmail),
    [normalizedEmail]
  );
  const isFinishedRoute = route === "finished";
  const visibleRaffles = useMemo(
    () => (isFinishedRoute ? finishedRaffles : activeRaffles),
    [isFinishedRoute, finishedRaffles, activeRaffles]
  );
  const visibleCount = visibleRaffles.length;

  const copy = useMemo(() => {
    if (isFinishedRoute) {
      return {
        title: "Sorteos finalizados",
        subtitle: "Revisá premios y ganadores de sorteos anteriores.",
        emptyTitle: "Todavía no hay sorteos finalizados.",
        emptySubtitle:
          "Ni bien cerremos un sorteo, vas a ver el listado completo acá.",
      };
    }
    return {
      title: "Sorteos activos",
      subtitle: "Participá en los sorteos vigentes y pedí recordatorios por correo.",
      emptyTitle: "No hay sorteos publicados en este momento.",
      emptySubtitle: "Publicaremos nuevos sorteos en cuanto estén disponibles.",
    };
  }, [isFinishedRoute]);

  const handleCloseReminder = useCallback(() => {
    setReminder({ open: false, raffle: null });
  }, []);

  const handleReminder = useCallback((raffle) => {
    setReminder({ open: true, raffle: raffle || null });
  }, []);

  const handleResetReminder = useCallback(() => {
    setReminder({ open: true, raffle: null });
  }, []);

  const handleEmailChange = useCallback((event) => {
    setEmail(event.target.value);
  }, []);

  const handleGeneralReminder = useCallback(() => {
    handleReminder(null);
  }, [handleReminder]);

  const reminderRaffle = reminder.raffle;

  const handleSubmitSubscription = useCallback(async (event) => {
    event.preventDefault();
    if (!isEmailValid) {
      showToast({ status: "error", message: "Ingresá un correo válido." });
      return;
    }
    try {
      setSubmitting(true);
      const result = await onRegisterSubscriber(normalizedEmail, reminderRaffle);
      if (result?.ok === false) {
        showToast({
          status: "error",
          message: result.message || "No pudimos registrar tu correo. Intentá nuevamente.",
        });
      } else if (result?.reuse) {
        showToast({
          status: "info",
          message:
            result.message || "Ya estabas suscripto. Mantendremos tus recordatorios.",
        });
      } else {
        showToast({
          status: "success",
          message:
            result?.message || "Registro exitoso. Te avisaremos antes del sorteo.",
        });
      }
      if (result?.ok && !result?.reuse) setEmail("");
      if (result?.ok) {
        handleCloseReminder();
      }
    } finally {
      setSubmitting(false);
    }
  }, [handleCloseReminder, isEmailValid, onRegisterSubscriber, normalizedEmail, reminderRaffle, showToast]);

  return (
    <>
      <section
        className="section-gap anim-fade-in"
        aria-labelledby="raffles-heading"
      >
        <div className="container">
          <div className="public-toolbar">
            <div className="anim-up">
              <h1 id="raffles-heading" className="section-title">
                {copy.title}
              </h1>
              <p className="section-subtitle" style={{ marginBottom: 0 }}>
                {copy.subtitle}
              </p>
            </div>
            <div className="public-toolbar__actions anim-up">
              <span className="section-subtitle">
                Hay {visibleCount} {visibleCount === 1 ? "sorteo" : "sorteos"}
              </span>
              <button
                type="button"
                className="button button--ghost"
                onClick={handleGeneralReminder}
              >
                Recordatorios por email
              </button>
            </div>
          </div>
          <RaffleGrid
            raffles={visibleRaffles}
            allowMarkFinished={!isFinishedRoute}
            onMarkFinished={onMarkFinished}
            onRequestReminder={handleReminder}
            emptyState={{ title: copy.emptyTitle, subtitle: copy.emptySubtitle }}
          />
        </div>
      </section>

      <ReminderDialog
        open={reminder.open}
        raffle={reminderRaffle}
        email={email}
        submitting={submitting}
        isEmailValid={isEmailValid}
        emailFieldRef={emailFieldRef}
        onClose={handleCloseReminder}
        onSubmit={handleSubmitSubscription}
        onEmailChange={handleEmailChange}
        onResetRaffle={handleResetReminder}
      />
    </>
  );
};

PublicView.propTypes = {
  activeRaffles: PropTypes.arrayOf(rafflePropType).isRequired,
  finishedRaffles: PropTypes.arrayOf(rafflePropType).isRequired,
  onMarkFinished: PropTypes.func,
  onRegisterSubscriber: PropTypes.func.isRequired,
  route: PropTypes.oneOf(["public", "finished"]),
};

PublicView.defaultProps = {
  onMarkFinished: undefined,
  route: "public",
};

export default PublicView;
