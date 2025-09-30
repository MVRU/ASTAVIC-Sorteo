// src/App.js
// ! DECISIÓN DE DISEÑO: Delegamos efectos globales a hooks especializados para mantener App como orquestador declarativo.
import { useCallback } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LiveDrawModal from "./components/LiveDrawModal";
import PublicView from "./components/public/PublicView";
import AdminView from "./components/admin/AdminView";
import initialRaffles from "./data/initialRaffles";
import { useToast } from "./context/ToastContext";
import { useHashRoute } from "./hooks/useHashRoute";
import { useAdminSession } from "./hooks/useAdminSession";
import { useRafflesManagement } from "./hooks/useRafflesManagement";
import { useLiveDraw } from "./hooks/useLiveDraw";
import { useSubscribersRegistry } from "./hooks/useSubscribersRegistry";
import "./App.css";

const LOGIN_ERROR_MESSAGE =
  "Credenciales inválidas. Revisá los datos e intentá nuevamente.";

const App = () => {
  const { showToast } = useToast();
  const { route, navigate } = useHashRoute();
  const {
    raffles,
    activeRaffles,
    finishedRaffles,
    createRaffle,
    updateRaffle,
    deleteRaffle,
    markFinished,
  } = useRafflesManagement(initialRaffles);
  const { liveDraw, startLiveDraw, closeLiveDraw } = useLiveDraw(markFinished);
  const { registerSubscriber, subscribersCount } = useSubscribersRegistry();
  const { isAdmin, login, logout, loginError } = useAdminSession();

  const handleLogin = useCallback(
    (email, password) => {
      const result = login(email, password);
      if (!result?.ok) {
        showToast({ status: "error", message: LOGIN_ERROR_MESSAGE });
        return result;
      }
      navigate("admin");
      showToast({ status: "success", message: "Sesión iniciada correctamente." });
      return result;
    },
    [login, navigate, showToast]
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate("public");
    showToast({ status: "info", message: "Sesión cerrada correctamente." });
  }, [logout, navigate, showToast]);

  return (
    <div className="app-shell">
      <Header currentRoute={route} onNavigate={navigate} isAdmin={isAdmin} />
      <main key={route} className="anim-fade-in">
        {route === "admin" ? (
          <AdminView
            isAdmin={isAdmin}
            onLogin={handleLogin}
            onLogout={handleLogout}
            loginError={loginError}
            raffles={raffles}
            subscribersCount={subscribersCount}
            onCreateRaffle={createRaffle}
            onUpdateRaffle={updateRaffle}
            onDeleteRaffle={deleteRaffle}
            onMarkFinished={markFinished}
          />
        ) : (
          <PublicView
            activeRaffles={activeRaffles}
            finishedRaffles={finishedRaffles}
            onStartLive={startLiveDraw}
            onMarkFinished={markFinished}
            onRegisterSubscriber={registerSubscriber}
            route={route}
          />
        )}
      </main>
      <Footer />
      <LiveDrawModal
        open={liveDraw.open}
        raffle={liveDraw.raffle}
        message={liveDraw.message}
        winners={liveDraw.winners}
        onClose={closeLiveDraw}
      />
    </div>
  );
};

export default App;
