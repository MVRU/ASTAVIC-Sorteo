// ! DECISIÓN DE DISEÑO: Centralizamos el ruteo por hash para aislar efectos globales y simplificar App.
import { useCallback, useEffect, useMemo, useState } from "react";

const ROUTES = {
  PUBLIC: "public",
  ADMIN: "admin",
  FINISHED: "finished",
};

const HASH_BY_ROUTE = {
  [ROUTES.PUBLIC]: "#/",
  [ROUTES.ADMIN]: "#/admin",
  [ROUTES.FINISHED]: "#/finalizados",
};

const parseRouteFromHash = (hash) => {
  if (!hash) return ROUTES.PUBLIC;
  if (hash.startsWith("#/admin")) return ROUTES.ADMIN;
  if (hash.startsWith("#/finalizados")) return ROUTES.FINISHED;
  return ROUTES.PUBLIC;
};

const getCurrentHash = () =>
  typeof window !== "undefined" ? window.location.hash || "" : "";

export const useHashRoute = () => {
  const [route, setRoute] = useState(() => parseRouteFromHash(getCurrentHash()));

  const syncFromLocation = useCallback(() => {
    setRoute(parseRouteFromHash(getCurrentHash()));
  }, []);

  useEffect(() => {
    syncFromLocation();
    if (typeof window === "undefined") return undefined;
    const onHashChange = () => syncFromLocation();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [syncFromLocation]);

  const navigate = useCallback((targetRoute) => {
    const safeTarget = Object.values(ROUTES).includes(targetRoute)
      ? targetRoute
      : ROUTES.PUBLIC;
    const nextHash = HASH_BY_ROUTE[safeTarget];
    if (typeof window !== "undefined") {
      if (window.location.hash !== nextHash) {
        window.location.hash = nextHash;
      } else {
        setRoute(safeTarget);
      }
    } else {
      setRoute(safeTarget);
    }
  }, []);

  const flags = useMemo(
    () => ({
      isAdminRoute: route === ROUTES.ADMIN,
      isFinishedRoute: route === ROUTES.FINISHED,
      isPublicRoute: route === ROUTES.PUBLIC,
    }),
    [route]
  );

  return { route, navigate, ...flags };
};

export default useHashRoute;
