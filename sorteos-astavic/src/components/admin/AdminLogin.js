/**
 * TODOS:
 * - [ ] Admin, luego de iniciar sesión, debe tener dos vistas: crear un nuevo sorteo y gestionar los sorteos existentes (editar o borrar).
 */

import { useState } from "react";
import PropTypes from "prop-types";

const AdminLogin = ({ onLogin, error }) => {
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
                placeholder="astavic.org.ar"
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
                placeholder="Colon 3115"
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
