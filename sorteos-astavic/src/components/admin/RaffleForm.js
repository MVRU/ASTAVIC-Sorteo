// ! DECISIÓN DE DISEÑO: El formulario gestiona su propio estado, expone cambios relevantes mediante callbacks puros y delega el
// ! feedback global en toasts accesibles.
import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import FileDropzone from "./ui/FileDropzone";
import { ensureId, parseParticipants } from "../../utils/raffleUtils";
import { validateRaffleDraft } from "../../utils/raffleValidation";
import { PREVIEW_DEFAULT_MESSAGE } from "./adminConstants";
import { useToast } from "../../context/ToastContext";

const noop = () => {};

const summarizeParticipants = (participants) => {
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
};

const RaffleForm = ({
  onCreateRaffle,
  onStatusChange,
  onPreviewChange,
  status,
  isDesktop,
}) => {
  const { showToast } = useToast();
  const [form, setForm] = useState({
    title: "",
    description: "",
    datetime: "",
    winners: "1",
    manual: "",
  });
  const [prizes, setPrizes] = useState([{ title: "" }]);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewParticipants, setPreviewParticipants] = useState([]);
  const [previewMessage, setPreviewMessage] = useState(PREVIEW_DEFAULT_MESSAGE);

  const sanitizedPrizes = useMemo(
    () =>
      prizes.map((prize, index) => ({
        title: (prize?.title || "").trim() || `Premio ${index + 1}`,
      })),
    [prizes]
  );

  const fileToken = useMemo(
    () =>
      file ? `${file.name}-${file.size}-${file.lastModified}` : "",
    [file]
  );

  const syncPreview = useCallback(() => {
    const fallbackDate = new Date(Date.now() + 86400000).toISOString();
    const participantsList =
      previewParticipants.length > 0
        ? previewParticipants
        : ["Participante demo"];
    const winnersFallback =
      sanitizedPrizes.length > 0
        ? sanitizedPrizes.length
        : Math.max(1, Number(form.winners) || 1);

    onPreviewChange({
      raffle: {
        id: "preview",
        title: form.title.trim() || "Título del sorteo",
        description: form.description.trim(),
        datetime: form.datetime || fallbackDate,
        winnersCount: winnersFallback,
        participants: participantsList,
        prizes: sanitizedPrizes,
        finished: false,
      },
      participants: previewParticipants,
      message: previewMessage,
    });
  }, [
    form.title,
    form.description,
    form.datetime,
    form.winners,
    sanitizedPrizes,
    previewParticipants,
    previewMessage,
    onPreviewChange,
  ]);

  useEffect(() => {
    syncPreview();
  }, [syncPreview]);

  useEffect(() => {
    if (!file && !form.manual.trim()) {
      setPreviewParticipants([]);
      setPreviewMessage(PREVIEW_DEFAULT_MESSAGE);
      return;
    }

    const applySummary = (participants) => {
      const summary = summarizeParticipants(participants);
      setPreviewParticipants(summary.participants);
      setPreviewMessage(summary.message);
    };

    if (!file) {
      applySummary(parseParticipants("", form.manual || ""));
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const fileText = await file.text();
        if (cancelled) return;
        applySummary(parseParticipants(fileText, form.manual));
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
  }, [file, form.manual]);

  const adjustPrizeSlots = (targetCount) => {
    const safeCount = Math.max(1, targetCount || 1);
    setPrizes((prev) => {
      if (safeCount === prev.length) return prev;
      if (safeCount > prev.length) {
        const additions = Array.from({ length: safeCount - prev.length }, () => ({
          title: "",
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
      setForm((prev) => ({ ...prev, winners: digitsOnly || "" }));
      adjustPrizeSlots(nextCount);
      onStatusChange(null);
      return;
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    onStatusChange(null);
  };

  const handleFile = (nextFile) => {
    setFile(nextFile);
    onStatusChange(null);
  };

  const handlePrizeChange = (index, value) => {
    setPrizes((prev) => {
      const next = [...prev];
      next[index] = { title: value };
      return next;
    });
    onStatusChange(null);
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
      setForm((prevForm) => ({ ...prevForm, winners: String(safeNext.length) }));
      return safeNext;
    });
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
    setPreviewMessage(PREVIEW_DEFAULT_MESSAGE);
    onStatusChange(null);
  }, [onStatusChange]);

  const handleResetClick = useCallback(() => {
    resetFormState();
    showToast({
      status: "info",
      message: "Formulario restablecido. Podés empezar desde cero.",
    });
  }, [resetFormState, showToast]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    onStatusChange(null);
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
        onStatusChange({ ok: false, message: errors[0] });
        setLoading(false);
        return;
      }

      const normalizedPrizes = prizes.map((prize) => ({
        title: String(prize.title).trim(),
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
      onStatusChange(result);
      if (result?.ok) {
        resetFormState();
      }
    } catch {
      onStatusChange({
        ok: false,
        message: "Ocurrió un problema al leer el archivo. Intentá nuevamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="card anim-scale-in" onSubmit={handleSubmit} noValidate>
      <fieldset disabled={loading} style={{ border: 0, padding: 0, margin: 0 }}>
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
          <span className="legend" style={{ marginTop: "0.375rem", display: "block" }}>
            Usá un título claro y breve.
          </span>
        </div>

        <div className="form-group" style={{ marginBottom: "1.25rem" }}>
          <label htmlFor="raffle-description">Descripción (opcional)</label>
          <textarea
            id="raffle-description"
            className="textarea"
            name="description"
            placeholder="Breve detalle del sorteo"
            value={form.description}
            onChange={handleChange}
            rows={3}
          />
          <span className="legend" style={{ marginTop: "0.375rem", display: "block" }}>
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
            <span className="legend" style={{ marginTop: "0.375rem", display: "block" }}>
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
          <p className="legend">Definí un título por premio. El orden determina el puesto.</p>
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
                  onChange={(event) => handlePrizeChange(index, event.target.value)}
                />
                <span className="legend">
                  Puesto {index + 1} = {prize.title || `Premio ${index + 1}`}
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

        <div className="form-group anim-up" style={{ marginBottom: "1.25rem" }}>
          <label>Participantes</label>
          <FileDropzone onFile={handleFile} disabled={loading} fileToken={fileToken} />
        </div>

        <div className="form-group anim-up" style={{ marginBottom: "1.25rem" }}>
          <label htmlFor="raffle-manual">O pegalo manualmente (uno por línea)</label>
          <textarea
            id="raffle-manual"
            className="textarea"
            name="manual"
            placeholder={"ana@correo.com\nbruno@correo.com"}
            value={form.manual}
            onChange={handleChange}
            rows={4}
          />
          <span className="legend" style={{ marginTop: "0.375rem", display: "block" }}>
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

        {status && (
          <p
            className={`toast${status.ok ? "" : " toast--error"} anim-pop`}
            role={status.ok ? "status" : "alert"}
            style={{ marginTop: "1rem" }}
          >
            {status.message}
          </p>
        )}
      </fieldset>
    </form>
  );
};

RaffleForm.propTypes = {
  onCreateRaffle: PropTypes.func.isRequired,
  onStatusChange: PropTypes.func,
  onPreviewChange: PropTypes.func,
  status: PropTypes.shape({
    ok: PropTypes.bool,
    message: PropTypes.string,
  }),
  isDesktop: PropTypes.bool,
};

RaffleForm.defaultProps = {
  onStatusChange: noop,
  onPreviewChange: noop,
  status: null,
  isDesktop: false,
};

export default RaffleForm;
