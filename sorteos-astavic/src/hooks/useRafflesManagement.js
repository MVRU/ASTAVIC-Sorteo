// ! DECISIÓN DE DISEÑO: Gestionamos el ciclo de vida de sorteos desde un hook para favorecer el principio de única responsabilidad.
import { useCallback, useMemo, useState } from "react";
import { isFinished } from "../utils/raffleUtils";

const normalizeRaffle = (raffle, referenceDate = new Date()) => ({
  ...raffle,
  finished: raffle.finished || isFinished(raffle, referenceDate),
});

const buildInitialState = (initialRaffles) => {
  const reference = new Date();
  return initialRaffles.map((raffle) => normalizeRaffle(raffle, reference));
};

export const useRafflesManagement = (initialRaffles = []) => {
  const [raffles, setRaffles] = useState(() => buildInitialState(initialRaffles));

  const createRaffle = useCallback((raffle) => {
    setRaffles((prev) => [...prev, normalizeRaffle(raffle)]);
    return {
      ok: true,
      message: "Sorteo creado (demo). Ya es visible en la vista publica.",
    };
  }, []);

  const updateRaffle = useCallback((updatedRaffle) => {
    setRaffles((prev) =>
      prev.map((raffle) =>
        raffle.id === updatedRaffle.id
          ? normalizeRaffle({ ...raffle, ...updatedRaffle })
          : raffle
      )
    );
    return { ok: true, message: "Sorteo actualizado correctamente." };
  }, []);

  const deleteRaffle = useCallback((raffleId) => {
    setRaffles((prev) => prev.filter((raffle) => raffle.id !== raffleId));
    return { ok: true, message: "Sorteo eliminado." };
  }, []);

  const markFinished = useCallback((raffleId) => {
    setRaffles((prev) =>
      prev.map((raffle) =>
        raffle.id === raffleId ? { ...raffle, finished: true } : raffle
      )
    );
    return { ok: true, message: "Sorteo marcado como finalizado." };
  }, []);

  const { activeRaffles, finishedRaffles } = useMemo(() => {
    const now = new Date();
    const active = [];
    const finished = [];

    raffles.forEach((raffle) => {
      const normalized = normalizeRaffle(raffle, now);
      if (normalized.finished) {
        finished.push(normalized);
      } else {
        active.push(normalized);
      }
    });

    active.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    finished.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));

    return { activeRaffles: active, finishedRaffles: finished };
  }, [raffles]);

  return {
    raffles,
    activeRaffles,
    finishedRaffles,
    createRaffle,
    updateRaffle,
    deleteRaffle,
    markFinished,
  };
};

export default useRafflesManagement;
