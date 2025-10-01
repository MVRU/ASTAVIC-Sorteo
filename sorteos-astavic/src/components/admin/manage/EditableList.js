// ! DECISIÓN DE DISEÑO: Este componente abstrae la edición de colecciones en formularios manteniendo control externo del estado.
// ! DECISIÓN DE DISEÑO: La superficie adopta los tokens claros del panel para respetar el fondo blanco predominante.
// * Normaliza entradas, anima las tarjetas y gestiona el foco para balancear UX atractiva con accesibilidad WCAG.
// ? Riesgo: Navegadores sin soporte de requestAnimationFrame podrían degradar el enfoque automático; se cae de forma segura.
import { useId, useMemo, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

export const EditableListStyles = () => (
  <style>{`
      .editable-list {
        --editable-list-gap: clamp(0.9rem, 1.8vw, 1.2rem);
        --editable-list-radius: var(--radius-lg, 1.15rem);
        --editable-list-shadow: var(--shadow-1, 0 12px 30px rgba(2, 12, 27, 0.08));
        --editable-list-border: var(--border, rgba(15, 40, 105, 0.16));
        display: flex;
        flex-direction: column;
        gap: var(--editable-list-gap);
        padding: clamp(1rem, 2.4vw, 1.4rem);
        border-radius: var(--editable-list-radius);
        border: 1px solid var(--editable-list-border);
        background: var(--surface-elevated, #ffffff);
        box-shadow: var(--editable-list-shadow);
        transition:
          border-color var(--transition-base, 0.2s ease),
          box-shadow var(--transition-base, 0.2s ease),
          transform var(--transition-fast, 0.16s ease);
      }

      .editable-list:focus-within {
        border-color: var(--brand-500, #4ea4ea);
        box-shadow:
          0 0 0 3px rgba(78, 164, 234, 0.18),
          var(--editable-list-shadow);
        transform: translateY(-1px);
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
        font-size: clamp(1rem, 1.15vw, 1.05rem);
        font-weight: 600;
        color: var(--text-primary, #0a1630);
        letter-spacing: 0.01em;
      }

      .editable-list__helper {
        margin: 0;
        font-size: 0.9rem;
        color: var(--text-secondary, #51607a);
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
        border: 1px solid var(--border-strong, rgba(15, 40, 105, 0.22));
        color: var(--brand-700, #0f4d9e);
        background: var(--brand-50, #eaf4ff);
        box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
        transition:
          background-color var(--transition-fast, 0.16s ease),
          border-color var(--transition-fast, 0.16s ease),
          color var(--transition-fast, 0.16s ease),
          box-shadow var(--transition-base, 0.2s ease);
      }

      .editable-list__add:hover,
      .editable-list__add:focus-visible {
        background: var(--brand-100, #d7eaff);
        color: var(--brand-600, #2d7ed1);
        border-color: var(--brand-400, #68a7ef);
        box-shadow: 0 8px 20px rgba(78, 164, 234, 0.18);
      }

      .editable-list__add:focus-visible {
        outline: none;
      }

      .editable-list__items {
        display: grid;
        gap: 0.85rem;
        list-style: none;
        padding: 0;
        margin: 0;
      }

      .editable-list__item {
        background: var(--surface-elevated, #ffffff);
        border-radius: var(--radius-md, 0.75rem);
        border: 1px solid var(--border, rgba(15, 40, 105, 0.16));
        padding: clamp(0.75rem, 1.6vw, 1rem);
        box-shadow: 0 8px 20px rgba(2, 12, 27, 0.06);
        transition:
          border-color var(--transition-fast, 0.16s ease),
          box-shadow var(--transition-base, 0.2s ease),
          transform var(--transition-fast, 0.16s ease);
      }

      .editable-list__item:focus-within {
        border-color: var(--brand-500, #4ea4ea);
        box-shadow: 0 12px 26px rgba(78, 164, 234, 0.18);
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
        gap: clamp(0.65rem, 1.4vw, 1rem);
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
        color: var(--brand-700, #0f4d9e);
        background: var(--brand-50, #eaf4ff);
        border: 1px solid var(--border, rgba(15, 40, 105, 0.16));
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
        color: var(--text-secondary, #51607a);
      }

      .editable-list__input {
        min-width: 0;
        width: 100%;
        background: var(--surface-elevated, #ffffff);
        border-color: var(--border, rgba(15, 40, 105, 0.16));
        box-shadow: none;
      }

      .editable-list__input:focus-visible {
        border-color: var(--brand-500, #4ea4ea);
        box-shadow: 0 0 0 3px rgba(78, 164, 234, 0.2);
        outline: none;
      }

      .editable-list__input--invalid {
        border-color: var(--danger, #c03434);
        box-shadow: 0 0 0 2px rgba(192, 52, 52, 0.15);
        background: rgba(192, 52, 52, 0.06);
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
        background: rgba(192, 52, 52, 0.1);
        color: var(--danger, #c03434);
        font-size: 1.2rem;
        line-height: 1;
        cursor: pointer;
        transition:
          background-color var(--transition-fast, 0.16s ease),
          border-color var(--transition-fast, 0.16s ease),
          box-shadow var(--transition-base, 0.2s ease),
          transform var(--transition-fast, 0.16s ease);
      }

      .editable-list__remove:hover,
      .editable-list__remove:focus-visible {
        background: rgba(192, 52, 52, 0.18);
        border-color: rgba(192, 52, 52, 0.3);
        box-shadow: 0 10px 22px rgba(192, 52, 52, 0.25);
        transform: translateY(-1px);
        outline: none;
      }

      .editable-list__empty {
        font-size: 0.9rem;
        padding: 0.85rem 1rem;
        color: var(--text-secondary, #51607a);
        background: rgba(15, 40, 105, 0.06);
        border-radius: var(--radius-md, 0.75rem);
        text-align: center;
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
          border-radius: var(--radius-md, 0.75rem);
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
