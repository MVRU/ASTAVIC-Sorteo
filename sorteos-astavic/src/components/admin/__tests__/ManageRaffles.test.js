// src/components/admin/__tests__/ManageRaffles.test.js
// ! DECISIÓN DE DISEÑO: Estas pruebas cubren escenarios críticos de validación para impedir modificaciones inválidas en sorteos existentes.

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ManageRaffles from "../ManageRaffles";

const baseRaffle = {
  id: "raffle-1",
  title: "Sorteo destacado",
  description: "Premios increíbles",
  datetime: "2099-01-01T12:00:00.000Z",
  winnersCount: 1,
  finished: false,
  prizes: [{ title: "Premio único" }],
  participants: ["Ana", "Luis"],
};

const renderManageRaffles = (overrides = {}) => {
  const props = {
    raffles: [{ ...baseRaffle, ...overrides }],
    onUpdateRaffle: jest.fn(),
    onDeleteRaffle: jest.fn(),
    onMarkFinished: jest.fn(),
  };
  render(<ManageRaffles {...props} />);
  return props;
};

const getUser = () =>
  typeof userEvent.setup === "function" ? userEvent.setup() : userEvent;

const openEditor = async () => {
  const user = getUser();
  await user.click(screen.getByRole("button", { name: /editar/i }));
  return user;
};

describe("ManageRaffles embedded editor validation", () => {
  test("rejects dates in the past", async () => {
    const { onUpdateRaffle } = renderManageRaffles();
    const user = await openEditor();

    const datetimeInput = screen.getByLabelText("Fecha y hora");
    fireEvent.change(datetimeInput, { target: { value: "2000-01-01T00:00" } });

    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    expect(onUpdateRaffle).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "La fecha/hora debe ser en el futuro."
    );
  });

  test("rejects empty prize titles", async () => {
    const { onUpdateRaffle } = renderManageRaffles();
    const user = await openEditor();

    const prizesField = screen.getByLabelText("Premios (uno por línea)");
    await user.clear(prizesField);

    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    expect(onUpdateRaffle).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "El título del premio 1 no puede estar vacío."
    );
  });

  test("rejects duplicated participants", async () => {
    const { onUpdateRaffle } = renderManageRaffles();
    const user = await openEditor();

    const participantsField = screen.getByLabelText("Participantes (uno por línea)");
    await user.clear(participantsField);
    await user.type(participantsField, "Ana\nAna");

    await user.click(screen.getByRole("button", { name: /guardar cambios/i }));

    expect(onUpdateRaffle).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Hay participantes duplicados; revisá la lista."
    );
  });
});
