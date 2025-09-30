/**
 * TODOS:
 * - [ ] Admin, luego de iniciar sesión, debe tener dos vistas: crear un nuevo sorteo y gestionar los sorteos existentes (editar o borrar).
 */
// ! DECISIÓN DE DISEÑO: El formulario expone las credenciales demo para reducir fricción en la evaluación.

import { useState } from "react";
import PropTypes from "prop-types";
import {
  ADMIN_CREDENTIALS,
  ADMIN_DEMO_MESSAGE,
} from "../../config/adminCredentials";

const AdminLogin = ({ onLogin, error }) => {
  const [form, setForm] = useState({
    email: ADMIN_CREDENTIALS.email,
    password: ADMIN_CREDENTIALS.password,
  });

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
          <div
            className="demo-notice"
            role="status"
            aria-live="polite"
            data-testid="admin-demo-notice"
          >
            <span className="demo-notice__message">{ADMIN_DEMO_MESSAGE}</span>
            <span className="demo-notice__credentials">
              <span>Email: <strong>{ADMIN_CREDENTIALS.email}</strong></span>
              <span>Contraseña: <strong>{ADMIN_CREDENTIALS.password}</strong></span>
            </span>
          </div>
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
                placeholder={ADMIN_CREDENTIALS.email}
                value={form.email}
                onChange={handleChange}
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
                placeholder={ADMIN_CREDENTIALS.password}
                value={form.password}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="button button--primary">
              Ingresar
            </button>
            {error && <p className="error-text">Credenciales inválidas.</p>}
          </form>
        </div>
      </div>
    </section>
  );
};

AdminLogin.propTypes = {
  onLogin: PropTypes.func.isRequired,
  error: PropTypes.bool,
};

AdminLogin.defaultProps = {
  error: false,
};

export default AdminLogin;
