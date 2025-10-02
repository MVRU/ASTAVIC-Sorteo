// src/components/public/RaffleGrid.js
// ! DECISIÓN DE DISEÑO: Esta grilla usa tokens semánticos para mantener consistencia cromática en vacíos y tarjetas.

import PropTypes from "prop-types";
import RaffleCard from "./RaffleCard";
import rafflePropType from "./rafflePropType";

const gridStyles = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: "0.9rem",
};

const emptyStateStyles = {
  textAlign: "center",
  padding: "1.75rem",
  display: "grid",
  gap: "0.5rem",
  justifyItems: "center",
};

const RaffleGrid = ({
  raffles,
  allowMarkFinished,
  onMarkFinished,
  onRequestReminder,
  emptyState,
}) => {
  if (!raffles.length) {
    return (
      <div
        className="empty-state card anim-fade-in"
        role="status"
        style={emptyStateStyles}
      >
        <p style={{ margin: 0 }}>{emptyState.title}</p>
        <p style={{ margin: 0, color: "var(--text-muted,#666)" }}>
          {emptyState.subtitle}
        </p>
      </div>
    );
  }

  return (
    <div className="grid-raffles stagger is-on" role="list" style={gridStyles}>
      {raffles.map((raffle) => (
        <div role="listitem" key={raffle.id}>
          <RaffleCard
            raffle={raffle}
            onMarkFinished={allowMarkFinished ? onMarkFinished : undefined}
            onRequestReminder={onRequestReminder}
          />
        </div>
      ))}
    </div>
  );
};

RaffleGrid.propTypes = {
  raffles: PropTypes.arrayOf(rafflePropType).isRequired,
  allowMarkFinished: PropTypes.bool,
  onMarkFinished: PropTypes.func,
  onRequestReminder: PropTypes.func.isRequired,
  emptyState: PropTypes.shape({
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
  }).isRequired,
};

RaffleGrid.defaultProps = {
  allowMarkFinished: true,
  onMarkFinished: undefined,
};

export default RaffleGrid;
