// src/config/adminCredentials.js
// ! DECISIÓN DE DISEÑO: Centralizamos las credenciales demo para evitar duplicaciones y facilitar su sustitución por variables de entorno seguras.

const DEFAULT_ADMIN_CREDENTIALS = Object.freeze({
  email: "demo@astavic.org",
  password: "Demostracion2025!",
});

export const getAdminCredentials = () => {
  const envEmail = (process.env.REACT_APP_ADMIN_EMAIL || "").trim();
  const envPassword = (process.env.REACT_APP_ADMIN_PASSWORD || "").trim();

  return {
    email: envEmail || DEFAULT_ADMIN_CREDENTIALS.email,
    password: envPassword || DEFAULT_ADMIN_CREDENTIALS.password,
  };
};

export const ADMIN_DEMO_MESSAGE =
  "Esta es una instancia de demostración. Podés usar las credenciales prellenadas.";

export const ADMIN_CREDENTIALS = getAdminCredentials();

export default ADMIN_CREDENTIALS;
