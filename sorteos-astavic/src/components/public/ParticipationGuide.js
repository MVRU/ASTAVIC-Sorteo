// src/components/public/ParticipationGuide.js
// ! DECISIÓN DE DISEÑO: Guiamos el flujo de participación con pasos accionables para reducir fricción y mejorar conversión.
// * El bloque refuerza accesibilidad usando lista ordenada y encabezados jerárquicos.
// -!- Riesgo: Si se agregan nuevas acciones asincrónicas deberán sincronizarse estados de carga para evitar solapamientos.
import PropTypes from "prop-types";

const ParticipationGuide = ({
  onOpenReminder,
  onViewFinished,
  showFinishedShortcut,
}) => (
  <section
    className="participation-guide anim-up"
    aria-labelledby="participation-guide-heading"
  >
    <div className="participation-guide__header">
      <h2 id="participation-guide-heading" className="participation-guide__title">
        Cómo participar en los sorteos
      </h2>
      <p className="participation-guide__intro">
        Seguí estos pasos para inscribirte, recibir alertas oportunas y enterarte
        de los resultados sin perderte ninguna instancia.
      </p>
    </div>
    <ol className="participation-guide__steps">
      <li className="participation-guide__step">
        <h3 className="participation-guide__step-title">Explorá y elegí</h3>
        <p className="participation-guide__step-copy">
          Revisá la fecha, los premios y los requisitos de cada sorteo antes de
          sumarte para confirmar que se ajusta a lo que buscás.
        </p>
      </li>
      <li className="participation-guide__step">
        <h3 className="participation-guide__step-title">Solicitá un recordatorio</h3>
        <p className="participation-guide__step-copy">
          Configurá un aviso por correo para recibir una alerta previa al cierre
          de inscripciones y preparar tu participación con tiempo.
        </p>
        <button
          type="button"
          className="button button--primary participation-guide__action"
          onClick={onOpenReminder}
        >
          Configurar recordatorio
        </button>
      </li>
      <li className="participation-guide__step">
        <h3 className="participation-guide__step-title">Seguí el sorteo en vivo</h3>
        <p className="participation-guide__step-copy">
          Volvé el día y horario indicados para acompañar la transmisión o la
          actualización en vivo y conocer a las personas ganadoras.
        </p>
      </li>
      <li className="participation-guide__step">
        <h3 className="participation-guide__step-title">Revisá los resultados</h3>
        <p className="participation-guide__step-copy">
          Consultá el historial para confirmar si fuiste seleccionado y ver los
          detalles de entrega publicados por el equipo organizador.
        </p>
        {showFinishedShortcut ? (
          <button
            type="button"
            className="button button--ghost participation-guide__action"
            onClick={onViewFinished}
          >
            Ver sorteos finalizados
          </button>
        ) : null}
      </li>
    </ol>
  </section>
);

ParticipationGuide.propTypes = {
  onOpenReminder: PropTypes.func.isRequired,
  onViewFinished: PropTypes.func,
  showFinishedShortcut: PropTypes.bool,
};

ParticipationGuide.defaultProps = {
  onViewFinished: undefined,
  showFinishedShortcut: false,
};

export default ParticipationGuide;
