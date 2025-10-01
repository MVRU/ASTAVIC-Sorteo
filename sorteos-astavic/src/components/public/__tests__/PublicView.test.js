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

test("muestra copy de sorteos activos y mantiene la guía plegada", () => {
  setup();
  expect(
    screen.getByRole("heading", { name: /sorteos activos/i })
  ).toBeInTheDocument();
  expect(
    screen.getByText(/hay 1 sorteo/i)
  ).toBeInTheDocument();
  expect(
    screen.queryByRole("heading", { name: /cómo participar en los sorteos/i })
  ).not.toBeInTheDocument();
  const toggle = screen.getByRole("button", { name: /ver guía de participación/i });
  expect(toggle).toHaveAttribute("aria-expanded", "false");
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

test("mantiene layout y acciones principales entre pestañas", () => {
  const { props, rerender } = setup({
    activeRaffles: [raffleSample],
    finishedRaffles: [{ ...raffleSample, id: "raffle-4", finished: true }],
  });

  const expectCommonElements = (headingPattern) => {
    expect(
      screen.getByRole("button", { name: /recordatorios por email/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /ver guía de participación/i })
    ).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.getByRole("heading", { name: headingPattern })
    ).toBeInTheDocument();
  };

  expectCommonElements(/sorteos activos/i);

  rerender(<PublicView {...props} route="all" />);
  expectCommonElements(/todos los sorteos/i);

  rerender(<PublicView {...props} route="finished" />);
  expectCommonElements(/sorteos finalizados/i);
});

test("permite desplegar la guía y ofrece accesos directos", async () => {
  const onRouteChange = jest.fn();
  setup({
    finishedRaffles: [{ ...raffleSample, id: "raffle-3", finished: true }],
    onRouteChange,
  });

  const toggle = screen.getByRole("button", { name: /ver guía de participación/i });
  await userEvent.click(toggle);

  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(
    screen.getByRole("heading", { name: /cómo participar en los sorteos/i })
  ).toBeInTheDocument();
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

test("colapsa la guía al ocultarla y restablece aria-hidden", async () => {
  setup();

  const toggle = screen.getByRole("button", { name: /ver guía de participación/i });
  const guideSection = () => screen.getByTestId("participation-guide");
  const initialGuide = guideSection();

  expect(initialGuide).not.toBeNull();
  expect(initialGuide).toHaveAttribute("data-state", "collapsed");
  expect(initialGuide).toHaveAttribute("aria-hidden", "true");

  await userEvent.click(toggle);

  expect(toggle).toHaveAttribute("aria-expanded", "true");
  const expandedGuide = guideSection();
  expect(expandedGuide).not.toBeNull();
  expect(expandedGuide).toHaveAttribute("data-state", "expanded");
  expect(expandedGuide).toHaveAttribute("aria-hidden", "false");

  await userEvent.click(
    screen.getByRole("button", { name: /ocultar guía de participación/i })
  );

  expect(toggle).toHaveAttribute("aria-expanded", "false");
  const collapsedGuide = guideSection();
  expect(collapsedGuide).not.toBeNull();
  expect(collapsedGuide).toHaveAttribute("data-state", "collapsed");
  expect(collapsedGuide).toHaveAttribute("aria-hidden", "true");
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
