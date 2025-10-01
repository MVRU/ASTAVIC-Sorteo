// ! DECISIÓN DE DISEÑO: Este componente abstrae la edición de colecciones en formularios manteniendo control externo del estado.
// * Normaliza entradas, anima las tarjetas y gestiona el foco para balancear UX atractiva con accesibilidad WCAG.
// ? Riesgo: Navegadores sin soporte de requestAnimationFrame podrían degradar el enfoque automático; se cae de forma segura.
import { useId, useMemo, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

export const EditableListStyles = () => (
  <style>{`
      .editable-list {
        --editable-list-gap: 1.25rem;
        --editable-list-surface: var(--surface-card, #ffffff);
        --editable-list-border: rgba(99, 102, 241, 0.25);
        --editable-list-shadow: 0 20px 45px -32px rgba(15, 23, 42, 0.45);
        display: flex;
        flex-direction: column;
        gap: var(--editable-list-gap);
        padding: clamp(1rem, 2vw, 1.5rem);
        border-radius: 18px;
        border: 1px solid var(--editable-list-border);
        background:
          linear-gradient(145deg, rgba(99, 102, 241, 0.07), rgba(14, 165, 233, 0.05)),
          var(--editable-list-surface);
        box-shadow: var(--editable-list-shadow);
        transition: border-color 180ms ease, box-shadow 220ms ease, transform 240ms ease;
      }

      .editable-list:focus-within {
        border-color: var(--focus-ring, #6366f1);
        box-shadow: 0 18px 38px -26px rgba(99, 102, 241, 0.45);
        transform: translateY(-2px);
      }

      @media (prefers-reduced-motion: reduce) {
        .editable-list,
        .editable-list:focus-within {
          transition: none;
          transform: none;
        }
      }

      .editable-list__header {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 0.75rem;
        flex-wrap: wrap;
      }

      .editable-list__label {
        font-size: clamp(1rem, 1.2vw, 1.05rem);
        font-weight: 600;
        color: var(--text-strong, #111827);
        letter-spacing: 0.01em;
      }

      .editable-list__helper {
        margin: 0;
        font-size: 0.9rem;
        color: var(--text-muted, #4b5563);
        line-height: 1.5;
      }

      .editable-list__add {
        align-self: flex-start;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 1rem;
        font-weight: 600;
        border-radius: 999px;
        border: 1px solid rgba(99, 102, 241, 0.35);
        color: var(--focus-ring, #6366f1);
        background: rgba(99, 102, 241, 0.08);
        transition: background-color 160ms ease, border-color 160ms ease, color 160ms ease, box-shadow 220ms ease;
      }

      .editable-list__add:hover,
      .editable-list__add:focus-visible {
        background: rgba(99, 102, 241, 0.16);
        color: var(--focus-ring-strong, #4338ca);
        border-color: rgba(99, 102, 241, 0.55);
        box-shadow: 0 10px 18px -14px rgba(99, 102, 241, 0.55);
      }

      .editable-list__add:focus-visible {
        outline: none;
      }

      .editable-list__items {
        display: grid;
        gap: 0.75rem;
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .editable-list__item {
        background: var(--surface-base, #ffffff);
        border-radius: 14px;
        border: 1px solid rgba(148, 163, 184, 0.18);
        padding: clamp(0.75rem, 1.8vw, 1rem);
        box-shadow: 0 16px 28px -24px rgba(15, 23, 42, 0.45);
        transition: border-color 160ms ease, box-shadow 220ms ease, transform 220ms ease;
      }

      .editable-list__item:focus-within {
        border-color: var(--focus-ring, #6366f1);
        box-shadow: 0 22px 32px -22px rgba(99, 102, 241, 0.45);
        transform: translateY(-1px);
      }

      @media (prefers-reduced-motion: reduce) {
        .editable-list__item,
        .editable-list__item:focus-within {
          transition: none;
          transform: none;
        }
      }

      .editable-list__item-grid {
        display: grid;
        grid-template-columns: auto minmax(0, 1fr) auto;
        gap: clamp(0.65rem, 1.5vw, 1rem);
        align-items: center;
      }

      .editable-list__index {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 50%;
        font-weight: 600;
        font-size: 0.95rem;
        color: var(--focus-ring-strong, #4338ca);
        background: radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.28), rgba(99, 102, 241, 0.12));
      }

      .editable-list__field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
        min-width: 0;
      }

      .editable-list__item-label {
        font-size: 0.85rem;
        font-weight: 600;
        color: var(--text-muted, #4b5563);
      }

      .editable-list__input {
        min-width: 0;
        width: 100%;
        padding: 0.65rem 0.75rem;
        border-radius: 10px;
        border: 1px solid rgba(148, 163, 184, 0.35);
        background: rgba(255, 255, 255, 0.92);
        box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.08);
        transition: border-color 160ms ease, box-shadow 200ms ease;
      }

      .editable-list__input:focus-visible {
        border-color: var(--focus-ring, #6366f1);
        box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
        outline: none;
      }

      .editable-list__input--invalid {
        border-color: var(--alert-danger-fg, #b91c1c);
        box-shadow: 0 0 0 2px rgba(185, 28, 28, 0.2);
        background: rgba(254, 242, 242, 0.8);
      }

      .editable-list__actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
      }

      .editable-list__remove {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
        border: 1px solid transparent;
        background: rgba(239, 68, 68, 0.1);
        color: var(--alert-danger-fg, #b91c1c);
        font-size: 1.2rem;
        line-height: 1;
        cursor: pointer;
        transition: background-color 160ms ease, border-color 160ms ease, box-shadow 200ms ease, transform 180ms ease;
      }

      .editable-list__remove:hover,
      .editable-list__remove:focus-visible {
        background: rgba(239, 68, 68, 0.18);
        border-color: rgba(239, 68, 68, 0.3);
        box-shadow: 0 12px 22px -18px rgba(185, 28, 28, 0.8);
        transform: translateY(-1px);
        outline: none;
      }

      .editable-list__empty {
        font-size: 0.9rem;
        padding: 0.85rem 1rem;
        color: var(--text-muted, #4b5563);
        background: rgba(148, 163, 184, 0.14);
        border-radius: 12px;
        text-align: center;
      }

      @media (prefers-color-scheme: dark) {
        .editable-list {
          --editable-list-surface: rgba(17, 24, 39, 0.94);
          --editable-list-border: rgba(99, 102, 241, 0.38);
          --editable-list-shadow: 0 28px 48px -28px rgba(15, 23, 42, 0.9);
          background:
            linear-gradient(145deg, rgba(99, 102, 241, 0.24), rgba(14, 165, 233, 0.18)),
            var(--editable-list-surface);
        }

        .editable-list__helper,
        .editable-list__item-label,
        .editable-list__empty {
          color: rgba(226, 232, 240, 0.86);
        }

        .editable-list__item {
          background: rgba(30, 41, 59, 0.95);
          border-color: rgba(99, 102, 241, 0.28);
          box-shadow: 0 20px 40px -30px rgba(15, 23, 42, 0.9);
        }

        .editable-list__input {
          background: rgba(15, 23, 42, 0.85);
          color: rgba(226, 232, 240, 0.95);
          border-color: rgba(99, 102, 241, 0.3);
          box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.05);
        }

        .editable-list__input::placeholder {
          color: rgba(148, 163, 184, 0.7);
        }

        .editable-list__remove {
          background: rgba(239, 68, 68, 0.24);
        }
      }

      @media (max-width: 680px) {
        .editable-list {
          padding: clamp(0.85rem, 4vw, 1.25rem);
        }

        .editable-list__item-grid {
          grid-template-columns: minmax(0, 1fr);
        }

        .editable-list__index {
          justify-self: flex-start;
        }

        .editable-list__actions {
          justify-content: flex-start;
        }

        .editable-list__remove {
          width: 100%;
          border-radius: 10px;
          height: 2.75rem;
        }
      }
    `}</style>
);

const coerceString = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const normalizeValues = (values) =>
  values.map((item) => coerceString(item).replace(/\r?\n/g, " "));

const EditableList = ({
  id,
  label,
  values,
  onChange,
  addButtonLabel,
  placeholder,
  helperText,
  describedBy,
  invalidIndexes = [],
}) => {
  const generatedId = useId();
  const listId = id || generatedId;
  const labelId = `${listId}-label`;
  const helperId = helperText ? `${listId}-helper` : undefined;
  const descriptionIds = useMemo(() => {
    return [helperId, describedBy].filter(Boolean).join(" ") || undefined;
  }, [helperId, describedBy]);
  const itemLabel = useMemo(() => label.replace(/:\s*$/, ""), [label]);
  const inputRefs = useRef([]);
  const [pendingFocusIndex, setPendingFocusIndex] = useState(null);

  useEffect(() => {
    if (pendingFocusIndex === null) return undefined;
    const node = inputRefs.current[pendingFocusIndex];
    if (node && typeof node.focus === "function") {
      const focusItem = () => node.focus();
      if (typeof window !== "undefined" && window.requestAnimationFrame) {
        window.requestAnimationFrame(focusItem);
      } else {
        focusItem();
      }
    }
    setPendingFocusIndex(null);
    return undefined;
  }, [pendingFocusIndex, values.length]);

  const registerRef = (index) => (node) => {
    inputRefs.current[index] = node;
  };

  const emitChange = (nextValues, focusIndex = null) => {
    onChange(normalizeValues(nextValues));
    if (focusIndex !== null) {
      setPendingFocusIndex(focusIndex);
    }
  };

  const handleItemChange = (index, value) => {
    const next = values.map((item, currentIndex) =>
      currentIndex === index ? value : item
    );
    emitChange(next);
  };

  const handleAdd = () => {
    const next = [...values, ""];
    emitChange(next, next.length - 1);
  };

  const handleRemove = (index) => {
    const next = values.filter((_, currentIndex) => currentIndex !== index);
    const nextFocus = Math.max(0, index - 1);
    emitChange(next, nextFocus < next.length ? nextFocus : null);
  };

  const handleKeyDown = (event, index) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      const isLast = index === values.length - 1;
      if (isLast) {
        handleAdd();
      } else {
        const nextFocus = Math.min(values.length - 1, index + 1);
        setPendingFocusIndex(nextFocus);
      }
    }
  };

  return (
    <div
      className="editable-list"
      aria-describedby={descriptionIds}
      role="group"
      aria-labelledby={labelId}
    >
      <div className="editable-list__header">
        <span id={labelId} className="editable-list__label">
          {label}
        </span>
        <button
          type="button"
          className="button button--ghost editable-list__add"
          onClick={handleAdd}
        >
          {addButtonLabel}
        </button>
      </div>
      {helperText ? (
        <p id={helperId} className="editable-list__helper">
          {helperText}
        </p>
      ) : null}
      <ul className="editable-list__items">
        {values.map((value, index) => {
          const inputId = `${listId}-item-${index}`;
          const isInvalid = invalidIndexes.includes(index);
          return (
            <li key={inputId} className="editable-list__item">
              <div className="editable-list__item-grid">
                <span className="editable-list__index" aria-hidden="true">
                  {index + 1}
                </span>
                <div className="editable-list__field">
                  <label className="editable-list__item-label" htmlFor={inputId}>
                    {itemLabel} {index + 1}
                  </label>
                  <input
                    id={inputId}
                    ref={registerRef(index)}
                    className={`input editable-list__input${
                      isInvalid ? " editable-list__input--invalid" : ""
                    }`}
                    value={value}
                    placeholder={placeholder}
                    onChange={(event) => handleItemChange(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(event, index)}
                    aria-describedby={descriptionIds}
                    aria-invalid={isInvalid ? "true" : undefined}
                  />
                </div>
                <div className="editable-list__actions">
                  <button
                    type="button"
                    className="editable-list__remove"
                    onClick={() => handleRemove(index)}
                    aria-label={`Eliminar ${itemLabel.toLowerCase()} ${index + 1}`}
                  >
                    ×
                  </button>
                </div>
              </div>
            </li>
          );
        })}
        {values.length === 0 ? (
          <li className="editable-list__empty" aria-live="polite">
            Aún no agregaste elementos.
          </li>
        ) : null}
      </ul>
    </div>
  );
};

EditableList.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  values: PropTypes.arrayOf(PropTypes.string),
  onChange: PropTypes.func.isRequired,
  addButtonLabel: PropTypes.string,
  placeholder: PropTypes.string,
  helperText: PropTypes.string,
  describedBy: PropTypes.string,
  invalidIndexes: PropTypes.arrayOf(PropTypes.number),
};

EditableList.defaultProps = {
  id: undefined,
  values: [],
  addButtonLabel: "Agregar",
  placeholder: "",
  helperText: undefined,
  describedBy: undefined,
  invalidIndexes: [],
};

export default EditableList;
