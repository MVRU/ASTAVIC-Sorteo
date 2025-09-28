// ! DECISIÓN DE DISEÑO: El panel ahora delega responsabilidades en piezas especializadas para reducir acoplamiento.
import { useCallback, useMemo, useState } from "react";
import PropTypes from "prop-types";
import useMediaQuery from "../../hooks/useMediaQuery";
import AdminStats from "./AdminStats";
import AdminTutorial from "./AdminTutorial";
import RafflePreview from "./RafflePreview";
import RaffleForm from "./RaffleForm";
import {
  PREVIEW_DEFAULT_MESSAGE,
  createPreviewFallback,
} from "./adminConstants";

const AdminDashboard = ({ onLogout, onCreateRaffle, raffles }) => {
  const isDesktop = useMediaQuery("(min-width: 960px)");
  const [status, setStatus] = useState(null);
  const [preview, setPreview] = useState(() => createPreviewFallback());

  const metrics = useMemo(() => {
    const active = raffles.filter((raffle) => !raffle.finished).length;
    const finished = raffles.length - active;
    return { total: raffles.length, active, finished };
  }, [raffles]);

  const handleStatusChange = useCallback((nextStatus) => {
    setStatus(nextStatus);
  }, []);

  const handlePreviewChange = useCallback((nextPreview) => {
    setPreview(() => {
      if (!nextPreview) {
        return createPreviewFallback();
      }
      const fallback = createPreviewFallback();
      return {
        raffle: nextPreview.raffle ?? fallback.raffle,
        participants: nextPreview.participants ?? fallback.participants,
        message: nextPreview.message ?? PREVIEW_DEFAULT_MESSAGE,
      };
    });
  }, []);

  return (
    <section className="section-gap anim-fade-in" aria-labelledby="admin-panel">
      <div className="container" style={{ display: "grid", gap: "1.5rem" }}>
        <div
          className="controls-row anim-up"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              id="admin-panel"
              className="section-title"
              style={{
                fontSize: "1.75rem",
                fontWeight: 700,
                marginBottom: "0.25rem",
              }}
            >
              Panel de Administración
            </h1>
            {!isDesktop && <AdminStats metrics={metrics} variant="chips" />}
          </div>

          <button
            type="button"
            className="button button--ghost"
            onClick={onLogout}
            aria-label="Cerrar sesión de administración"
            title="Cerrar sesión"
          >
            Cerrar sesión
          </button>
        </div>

        <div className="admin-layout">
          <RaffleForm
            isDesktop={isDesktop}
            status={status}
            onStatusChange={handleStatusChange}
            onCreateRaffle={onCreateRaffle}
            onPreviewChange={handlePreviewChange}
          />

          <aside
            className="stagger is-on"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.25rem",
              alignContent: "start",
            }}
          >
            <AdminTutorial />
            {isDesktop && <AdminStats metrics={metrics} variant="cards" />}
            <RafflePreview preview={preview} isDesktop={isDesktop} />
          </aside>
        </div>
      </div>
    </section>
  );
};

AdminDashboard.propTypes = {
  onLogout: PropTypes.func.isRequired,
  onCreateRaffle: PropTypes.func.isRequired,
  raffles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      finished: PropTypes.bool,
    })
  ).isRequired,
};

export default AdminDashboard;
