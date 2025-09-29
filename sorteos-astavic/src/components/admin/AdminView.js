// src/components/admin/AdminView.js
//! DECISIÓN DE DISEÑO: Se expone el estado del servicio de autenticación para informar fallos de configuración.
import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import AdminDashboard from "./AdminDashboard";
import AdminLogin from "./AdminLogin";
import ManageRaffles from "./ManageRaffles";
import AdminHome from "./AdminHome";

function getAdminSubroute() {
  const hash = typeof window !== "undefined" ? window.location.hash : "";
  if (hash.includes("/crear")) return "create";
  if (hash.includes("/gestionar")) return "manage";
  return "home"; // ruta por defecto
}

const AdminView = ({
  isAdmin,
  onLogin,
  onLogout,
  loginError,
  authUnavailable,
  raffles,
  subscribersCount,
  onCreateRaffle,
  onUpdateRaffle,
  onDeleteRaffle,
  onMarkFinished,
}) => {
  const [subroute, setSubroute] = useState(getAdminSubroute());

  useEffect(() => {
    const onHash = () => setSubroute(getAdminSubroute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  if (!isAdmin) {
    return (
      <AdminLogin
        onLogin={onLogin}
        error={loginError}
        authUnavailable={authUnavailable}
      />
    );
  }

  if (subroute === "create") {
    return (
      <AdminDashboard
        onLogout={onLogout}
        onCreateRaffle={onCreateRaffle}
        raffles={raffles}
        subscribersCount={subscribersCount}
      />
    );
  }

  if (subroute === "manage") {
    return (
      <ManageRaffles
        raffles={raffles}
        onUpdateRaffle={onUpdateRaffle}
        onDeleteRaffle={onDeleteRaffle}
        onMarkFinished={onMarkFinished}
      />
    );
  }

  // default → home
  return <AdminHome onLogout={onLogout} />;
};

AdminView.propTypes = {
  isAdmin: PropTypes.bool.isRequired,
  onLogin: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  loginError: PropTypes.bool,
  authUnavailable: PropTypes.bool,
  raffles: PropTypes.array.isRequired,
  subscribersCount: PropTypes.number.isRequired,
  onCreateRaffle: PropTypes.func.isRequired,
  onUpdateRaffle: PropTypes.func.isRequired,
  onDeleteRaffle: PropTypes.func.isRequired,
  onMarkFinished: PropTypes.func.isRequired,
};

AdminView.defaultProps = {
  loginError: false,
  authUnavailable: false,
};

export default AdminView;
