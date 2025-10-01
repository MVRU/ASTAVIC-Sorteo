// src/components/admin/AdminModal.js

import { useEffect, useId, useRef, useMemo } from "react";
import PropTypes from "prop-types";
import { createPortal } from "react-dom";
import useFocusTrap from "../../hooks/useFocusTrap";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";

const AdminModal = ({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  initialFocusRef,
}) => {
  const headingId = useId();
  const descId = description ? `${headingId}-desc` : undefined;
  const contentRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previousFocusRef = useRef(null);

  useBodyScrollLock(open);
  useFocusTrap(contentRef, open);

  useEffect(() => {
    if (!open) return undefined;
    if (typeof document !== "undefined") {
      const activeElement = document.activeElement;
      previousFocusRef.current =
        activeElement && typeof activeElement.focus === "function"
          ? activeElement
          : null;
    }
    const handleKey = (event) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("keydown", handleKey);
      const focusTarget = previousFocusRef.current;
      if (focusTarget && typeof focusTarget.focus === "function") {
        focusTarget.focus();
      }
      previousFocusRef.current = null;
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const focusCandidate = initialFocusRef?.current;
    if (focusCandidate) {
      focusCandidate.focus();
      return;
    }
    const content = contentRef.current;
    if (!content) return;
    const autoFocus = content.querySelector("[data-modal-autofocus='true']");
    if (autoFocus) {
      autoFocus.focus();
      return;
    }
    const fallback = content.querySelector(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );
    if (fallback) {
      fallback.focus();
    } else {
      closeButtonRef.current?.focus();
    }
  }, [open, initialFocusRef]);

  const portalTarget = useMemo(
    () => (typeof document !== "undefined" ? document.body : null),
    []
  );

  if (!open || !portalTarget) return null;

  return createPortal(
    <div
      className="modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      aria-describedby={descId}
    >
      <div className="modal__overlay" onClick={onClose} />
      <div className="modal__content" ref={contentRef}>
        <div className="modal__header">
          <div>
            <h3 id={headingId} className="modal__title">
              {title}
            </h3>
            {description && (
              <p id={descId} className="modal__desc">
                {description}
              </p>
            )}
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            className="button button--ghost"
            aria-label="Cerrar modal"
            onClick={onClose}
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__footer">{footer}</div>}
      </div>
    </div>,
    portalTarget
  );
};

AdminModal.propTypes = {
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  onClose: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  initialFocusRef: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};

AdminModal.defaultProps = {
  description: undefined,
  footer: null,
  initialFocusRef: null,
};

export default AdminModal;
