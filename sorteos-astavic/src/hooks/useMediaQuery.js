// ! DECISIÓN DE DISEÑO: Centralizamos la detección de media queries para evitar duplicar listeners en cada componente.
import { useEffect, useState } from "react";

const getMatch = (query) =>
  typeof window !== "undefined" ? window.matchMedia(query).matches : false;

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(() => getMatch(query));

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const handleChange = (event) => setMatches(event.matches);

    mediaQuery.addEventListener?.("change", handleChange);
    mediaQuery.addListener?.(handleChange);
    setMatches(mediaQuery.matches);

    return () => {
      mediaQuery.removeEventListener?.("change", handleChange);
      mediaQuery.removeListener?.(handleChange);
    };
  }, [query]);

  return matches;
};

export default useMediaQuery;
