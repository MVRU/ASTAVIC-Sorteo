import { useEffect, useMemo, useRef, useState } from "react";
import PropTypes from "prop-types";
import { ensureId, parseParticipants } from "../../utils/raffleUtils";

/** Chips compactos para ejemplos y tags */
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

/** Tarjeta de métrica */
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
      <div style={{ fontSize: "0.8rem", color: "var(--text-3,#666)" }}>
        {label}
      </div>
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

/** Dropzone accesible para archivo (teclado, mouse y drag&drop) */
const FileDropzone = ({ onFile, disabled }) => {
  const zoneRef = useRef(null);

  const handleKey = (e) => {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      const input = zoneRef.current?.querySelector('input[type="file"]');
      if (input) input.click();
      e.preventDefault();
    }
  };

  const handleChange = (e) => {
    if (disabled) return;
    const f = e.target.files && e.target.files[0] ? e.target.files[0] : null;
    onFile(f || null);
  };

  const handleDragOver = (e) => {
    if (disabled) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e) => {
    if (disabled) return;
    e.preventDefault();
    const f =
      e.dataTransfer.files && e.dataTransfer.files[0]
        ? e.dataTransfer.files[0]
        : null;
    onFile(f || null);
  };

  return (
    <div
      ref={zoneRef}
      className="card"
      onKeyDown={handleKey}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      role="button"
      tabIndex={0}
      aria-label="Soltá aquí tu archivo de participantes o presioná Enter para seleccionarlo"
      style={{
        padding: "1rem",
        border: "1.5px dashed var(--line-1,#d8dae0)",
        background:
          "linear-gradient(180deg, rgba(250,250,252,0.7), rgba(250,250,252,0.35))",
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
};
FileDropzone.defaultProps = { disabled: false };

const AdminDashboard = ({
  onLogout,
  onCreateRaffle,
  raffles,
  subscribersCount,
}) => {
  const [form, setForm] = useState({
    title: "",
    datetime: "",
    winners: "1",
    manual: "",
  });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(
    "Subí un archivo o pegá participantes para ver un resumen aquí."
  );
  const [status, setStatus] = useState(null); // { ok:boolean, message:string }
  const [loading, setLoading] = useState(false);

  // Métricas (tarjetas)
  const metrics = useMemo(() => {
    const active = raffles.filter((r) => !r.finished).length;
    const finished = raffles.length - active;
    return { active, finished, total: raffles.length };
  }, [raffles]);

  // Util: actualiza previsualización (sin crear sorteo)
  const updatePreview = async (f, manualText) => {
    const fileText = f ? await f.text() : "";
    const participants = parseParticipants(fileText, manualText || "");
    if (participants.length === 0) {
      setPreview(
        "No se detectaron participantes. Asegurate del formato o pegá uno por línea."
      );
      return;
    }
    const sample = participants.slice(0, 5);
    setPreview(
      `${
        participants.length
      } participantes detectados • Ejemplos: ${sample.join(", ")}${
        participants.length > 5 ? "…" : ""
      }`
    );
  };

  // Preview inmediato al cargar archivo o modificar texto manual
  useEffect(() => {
    // Evitamos bloquear UI si falta todo
    if (!file && !form.manual.trim()) {
      setPreview(
        "Subí un archivo o pegá participantes para ver un resumen aquí."
      );
      return;
    }
    let cancelled = false;
    (async () => {
      await updatePreview(file, form.manual);
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
  }, [file, form.manual]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFile = (nextFile) => {
    setFile(nextFile);
    setStatus(null);
  };

  const resetForm = () => {
    setForm({ title: "", datetime: "", winners: "1", manual: "" });
    setFile(null);
    setPreview(
      "Subí un archivo o pegá participantes para ver un resumen aquí."
    );
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    setLoading(true);
    try {
      // Validaciones mínimas
      if (!form.title.trim() || !form.datetime) {
        setStatus({ ok: false, message: "Completá título y fecha/hora." });
        setLoading(false);
        return;
      }
      const winnersNum = Number(form.winners) || 1;
      if (winnersNum < 1) {
        setStatus({
          ok: false,
          message: "La cantidad de ganadores debe ser al menos 1.",
        });
        setLoading(false);
        return;
      }

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

      const newRaffle = {
        id: ensureId(),
        title: form.title.trim(),
        datetime: form.datetime,
        winnersCount: winnersNum,
        participants,
        finished: false,
      };

      const result = onCreateRaffle(newRaffle);
      setStatus(result);
      if (result?.ok) resetForm();
    } catch (err) {
      setStatus({
        ok: false,
        message: "Ocurrió un error al leer el archivo. Intentá nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section-gap" aria-labelledby="admin-panel">
      <div className="container" style={{ display: "grid", gap: "1.25rem" }}>
        {/* Header con métricas y acción de logout */}
        <div
          className="controls-row"
          style={{
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
          }}
        >
          <div>
            <h1
              id="admin-panel"
              className="section-title"
              style={{ fontSize: "1.8rem", marginBottom: "0.25rem" }}
            >
              Administración
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
            aria-label="Cerrar sesión de administración"
            title="Cerrar sesión"
          >
            Cerrar sesión
          </button>
        </div>

        {/* Grid principal: formulario + ayudas/preview */}
        <div
          className="admin-layout"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1fr) 360px",
            gap: "1rem",
          }}
        >
          {/* Columna izquierda: formulario */}
          <form className="card" onSubmit={handleSubmit} noValidate>
            <fieldset
              className="form-card"
              disabled={loading}
              style={{ border: 0, padding: 0, margin: 0 }}
            >
              <legend className="visually-hidden">Crear sorteo</legend>

              {/* Campos: título y datetime/winners */}
              <div className="form-group">
                <label htmlFor="raffle-title">Título</label>
                <input
                  id="raffle-title"
                  className="input"
                  name="title"
                  placeholder="Ej.: Sorteo Día de la Madre"
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

              <div
                className="form-grid split"
                style={{
                  display: "grid",
                  gap: "1rem",
                  gridTemplateColumns: "1fr 180px",
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

              {/* Dropzone accesible */}
              <div className="form-group">
                <label>Participantes</label>
                <FileDropzone onFile={handleFile} disabled={loading} />
              </div>

              {/* Manual text */}
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

              {/* Acciones */}
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
                  {loading ? "Creando…" : "Crear sorteo"}
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

              {/* Mensajes de estado */}
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

          {/* Columna derecha: ayudas + métricas + preview */}
          <div style={{ display: "grid", gap: "1rem", alignContent: "start" }}>
            <div className="card">
              <h2
                className="raffle-card__title"
                style={{ fontSize: "1rem", marginBottom: "0.5rem" }}
              >
                Cómo crear un sorteo
              </h2>
              <ol
                className="helper-list"
                style={{ margin: 0, paddingInlineStart: "1.25rem" }}
              >
                <li>
                  Subí o pegá la lista de participantes (CSV, TSV o texto).
                </li>
                <li>Definí fecha, hora, título y cantidad de ganadores.</li>
                <li>
                  Publicá: el público verá el contador y la experiencia en vivo.
                </li>
              </ol>
            </div>

            {/* Tarjetas rápidas (opcional visual) */}
            <div style={{ display: "grid", gap: "0.75rem" }}>
              <StatCard
                label="Sorteos totales"
                value={metrics.total}
                icon="🗂️"
              />
              <StatCard label="Activos" value={metrics.active} icon="⏳" />
              <StatCard
                label="Finalizados"
                value={metrics.finished}
                icon="✅"
              />
            </div>

            <div className="card" aria-live="polite">
              <h2
                className="raffle-card__title"
                style={{ fontSize: "1rem", marginBottom: "0.25rem" }}
              >
                Vista previa de participantes
              </h2>
              <p className="section-subtitle" style={{ margin: 0 }}>
                {preview}
              </p>
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
