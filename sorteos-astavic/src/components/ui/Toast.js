// src/components/ui/Toast.js
// ! DECISIÓN DE DISEÑO: Renderizamos el toast en un portal para garantizar que se superponga correctamente sin alterar layouts.
// ? Riesgo: Si se añaden nuevos estados sin registrar su iconografía y estilo, se degradará la consistencia visual del sistema de notificaciones.
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

const STATUS_META = {
  success: { title: "Éxito", icon: "✓" },
  error: { title: "Error", icon: "⛔" },
  warning: { title: "Advertencia", icon: "⚠" },
  info: { title: "Aviso", icon: "ℹ" },
};

const Toast = ({ toast, onClose }) => {
  if (!toast || typeof document === "undefined") {
    return null;
  }

  const statusKey = STATUS_META[toast.status] ? toast.status : "info";
  const statusMeta = STATUS_META[statusKey];
  const role = statusKey === "error" ? "alert" : "status";
  const ariaLive = statusKey === "error" ? "assertive" : "polite";
  const toastClassName = `toast toast--${statusKey} anim-pop`;
  const messageContent = toast.message ?? "";

  const content = (
    <div className="toast-layer" role="presentation">
      <div
        className={toastClassName}
        role={role}
        aria-live={ariaLive}
        aria-atomic="true"
      >
        <span className="toast__icon" aria-hidden="true">
          {statusMeta.icon}
        </span>
        <div className="toast__content">
          <p className="toast__title">{statusMeta.title}</p>
          <div className="toast__message">{messageContent}</div>
        </div>
        <button
          type="button"
          className="button button--ghost toast__close"
          onClick={onClose}
          aria-label="Cerrar notificación"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

Toast.propTypes = {
  toast: PropTypes.shape({
    id: PropTypes.number,
    status: PropTypes.oneOf(["success", "error", "info", "warning"]),
    message: PropTypes.node,
  }),
  onClose: PropTypes.func.isRequired,
};

Toast.defaultProps = {
  toast: null,
};

export default Toast;
