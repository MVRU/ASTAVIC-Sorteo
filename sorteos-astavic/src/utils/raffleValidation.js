// src/utils/raffleValidation.js

const MIN_TITLE_LENGTH = 3;
const MIN_WINNERS = 1;

const sanitizeTitle = (value) => String(value ?? "").trim();

const ensureWinnersCount = (value) => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return Math.floor(value);
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isNaN(parsed)) {
      return Math.floor(parsed);
    }
  }
  return NaN;
};

const normalizePrizes = (prizes) =>
  Array.isArray(prizes)
    ? prizes.map((prize) => ({ title: sanitizeTitle(prize?.title) }))
    : [];

const normalizeParticipants = (participants) =>
  Array.isArray(participants)
    ? participants
        .map((participant) => sanitizeTitle(participant))
        .filter(Boolean)
    : [];

export const validateRaffleDraft = ({
  title,
  datetime,
  winnersCount,
  prizes,
  participants,
}) => {
  const errors = [];

  const normalizedTitle = sanitizeTitle(title);
  if (normalizedTitle.length < MIN_TITLE_LENGTH) {
    errors.push("El título debe tener al menos 3 caracteres.");
  }

  if (!datetime) {
    errors.push("Seleccioná fecha y hora del sorteo.");
  } else {
    const timestamp = new Date(datetime).getTime();
    if (Number.isNaN(timestamp)) {
      errors.push("La fecha/hora no es válida.");
    } else if (timestamp <= Date.now()) {
      errors.push("La fecha/hora debe ser en el futuro.");
    }
  }

  const rawWinners = ensureWinnersCount(winnersCount);
  const winners = Number.isNaN(rawWinners)
    ? MIN_WINNERS
    : Math.max(MIN_WINNERS, rawWinners);
  if (Number.isNaN(rawWinners) || rawWinners < MIN_WINNERS) {
    errors.push("Debe haber al menos 1 ganador.");
  }

  const normalizedPrizes = normalizePrizes(prizes);
  if (normalizedPrizes.length !== winners) {
    errors.push(
      "La cantidad de premios debe coincidir con la cantidad de ganadores."
    );
  }
  normalizedPrizes.forEach((prize, index) => {
    if (!prize.title) {
      errors.push(`El título del premio ${index + 1} no puede estar vacío.`);
    }
  });

  const normalizedParticipants = normalizeParticipants(participants);
  if (normalizedParticipants.length === 0) {
    errors.push("No se detectaron participantes (archivo o texto).");
  } else if (normalizedParticipants.length < winners) {
    errors.push(
      "La cantidad de participantes debe ser mayor o igual a la de ganadores."
    );
  }

  const seenParticipants = new Set();
  let hasDuplicate = false;
  normalizedParticipants.forEach((participant) => {
    const key = participant.toLowerCase();
    if (seenParticipants.has(key)) {
      hasDuplicate = true;
    }
    seenParticipants.add(key);
  });
  if (hasDuplicate) {
    errors.push("Hay participantes duplicados; revisá la lista.");
  }

  return errors;
};

export default validateRaffleDraft;
