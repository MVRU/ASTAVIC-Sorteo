import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
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

  await user.type(
    screen.getByLabelText(/email/i, { selector: 'input' }),
    'astavic@gmail.com'
  );
  await user.type(
    screen.getByLabelText(/contraseña/i, { selector: 'input' }),
    'Colon 3115'
  );
  await user.click(screen.getByRole('button', { name: /ingresar/i }));

  await waitFor(() => expect(window.location.hash).toBe('#/admin'));
  expect(window.location.hash.includes('/crear')).toBe(false);
});
