import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isAdminAuthed, setIsAdminAuthed] = useState(false);

  // cargar estado desde localStorage al iniciar
  useEffect(() => {
    const saved = localStorage.getItem("admin_authed");
    setIsAdminAuthed(saved === "1");
  }, []);

  // helpers para login/logout
  const login = () => {
    localStorage.setItem("admin_authed", "1");
    setIsAdminAuthed(true);
  };

  const logout = () => {
    localStorage.removeItem("admin_authed");
    setIsAdminAuthed(false);
  };

  const value = useMemo(
    () => ({ isAdminAuthed, login, logout }),
    [isAdminAuthed]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
};
