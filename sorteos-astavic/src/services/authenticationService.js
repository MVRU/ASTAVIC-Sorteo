//! DECISIÓN DE DISEÑO: Se encapsula la validación de credenciales para permitir proveedores seguros y reemplazables.
const ensureCredential = (value, envKey) => {
  if (!value) {
    throw new Error(
      `Credencial faltante: define la variable de entorno ${envKey} antes del despliegue.`
    );
  }
  return value;
};

const sanitize = (value) => (typeof value === "string" ? value.trim() : "");

const defaultCredentialsProvider = () => ({
  adminEmail: ensureCredential(process.env.REACT_APP_ADMIN_EMAIL, "REACT_APP_ADMIN_EMAIL"),
  adminPassword: ensureCredential(
    process.env.REACT_APP_ADMIN_PASSWORD,
    "REACT_APP_ADMIN_PASSWORD"
  ),
});

const defaultComparator = ({ email, password }, { adminEmail, adminPassword }) =>
  email === adminEmail && password === adminPassword;

export const createAuthenticationService = ({
  credentialsProvider = defaultCredentialsProvider,
  comparator = defaultComparator,
} = {}) => {
  const credentials = credentialsProvider();

  return {
    async validateCredentials({ email, password }) {
      const normalizedInput = {
        email: sanitize(email),
        password: sanitize(password),
      };

      if (!normalizedInput.email || !normalizedInput.password) {
        return false;
      }

      return comparator(normalizedInput, credentials);
    },
  };
};

export const buildAuthenticationServiceSafely = (options) => {
  try {
    const service = createAuthenticationService(options);
    return { service, configurationError: null };
  } catch (error) {
    return {
      service: {
        async validateCredentials() {
          throw error;
        },
      },
      configurationError: error,
    };
  }
};

//? Riesgo: si la configuración falla, la autenticación queda deshabilitada deliberadamente hasta corregir el despliegue.
