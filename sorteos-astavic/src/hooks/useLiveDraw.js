// src/hooks/useLiveDraw.js

import { useCallback, useEffect, useRef, useState } from "react";
import { pickWinners } from "../utils/raffleUtils";

const INITIAL_STATE = Object.freeze({
  open: false,
  message: "",
  winners: [],
  raffle: null,
});

const DEFAULT_MESSAGES = Object.freeze({
  mixing: "\u{1F504} Revolviendo nombres.",
  drawing: "\u{1F5F3}\u{FE0F} Extrayendo.",
});

const REVEAL_DELAY = 700;
const STAGE_DELAY = 800;

export const useLiveDraw = (
  markFinished,
  messages = DEFAULT_MESSAGES,
  options = { stageDelay: STAGE_DELAY, revealDelay: REVEAL_DELAY }
) => {
  const [liveDraw, setLiveDraw] = useState(INITIAL_STATE);
  const timersRef = useRef([]);
  const { stageDelay = STAGE_DELAY, revealDelay = REVEAL_DELAY } = options;

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timerId) => window.clearTimeout(timerId));
    timersRef.current = [];
  }, []);

  const closeLiveDraw = useCallback(() => {
    clearTimers();
    setLiveDraw(INITIAL_STATE);
  }, [clearTimers]);

  const startLiveDraw = useCallback(
    (raffle) => {
      if (!raffle) return;
      markFinished?.(raffle.id);
      clearTimers();

      const winners = pickWinners(raffle.participants, raffle.winnersCount);
      setLiveDraw({
        open: true,
        raffle,
        message: messages.mixing,
        winners: [],
      });

      const stageTimer = window.setTimeout(() => {
        setLiveDraw((prev) => ({ ...prev, message: messages.drawing }));
        winners.forEach((winner, index) => {
          const revealTimer = window.setTimeout(() => {
            setLiveDraw((prev) =>
              prev.winners.includes(winner)
                ? prev
                : { ...prev, winners: [...prev.winners, winner] }
            );
          }, revealDelay * index);
          timersRef.current.push(revealTimer);
        });
      }, stageDelay);

      timersRef.current.push(stageTimer);
    },
    [
      clearTimers,
      markFinished,
      messages.drawing,
      messages.mixing,
      revealDelay,
      stageDelay,
    ]
  );

  useEffect(() => () => clearTimers(), [clearTimers]);

  return { liveDraw, startLiveDraw, closeLiveDraw };
};

export default useLiveDraw;
