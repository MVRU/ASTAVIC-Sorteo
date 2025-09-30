// src/components/public/__tests__/PublicView.test.js
// ! DECISIÓN DE DISEÑO: Garantizamos que la vista pública respete flujos de validación y renderizados derivados tras la refactorización modular.
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import PublicView from "../PublicView";

const mockShowToast = jest.fn();

jest.mock("../../../context/ToastContext", () => ({
  useToast: () => ({ showToast: mockShowToast }),
}));

const raffleSample = {
  id: "raffle-1",
  title: "Sorteo de prueba",
  description: "",
  datetime: new Date().toISOString(),
  winnersCount: 1,
  participants: [],
  prizes: [{ title: "Premio" }],
  finished: false,
};

const setup = (overrides = {}) => {
  const props = {
    activeRaffles: [raffleSample],
    finishedRaffles: [],
    onMarkFinished: jest.fn(),
    onRegisterSubscriber: jest.fn(),
    route: "public",
    ...overrides,
  };
  render(<PublicView {...props} />);
  return props;
};

beforeEach(() => {
  mockShowToast.mockClear();
});

test("muestra copy de sorteos activos y contador accesible", () => {
  setup();
  expect(
    screen.getByRole("heading", { name: /sorteos activos/i })
  ).toBeInTheDocument();
  expect(
    screen.getByText(/hay 1 sorteo/i)
  ).toBeInTheDocument();
});

test("valida correo antes de registrar suscripción", async () => {
  const registerSpy = jest.fn();
  setup({ onRegisterSubscriber: registerSpy });

  await userEvent.click(screen.getByRole("button", { name: /recordatorios por email/i }));
  await userEvent.click(screen.getByRole("button", { name: /quiero recibir novedades/i }));

  expect(registerSpy).not.toHaveBeenCalled();
  expect(mockShowToast).toHaveBeenCalledWith(
    expect.objectContaining({ message: "Ingresá un correo válido.", status: "error" })
  );
});

test("registra correo sanitizado y cierra modal en éxito", async () => {
  const registerSpy = jest
    .fn()
    .mockResolvedValue({ ok: true, message: "Registro completado." });
  setup({ onRegisterSubscriber: registerSpy });

  await userEvent.click(screen.getByRole("button", { name: /recordatorios por email/i }));
  const emailInput = screen.getByLabelText(/correo electrónico/i);
  await userEvent.type(emailInput, " Usuario@Test.COM  ");
  await userEvent.click(screen.getByRole("button", { name: /quiero recibir novedades/i }));

  await waitFor(() => {
    expect(registerSpy).toHaveBeenCalledWith("usuario@test.com", null);
  });

  expect(mockShowToast).toHaveBeenCalledWith(
    expect.objectContaining({ status: "success", message: "Registro completado." })
  );
  await waitFor(() => {
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
