/**
 * TODOS:
 * - [ ] Admin, luego de iniciar sesión, debe tener dos vistas: crear un nuevo sorteo y gestionar los sorteos existentes (editar o borrar).
*/

//! DECISIÓN DE DISEÑO: Se comunica explícitamente la indisponibilidad del servicio para evitar intentos fallidos.
import { useState } from "react";
import PropTypes from "prop-types";

const AdminLogin = ({ onLogin, error, authUnavailable }) => {
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onLogin(form.email.trim(), form.password.trim());
  };

  return (
    <section className="section-gap" aria-labelledby="admin-login">
      <div className="container">
        <div className="login-card">
          <h1
            id="admin-login"
            className="section-title"
            style={{ fontSize: "1.55rem" }}
          >
            Ingreso para administración
          </h1>
          <p className="section-subtitle" style={{ marginBottom: "1.5rem" }}>
            Acceso restringido. Usá las credenciales provistas por ASTAVIC.
          </p>
          <form className="form-card" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="admin-email">Email</label>
              <input
                id="admin-email"
                className="input"
                name="email"
                type="email"
                autoComplete="username"
                required
                placeholder="correo@ejemplo.com"
                value={form.email}
                onChange={handleChange}
                disabled={authUnavailable}
              />
            </div>
            <div className="form-group">
              <label htmlFor="admin-password">Contraseña</label>
              <input
                id="admin-password"
                className="input"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                placeholder="Contraseña segura"
                value={form.password}
                onChange={handleChange}
                disabled={authUnavailable}
              />
            </div>
            <button
              type="submit"
              className="button button--primary"
              disabled={authUnavailable}
              aria-disabled={authUnavailable}
            >
              Ingresar
            </button>
            {authUnavailable ? (
              <p className="error-text" role="alert">
                Servicio de autenticación no disponible. Contactá a la mesa técnica.
              </p>
            ) : (
              error && (
                <p className="error-text" role="alert">
                  Credenciales inválidas.
                </p>
              )
            )}
          </form>
        </div>
      </div>
    </section>
  );
};

AdminLogin.propTypes = {
  onLogin: PropTypes.func.isRequired,
  error: PropTypes.bool,
  authUnavailable: PropTypes.bool,
};

AdminLogin.defaultProps = {
  error: false,
  authUnavailable: false,
};

export default AdminLogin;
