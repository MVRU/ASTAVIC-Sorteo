// src/components/public/ParticipationGuide.js

import PropTypes from "prop-types";

const ParticipationGuide = ({
  id,
  isVisible,
  onOpenReminder,
  onViewFinished,
  showFinishedShortcut,
}) => (
  <section
    id={id}
    className={`participation-guide anim-up${
      isVisible ? " participation-guide--expanded" : ""
    }`}
    aria-labelledby="participation-guide-heading"
    aria-hidden={!isVisible}
    data-state={isVisible ? "expanded" : "collapsed"}
    hidden={!isVisible}
    data-testid="participation-guide"
  >
    <div className="participation-guide__header">
      <h2
        id="participation-guide-heading"
        className="participation-guide__title"
      >
        Cómo participar en los sorteos
      </h2>
      <p className="participation-guide__intro">
        Seguí estos pasos para mantenerte informado: ASTAVIC gestiona las
        inscripciones y avisos oficiales, vos podés consultar fechas, premios y
        resultados sin perderte ninguna instancia.
      </p>
    </div>
    <ol className="participation-guide__steps">
      <li className="participation-guide__step">
        <h3 className="participation-guide__step-title">Explorá los sorteos</h3>
        <p className="participation-guide__step-copy">
          Revisá fecha, premios y participantes designados para cada sorteo. No
          necesitás inscribirte: el equipo de ASTAVIC administra la selección de
          personas participantes.
        </p>
      </li>
      <li className="participation-guide__step">
        <h3 className="participation-guide__step-title">
          Activá recordatorios
        </h3>
        <p className="participation-guide__step-copy">
          Configurá un aviso por correo para que te notifiquemos antes del
          sorteo y estés listo para seguir la transmisión o revisar novedades.
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
        <h3 className="participation-guide__step-title">
          Seguí el sorteo en vivo
        </h3>
        <p className="participation-guide__step-copy">
          Volvé el día y horario indicados para acompañar la transmisión o las
          actualizaciones en vivo que compartimos en la plataforma.
        </p>
      </li>
      <li className="participation-guide__step">
        <h3 className="participation-guide__step-title">
          Revisá los resultados
        </h3>
        <p className="participation-guide__step-copy">
          Consultá el historial para ver ganadores y detalles de entrega que
          publica ASTAVIC una vez finalizada cada instancia.
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
  id: PropTypes.string,
  isVisible: PropTypes.bool,
  onOpenReminder: PropTypes.func.isRequired,
  onViewFinished: PropTypes.func,
  showFinishedShortcut: PropTypes.bool,
};

ParticipationGuide.defaultProps = {
  id: undefined,
  isVisible: false,
  onViewFinished: undefined,
  showFinishedShortcut: false,
};

export default ParticipationGuide;
