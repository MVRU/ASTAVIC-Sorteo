import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import { ADMIN_CREDENTIALS, ADMIN_DEMO_MESSAGE } from './config/adminCredentials';
import { ToastProvider } from './context/ToastContext';

const createUser = () =>
  typeof userEvent.setup === 'function'
    ? userEvent.setup()
    : {
        click: (...args) => userEvent.click(...args),
        type: (...args) => userEvent.type(...args),
        clear: (...args) => userEvent.clear(...args),
      };

const renderWithToast = (ui) => render(<ToastProvider>{ui}</ToastProvider>);

const prepareAdminRoute = () => {
  window.location.hash = '#/admin';
  sessionStorage.clear();
};

const fillLoginForm = async (user, {
  email = ADMIN_CREDENTIALS.email,
  password = ADMIN_CREDENTIALS.password,
} = {}) => {
  const emailInput = screen.getByLabelText(/email/i, { selector: 'input' });
  const passwordInput = screen.getByLabelText(/contraseña/i, { selector: 'input' });

  await user.clear(emailInput);
  await user.clear(passwordInput);
  await user.type(emailInput, email);
  await user.type(passwordInput, password);
};

const submitLogin = async (user) => {
  await user.click(screen.getByRole('button', { name: /ingresar/i }));
};

test('renderiza la vista publica con el titulo Sorteos', () => {
  renderWithToast(<App />);
  const heading = screen.getByRole('heading', {
    level: 1,
    name: /sorteos activos/i,
  });
  expect(heading).toBeInTheDocument();
});

test('redirecciona al panel principal tras iniciar sesión sin forzar subrutas', async () => {
  const user = createUser();
  prepareAdminRoute();

  renderWithToast(<App />);

  expect(
    await screen.findByTestId('admin-demo-notice')
  ).toHaveTextContent(ADMIN_DEMO_MESSAGE);

  await fillLoginForm(user);
  await submitLogin(user);

  await waitFor(() => expect(window.location.hash).toBe('#/admin'));
  expect(window.location.hash.includes('/crear')).toBe(false);
});

test('muestra un toast de error al ingresar credenciales incorrectas', async () => {
  const user = createUser();
  prepareAdminRoute();

  renderWithToast(<App />);
  await screen.findByTestId('admin-demo-notice');

  await fillLoginForm(user, { email: 'otro@example.com', password: 'incorrecta' });
  await submitLogin(user);

  expect(
    await screen.findByText(/Credenciales inválidas\. Revisá los datos e intentá nuevamente\./i)
  ).toBeInTheDocument();
});

test('muestra un toast de éxito al iniciar sesión y otro informativo al cerrar sesión', async () => {
  const user = createUser();
  prepareAdminRoute();

  renderWithToast(<App />);
  await screen.findByTestId('admin-demo-notice');

  await fillLoginForm(user);
  await submitLogin(user);

  expect(
    await screen.findByText(/Sesión iniciada correctamente\./i)
  ).toBeInTheDocument();

  const logoutButton = await screen.findByRole('button', { name: /cerrar sesión/i });
  await user.click(logoutButton);

  expect(
    await screen.findByText(/Sesión cerrada correctamente\./i)
  ).toBeInTheDocument();
});
