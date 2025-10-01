/* eslint-env es2020, browser, node */

// src/utils/raffleUtils.js
// Utilidades robustas para sorteos (JS puro, sin TypeScript).

// Objeto global sin usar 'self' (que tu ESLint restringe).
const getRoot = () => {
  if (typeof globalThis !== "undefined") return globalThis; // moderno: browser/Node/worker
  if (typeof window !== "undefined") return window; // browser
  if (typeof global !== "undefined") return global; // Node
  return undefined;
};

/**
 * Intenta parsear fechas en:
 *  - ISO 8601 (recomendado)
 *  - DD/MM/YYYY[ HH:mm]
 *  - DD-MM-YYYY[ HH:mm]
 *  - timestamps numéricos o Date
 * @param {unknown} value
 * @returns {Date|null}
 */
const parseDateFlexible = (value) => {
  if (value == null) return null;

  if (value instanceof Date)
    return Number.isNaN(value.getTime()) ? null : value;
  if (typeof value === "number") {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  const str = String(value).trim();
  if (!str) return null;

  // ISO 8601 (seguro en JS)
  if (
    /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?)?(?:Z|[+-]\d{2}:?\d{2})?$/.test(
      str
    )
  ) {
    const d = new Date(str);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  // DD/MM/YYYY [HH:mm] o DD-MM-YYYY [HH:mm]
  const m = str.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})(?:[ T](\d{1,2}):(\d{2}))?$/
  );
  if (m) {
    const d = Number(m[1]);
    const mo = Number(m[2]);
    const y = Number(m[3]);
    const h = m[4] != null ? Number(m[4]) : 0;
    const mi = m[5] != null ? Number(m[5]) : 0;

    const date = new Date(y, mo - 1, d, h, mi, 0, 0);
    const ok =
      date.getFullYear() === y &&
      date.getMonth() === mo - 1 &&
      date.getDate() === d &&
      date.getHours() === h &&
      date.getMinutes() === mi;
    return ok ? date : null;
  }

  // Último intento (no recomendado pero útil para compat)
  const fallback = new Date(str);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
};

/**
 * Formatea en "DD/MM/YYYY HH:mm" usando es-AR (24h).
 * @param {unknown} value
 * @returns {string}
 */
export const formatDateEs = (value) => {
  const date = parseDateFlexible(value);
  if (!date) return "";
  const df = new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Cordoba",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return df.format(date);
};

/**
 * Devuelve partes de tiempo hacia una fecha objetivo.
 * @param {Date|string|number} targetDate
 * @param {Date} [fromDate=new Date()]
 * @returns {{diff:number,days:number,hours:number,minutes:number,seconds:number,invalid:boolean}}
 */
export const getTimeParts = (targetDate, fromDate = new Date()) => {
  const target = parseDateFlexible(targetDate);
  const from = parseDateFlexible(fromDate) ?? new Date();
  if (!target) {
    return {
      diff: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      invalid: true,
    };
  }
  const diff = target.getTime() - from.getTime();
  const totalSeconds = Math.max(0, Math.floor(diff / 1000));
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return { diff, days, hours, minutes, seconds, invalid: false };
};

/**
 * Indica si un sorteo ya finalizó.
 * @param {{ datetime: Date|string|number }} raffle
 * @param {Date|string|number} [reference=new Date()]
 */
export const isFinished = (raffle, reference = new Date()) => {
  const target = parseDateFlexible(raffle && raffle.datetime);
  const ref = parseDateFlexible(reference) ?? new Date();
  if (!target) return true;
  return target.getTime() <= ref.getTime();
};

// ---------- Participantes ----------
const guessSeparator = (text) => {
  if (text.includes("\t")) return "\t";
  if (text.includes(";") && !text.includes(",")) return ";";
  return ","; // por defecto CSV
};

const normalizeManualEntries = (manualInput) => {
  if (Array.isArray(manualInput)) {
    return manualInput
      .flat()
      .map((value) => String(value ?? "").trim())
      .filter(Boolean);
  }
  const manualText = String(manualInput ?? "").trim();
  if (!manualText) return [];
  return manualText
    .split(/\r?\n/)
    .map((value) => value.trim())
    .filter(Boolean);
};

/**
 * Parsea lista de participantes desde texto de archivo y/o manual.
 * @param {string} [fileText='']
 * @param {string|string[]} [manualInput='']
 * @returns {string[]}
 */
export const parseParticipants = (fileText = "", manualInput = "") => {
  let participants = [];
  const trimmedFile = fileText.trim();
  const manualEntries = normalizeManualEntries(manualInput);

  if (trimmedFile) {
    const separator = guessSeparator(trimmedFile);
    const rows = trimmedFile.split(/\r?\n/).filter(Boolean);
    if (rows.length) {
      const header = rows[0]
        .split(separator)
        .map((v) => v.trim().toLowerCase());
      const candidateIndex = header.findIndex((label) =>
        ["email", "correo", "nombre", "name"].includes(label)
      );
      const dataRows = candidateIndex >= 0 ? rows.slice(1) : rows;

      const parsed = dataRows
        .map((row) => {
          const cols = row.split(separator).map((v) => v.trim());
          const idx = candidateIndex >= 0 ? candidateIndex : 0;
          return cols[idx] || "";
        })
        .filter(Boolean);

      participants = participants.concat(parsed);
    }
  }

  if (manualEntries.length > 0) {
    participants = participants.concat(manualEntries);
  }

  // normalización + únicos
  const unique = new Set();
  const sanitized = [];
  for (const value of participants) {
    const normalized = value.trim();
    if (!normalized) continue;
    const key = normalized.toLowerCase();
    if (unique.has(key)) continue;
    unique.add(key);
    sanitized.push(normalized);
  }
  return sanitized;
};

// ---------- Sorteo (aleatoriedad) ----------
/** @returns {Crypto|undefined} */
const getCrypto = () => {
  const root = getRoot();
  const c = root && root.crypto ? root.crypto : undefined;
  return c && typeof c.getRandomValues === "function" ? c : undefined;
};

/** @param {number} maxExclusive */
const randomInt = (maxExclusive) => {
  const c = getCrypto();
  if (c) {
    const buf = new Uint32Array(1);
    c.getRandomValues(buf);
    return buf[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
};

/**
 * Selecciona ganadores únicos con Fisher–Yates.
 * @param {string[]} participants
 * @param {number} winnersCount
 * @returns {string[]}
 */
export const pickWinners = (participants, winnersCount) => {
  const total = Math.max(1, winnersCount || 1);
  const pool = Array.isArray(participants) ? [...participants] : [];
  if (!pool.length) return [];

  for (let i = pool.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, total);
};

// ---------- IDs ----------
/** @returns {string} */
export const ensureId = () => {
  const root = getRoot();
  const c = root && root.crypto ? root.crypto : undefined;
  if (c && typeof c.randomUUID === "function") {
    return c.randomUUID();
  }
  return `raffle-${Math.random().toString(36).slice(2, 11)}`;
};
