// src/components/admin/manage/EditableList.js
// * DECISIÓN: Unificamos el rediseño de las listas editables para garantizar una
//   experiencia consistente entre creación y edición, reforzando accesibilidad
//   y adaptabilidad mobile sin duplicar estilos.
// -*- DECISIÓN: Incorporamos una etiqueta singular opcional para alinear la
//    semántica visual y accesible sin sacrificar encabezados descriptivos.
// -*- DECISIÓN: Contextualizamos el contador para informar el tipo de recurso
//    administrado y mejorar la retroalimentación asistiva.

import { useId, useMemo, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import "./EditableList.css";

const coerceString = (value) => {
  if (value === null || value === undefined) return "";
  return String(value);
};

const normalizeValues = (values) =>
  values.map((item) => coerceString(item).replace(/\r?\n/g, " "));

const FALLBACK_SINGULAR = "Elemento";
const FALLBACK_PLURAL = "Elementos";

const sanitizeToken = (value, fallback) => {
  const trimmed = coerceString(value).trim();
  return trimmed || fallback;
};

const toAccessibleLowerCase = (value, fallback) => {
  const sanitized = sanitizeToken(value, fallback);
  return sanitized.toLocaleLowerCase("es-ES");
};

const EditableList = ({
  id,
  label,
  itemLabel,
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
  const sanitizedLabel = useMemo(
    () => label.replace(/:\s*$/, "").trim(),
    [label]
  );
  const singularLabel = useMemo(() => {
    if (itemLabel && itemLabel.trim()) {
      return itemLabel.trim();
    }
    return sanitizeToken(sanitizedLabel, FALLBACK_SINGULAR);
  }, [itemLabel, sanitizedLabel]);
  const pluralLabel = useMemo(() => {
    return sanitizeToken(sanitizedLabel, FALLBACK_PLURAL);
  }, [sanitizedLabel]);
  const accessibleSingular = useMemo(() => {
    return toAccessibleLowerCase(singularLabel, FALLBACK_SINGULAR);
  }, [singularLabel]);
  const accessiblePlural = useMemo(() => {
    return toAccessibleLowerCase(pluralLabel, FALLBACK_PLURAL);
  }, [pluralLabel]);
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

  const summaryLabel = useMemo(() => {
    if (values.length === 0) {
      return `0 ${accessiblePlural}`;
    }
    if (values.length === 1) {
      return `1 ${accessibleSingular}`;
    }
    return `${values.length} ${accessiblePlural}`;
  }, [accessiblePlural, accessibleSingular, values.length]);
  const badgeAriaLabel = useMemo(() => {
    return `Total de ${accessiblePlural}: ${summaryLabel}`;
  }, [accessiblePlural, summaryLabel]);

  return (
    <div
      className="editable-list"
      aria-describedby={descriptionIds}
      role="group"
      aria-labelledby={labelId}
      data-length={values.length}
    >
      <div className="editable-list__header">
        <div className="editable-list__heading">
          <span id={labelId} className="editable-list__label">
            {label}
          </span>
          {helperText ? (
            <p id={helperId} className="editable-list__helper">
              {helperText}
            </p>
          ) : null}
        </div>
        <div className="editable-list__cta">
          <span
            className="editable-list__count"
            role="status"
            aria-live="polite"
            aria-label={badgeAriaLabel}
          >
            {summaryLabel}
          </span>
          <button
            type="button"
            className="button button--ghost editable-list__add"
            onClick={handleAdd}
          >
            {addButtonLabel}
          </button>
        </div>
      </div>
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
                  <label
                    className="editable-list__item-label"
                    htmlFor={inputId}
                  >
                    {singularLabel} {index + 1}
                  </label>
                  <input
                    id={inputId}
                    ref={registerRef(index)}
                    className={`input editable-list__input${
                      isInvalid ? " editable-list__input--invalid" : ""
                    }`}
                    value={value}
                    placeholder={placeholder}
                    onChange={(event) =>
                      handleItemChange(index, event.target.value)
                    }
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
                    aria-label={`Eliminar ${singularLabel.toLowerCase()} ${
                      index + 1
                    }`}
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
            {`Aún no agregaste ${accessiblePlural}.`}
          </li>
        ) : null}
      </ul>
    </div>
  );
};

EditableList.propTypes = {
  id: PropTypes.string,
  label: PropTypes.string.isRequired,
  itemLabel: PropTypes.string,
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
  itemLabel: undefined,
  values: [],
  addButtonLabel: "Agregar",
  placeholder: "",
  helperText: undefined,
  describedBy: undefined,
  invalidIndexes: [],
};

export default EditableList;
