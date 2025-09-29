import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

beforeEach(() => {
  process.env.REACT_APP_ADMIN_EMAIL = 'admin@example.com';
  process.env.REACT_APP_ADMIN_PASSWORD = 'clave-super-segura';
});

afterEach(() => {
  delete process.env.REACT_APP_ADMIN_EMAIL;
  delete process.env.REACT_APP_ADMIN_PASSWORD;
  sessionStorage.clear();
  window.location.hash = '#/';
});

const createUser = () =>
  typeof userEvent.setup === 'function'
    ? userEvent.setup()
    : {
        click: (...args) => userEvent.click(...args),
        type: (...args) => userEvent.type(...args),
      };

test('renderiza la vista publica con el titulo Sorteos', () => {
  render(<App />);
  const heading = screen.getByRole('heading', { name: /Sorteos/i });
  expect(heading).toBeInTheDocument();
});

test('redirecciona al panel principal tras iniciar sesión sin forzar subrutas', async () => {
  const user = createUser();
  window.location.hash = '#/admin';
  sessionStorage.clear();

  render(<App />);

  await user.type(
    screen.getByLabelText(/email/i, { selector: 'input' }),
    'admin@example.com'
  );
  await user.type(
    screen.getByLabelText(/contraseña/i, { selector: 'input' }),
    'clave-super-segura'
  );
  await user.click(screen.getByRole('button', { name: /ingresar/i }));

  await waitFor(() => expect(window.location.hash).toBe('#/admin'));
  expect(window.location.hash.includes('/crear')).toBe(false);
});
