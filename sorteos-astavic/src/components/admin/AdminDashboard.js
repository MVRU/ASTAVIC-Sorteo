// src/components/admin/AdminDashboard.js
// ! DECISIÓN DE DISEÑO: Este panel delega la validación en un helper compartido para mantener reglas coherentes en toda la aplicación.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { ensureId, parseParticipants } from "../../utils/raffleUtils";
import { validateRaffleDraft } from "../../utils/raffleValidation";
import RaffleCard from "../public/RaffleCard";

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
const StatCard = ({ label, value, icon }) => (
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
    {icon && (
      <div
        style={{
          fontSize: "1.4rem",
          color: "var(--brand-700)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: "var(--brand-50)",
        }}
        aria-hidden="true"
      >
        {icon}
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
  icon: PropTypes.node,
};
StatCard.defaultProps = { icon: "📊" };

/* =========================
   Dropzone accesible
   ========================= */
const FileDropzone = ({ onFile, disabled, fileToken }) => {
  const zoneRef = useRef(null);
  const inputRef = useRef(null);

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
      ref={zoneRef}
      className="card anim-fade-in"
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      aria-label="Soltá tu archivo de participantes o presioná Enter para seleccionarlo"
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
          fontSize: "1.4rem",
          boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
        }}
        aria-hidden="true"
      >
        📎
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
};
FileDropzone.propTypes = {
  onFile: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
  fileToken: PropTypes.string,
};
FileDropzone.defaultProps = {
  disabled: false,
  fileToken: "",
};

/* =========================
   AdminDashboard
   ========================= */
const AdminDashboard = ({ onLogout, onCreateRaffle, raffles }) => {
  const isDesktop = useMediaQuery("(min-width: 960px)");

  const previewDefaultMessage =
    "Subí un archivo o pegá participantes para ver un resumen acá.";
  const [form, setForm] = useState({
    title: "",
    description: "",
    datetime: "",
    winners: "1",
    manual: "",
  });
  const [prizes, setPrizes] = useState([{ title: "" }]);
  const [file, setFile] = useState(null);
  const [previewMessage, setPreviewMessage] = useState(previewDefaultMessage);
  const [previewParticipants, setPreviewParticipants] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

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
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    if (name === "winners") {
      const digitsOnly = value.replace(/[^0-9]/g, "");
      const nextCount = Math.max(1, Number(digitsOnly) || 1);
      setForm((prev) => ({ ...prev, winners: digitsOnly }));
      adjustPrizeSlots(nextCount);
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    setStatus(null);
  };

  const handleFile = (nextFile) => {
    setFile(nextFile);
    setStatus(null);
  };

  const handlePrizeChange = (index, value) => {
    setPrizes((prev) => {
      const next = [...prev];
      next[index] = { title: value };
      return next;
    });
    setStatus(null);
  };

  const addPrize = () => {
    setPrizes((prev) => {
      const next = [...prev, { title: "" }];
      setForm((prevForm) => ({ ...prevForm, winners: String(next.length) }));
      return next;
    });
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
  };

  const resetForm = () => {
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
    setStatus(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      const winnersNum = Math.max(1, Number(form.winners) || 1);
      const fileText = file ? await file.text() : "";
      const participants = parseParticipants(fileText, form.manual);

      const draft = {
        title: form.title,
        description: form.description,
        datetime: form.datetime,
        winnersCount: winnersNum,
        prizes,
        participants,
      };
      const errors = validateRaffleDraft(draft);
      if (errors.length > 0) {
        setStatus({ ok: false, message: errors[0] });
        setLoading(false);
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

      const result = onCreateRaffle(newRaffle);
      setStatus(result);
      if (result?.ok) resetForm();
    } catch {
      setStatus({
        ok: false,
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
                  🗂️ {metrics.total}
                </Chip>
                <Chip
                  active={chipHint === "active"}
                  onClick={() =>
                    setChipHint((s) => (s === "active" ? null : "active"))
                  }
                >
                  ⏳ {metrics.active}
                </Chip>
                <Chip
                  active={chipHint === "finished"}
                  onClick={() =>
                    setChipHint((s) => (s === "finished" ? null : "finished"))
                  }
                >
                  ✅ {metrics.finished}
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
                />
                <span
                  className="legend"
                  style={{ marginTop: "0.375rem", display: "block" }}
                >
                  Usá un título claro y breve.
                </span>
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
                />
                <span
                  className="legend"
                  style={{ marginTop: "0.375rem", display: "block" }}
                >
                  Incluí condiciones o mensajes importantes.
                </span>
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
                  />
                  <span
                    className="legend"
                    style={{ marginTop: "0.375rem", display: "block" }}
                  >
                    Se mostrará en formato latino.
                  </span>
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
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginBottom: "1.25rem" }}>
                <label>Premios</label>
                <p className="legend">
                  Definí un título por premio. El orden determina el puesto.
                </p>
                {prizes.map((prize, index) => (
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
                      />
                      <span className="legend">
                        Puesto {index + 1} ={" "}
                        {prize.title || `Premio ${index + 1}`}
                      </span>
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
                ))}
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
                />
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
                />
                <span
                  className="legend"
                  style={{ marginTop: "0.375rem", display: "block" }}
                >
                  Acepta email o nombre. Se eliminan duplicados automáticamente.
                </span>
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
                  onClick={resetForm}
                  disabled={loading}
                  title="Limpiar formulario"
                >
                  Limpiar
                </button>
                <span className="legend" style={{ marginLeft: "auto" }}>
                  Previsualizá antes de publicar.
                </span>
              </div>

              {status && (
                <p
                  className={`toast${
                    status.ok ? "" : " toast--error"
                  } anim-pop`}
                  role={status.ok ? "status" : "alert"}
                  style={{ marginTop: "1rem" }}
                >
                  {status.message}
                </p>
              )}
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
            {/* Tutorial */}
            <div className="card anim-fade-in">
              <h2
                style={{
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  margin: 0,
                  marginBottom: "1rem",
                }}
              >
                Cómo crear un sorteo
              </h2>
              <ol
                className="stagger is-on"
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.875rem",
                }}
              >
                {[
                  {
                    icon: "📥",
                    title: "Cargá participantes",
                    desc: "Subí un CSV/TSV o pegá la lista (uno por línea). Eliminamos duplicados automáticamente.",
                  },
                  {
                    icon: "🗓️",
                    title: "Configurá detalles",
                    desc: "Definí título, fecha y cantidad de ganadores. Ordená los premios según el puesto.",
                  },
                  {
                    icon: "🚀",
                    title: "Publicá el sorteo",
                    desc: "Se mostrará el contador y, al finalizar, todos verán los mismos ganadores.",
                  },
                ].map((step, i) => (
                  <li
                    key={step.title}
                    className="anim-up"
                    style={{
                      display: "flex",
                      gap: "1rem",
                      padding: "0.875rem",
                      borderRadius: "12px",
                      border: "1px solid var(--border)",
                      background: "var(--surface)",
                    }}
                  >
                    <div
                      style={{
                        width: "40px",
                        height: "40px",
                        borderRadius: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "var(--brand-50)",
                        color: "var(--brand-700)",
                        fontSize: "1.1rem",
                        flexShrink: 0,
                      }}
                      aria-hidden
                    >
                      {step.icon}
                    </div>
                    <div>
                      <strong
                        style={{
                          display: "block",
                          marginBottom: "0.25rem",
                          fontWeight: 700,
                        }}
                      >
                        {i + 1}. {step.title}
                      </strong>
                      <span
                        style={{
                          fontSize: "0.925rem",
                          color: "var(--text-secondary)",
                        }}
                      >
                        {step.desc}
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

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
                  icon="📂"
                />
                <StatCard label="Activos" value={metrics.active} icon="⏳" />
                <StatCard
                  label="Finalizados"
                  value={metrics.finished}
                  icon="✅"
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
                style={{
                  pointerEvents: "none",
                  opacity: previewParticipants.length ? 1 : 0.6,
                  maxWidth: isDesktop ? "380px" : "100%",
                  margin: "0 auto",
                }}
              >
                <RaffleCard
                  raffle={previewRaffle}
                  onLive={() => {}}
                  onMarkFinished={() => {}}
                  onRequestReminder={() => {}}
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
  raffles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      finished: PropTypes.bool,
    })
  ).isRequired,
};

export default AdminDashboard;
