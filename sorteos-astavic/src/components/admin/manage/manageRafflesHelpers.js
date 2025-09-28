// ! DECISIÓN DE DISEÑO: Centralizamos transformaciones de datos del editor para reutilizarlas entre componentes.
const pad = (value) => String(value).padStart(2, "0");

const splitLines = (text) =>
  String(text || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

export const toLocalInputValue = (isoLike) => {
  const date = new Date(isoLike);
  if (Number.isNaN(date.getTime())) return "";
  const yyyy = date.getFullYear();
  const MM = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
};

export const fromLocalInputValue = (value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new Error("invalid-date");
  }
  return date.toISOString();
};

export const formatReadableDate = (iso) => {
  try {
    const date = new Date(iso);
    return date.toLocaleString();
  } catch {
    return iso;
  }
};

export const mapRaffleToForm = (raffle) => ({
  id: raffle.id,
  title: raffle.title || "",
  description: raffle.description || "",
  datetime: toLocalInputValue(raffle.datetime),
  winnersCount: raffle.winnersCount ?? 1,
  finished: !!raffle.finished,
  prizesText: Array.isArray(raffle.prizes)
    ? raffle.prizes
        .map((prize) => prize?.title || "")
        .filter(Boolean)
        .join("\n")
    : "",
  participantsText: Array.isArray(raffle.participants)
    ? raffle.participants.join("\n")
    : "",
});

export const mapFormToValidationDraft = (form) => {
  const prizeLines = String(form.prizesText ?? "").split("\n");
  const participantLines = String(form.participantsText ?? "").split("\n");

  return {
    title: form.title,
    datetime: form.datetime,
    winnersCount: form.winnersCount,
    prizes: prizeLines.map((title) => ({ title })),
    participants: participantLines,
  };
};

export const mapFormToPayload = (form) => {
  const prizeLines = splitLines(form.prizesText);
  const participantLines = splitLines(form.participantsText);
  const isoDatetime = fromLocalInputValue(form.datetime);
  const winnersCount = Math.max(1, Number(form.winnersCount || 1));

  return {
    id: form.id,
    title: String(form.title || "").trim(),
    description: String(form.description || "").trim(),
    datetime: isoDatetime,
    winnersCount,
    finished: !!form.finished,
    prizes: prizeLines.map((title) => ({ title })),
    participants: participantLines,
  };
};
