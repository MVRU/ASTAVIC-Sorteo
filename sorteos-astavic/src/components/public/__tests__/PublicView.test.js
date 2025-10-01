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
    onRouteChange: jest.fn(),
    route: "public",
    ...overrides,
  };
  const view = render(<PublicView {...props} />);
  return { props, ...view };
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
  expect(
    screen.getByRole("heading", { name: /cómo participar en los sorteos/i })
  ).toBeInTheDocument();
});

test("permite alternar entre vistas desde el segmento", async () => {
  const onRouteChange = jest.fn();
  const { props, rerender } = setup({ onRouteChange });

  const allTab = screen.getByRole("button", { name: /todos/i });
  const finishedTab = screen.getByRole("button", { name: /finalizados/i });
  expect(finishedTab).toHaveAttribute("aria-pressed", "false");

  await userEvent.click(allTab);
  expect(onRouteChange).toHaveBeenCalledWith("all");

  await userEvent.click(finishedTab);

  expect(onRouteChange).toHaveBeenCalledWith("finished");

  rerender(<PublicView {...props} route="finished" />);

  expect(
    screen.getByRole("button", { name: /finalizados/i })
  ).toHaveAttribute("aria-pressed", "true");
  expect(
    screen.getByRole("button", { name: /finalizados/i })
  ).toHaveAttribute("aria-current", "page");
  expect(
    screen.getByRole("button", { name: /activos/i })
  ).not.toHaveAttribute("aria-current");

  rerender(<PublicView {...props} route="all" />);

  expect(screen.getByRole("button", { name: /todos/i })).toHaveAttribute(
    "aria-current",
    "page"
  );
  expect(screen.getByRole("button", { name: /todos/i })).toHaveAttribute(
    "aria-pressed",
    "true"
  );
});

test("muestra copy combinado y conteo acumulado en pestaña todos", () => {
  setup({
    route: "all",
    activeRaffles: [raffleSample],
    finishedRaffles: [{ ...raffleSample, id: "raffle-2", finished: true }],
  });

  expect(
    screen.getByRole("heading", { name: /todos los sorteos/i })
  ).toBeInTheDocument();
  expect(screen.getByText(/hay 2 sorteos/i)).toBeInTheDocument();
});

test("la guía explica pasos clave y ofrece accesos directos", async () => {
  const onRouteChange = jest.fn();
  setup({
    finishedRaffles: [{ ...raffleSample, id: "raffle-3", finished: true }],
    onRouteChange,
  });

  expect(
    screen.getByText(/Configurá un aviso por correo/i)
  ).toBeInTheDocument();

  await userEvent.click(
    screen.getByRole("button", { name: /configurar recordatorio/i })
  );

  expect(
    await screen.findByRole("dialog", { name: /recibí recordatorios y resultados/i })
  ).toBeInTheDocument();

  const finishedShortcut = screen.getByRole("button", {
    name: /ver sorteos finalizados/i,
  });

  await userEvent.click(finishedShortcut);

  expect(onRouteChange).toHaveBeenCalledWith("finished");
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
