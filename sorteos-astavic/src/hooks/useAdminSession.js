// ! DECISIÓN DE DISEÑO: Este hook abstrae la autenticación demo basada en sessionStorage.
import { useCallback, useMemo, useState } from "react";

const STORAGE_KEY = "adminAuth";

export const useAdminSession = (credentials) => {
  const [isAdmin, setIsAdmin] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  });
  const [loginError, setLoginError] = useState(false);

  const login = useCallback(
    (email, password) => {
      const expectedEmail = (credentials?.email || "").trim().toLowerCase();
      const expectedPassword = credentials?.password || "";
      const normalizedEmail = (email || "").trim().toLowerCase();
      const sanitizedPassword = password || "";

      const isValid =
        normalizedEmail === expectedEmail && sanitizedPassword === expectedPassword;

      if (!isValid) {
        setLoginError(true);
        return { ok: false };
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      }
      setIsAdmin(true);
      setLoginError(false);
      return { ok: true };
    },
    [credentials?.email, credentials?.password]
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
    setIsAdmin(false);
  }, []);

  return useMemo(
    () => ({ isAdmin, login, logout, loginError }),
    [isAdmin, login, logout, loginError]
  );
};

export default useAdminSession;
