// ! DECISIÓN DE DISEÑO: La vista previa queda aislada para poder reutilizarla y evitar lógica condicional en el panel.
import PropTypes from "prop-types";
import RaffleCard from "../public/RaffleCard";

const noop = () => {};

const RafflePreview = ({ preview, isDesktop }) => (
  <div className="card anim-fade-in" aria-live="polite">
    <h2
      style={{
        fontSize: "1.125rem",
        fontWeight: 700,
        margin: 0,
        marginBottom: "1rem",
      }}
    >
      Vista previa
    </h2>
    <div
      className="anim-up"
      style={{
        pointerEvents: "none",
        opacity: preview.participants.length ? 1 : 0.6,
        maxWidth: isDesktop ? "380px" : "100%",
        margin: "0 auto",
      }}
    >
      <RaffleCard
        raffle={preview.raffle}
        onLive={noop}
        onMarkFinished={noop}
        onRequestReminder={noop}
      />
    </div>
    <p
      className="anim-up"
      style={{
        margin: "1rem 0 0.5rem",
        fontSize: "0.925rem",
        color: "var(--text-secondary)",
      }}
    >
      {preview.message}
    </p>
    {preview.participants.length > 0 && (
      <ul
        className="anim-up"
        style={{
          marginTop: "0.5rem",
          paddingLeft: "1.25rem",
          fontSize: "0.9rem",
          color: "var(--text-secondary)",
          maxHeight: "100px",
          overflowY: "auto",
        }}
      >
        {preview.participants.slice(0, 5).map((participant) => (
          <li key={participant}>{participant}</li>
        ))}
        {preview.participants.length > 5 && <li>...</li>}
      </ul>
    )}
  </div>
);

RafflePreview.propTypes = {
  preview: PropTypes.shape({
    raffle: PropTypes.shape({
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
      ).isRequired,
      finished: PropTypes.bool.isRequired,
    }).isRequired,
    participants: PropTypes.arrayOf(PropTypes.string).isRequired,
    message: PropTypes.string.isRequired,
  }).isRequired,
  isDesktop: PropTypes.bool,
};

RafflePreview.defaultProps = {
  isDesktop: false,
};

export default RafflePreview;
