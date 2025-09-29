// src/context/ToastContext.js
// ! DECISIÓN DE DISEÑO: Centralizamos los toasts para reutilizar lógica de feedback y mantener un patrón accesible único.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import Toast from "../components/ui/Toast";

const ToastContext = createContext(undefined);

const SUCCESS_DURATION = 3200;
const ERROR_DURATION = 4200;
const INFO_DURATION = 3600;

const resolveStatus = (payload) => {
  if (!payload || typeof payload !== "object") {
    return "info";
  }
  if (payload.status) return payload.status;
  if (payload.severity) return payload.severity;
  if (typeof payload.ok === "boolean") {
    return payload.ok ? "success" : "error";
  }
  return "info";
};

const normalizeToast = (input) => {
  if (input == null) return null;
  if (typeof input === "string") {
    return { id: Date.now(), status: "info", message: input, duration: INFO_DURATION };
  }
  const status = resolveStatus(input);
  const duration =
    typeof input.duration === "number"
      ? Math.max(1200, input.duration)
      : status === "error"
      ? ERROR_DURATION
      : status === "info"
      ? INFO_DURATION
      : SUCCESS_DURATION;
  return {
    id: Date.now(),
    status,
    message: input.message || "",
    duration,
    action: input.action,
  };
};

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const hideToast = useCallback(() => {
    if (timerRef.current && typeof window !== "undefined") {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setToast(null);
  }, []);

  const showToast = useCallback((payload) => {
    setToast((prev) => {
      if (timerRef.current && typeof window !== "undefined") {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      const next = normalizeToast(payload);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    if (typeof window !== "undefined") {
      timerRef.current = window.setTimeout(() => {
        hideToast();
      }, toast.duration);
    }
    return () => {
      if (timerRef.current && typeof window !== "undefined") {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [toast, hideToast]);

  const value = useMemo(
    () => ({ toast, showToast, hideToast }),
    [toast, showToast, hideToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toast toast={toast} onClose={hideToast} />
    </ToastContext.Provider>
  );
};

ToastProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast debe utilizarse dentro de un ToastProvider");
  }
  return context;
};

export default ToastContext;
