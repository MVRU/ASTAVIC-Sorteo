// ! DECISIÓN DE DISEÑO: Este componente abstrae la edición de colecciones en formularios manteniendo control externo del estado.
// * Normaliza entradas y gestiona el foco al agregar/eliminar para favorecer accesibilidad y UX consistentes.
// ? Riesgo: Navegadores sin soporte de requestAnimationFrame podrían degradar el enfoque automático; se cae de forma segura.
import { useId, useMemo, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";

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
              <label className="editable-list__item-label" htmlFor={inputId}>
                {itemLabel} {index + 1}
              </label>
              <div className="editable-list__item-controls">
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
                  aria-invalid={isInvalid ? "true" : undefined}
                />
                <button
                  type="button"
                  className="button button--ghost editable-list__remove"
                  onClick={() => handleRemove(index)}
                  aria-label={`Eliminar ${itemLabel.toLowerCase()} ${index + 1}`}
                >
                  ×
                </button>
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
