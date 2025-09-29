// ! DECISIÓN DE DISEÑO: Encapsulamos métricas y chips para mantener la lógica de hints controlada y reutilizable.
import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import Chip from "./ui/Chip";
import StatCard from "./ui/StatCard";

const metricsShape = PropTypes.shape({
  total: PropTypes.number.isRequired,
  active: PropTypes.number.isRequired,
  finished: PropTypes.number.isRequired,
});

const chipText = {
  total: "Sorteos totales",
  active: "Sorteos activos",
  finished: "Sorteos finalizados",
};

const StatsChips = ({ metrics }) => {
  const [chipHint, setChipHint] = useState(null);
  const chipGroupRef = useRef(null);

  useEffect(() => {
    const handleDocumentClick = (event) => {
      if (!chipGroupRef.current) return;
      if (!chipGroupRef.current.contains(event.target)) {
        setChipHint(null);
      }
    };
    document.addEventListener("click", handleDocumentClick);
    return () => document.removeEventListener("click", handleDocumentClick);
  }, []);

  const toggleChip = (key) => {
    setChipHint((current) => (current === key ? null : key));
  };

  return (
    <div
      ref={chipGroupRef}
      className="tag-group anim-up"
      style={{
        display: "grid",
        gridAutoFlow: "column",
        gap: "0.5rem",
        marginTop: "0.5rem",
        width: "fit-content",
      }}
    >
      <Chip active={chipHint === "total"} onClick={() => toggleChip("total")}>
        🗂️ {metrics.total}
      </Chip>
      <Chip active={chipHint === "active"} onClick={() => toggleChip("active")}>
        ⏳ {metrics.active}
      </Chip>
      <Chip
        active={chipHint === "finished"}
        onClick={() => toggleChip("finished")}
      >
        ✅ {metrics.finished}
      </Chip>

      {chipHint && (
        <div
          className="anim-pop"
          role="status"
          style={{
            gridColumn: "1 / -1",
            marginTop: "0.4rem",
            padding: "0.4rem 0.6rem",
            borderRadius: "10px",
            fontSize: "0.82rem",
            color: "var(--brand-700)",
            background: "var(--brand-50)",
            border: "1px solid var(--border)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.8)",
            width: "max-content",
          }}
        >
          {chipText[chipHint]}
        </div>
      )}
    </div>
  );
};

StatsChips.propTypes = {
  metrics: metricsShape.isRequired,
};

const StatsCards = ({ metrics }) => (
  <div
    className="stagger is-on"
    style={{
      display: "grid",
      gap: "1rem",
      gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    }}
  >
    <StatCard label="Sorteos totales" value={metrics.total} icon="📂" />
    <StatCard label="Activos" value={metrics.active} icon="⏳" />
    <StatCard label="Finalizados" value={metrics.finished} icon="✅" />
  </div>
);

StatsCards.propTypes = StatsChips.propTypes;

const AdminStats = ({ metrics, variant }) => {
  if (variant === "chips") {
    return <StatsChips metrics={metrics} />;
  }
  return <StatsCards metrics={metrics} />;
};

AdminStats.propTypes = {
  metrics: metricsShape.isRequired,
  variant: PropTypes.oneOf(["chips", "cards"]),
};

AdminStats.defaultProps = {
  variant: "cards",
};

export default AdminStats;
