// src/components/public/PublicView.js
// ! DECISIÓN DE DISEÑO: Los feedback del público utilizan el ToastContext para brindar mensajes consistentes y accesibles.
// * Separamos responsabilidades en componentes auxiliares para mantener este contenedor declarativo.
// * Controlamos la navegación local con un segmento accesible que evita recargas y preserva el foco.
// * Integramos una guía plegable para educar a nuevas personas participantes sin sobrecargar el layout.
// -!- Riesgo: En producción debería persistirse la suscripción en un backend confiable y con doble opt-in.
import { useCallback, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import RaffleGrid from "./RaffleGrid";
import ReminderDialog from "./ReminderDialog";
import ParticipationGuide from "./ParticipationGuide";
import rafflePropType from "./rafflePropType";
import { useToast } from "../../context/ToastContext";
import { isValidEmail, sanitizeEmail } from "../../utils/validation";

const PublicView = ({
  activeRaffles,
  finishedRaffles,
  onMarkFinished,
  onRegisterSubscriber,
  onRouteChange,
  route,
}) => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [reminder, setReminder] = useState({ open: false, raffle: null });
  const [isGuideVisible, setGuideVisible] = useState(false);
  const emailFieldRef = useRef(null);
  const { showToast } = useToast();
  const normalizedEmail = useMemo(() => sanitizeEmail(email), [email]);
  const isEmailValid = useMemo(
    () => isValidEmail(normalizedEmail),
    [normalizedEmail]
  );
  const isFinishedRoute = route === "finished";
  const isAllRoute = route === "all";
  const hasFinishedRaffles = finishedRaffles.length > 0;
  const segmentOptions = useMemo(
    () => [
      { label: "Todos", value: "all" },
      { label: "Activos", value: "public" },
      { label: "Finalizados", value: "finished" },
    ],
    []
  );
  const visibleRaffles = useMemo(
    () => {
      if (isAllRoute) {
        return [...activeRaffles, ...finishedRaffles];
      }
      return isFinishedRoute ? finishedRaffles : activeRaffles;
    },
    [activeRaffles, finishedRaffles, isAllRoute, isFinishedRoute]
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
    if (isAllRoute) {
      return {
        title: "Todos los sorteos",
        subtitle: "Explorá el historial completo de sorteos y sus resultados.",
        emptyTitle: "No encontramos sorteos publicados todavía.",
        emptySubtitle:
          "Cuando publiquemos sorteos vas a verlos acá, activos o finalizados.",
      };
    }
    return {
      title: "Sorteos activos",
      subtitle:
        "Informate sobre los sorteos vigentes, sus premios y participantes confirmados. Pedí recordatorios por correo.",
      emptyTitle: "No hay sorteos publicados en este momento.",
      emptySubtitle: "Publicaremos nuevos sorteos en cuanto estén disponibles.",
    };
  }, [isAllRoute, isFinishedRoute]);

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

  const handleRouteSelection = useCallback(
    (targetRoute) => {
      if (targetRoute === route) return;
      if (onRouteChange) {
        onRouteChange(targetRoute);
      }
    },
    [onRouteChange, route]
  );

  const handleViewFinished = useCallback(() => {
    handleRouteSelection("finished");
  }, [handleRouteSelection]);

  const reminderRaffle = reminder.raffle;
  const participationGuideId = "participation-guide-section";
  const guideToggleLabel = isGuideVisible
    ? "Ocultar guía de participación"
    : "Ver guía de participación";

  const toggleGuideVisibility = useCallback(() => {
    setGuideVisible((previous) => !previous);
  }, []);

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
              <div
                className="public-toolbar__segments"
                role="group"
                aria-label="Filtrar sorteos por estado"
              >
                {segmentOptions.map((option) => {
                  const isActive = option.value === route;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className={`segmented-button${
                        isActive ? " segmented-button--active" : ""
                      }`}
                      onClick={() => handleRouteSelection(option.value)}
                      aria-pressed={isActive}
                      aria-current={isActive ? "page" : undefined}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
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
          <div className="participation-guide__toggle-wrapper anim-up">
            <button
              type="button"
              className="button button--ghost participation-guide__toggle"
              aria-expanded={isGuideVisible}
              aria-controls={participationGuideId}
              onClick={toggleGuideVisibility}
            >
              {guideToggleLabel}
            </button>
          </div>
          <ParticipationGuide
            id={participationGuideId}
            isVisible={isGuideVisible}
            onOpenReminder={handleGeneralReminder}
            onViewFinished={hasFinishedRaffles ? handleViewFinished : undefined}
            showFinishedShortcut={hasFinishedRaffles && !isFinishedRoute}
          />
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
  onRouteChange: PropTypes.func,
  route: PropTypes.oneOf(["public", "finished", "all"]),
};

PublicView.defaultProps = {
  onMarkFinished: undefined,
  onRouteChange: undefined,
  route: "public",
};

export default PublicView;
