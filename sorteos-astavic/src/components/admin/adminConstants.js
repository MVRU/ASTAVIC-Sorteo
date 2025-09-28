// ! DECISIÓN DE DISEÑO: Centralizamos textos y defaults para sincronizar vista previa y tutorial sin duplicar literales.
export const PREVIEW_DEFAULT_MESSAGE =
  "Subí un archivo o pegá participantes para ver un resumen acá.";

export const TUTORIAL_STEPS = [
  {
    icon: "📥",
    title: "Cargá participantes",
    description:
      "Subí un CSV/TSV o pegá la lista (uno por línea). Eliminamos duplicados automáticamente.",
  },
  {
    icon: "🗓️",
    title: "Configurá detalles",
    description:
      "Definí título, fecha y cantidad de ganadores. Ordená los premios según el puesto.",
  },
  {
    icon: "🚀",
    title: "Publicá el sorteo",
    description:
      "Se mostrará el contador y, al finalizar, todos verán los mismos ganadores.",
  },
];

export const createPreviewFallback = () => ({
  raffle: {
    id: "preview",
    title: "Título del sorteo",
    description: "",
    datetime: new Date(Date.now() + 86400000).toISOString(),
    winnersCount: 1,
    participants: ["Participante demo"],
    prizes: [{ title: "Premio 1" }],
    finished: false,
  },
  participants: [],
  message: PREVIEW_DEFAULT_MESSAGE,
});
