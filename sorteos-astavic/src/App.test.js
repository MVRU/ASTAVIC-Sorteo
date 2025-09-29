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
      };

const renderWithToast = (ui) => render(<ToastProvider>{ui}</ToastProvider>);

test('renderiza la vista publica con el titulo Sorteos', () => {
  renderWithToast(<App />);
  const heading = screen.getByRole('heading', { name: /Sorteos/i });
  expect(heading).toBeInTheDocument();
});

test('redirecciona al panel principal tras iniciar sesión sin forzar subrutas', async () => {
  const user = createUser();
  window.location.hash = '#/admin';
  sessionStorage.clear();

  renderWithToast(<App />);

  expect(
    await screen.findByTestId('admin-demo-notice')
  ).toHaveTextContent(ADMIN_DEMO_MESSAGE);

  const emailInput = screen.getByLabelText(/email/i, { selector: 'input' });
  const passwordInput = screen.getByLabelText(/contraseña/i, { selector: 'input' });

  await userEvent.clear(emailInput);
  await userEvent.clear(passwordInput);

  await user.type(emailInput, ADMIN_CREDENTIALS.email);
  await user.type(passwordInput, ADMIN_CREDENTIALS.password);
  await user.click(screen.getByRole('button', { name: /ingresar/i }));

  await waitFor(() => expect(window.location.hash).toBe('#/admin'));
  expect(window.location.hash.includes('/crear')).toBe(false);
});
