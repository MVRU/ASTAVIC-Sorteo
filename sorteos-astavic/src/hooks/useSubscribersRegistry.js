// src/hooks/useSubscribersRegistry.js

import { useCallback, useMemo, useRef, useState } from "react";
import { isValidEmail, sanitizeEmail } from "../utils/validation";

export const useSubscribersRegistry = () => {
  const storeRef = useRef(new Set());
  const [subscribersCount, setSubscribersCount] = useState(0);
  const [lastRegistration, setLastRegistration] = useState(null);

  const registerSubscriber = useCallback((rawEmail, raffle) => {
    const normalized = sanitizeEmail(rawEmail);
    if (!isValidEmail(normalized)) {
      const result = { ok: false, message: "Ingresa un correo valido." };
      setLastRegistration(result);
      return result;
    }

    const alreadyExists = storeRef.current.has(normalized);
    if (!alreadyExists) {
      storeRef.current.add(normalized);
      setSubscribersCount(storeRef.current.size);
    }

    const result = {
      ok: true,
      reuse: alreadyExists,
      message: alreadyExists
        ? "Ya estabas suscripto. Mantendremos tu recordatorio."
        : raffle
        ? `Te avisaremos para "${raffle.title}".`
        : "Registro exitoso. Te escribiremos antes del sorteo.",
    };

    setLastRegistration(result);
    return result;
  }, []);

  return useMemo(
    () => ({
      registerSubscriber,
      subscribersCount,
      lastRegistration,
    }),
    [lastRegistration, registerSubscriber, subscribersCount]
  );
};

export default useSubscribersRegistry;
