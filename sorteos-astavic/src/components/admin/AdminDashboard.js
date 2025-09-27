// src/components/admin/AdminDashboard.js
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { ensureId, parseParticipants } from "../../utils/raffleUtils";
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
    // fallback Safari/iOS
    mql.addListener?.(handler);
    setMatches(mql.matches);
    return () => {
      mql.removeEventListener?.("change", handler);
      mql.removeListener?.(handler);
    };
  }, [query]);
  return matches;
}

// Chip util para mostrar contadores y tags (solo mobile)
const Chip = ({ children }) => (
  <span
    className="tag"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.375rem",
      fontSize: "0.85rem",
      padding: "0.25rem 0.6rem",
      borderRadius: "999px",
      background: "var(--surface-2, #f4f4f6)",
      color: "var(--text-2, #444)",
      border: "1px solid var(--line-1, #e6e6ea)",
      whiteSpace: "nowrap",
    }}
  >
    {children}
  </span>
);
Chip.propTypes = { children: PropTypes.node.isRequired };

// Tarjeta compacta de métricas (solo desktop)
const StatCard = ({ label, value, icon }) => (
  <div
    className="card"
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
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
      borderRadius: "0.75rem",
      background: "var(--surface-1, #ffffff)",
      border: "1px solid var(--line-1, #e6e6ea)",
    }}
  >
    {icon && (
      <div
        style={{ fontSize: "1.4rem", color: "var(--text-1, #222)" }}
        aria-hidden="true"
      >
        {icon}
      </div>
    )}
    <div>
      <div
        style={{
          fontSize: "0.85rem",
          fontWeight: 500,
          color: "var(--text-3, #666)",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "1.55rem",
          fontWeight: 700,
          color: "var(--text-1, #222)",
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

// Dropzone accesible
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
      className="card"
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      aria-label="Soltá tu archivo de participantes o presioná Enter para seleccionarlo"
      onKeyDown={handleKey}
      onClick={triggerPicker}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      style={{
        padding: "1rem",
        border: "1.5px dashed var(--line-1,#d8dae0)",
        background:
          "linear-gradient(180deg, rgba(250,250,252,0.7), rgba(250,250,252,0.35))",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <span style={{ fontSize: "1.25rem" }} aria-hidden>
          📎
        </span>
        <div>
          <div style={{ fontWeight: 600 }}>
            Soltá tu archivo (.csv, .tsv, .txt)
          </div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-3,#666)" }}>
            También podés hacer clic o presionar Enter para buscarlo.
          </div>
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
  const [status, setStatus] = useState(null); // { ok: boolean, message: string }
  const [loading, setLoading] = useState(false);

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
      if (!form.title.trim() || !form.datetime) {
        setStatus({
          ok: false,
          message: "Completá el título y la fecha del sorteo.",
        });
        setLoading(false);
        return;
      }
      const winnersNum = Math.max(1, Number(form.winners) || 1);
      const fileText = file ? await file.text() : "";
      const participants = parseParticipants(fileText, form.manual);
      if (participants.length === 0) {
        setStatus({
          ok: false,
          message:
            "No se detectaron participantes. Revisá el archivo o el texto.",
        });
        setLoading(false);
        return;
      }
      const normalizedPrizes = sanitizedPrizes.map((p) => ({ ...p }));
      const winnersCount =
        normalizedPrizes.length > 0 ? normalizedPrizes.length : winnersNum;

      const newRaffle = {
        id: ensureId(),
        title: form.title.trim(),
        description: form.description.trim(),
        datetime: form.datetime,
        winnersCount,
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

  return (
    <section className="section-gap" aria-labelledby="admin-panel">
      <div className="container" style={{ display: "grid", gap: "1.25rem" }}>
        {/* Toolbar responsive */}
        <div
          className="controls-row"
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.75rem",
          }}
        >
          <div>
            <h1
              id="admin-panel"
              className="section-title"
              style={{ marginBottom: "0.25rem" }}
            >
              Administración
            </h1>

            {/* Chips SOLO en mobile */}
            {!isDesktop && (
              <div className="tag-group">
                <Chip>🗂️ Sorteos: {metrics.total}</Chip>
                <Chip>⏳ Activos: {metrics.active}</Chip>
                <Chip>✅ Finalizados: {metrics.finished}</Chip>
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

        {/* Layout: 1 col en mobile / 2 cols >= 960px (lo maneja App.css .admin-layout) */}
        <div className="admin-layout">
          {/* Columna principal: formulario */}
          <form className="card" onSubmit={handleSubmit} noValidate>
            <fieldset
              className="form-card"
              disabled={loading}
              style={{ border: 0, padding: 0, margin: 0 }}
            >
              <legend className="visually-hidden">Crear sorteo</legend>

              <div className="form-group">
                <label htmlFor="raffle-title">Título</label>
                <input
                  id="raffle-title"
                  className="input"
                  name="title"
                  placeholder="Ej.: Sorteo Aniversario"
                  required
                  minLength={3}
                  value={form.title}
                  onChange={handleChange}
                  aria-describedby="title-help"
                />
                <span id="title-help" className="legend">
                  Usá un título claro y breve.
                </span>
              </div>

              <div className="form-group">
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
                <span className="legend">
                  Incluí condiciones o mensajes importantes.
                </span>
              </div>

              {/* .form-grid.split (App.css) hace responsive a 1/2 columnas */}
              <div className="form-grid split">
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
                    aria-describedby="datetime-help"
                  />
                  <span id="datetime-help" className="legend">
                    Se mostrará en formato latino.
                  </span>
                </div>

                <div className="form-group">
                  <label htmlFor="raffle-winners">Ganadores</label>
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

              <div className="form-group">
                <label>Premios</label>
                <p className="legend" style={{ marginBottom: "0.5rem" }}>
                  Definí un título por premio. El orden determina el puesto.
                </p>
                {prizes.map((prize, index) => (
                  <div
                    key={`prize-${index}`}
                    style={{
                      border: "1px solid var(--line-1,#e6e6ea)",
                      borderRadius: "0.75rem",
                      padding: "0.75rem",
                      marginBottom: "0.75rem",
                      background: "var(--surface-2,#f8f9fb)",
                    }}
                  >
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor={`prize-title-${index}`}>Título</label>
                      <input
                        id={`prize-title-${index}`}
                        className="input"
                        placeholder={`Premio ${index + 1}`}
                        value={prize.title}
                        onChange={(e) =>
                          handlePrizeChange(index, e.target.value)
                        }
                      />
                      <span className="legend">
                        Puesto {index + 1} ={" "}
                        {prize.title ? prize.title : `Premio ${index + 1}`}
                      </span>
                    </div>
                    {prizes.length > 1 && (
                      <div style={{ marginTop: "0.5rem", textAlign: "right" }}>
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
                  style={{ marginTop: "0.25rem" }}
                >
                  Agregar premio
                </button>
              </div>

              <div className="form-group">
                <label>Participantes</label>
                <FileDropzone
                  onFile={handleFile}
                  disabled={loading}
                  fileToken={fileToken}
                />
              </div>

              <div className="form-group">
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
                  aria-describedby="manual-help"
                />
                <span id="manual-help" className="legend">
                  Acepta email o nombre. Se eliminan duplicados automáticamente.
                </span>
              </div>

              <div
                className="card-actions"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="submit"
                  className="button button--primary"
                  aria-live="polite"
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
                <span className="legend">Previsualizá antes de publicar.</span>
              </div>

              {status && (
                <p
                  className={status.ok ? "success-text" : "error-text"}
                  role={status.ok ? "status" : "alert"}
                  style={{ marginTop: "0.5rem" }}
                >
                  {status.message}
                </p>
              )}
            </fieldset>
          </form>

          {/* Columna lateral: tutorial / métricas (desktop) / preview */}
          <aside
            style={{ display: "grid", gap: "1rem", alignContent: "start" }}
          >
            {/* Tutorial mejorado */}
            <div className="card" style={{ padding: "1.1rem 1rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  marginBottom: "0.4rem",
                }}
              >
                <h2
                  className="raffle-card__title"
                  style={{ fontSize: "1rem", margin: 0 }}
                >
                  Cómo crear un sorteo
                </h2>
              </div>

              <ol
                style={{
                  listStyle: "none",
                  margin: 0,
                  padding: 0,
                  display: "grid",
                  gap: "0.6rem",
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
                    style={{
                      display: "grid",
                      gridTemplateColumns: "auto 1fr",
                      gap: "0.6rem",
                      alignItems: "start",
                      padding: "0.55rem 0.6rem",
                      border: "1px solid var(--border)",
                      borderRadius: "0.75rem",
                      background: "var(--surface)",
                    }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        display: "grid",
                        placeItems: "center",
                        border: "1px solid var(--border)",
                        background: "var(--surface-elevated)",
                        fontSize: "1rem",
                      }}
                      aria-hidden
                    >
                      {step.icon}
                    </div>
                    <div>
                      <strong style={{ display: "block", marginBottom: 2 }}>
                        {i + 1}. {step.title}
                      </strong>
                      <span className="legend">{step.desc}</span>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            {/* Métricas: SOLO DESKTOP */}
            {isDesktop && (
              <div
                style={{
                  display: "grid",
                  gap: "0.75rem",
                  gridTemplateColumns: "repeat( auto-fit, minmax(160px, 1fr) )",
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

            {/* Vista previa (más chica en desktop) */}
            <div className="card" aria-live="polite">
              <h2
                className="raffle-card__title"
                style={{ fontSize: "1rem", marginBottom: "0.25rem" }}
              >
                Vista previa del sorteo
              </h2>
              <div
                style={{
                  pointerEvents: "none",
                  opacity: previewParticipants.length ? 1 : 0.6,
                  // Anchura contenida en desktop
                  maxWidth: isDesktop ? "360px" : "100%",
                }}
              >
                <RaffleCard
                  raffle={previewRaffle}
                  onLive={() => {}}
                  onMarkFinished={() => {}}
                  onRequestReminder={() => {}}
                />
              </div>
              <p className="section-subtitle" style={{ margin: "0.75rem 0 0" }}>
                {previewMessage}
              </p>
              {previewParticipants.length > 0 && (
                <ul
                  style={{
                    marginTop: "0.5rem",
                    paddingLeft: "1rem",
                    fontSize: "0.9rem",
                    color: "var(--text-2,#444)",
                  }}
                >
                  {previewParticipants.slice(0, 5).map((participant) => (
                    <li key={participant}>{participant}</li>
                  ))}
                  {previewParticipants.length > 5 && (
                    <li key="preview-more">...</li>
                  )}
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
