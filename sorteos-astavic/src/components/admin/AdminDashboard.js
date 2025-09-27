import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { ensureId, parseParticipants } from "../../utils/raffleUtils";
import RaffleCard from "../public/RaffleCard";

// Chip util para mostrar contadores y tags
const Chip = ({ children }) => (
  <span
    className="tag"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "0.375rem",
      fontSize: "0.85rem",
      padding: "0.25rem 0.5rem",
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

// Tarjeta compacta de metricas
const StatCard = ({ label, value, icon }) => (
  <div
    className="card"
    role="status"
    aria-live="polite"
    style={{
      padding: "1rem 1.25rem",
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      boxShadow: "0 6px 18px rgba(0,0,0,0.06)",
    }}
  >
    <div style={{ fontSize: "1.25rem" }} aria-hidden>
      {icon}
    </div>
    <div style={{ lineHeight: 1.2 }}>
      <div style={{ fontSize: "0.8rem", color: "var(--text-3,#666)" }}>{label}</div>
      <div style={{ fontSize: "1.4rem", fontWeight: 700 }}>{value}</div>
    </div>
  </div>
);
StatCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.node,
};
StatCard.defaultProps = { icon: "📊" };

// Dropzone accesible para subir o seleccionar archivos de participantes
const FileDropzone = ({ onFile, disabled, fileToken }) => {
  const zoneRef = useRef(null);
  const inputRef = useRef(null);

  const triggerPicker = () => {
    if (disabled) return;
    const input = inputRef.current;
    if (input) input.click();
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
    const nextFile = event.target.files && event.target.files[0] ? event.target.files[0] : null;
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
      aria-label="Solta tu archivo de participantes o presiona Enter para seleccionarlo"
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
          <div style={{ fontWeight: 600 }}>Solta tu archivo (.csv, .tsv, .txt)</div>
          <div style={{ fontSize: "0.9rem", color: "var(--text-3,#666)" }}>
            Tambien podes hacer clic o presionar Enter para buscarlo.
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

const AdminDashboard = ({ onLogout, onCreateRaffle, raffles, subscribersCount }) => {
  const previewDefaultMessage = "Subi un archivo o pega participantes para ver un resumen aca.";
  const [form, setForm] = useState({
    title: "",
    description: "",
    datetime: "",
    winners: "1",
    manual: "",
  });
  const [prizes, setPrizes] = useState([{ name: "", description: "" }]);
  const [file, setFile] = useState(null);
  const [previewMessage, setPreviewMessage] = useState(previewDefaultMessage);
  const [previewParticipants, setPreviewParticipants] = useState([]);
  const [status, setStatus] = useState(null); // { ok: boolean, message: string }
  const [loading, setLoading] = useState(false);

  const metrics = useMemo(() => {
    const active = raffles.filter((raffle) => !raffle.finished).length;
    const finished = raffles.length - active;
    return { total: raffles.length, active, finished };
  }, [raffles]);

  const sanitizedPrizes = useMemo(() => {
    return prizes.map((prize, index) => {
      const nameValue = prize && prize.name ? prize.name.trim() : "";
      const descriptionValue = prize && prize.description ? prize.description.trim() : "";
      return {
        name: nameValue || `Premio ${index + 1}`,
        description: descriptionValue,
      };
    });
  }, [prizes]);

  const previewRaffle = useMemo(() => {
    const fallbackDate = new Date(Date.now() + 86400000).toISOString();
    const participantsList =
      previewParticipants.length > 0 ? previewParticipants : ["Participante demo"];
    const winnersFallback =
      sanitizedPrizes.length > 0
        ? sanitizedPrizes.length
        : Math.max(1, Number(form.winners) || 1);
    return {
      id: "preview",
      title: form.title.trim() || "Titulo del sorteo",
      description: form.description.trim(),
      datetime: form.datetime || fallbackDate,
      winnersCount: winnersFallback,
      participants: participantsList,
      prizes: sanitizedPrizes,
      finished: false,
    };
  }, [form.title, form.description, form.datetime, form.winners, sanitizedPrizes, previewParticipants]);

  const buildPreviewState = useCallback(async (currentFile, manualText) => {
    const fileText = currentFile ? await currentFile.text() : "";
    const participants = parseParticipants(fileText, manualText || "");
    if (participants.length === 0) {
      return {
        participants: [],
        message: "No se detectaron participantes. Asegurate del formato o pega uno por linea.",
      };
    }
    const sampleList = participants.slice(0, 5).join(", ");
    const suffix = participants.length > 5 ? "..." : "";
    return {
      participants,
      message: `${participants.length} participantes detectados - Ejemplos: ${sampleList}${suffix}`,
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
      } catch (error) {
        if (cancelled) return;
        setPreviewParticipants([]);
        setPreviewMessage("No se pudo leer el archivo para la vista previa. Intenta nuevamente.");
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
        const additions = Array.from({ length: safeCount - prev.length }, () => ({
          name: "",
          description: "",
        }));
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

  const handlePrizeChange = (index, field, value) => {
    setPrizes((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
    setStatus(null);
  };

  const addPrize = () => {
    setPrizes((prev) => {
      const next = [...prev, { name: "", description: "" }];
      setForm((prevForm) => ({ ...prevForm, winners: String(next.length) }));
      return next;
    });
  };

  const removePrize = (index) => {
    setPrizes((prev) => {
      if (prev.length === 1) return prev;
      const next = prev.filter((_, idx) => idx !== index);
      const safeNext = next.length > 0 ? next : [{ name: "", description: "" }];
      setForm((prevForm) => ({ ...prevForm, winners: String(safeNext.length) }));
      return safeNext;
    });
  };

  const resetForm = () => {
    setForm({ title: "", description: "", datetime: "", winners: "1", manual: "" });
    setPrizes([{ name: "", description: "" }]);
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
        setStatus({ ok: false, message: "Completa el titulo y la fecha del sorteo." });
        setLoading(false);
        return;
      }
      const winnersNum = Math.max(1, Number(form.winners) || 1);
      const fileText = file ? await file.text() : "";
      const participants = parseParticipants(fileText, form.manual);
      if (participants.length === 0) {
        setStatus({ ok: false, message: "No se detectaron participantes. Revisa el archivo o el texto." });
        setLoading(false);
        return;
      }

      const normalizedPrizes = sanitizedPrizes.map((prize) => ({ ...prize }));
      const winnersCount = normalizedPrizes.length > 0 ? normalizedPrizes.length : winnersNum;

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
      if (result?.ok) {
        resetForm();
      }
    } catch (error) {
      setStatus({ ok: false, message: "Ocurrio un problema al leer el archivo. Intenta nuevamente." });
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
        <div
          className="controls-row"
          style={{ alignItems: "center", justifyContent: "space-between", gap: "1rem" }}
        >
          <div>
            <h1
              id="admin-panel"
              className="section-title"
              style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}
            >
              Administracion
            </h1>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              <Chip>Visibles: {metrics.total}</Chip>
              <Chip>Activos: {metrics.active}</Chip>
              <Chip>Finalizados: {metrics.finished}</Chip>
              <Chip>Suscriptores: {subscribersCount}</Chip>
            </div>
          </div>

          <button
            type="button"
            className="button button--ghost"
            onClick={onLogout}
            aria-label="Cerrar sesion de administracion"
            title="Cerrar sesion"
          >
            Cerrar sesion
          </button>
        </div>

        <div
          className="admin-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) 360px",
            gap: "1rem",
          }}
        >
          <form className="card" onSubmit={handleSubmit} noValidate>
            <fieldset className="form-card" disabled={loading} style={{ border: 0, padding: 0, margin: 0 }}>
              <legend className="visually-hidden">Crear sorteo</legend>

              <div className="form-group">
                <label htmlFor="raffle-title">Titulo</label>
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
                  Usa un titulo claro y breve.
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="raffle-description">Descripcion (opcional)</label>
                <textarea
                  id="raffle-description"
                  className="textarea"
                  name="description"
                  placeholder="Breve detalle del sorteo"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                />
                <span className="legend">Inclui condiciones o mensajes importantes.</span>
              </div>

              <div
                className="form-grid split"
                style={{ display: "grid", gap: "1rem", gridTemplateColumns: "1fr 180px" }}
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
                    aria-describedby="datetime-help"
                  />
                  <span id="datetime-help" className="legend">
                    Se mostrara en formato latino.
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
                  Define un nombre y una descripcion para cada premio.
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
                    <div
                      style={{
                        display: "grid",
                        gap: "0.75rem",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                      }}
                    >
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor={`prize-name-${index}`}>Titulo</label>
                        <input
                          id={`prize-name-${index}`}
                          className="input"
                          placeholder={`Premio ${index + 1}`}
                          value={prize.name}
                          onChange={(event) => handlePrizeChange(index, "name", event.target.value)}
                        />
                      </div>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor={`prize-description-${index}`}>Descripcion</label>
                        <input
                          id={`prize-description-${index}`}
                          className="input"
                          placeholder="Ej.: Orden de compra"
                          value={prize.description}
                          onChange={(event) => handlePrizeChange(index, "description", event.target.value)}
                        />
                      </div>
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
                <FileDropzone onFile={handleFile} disabled={loading} fileToken={fileToken} />
              </div>

              <div className="form-group">
                <label htmlFor="raffle-manual">O pegalo manualmente (uno por linea)</label>
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
                  Acepta email o nombre. Se eliminan duplicados automaticamente.
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
                <button type="submit" className="button button--primary" aria-live="polite">
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
                <span className="legend">Previsualiza antes de publicar.</span>
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

          <div style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
            <div className="card">
              <h2 className="raffle-card__title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                Como crear un sorteo
              </h2>
              <ol className="helper-list" style={{ margin: 0, paddingInlineStart: "1.25rem" }}>
                <li>Subi o pega la lista de participantes (CSV, TSV o texto).</li>
                <li>Defini fecha, hora, titulo y cantidad de ganadores.</li>
                <li>Publica: el publico vera el contador y la experiencia en vivo.</li>
              </ol>
            </div>

            <div style={{ display: "grid", gap: "0.75rem" }}>
              <StatCard label="Sorteos totales" value={metrics.total} icon="📂" />
              <StatCard label="Activos" value={metrics.active} icon="⏳" />
              <StatCard label="Finalizados" value={metrics.finished} icon="✅" />
            </div>

            <div className="card" aria-live="polite">
              <h2 className="raffle-card__title" style={{ fontSize: "1rem", marginBottom: "0.25rem" }}>
                Vista previa del sorteo
              </h2>
              <div
                style={{
                  pointerEvents: "none",
                  opacity: previewParticipants.length ? 1 : 0.6,
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
                  {previewParticipants.length > 5 && <li key="preview-more">...</li>}
                </ul>
              )}
            </div>
          </div>
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
  subscribersCount: PropTypes.number.isRequired,
};

export default AdminDashboard;

