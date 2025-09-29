// src/App.js
//! DECISIÓN DE DISEÑO: Se separa la autenticación en un servicio inyectable para reforzar seguridad y mantenibilidad.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import LiveDrawModal from "./components/LiveDrawModal";
import PublicView from "./components/public/PublicView";
import AdminView from "./components/admin/AdminView";
import initialRaffles from "./data/initialRaffles";
import { isFinished, pickWinners } from "./utils/raffleUtils";
import "./App.css";
import { buildAuthenticationServiceSafely } from "./services/authenticationService";

const MIXING_MESSAGE = "\u{1F504} Revolviendo nombres.";
const DRAWING_MESSAGE = "\u{1F5F3}\u{FE0F} Extrayendo.";

const parseRoute = (hash) => {
  if (hash?.startsWith("#/admin")) return "admin";
  if (hash?.startsWith("#/finalizados")) return "finished";
  return "public";
};

const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const buildInitialRaffles = () =>
  initialRaffles.map((raffle) => ({
    ...raffle,
    finished: raffle.finished || isFinished(raffle),
  }));

const App = () => {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash));
  const [raffles, setRaffles] = useState(buildInitialRaffles);
  const [isAdmin, setIsAdmin] = useState(
    () => sessionStorage.getItem("adminAuth") === "1"
  );
  const [loginError, setLoginError] = useState(false);
  const authSetup = useMemo(() => buildAuthenticationServiceSafely(), []);
  const authenticationService = authSetup.service;
  const hasAuthConfigurationIssue = Boolean(authSetup.configurationError);
  const [subscribers, setSubscribers] = useState([]);
  const [liveDraw, setLiveDraw] = useState({
    open: false,
    message: "",
    winners: [],
    raffle: null,
  });
  const timersRef = useRef([]);

  const clearLiveTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const handleNavigate = useCallback((target) => {
    const nextHash =
      target === "admin"
        ? "#/admin"
        : target === "finished"
        ? "#/finalizados"
        : "#/";
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    } else {
      setRoute(target);
    }
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute(window.location.hash));
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const handleMarkFinished = useCallback((raffleId) => {
    setRaffles((prev) =>
      prev.map((raffle) =>
        raffle.id === raffleId ? { ...raffle, finished: true } : raffle
      )
    );
  }, []);

  const handleStartLive = useCallback(
    (raffle) => {
      handleMarkFinished(raffle.id);
      clearLiveTimers();
      const winners = pickWinners(raffle.participants, raffle.winnersCount);
      setLiveDraw({
        open: true,
        raffle,
        message: MIXING_MESSAGE,
        winners: [],
      });
      const stageTimer = window.setTimeout(() => {
        setLiveDraw((prev) => ({ ...prev, message: DRAWING_MESSAGE }));
        winners.forEach((winner, index) => {
          const revealTimer = window.setTimeout(() => {
            setLiveDraw((prev) => ({
              ...prev,
              winners: prev.winners.includes(winner)
                ? prev.winners
                : [...prev.winners, winner],
            }));
          }, 700 * index);
          timersRef.current.push(revealTimer);
        });
      }, 800);
      timersRef.current.push(stageTimer);
    },
    [clearLiveTimers, handleMarkFinished]
  );

  const handleCloseLive = useCallback(() => {
    clearLiveTimers();
    setLiveDraw({ open: false, message: "", winners: [], raffle: null });
  }, [clearLiveTimers]);

  useEffect(() => () => clearLiveTimers(), [clearLiveTimers]);

  useEffect(() => {
    if (hasAuthConfigurationIssue) {
      console.error(
        "Configuración de autenticación incompleta. Define las variables de entorno requeridas."
      );
    }
  }, [hasAuthConfigurationIssue]);

  const handleRegisterSubscriber = useCallback(
    (email, raffle) => {
      const normalized = (email || "").trim().toLowerCase();
      if (!emailRegex.test(normalized)) {
        return { ok: false, message: "Ingresa un correo valido." };
      }
      const alreadyExists = subscribers.includes(normalized);
      if (!alreadyExists) {
        setSubscribers((prev) => [...prev, normalized]);
      }
      return {
        ok: true,
        reuse: alreadyExists,
        message: alreadyExists
          ? "Ya estabas suscripto. Mantendremos tu recordatorio."
          : raffle
          ? `Te avisaremos para "${raffle.title}".`
          : "Registro exitoso. Te escribiremos antes del sorteo.",
      };
    },
    [subscribers]
  );

  const handleLogin = useCallback(
    async (email, password) => {
      if (hasAuthConfigurationIssue) {
        setLoginError(true);
        return;
      }

      try {
        const isValid = await authenticationService.validateCredentials({
          email,
          password,
        });

        if (!isValid) {
          setLoginError(true);
          return;
        }
      } catch (error) {
        console.error("Servicio de autenticación no disponible", error);
        setLoginError(true);
        return;
      }

      sessionStorage.setItem("adminAuth", "1");
      setIsAdmin(true);
      setLoginError(false);
      handleNavigate("admin");
    },
    [authenticationService, handleNavigate, hasAuthConfigurationIssue]
  );

  const handleLogout = useCallback(() => {
    sessionStorage.removeItem("adminAuth");
    setIsAdmin(false);
    handleNavigate("public");
  }, [handleNavigate]);

  const handleCreateRaffle = useCallback((raffle) => {
    const prepared = {
      ...raffle,
      finished: raffle.finished || isFinished(raffle),
    };
    setRaffles((prev) => [...prev, prepared]);
    return {
      ok: true,
      message: "Sorteo creado (demo). Ya es visible en la vista publica.",
    };
  }, []);

  // >>> NUEVOS: actualizar y eliminar
  const handleUpdateRaffle = useCallback((updated) => {
    setRaffles((prev) =>
      prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
    );
    return { ok: true };
  }, []);

  const handleDeleteRaffle = useCallback((raffleId) => {
    setRaffles((prev) => prev.filter((r) => r.id !== raffleId));
    return { ok: true };
  }, []);
  const { activeRaffles, finishedRaffles } = useMemo(() => {
    const now = new Date();
    const active = [];
    const finished = [];
    raffles.forEach((raffle) => {
      const item = {
        ...raffle,
        finished: raffle.finished || isFinished(raffle, now),
      };
      if (item.finished) {
        finished.push(item);
      } else {
        active.push(item);
      }
    });
    active.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));
    finished.sort((a, b) => new Date(b.datetime) - new Date(a.datetime));
    return { activeRaffles: active, finishedRaffles: finished };
  }, [raffles]);

  return (
    <div className="app-shell">
      <Header
        currentRoute={route}
        onNavigate={handleNavigate}
        isAdmin={isAdmin}
      />
      <main key={route} className="anim-fade-in">
        {route === "admin" ? (
          <AdminView
            isAdmin={isAdmin}
            onLogin={handleLogin}
            onLogout={handleLogout}
            loginError={loginError}
            authUnavailable={hasAuthConfigurationIssue}
            raffles={raffles}
            subscribersCount={subscribers.length}
            onCreateRaffle={handleCreateRaffle}
            onUpdateRaffle={handleUpdateRaffle} // ⇐ nuevo
            onDeleteRaffle={handleDeleteRaffle} // ⇐ nuevo
            onMarkFinished={handleMarkFinished} // útil desde gestionar
          />
        ) : (
          <PublicView
            activeRaffles={activeRaffles}
            finishedRaffles={finishedRaffles}
            onStartLive={handleStartLive}
            onMarkFinished={handleMarkFinished}
            onRegisterSubscriber={handleRegisterSubscriber}
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
        onClose={handleCloseLive}
      />
    </div>
  );
};

export default App;
