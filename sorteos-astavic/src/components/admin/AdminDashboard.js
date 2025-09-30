// src/components/admin/AdminDashboard.js
// ! DECISIÓN DE DISEÑO: Los toasts globales sustituyen feedback locales para mantener consistencia y accesibilidad en el panel.
// ! DECISIÓN DE DISEÑO: Las validaciones ahora generan mensajes inline accesibles para acelerar la corrección de errores críticos.
import {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import PropTypes from "prop-types";
import { ensureId, parseParticipants } from "../../utils/raffleUtils";
import RaffleCard from "../public/RaffleCard";
import rafflePropType from "../public/rafflePropType";
import { useToast } from "../../context/ToastContext";
import Icon, { ICON_NAMES } from "../ui/Icon";
import AdminTutorial from "./AdminTutorial";

/* =========================
   Hook simple de media query
   ========================= */
function useMediaQuery(query) {
  const getMatch = () =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false;
  const [matches, setMatches] = useState(getMatch);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e) => setMatches(e.matches);
    mql.addEventListener?.("change", handler);
    mql.addListener?.(handler);
    setMatches(mql.matches);
    return () => {
      mql.removeEventListener?.("change", handler);
      mql.removeListener?.(handler);
    };
  }, [query]);
  return matches;
}

/* =========================
   Chip elegante (solo mobile)
   ========================= */
const Chip = ({ children, onClick, active }) => (
  <button
    type="button"
    className="tag"
    onClick={onClick}
    aria-pressed={!!active}
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.375rem",
      fontSize: "0.825rem",
      fontWeight: 600,
      padding: "0.25rem 0.6rem",
      borderRadius: "999px",
      background: active ? "var(--brand-100)" : "var(--brand-50)",
      color: "var(--brand-700)",
      border: "1px solid var(--border)",
      whiteSpace: "nowrap",
      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
      cursor: "pointer",
    }}
  >
    {children}
  </button>
);
Chip.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  active: PropTypes.bool,
};
Chip.defaultProps = { onClick: undefined, active: false };

/* =========================
   StatCard (solo desktop)
   ========================= */
const StatCard = ({ label, value, iconName }) => (
  <div
    className="card anim-fade-in"
    role="status"
    aria-live="polite"
    style={{
      padding: "1.1rem",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      gap: "0.5rem",
      borderRadius: "12px",
      background: "var(--surface-elevated)",
      border: "1px solid var(--border)",
      boxShadow: "var(--shadow-1)",
      transition:
        "transform var(--transition-base), box-shadow var(--transition-base)",
    }}
  >
    {iconName && (
      <div
        style={{
          color: "var(--brand-700)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "var(--brand-50)",
        }}
      >
        <Icon name={iconName} decorative size={24} strokeWidth={1.8} />
      </div>
    )}
    <div>
      <div
        style={{
          fontSize: "0.875rem",
          fontWeight: 600,
          color: "var(--text-secondary)",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "1.65rem",
          fontWeight: 700,
          color: "var(--brand-700)",
          lineHeight: 1.2,
        }}
      >
        {value}
      </div>
    </div>
  </div>
);
StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  iconName: PropTypes.oneOf(ICON_NAMES),
};
StatCard.defaultProps = { iconName: "chart" };

const PRIZE_COUNT_ERROR =
  "La cantidad de premios debe coincidir con la cantidad de ganadores.";

/* =========================
   Dropzone accesible
   ========================= */
const FileDropzone = forwardRef(
  ({ onFile, disabled, fileToken, describedBy }, externalRef) => {
    const zoneRef = useRef(null);
    const inputRef = useRef(null);

    const assignZoneRef = useCallback(
      (element) => {
        zoneRef.current = element;
        if (!externalRef) return;
        if (typeof externalRef === "function") {
          externalRef(element);
          return;
        }
        // * Permitimos al padre controlar el focus del contenedor.
        externalRef.current = element;
      },
      [externalRef]
    );

    const triggerPicker = () => {
      if (disabled) return;
      inputRef.current?.click();
    };

    const handleKey = (event) => {
      if (disabled) return;
      if (event.key === "Enter" || event.key === " ") {
        triggerPicker();
        event.preventDefault();
      }
    };

    const handleChange = (event) => {
      if (disabled) return;
      const nextFile =
        event.target.files && event.target.files[0]
          ? event.target.files[0]
          : null;
      onFile(nextFile);
    };

    const handleDragOver = (event) => {
      if (disabled) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = "copy";
    };

    const handleDrop = (event) => {
      if (disabled) return;
      event.preventDefault();
      const nextFile =
        event.dataTransfer.files && event.dataTransfer.files[0]
          ? event.dataTransfer.files[0]
          : null;
      onFile(nextFile);
    };

    useEffect(() => {
      if (!fileToken && inputRef.current) {
        inputRef.current.value = "";
      }
    }, [fileToken]);

    return (
      <div
        ref={assignZoneRef}
        className="card anim-fade-in"
        role="button"
        tabIndex={0}
        aria-disabled={disabled}
        aria-label="Soltá tu archivo de participantes o presioná Enter para seleccionarlo"
        aria-describedby={describedBy || undefined}
        onKeyDown={handleKey}
        onClick={triggerPicker}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          padding: "1.25rem",
          border: "2px dashed var(--border)",
          borderRadius: "12px",
          background: "var(--surface-elevated)",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "var(--surface)",
            color: "var(--brand-700)",
            boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
          }}
        >
          <Icon name="paperclip" decorative size={26} strokeWidth={1.9} />
        </div>
        <div>
          <div
            style={{
              fontWeight: 700,
              color: "var(--text-primary)",
              fontSize: "1rem",
            }}
          >
            Soltá tu archivo (.csv, .tsv, .txt)
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            También podés hacer clic o presionar Enter para buscarlo.
          </div>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.txt"
          onChange={handleChange}
          disabled={disabled}
          aria-hidden="true"
          style={{
            position: "absolute",
            opacity: 0,
            pointerEvents: "none",
            width: 0,
            height: 0,
          }}
        />
      </div>
    );
  }
);
FileDropzone.displayName = "FileDropzone";
FileDropzone.propTypes = {
  onFile: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  fileToken: PropTypes.string,
  describedBy: PropTypes.string,
};
FileDropzone.defaultProps = {
  disabled: false,
  fileToken: "",
  describedBy: undefined,
};

/* =========================
   AdminDashboard
   ========================= */
const AdminDashboard = ({ onLogout, onCreateRaffle, raffles }) => {
  const isDesktop = useMediaQuery("(min-width: 960px)");
  const { showToast } = useToast();

  const previewDefaultMessage =
    "Subí un archivo o pegá participantes para ver un resumen acá.";
  const [form, setForm] = useState({
    title: "",
    description: "",
    datetime: "",
    winners: "1",
    manual: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [prizes, setPrizes] = useState([{ title: "" }]);
  const [file, setFile] = useState(null);
  const [previewMessage, setPreviewMessage] = useState(previewDefaultMessage);
  const [previewParticipants, setPreviewParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const fieldRefs = useRef({});
  const prizeRefs = useRef([]);

  // Hint de chips (solo mobile)
  const [chipHint, setChipHint] = useState(null); // 'total' | 'active' | 'finished' | null
  const chipGroupRef = useRef(null);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!chipGroupRef.current) return;
      if (!chipGroupRef.current.contains(e.target)) setChipHint(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const metrics = useMemo(() => {
    const active = raffles.filter((r) => !r.finished).length;
    const finished = raffles.length - active;
    return { total: raffles.length, active, finished };
  }, [raffles]);

  const sanitizedPrizes = useMemo(
    () =>
      prizes.map((prize, index) => ({
        title: (prize?.title || "").trim() || `Premio ${index + 1}`,
      })),
    [prizes]
  );

  const buildDescribedBy = (...ids) =>
    ids
      .filter((id) => typeof id === "string" && id.trim().length > 0)
      .join(" ") || undefined;

  const previewRaffle = useMemo(() => {
    const fallbackDate = new Date(Date.now() + 86400000).toISOString();
    const participantsList =
      previewParticipants.length > 0
        ? previewParticipants
        : ["Participante demo"];
    const winnersFallback =
      sanitizedPrizes.length > 0
        ? sanitizedPrizes.length
        : Math.max(1, Number(form.winners) || 1);
    return {
      id: "preview",
      title: form.title.trim() || "Título del sorteo",
      description: form.description.trim(),
      datetime: form.datetime || fallbackDate,
      winnersCount: winnersFallback,
      participants: participantsList,
      prizes: sanitizedPrizes,
      finished: false,
    };
  }, [
    form.title,
    form.description,
    form.datetime,
    form.winners,
    sanitizedPrizes,
    previewParticipants,
  ]);

  const buildPreviewState = useCallback(async (currentFile, manualText) => {
    const fileText = currentFile ? await currentFile.text() : "";
    const participants = parseParticipants(fileText, manualText || "");
    if (participants.length === 0) {
      return {
        participants: [],
        message:
          "No se detectaron participantes. Asegurate del formato o pegá uno por línea.",
      };
    }
    const sampleList = participants.slice(0, 5).join(", ");
    const suffix = participants.length > 5 ? "..." : "";
    return {
      participants,
      message: `${participants.length} participantes detectados — Ejemplos: ${sampleList}${suffix}`,
    };
  }, []);

  useEffect(() => {
    if (!file && !form.manual.trim()) {
      setPreviewParticipants([]);
      setPreviewMessage(previewDefaultMessage);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const nextPreview = await buildPreviewState(file, form.manual);
        if (cancelled) return;
        setPreviewParticipants(nextPreview.participants);
        setPreviewMessage(nextPreview.message);
      } catch {
        if (cancelled) return;
        setPreviewParticipants([]);
        setPreviewMessage(
          "No se pudo leer el archivo para la vista previa. Intentá nuevamente."
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [file, form.manual, buildPreviewState, previewDefaultMessage]);

  const adjustPrizeSlots = (targetCount) => {
    const safeCount = Math.max(1, targetCount || 1);
    setPrizes((prev) => {
      if (safeCount === prev.length) return prev;
      if (safeCount > prev.length) {
        const additions = Array.from(
          { length: safeCount - prev.length },
          () => ({ title: "" })
        );
        return [...prev, ...additions];
      }
      return prev.slice(0, safeCount);
    });
    prizeRefs.current = prizeRefs.current.slice(0, safeCount);
    setFormErrors((prev) => {
      if (!prev?.prizes) return prev;
      if (!Array.isArray(prev.prizes)) return prev;
      if (prev.prizes.length <= safeCount) return prev;
      const nextPrizes = prev.prizes.slice(0, safeCount);
      if (nextPrizes.every((value) => !value)) {
        const { prizes: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, prizes: nextPrizes };
    });
  };

  const clearFieldError = useCallback(
    (field, index) => {
      setFormErrors((prev) => {
        if (!prev || Object.keys(prev).length === 0) return prev;
        if (field === "prizes") {
          if (!Array.isArray(prev.prizes)) return prev;
          if (typeof index !== "number") {
            const nextPrizes = [...prev.prizes];
            let touched = false;
            nextPrizes.forEach((value, idx) => {
              if (value === PRIZE_COUNT_ERROR) {
                nextPrizes[idx] = null;
                touched = true;
              }
            });
            if (!touched) return prev;
            if (nextPrizes.every((value) => !value)) {
              const { prizes: _removed, ...rest } = prev;
              return rest;
            }
            return { ...prev, prizes: nextPrizes };
          }
          if (!prev.prizes[index]) return prev;
          const nextPrizes = [...prev.prizes];
          nextPrizes[index] = null;
          if (nextPrizes.every((value) => !value)) {
            const { prizes: _removed, ...rest } = prev;
            return rest;
          }
          return { ...prev, prizes: nextPrizes };
        }
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [setFormErrors]
  );

  const focusFirstError = useCallback(
    (fieldErrors) => {
      if (!fieldErrors) return;
      const order = ["title", "description", "datetime", "winners", "prizes", "manual"];
      for (const key of order) {
        if (key === "prizes") {
          if (!Array.isArray(fieldErrors.prizes)) continue;
          const firstPrize = fieldErrors.prizes.findIndex((value) => Boolean(value));
          if (firstPrize >= 0) {
            const target = prizeRefs.current[firstPrize];
            target?.focus?.();
            return;
          }
          continue;
        }
        if (!fieldErrors[key]) continue;
        const node = fieldRefs.current[key];
        if (node && typeof node.focus === "function") {
          node.focus();
          return;
        }
      }
    },
    []
  );

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "winners") {
      const digitsOnly = value.replace(/[^0-9]/g, "");
      const nextCount = Math.max(1, Number(digitsOnly) || 1);
      setForm((prev) => ({ ...prev, winners: digitsOnly }));
      adjustPrizeSlots(nextCount);
      clearFieldError("winners");
      clearFieldError("prizes");
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
  };

  const handleFile = (nextFile) => {
    setFile(nextFile);
    clearFieldError("manual");
  };

  const handlePrizeChange = (index, value) => {
    setPrizes((prev) => {
      const next = [...prev];
      next[index] = { title: value };
      return next;
    });
    clearFieldError("prizes", index);
  };

  const addPrize = () => {
    setPrizes((prev) => {
      const next = [...prev, { title: "" }];
      setForm((prevForm) => ({ ...prevForm, winners: String(next.length) }));
      return next;
    });
    prizeRefs.current.push(null);
    clearFieldError("prizes");
    clearFieldError("winners");
  };

  const removePrize = (index) => {
    setPrizes((prev) => {
      if (prev.length === 1) return prev;
      const next = prev.filter((_, idx) => idx !== index);
      const safeNext = next.length > 0 ? next : [{ title: "" }];
      setForm((prevForm) => ({
        ...prevForm,
        winners: String(safeNext.length),
      }));
      return safeNext;
    });
    prizeRefs.current.splice(index, 1);
    clearFieldError("prizes", index);
    clearFieldError("winners");
  };

  const resetFormState = useCallback(() => {
    setForm({
      title: "",
      description: "",
      datetime: "",
      winners: "1",
      manual: "",
    });
    setPrizes([{ title: "" }]);
    setFile(null);
    setPreviewParticipants([]);
    setPreviewMessage(previewDefaultMessage);
    setFormErrors({});
    prizeRefs.current = [];
  }, [previewDefaultMessage]);

  const handleResetClick = useCallback(() => {
    resetFormState();
    showToast({
      status: "info",
      message: "Se reinició el formulario. Podés cargar los datos nuevamente.",
    });
  }, [resetFormState, showToast]);

  /* =========================
     Validaciones robustas
     ========================= */
  const validateBeforeSubmit = (payload) => {
    const generalErrors = [];
    const fieldErrors = {};

    const title = (payload.title || "").trim();
    if (title.length < 3) {
      const message = "El título debe tener al menos 3 caracteres.";
      generalErrors.push(message);
      fieldErrors.title = message;
    }

    if (!payload.datetime) {
      const message = "Seleccioná fecha y hora del sorteo.";
      generalErrors.push(message);
      fieldErrors.datetime = message;
    } else {
      const selected = new Date(payload.datetime).getTime();
      if (Number.isNaN(selected)) {
        const message = "La fecha/hora no es válida.";
        generalErrors.push(message);
        fieldErrors.datetime = message;
      } else if (selected <= Date.now()) {
        const message = "La fecha/hora debe ser en el futuro.";
        generalErrors.push(message);
        fieldErrors.datetime = message;
      }
    }

    const winnersNum = Math.max(1, Number(payload.winners) || 1);
    if (winnersNum < 1) {
      const message = "Debe haber al menos 1 ganador.";
      generalErrors.push(message);
      fieldErrors.winners = message;
    }

    if (!Array.isArray(payload.prizes) || payload.prizes.length !== winnersNum) {
      const message = PRIZE_COUNT_ERROR;
      generalErrors.push(message);
      fieldErrors.winners = fieldErrors.winners || message;
      const prizesArray = Array.isArray(payload.prizes)
        ? [...payload.prizes]
        : Array.from({ length: winnersNum });
      fieldErrors.prizes = prizesArray.map(() => message);
    }

    if (Array.isArray(payload.prizes)) {
      payload.prizes.forEach((prize, index) => {
        if (!prize || !String(prize.title).trim()) {
          const message = `El título del premio ${index + 1} no puede estar vacío.`;
          generalErrors.push(message);
          if (!fieldErrors.prizes) fieldErrors.prizes = [];
          fieldErrors.prizes[index] = message;
        }
      });
    }

    const participants = Array.isArray(payload.participants)
      ? payload.participants
      : [];
    if (participants.length === 0) {
      const message = "No se detectaron participantes (archivo o texto).";
      generalErrors.push(message);
      fieldErrors.manual = message;
    } else if (participants.length < winnersNum) {
      const message =
        "La cantidad de participantes debe ser mayor o igual a la de ganadores.";
      generalErrors.push(message);
      fieldErrors.manual = message;
    }

    if (fieldErrors.prizes && fieldErrors.prizes.every((value) => !value)) {
      delete fieldErrors.prizes;
    }

    return { generalErrors, fieldErrors };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const winnersNum = Math.max(1, Number(form.winners) || 1);
      const fileText = file ? await file.text() : "";
      const participants = parseParticipants(fileText, form.manual);

      const draft = {
        title: form.title,
        description: form.description,
        datetime: form.datetime,
        participants,
        winners: winnersNum,
        prizes,
      };
      const { fieldErrors: validationFieldErrors, generalErrors } =
        validateBeforeSubmit(draft);
      const hasFieldIssues = Object.keys(validationFieldErrors).length > 0;
      if (hasFieldIssues) {
        setFormErrors(validationFieldErrors);
        focusFirstError(validationFieldErrors);
      } else {
        setFormErrors({});
      }
      if (generalErrors.length > 0) {
        showToast({
          status: "error",
          message:
            generalErrors[0] || "Revisá los datos antes de crear el sorteo.",
        });
        return;
      }

      const normalizedPrizes = prizes.map((p) => ({
        title: String(p.title).trim(),
      }));

      const newRaffle = {
        id: ensureId(),
        title: draft.title.trim(),
        description: draft.description.trim(),
        datetime: draft.datetime,
        winnersCount: winnersNum,
        participants,
        prizes: normalizedPrizes,
        finished: false,
      };

      const result = await Promise.resolve(onCreateRaffle(newRaffle));
      if (result?.ok === false) {
        showToast({
          status: "error",
          message:
            result.message || "No pudimos crear el sorteo. Intentá nuevamente.",
        });
        return;
      }
      showToast({
        status: "success",
        message:
          result?.message ||
          "Sorteo creado (demo). Ya es visible en la vista pública.",
      });
      resetFormState();
      setFormErrors({});
    } catch {
      showToast({
        status: "error",
        message: "Ocurrió un problema al leer el archivo. Intentá nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fileToken = file
    ? `${file.name}-${file.size}-${file.lastModified}`
    : "";

  // Contenidos de hint para chips
  const chipText = {
    total: "Sorteos totales",
    active: "Sorteos activos",
    finished: "Sorteos finalizados",
  };
  const prizeErrors = Array.isArray(formErrors.prizes) ? formErrors.prizes : [];
  const titleHintId = "raffle-title-hint";
  const titleErrorId = "raffle-title-error";
  const descriptionHintId = "raffle-description-hint";
  const datetimeHintId = "raffle-datetime-hint";
  const datetimeErrorId = "raffle-datetime-error";
  const winnersHintId = "raffle-winners-hint";
  const winnersErrorId = "raffle-winners-error";
  const participantsHintId = "raffle-participants-hint";
  const manualHintId = "raffle-manual-hint";
  const manualErrorId = "raffle-manual-error";

  return (
    <section className="section-gap anim-fade-in" aria-labelledby="admin-panel">
      <div className="container" style={{ display: "grid", gap: "1.5rem" }}>
        {/* Toolbar */}
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

            {/* Chips solo en mobile + hint único */}
            {!isDesktop && (
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
                <Chip
                  active={chipHint === "total"}
                  onClick={() =>
                    setChipHint((s) => (s === "total" ? null : "total"))
                  }
                >
                  <Icon name="collection" decorative size={16} strokeWidth={2} />
                  {metrics.total}
                </Chip>
                <Chip
                  active={chipHint === "active"}
                  onClick={() =>
                    setChipHint((s) => (s === "active" ? null : "active"))
                  }
                >
                  <Icon name="hourglass" decorative size={16} strokeWidth={2} />
                  {metrics.active}
                </Chip>
                <Chip
                  active={chipHint === "finished"}
                  onClick={() =>
                    setChipHint((s) => (s === "finished" ? null : "finished"))
                  }
                >
                  <Icon name="checkCircle" decorative size={16} strokeWidth={2} />
                  {metrics.finished}
                </Chip>

                {/* Hint (solo uno a la vez) */}
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
            )}
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
          {/* Formulario principal */}
          <form
            className="card anim-scale-in"
            onSubmit={handleSubmit}
            noValidate
          >
            <fieldset
              disabled={loading}
              style={{ border: 0, padding: 0, margin: 0 }}
            >
              <legend className="visually-hidden">Crear sorteo</legend>

              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label htmlFor="raffle-title">Título del sorteo</label>
                <input
                  id="raffle-title"
                  className="input"
                  name="title"
                  placeholder="Ej.: Sorteo de Aniversario"
                  required
                  minLength={3}
                  value={form.title}
                  onChange={handleChange}
                  ref={(element) => {
                    fieldRefs.current.title = element;
                  }}
                  aria-invalid={Boolean(formErrors.title)}
                  aria-describedby={buildDescribedBy(
                    titleHintId,
                    formErrors.title ? titleErrorId : null
                  )}
                />
                <span
                  className="legend"
                  id={titleHintId}
                  style={{ marginTop: "0.375rem", display: "block" }}
                >
                  Usá un título claro y breve.
                </span>
                {formErrors.title && (
                  <p
                    id={titleErrorId}
                    role="alert"
                    style={{
                      marginTop: "0.375rem",
                      color: "var(--danger)",
                      fontSize: "0.875rem",
                    }}
                  >
                    {formErrors.title}
                  </p>
                )}
              </div>

              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label htmlFor="raffle-description">
                  Descripción (opcional)
                </label>
                <textarea
                  id="raffle-description"
                  className="textarea"
                  name="description"
                  placeholder="Breve detalle del sorteo"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                  ref={(element) => {
                    fieldRefs.current.description = element;
                  }}
                  aria-invalid={Boolean(formErrors.description)}
                  aria-describedby={buildDescribedBy(
                    descriptionHintId,
                    formErrors.description ? `${descriptionHintId}-error` : null
                  )}
                />
                <span
                  className="legend"
                  id={descriptionHintId}
                  style={{ marginTop: "0.375rem", display: "block" }}
                >
                  Incluí condiciones o mensajes importantes.
                </span>
                {formErrors.description && (
                  <p
                    id={`${descriptionHintId}-error`}
                    role="alert"
                    style={{
                      marginTop: "0.375rem",
                      color: "var(--danger)",
                      fontSize: "0.875rem",
                    }}
                  >
                    {formErrors.description}
                  </p>
                )}
              </div>

              <div
                className="form-grid split"
                style={{
                  display: "grid",
                  gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
                  gap: "1rem",
                  marginBottom: "1.25rem",
                }}
              >
                <div className="form-group">
                  <label htmlFor="raffle-datetime">Fecha y hora</label>
                  <input
                    id="raffle-datetime"
                    className="input"
                    name="datetime"
                    type="datetime-local"
                    required
                    value={form.datetime}
                    onChange={handleChange}
                    ref={(element) => {
                      fieldRefs.current.datetime = element;
                    }}
                    aria-invalid={Boolean(formErrors.datetime)}
                    aria-describedby={buildDescribedBy(
                      datetimeHintId,
                      formErrors.datetime ? datetimeErrorId : null
                    )}
                  />
                  <span
                    className="legend"
                    id={datetimeHintId}
                    style={{ marginTop: "0.375rem", display: "block" }}
                  >
                    Se mostrará en formato latino.
                  </span>
                  {formErrors.datetime && (
                    <p
                      id={datetimeErrorId}
                      role="alert"
                      style={{
                        marginTop: "0.375rem",
                        color: "var(--danger)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {formErrors.datetime}
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <label htmlFor="raffle-winners">Número de ganadores</label>
                  <input
                    id="raffle-winners"
                    className="input"
                    name="winners"
                    type="number"
                    min="1"
                    required
                    value={form.winners}
                    onChange={handleChange}
                    inputMode="numeric"
                    pattern="[0-9]*"
                    ref={(element) => {
                      fieldRefs.current.winners = element;
                    }}
                    aria-invalid={Boolean(formErrors.winners)}
                    aria-describedby={buildDescribedBy(
                      winnersHintId,
                      formErrors.winners ? winnersErrorId : null
                    )}
                  />
                  <span
                    className="legend"
                    id={winnersHintId}
                    style={{ marginTop: "0.375rem", display: "block" }}
                  >
                    Ajustamos los premios automáticamente según esta cantidad.
                  </span>
                  {formErrors.winners && (
                    <p
                      id={winnersErrorId}
                      role="alert"
                      style={{
                        marginTop: "0.375rem",
                        color: "var(--danger)",
                        fontSize: "0.875rem",
                      }}
                    >
                      {formErrors.winners}
                    </p>
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label>Premios</label>
                <p className="legend">
                  Definí un título por premio. El orden determina el puesto.
                </p>
                {prizes.map((prize, index) => {
                  const hintId = `prize-title-${index}-hint`;
                  const errorId = `prize-title-${index}-error`;
                  const prizeError = prizeErrors[index];
                  return (
                  <div
                    key={`prize-${index}`}
                    className="anim-fade-in"
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      padding: "1rem",
                      marginBottom: "0.75rem",
                      background: "var(--surface)",
                    }}
                  >
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor={`prize-title-${index}`}>
                        Título del premio {index + 1}
                      </label>
                      <input
                        id={`prize-title-${index}`}
                        className="input"
                        placeholder={`Premio ${index + 1}`}
                        required
                        value={prize.title}
                        onChange={(e) =>
                          handlePrizeChange(index, e.target.value)
                        }
                        ref={(element) => {
                          prizeRefs.current[index] = element;
                        }}
                        aria-invalid={Boolean(prizeError)}
                        aria-describedby={buildDescribedBy(
                          hintId,
                          prizeError ? errorId : null
                        )}
                      />
                      <span className="legend" id={hintId}>
                        Puesto {index + 1} ={" "}
                        {prize.title || `Premio ${index + 1}`}
                      </span>
                      {prizeError && (
                        <p
                          id={errorId}
                          role="alert"
                          style={{
                            marginTop: "0.375rem",
                            color: "var(--danger)",
                            fontSize: "0.875rem",
                          }}
                        >
                          {prizeError}
                        </p>
                      )}
                    </div>
                    {prizes.length > 1 && (
                      <div style={{ marginTop: "0.75rem", textAlign: "right" }}>
                        <button
                          type="button"
                          className="button button--ghost"
                          onClick={() => removePrize(index)}
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                  </div>
                );
                })}
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={addPrize}
                >
                  + Agregar premio
                </button>
              </div>

              <div
                className="form-group anim-up"
                style={{ marginBottom: "1.25rem" }}
              >
                <label>Participantes</label>
                <FileDropzone
                  onFile={handleFile}
                  disabled={loading}
                  fileToken={fileToken}
                  ref={(element) => {
                    fieldRefs.current.participants = element;
                  }}
                  describedBy={buildDescribedBy(
                    participantsHintId,
                    formErrors.manual ? manualErrorId : null
                  )}
                />
                <p
                  className="legend"
                  id={participantsHintId}
                  style={{ marginTop: "0.375rem", display: "block" }}
                >
                  Acepta archivos .csv, .tsv o .txt con un participante por línea.
                </p>
              </div>

              <div
                className="form-group anim-up"
                style={{ marginBottom: "1.25rem" }}
              >
                <label htmlFor="raffle-manual">
                  O pegalo manualmente (uno por línea)
                </label>
                <textarea
                  id="raffle-manual"
                  className="textarea"
                  name="manual"
                  placeholder={"ana@correo.com\nbruno@correo.com"}
                  value={form.manual}
                  onChange={handleChange}
                  rows={4}
                  ref={(element) => {
                    fieldRefs.current.manual = element;
                  }}
                  aria-invalid={Boolean(formErrors.manual)}
                  aria-describedby={buildDescribedBy(
                    manualHintId,
                    formErrors.manual ? manualErrorId : null
                  )}
                />
                <span
                  className="legend"
                  id={manualHintId}
                  style={{ marginTop: "0.375rem", display: "block" }}
                >
                  Acepta email o nombre. Se eliminan duplicados automáticamente.
                </span>
                {formErrors.manual && (
                  <p
                    id={manualErrorId}
                    role="alert"
                    style={{
                      marginTop: "0.375rem",
                      color: "var(--danger)",
                      fontSize: "0.875rem",
                    }}
                  >
                    {formErrors.manual}
                  </p>
                )}
              </div>

              <div
                className="card-actions anim-up"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                  paddingTop: "0.5rem",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <button
                  type="submit"
                  className="button button--primary"
                  aria-live="polite"
                  disabled={loading}
                >
                  {loading ? "Creando..." : "Crear sorteo"}
                </button>
                <button
                  type="button"
                  className="button button--ghost"
                  onClick={handleResetClick}
                  disabled={loading}
                  title="Limpiar formulario"
                >
                  Limpiar
                </button>
                <span className="legend" style={{ marginLeft: "auto" }}>
                  Previsualizá antes de publicar.
                </span>
              </div>

            </fieldset>
          </form>

          {/* Sidebar: tutorial + métricas + preview */}
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

            {/* Métricas (solo desktop) */}
            {isDesktop && (
              <div
                className="stagger is-on"
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                }}
              >
                <StatCard
                  label="Sorteos totales"
                  value={metrics.total}
                  iconName="collection"
                />
                <StatCard label="Activos" value={metrics.active} iconName="hourglass" />
                <StatCard
                  label="Finalizados"
                  value={metrics.finished}
                  iconName="checkCircle"
                />
              </div>
            )}

            {/* Vista previa */}
            <div className="card anim-fade-in" aria-live="polite">
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  margin: 0,
                  marginBottom: "1rem",
                }}
              >
                Vista previa
              </h2>
              <div
                className="anim-up"
                aria-hidden="true"
                style={{
                  pointerEvents: "none",
                  opacity: previewParticipants.length ? 1 : 0.6,
                  maxWidth: isDesktop ? "380px" : "100%",
                  margin: "0 auto",
                }}
              >
                <RaffleCard
                  raffle={previewRaffle}
                  onMarkFinished={() => {}}
                  onRequestReminder={() => {}}
                  interactionMode="preview"
                />
              </div>
              <p
                className="anim-up"
                style={{
                  margin: "1rem 0 0.5rem",
                  fontSize: "0.925rem",
                  color: "var(--text-secondary)",
                }}
              >
                {previewMessage}
              </p>
              {previewParticipants.length > 0 && (
                <ul
                  className="anim-up"
                  style={{
                    marginTop: "0.5rem",
                    paddingLeft: "1.25rem",
                    fontSize: "0.9rem",
                    color: "var(--text-secondary)",
                    maxHeight: "100px",
                    overflowY: "auto",
                  }}
                >
                  {previewParticipants.slice(0, 5).map((participant) => (
                    <li key={participant}>{participant}</li>
                  ))}
                  {previewParticipants.length > 5 && <li>...</li>}
                </ul>
              )}
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
};

AdminDashboard.propTypes = {
  onLogout: PropTypes.func.isRequired,
  onCreateRaffle: PropTypes.func.isRequired,
  raffles: PropTypes.arrayOf(rafflePropType).isRequired,
};

export default AdminDashboard;
