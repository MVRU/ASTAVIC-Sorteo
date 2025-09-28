// src/App.js
// ! DECISIÓN DE DISEÑO: Delegamos estado a hooks especializados para mantener la pantalla como orquestador del flujo.
import { useCallback } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LiveDrawModal from "./components/LiveDrawModal";
import PublicView from "./components/public/PublicView";
import AdminView from "./components/admin/AdminView";
import initialRaffles from "./data/initialRaffles";
import useHashRoute from "./hooks/useHashRoute";
import useRafflesManagement from "./hooks/useRafflesManagement";
import useLiveDraw from "./hooks/useLiveDraw";
import useSubscribersRegistry from "./hooks/useSubscribersRegistry";
import useAdminSession from "./hooks/useAdminSession";
import "./App.css";

const ADMIN_EMAIL = process.env.REACT_APP_ADMIN_EMAIL || "astavic@gmail.com";
const ADMIN_PASSWORD = process.env.REACT_APP_ADMIN_PASSWORD || "Colon 3115";

const App = () => {
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
  const { isAdmin, login, logout, loginError } = useAdminSession({
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
  });

  const handleLogin = useCallback(
    (email, password) => {
      const result = login(email, password);
      if (result.ok) {
        navigate("admin");
        if (typeof window !== "undefined") {
          window.location.hash = "#/admin/crear";
        }
      }
    },
    [login, navigate]
  );

  const handleLogout = useCallback(() => {
    logout();
    navigate("public");
  }, [logout, navigate]);

  return (
    <div className="app-shell">
      <Header
        currentRoute={route}
        onNavigate={navigate}
        isAdmin={isAdmin}
      />
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
