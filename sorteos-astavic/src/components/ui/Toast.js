// src/components/ui/Toast.js
// ! DECISIÓN DE DISEÑO: Renderizamos el toast en un portal para garantizar que se superponga correctamente sin alterar layouts.
import { createPortal } from "react-dom";
import PropTypes from "prop-types";

const Toast = ({ toast, onClose }) => {
  if (!toast || typeof document === "undefined") {
    return null;
  }

  const role = toast.status === "error" ? "alert" : "status";
  const ariaLive = toast.status === "error" ? "assertive" : "polite";
  const toastClassName = `toast${toast.status === "error" ? " toast--error" : toast.status === "success" ? " toast--success" : " toast--info"} anim-pop`;

  const content = (
    <div className="toast-layer" role="presentation">
      <div className={toastClassName} role={role} aria-live={ariaLive}>
        <span>{toast.message}</span>
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
    message: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
};

Toast.defaultProps = {
  toast: null,
};

export default Toast;
