// src/components/public/__tests__/RaffleCard.test.js
// ! DECISIÓN DE DISEÑO: Validamos la interacción de volteo para asegurar accesibilidad y evitar regresiones visuales.
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { act } from "react";
import RaffleCard from "../RaffleCard";

jest.mock("../RaffleDetailsModal", () => () => null);

const finishedRaffle = {
  id: "raffle-finished-1",
  title: "Sorteo aniversario",
  description: "",
  datetime: "2024-03-01T12:00:00.000Z",
  participants: [],
  winners: ["Ana García", "Luis Gómez"],
  prizes: [
    { title: "Notebook Lenovo IdeaPad" },
    { title: "Auriculares inalámbricos" },
  ],
  finished: true,
  winnersCount: 2,
};

const renderComponent = () => {
  render(
    <RaffleCard
      raffle={finishedRaffle}
      onMarkFinished={jest.fn()}
      onRequestReminder={jest.fn()}
      interactionMode="active"
    />
  );
};

test("alterna ganadores y premios al interactuar con la tarjeta finalizada", async () => {
  renderComponent();

  const cardToggle = screen.getByRole("button", {
    name: /mostrar premios del sorteo sorteo aniversario/i,
  });
  const flipWrapper = screen.getByTestId("raffle-card-flip");
  const shells = screen.getAllByTestId("raffle-card-shell");
  const [frontSide, backSide] = screen.getAllByRole("group", { hidden: true });
  const frontCtaButton = within(frontSide).getByRole("button", {
    name: /ver detalles del sorteo sorteo aniversario/i,
  });

  expect(cardToggle).toHaveClass("raffle-card--finished");
  expect(cardToggle).not.toHaveClass("card");
  expect(cardToggle).not.toHaveClass("raffle-card--finished-horizontal");

  expect(shells).toHaveLength(2);
  expect(flipWrapper).toHaveAttribute("data-active-face", "front");
  expect(frontSide).toHaveAttribute(
    "aria-label",
    "Ganadores del sorteo Sorteo aniversario"
  );
  expect(backSide).toHaveAttribute(
    "aria-label",
    "Premios del sorteo Sorteo aniversario"
  );

  expect(frontSide).not.toBeNull();
  expect(backSide).not.toBeNull();
  expect(frontSide).toHaveAttribute("aria-hidden", "false");
  expect(backSide).toHaveAttribute("aria-hidden", "true");
  expect(within(frontSide).getByText("Ana García")).toBeInTheDocument();
  expect(frontCtaButton.style.width).toBe("");
  expect(frontCtaButton).toHaveClass("button--gold");

  await userEvent.click(cardToggle);

  expect(cardToggle).toHaveAttribute("aria-pressed", "true");
  expect(frontSide).toHaveAttribute("aria-hidden", "true");
  expect(backSide).toHaveAttribute("aria-hidden", "false");
  expect(flipWrapper).toHaveAttribute("data-active-face", "back");
  expect(within(backSide).getByText("Notebook Lenovo IdeaPad")).toBeInTheDocument();
  const backCtaButton = within(backSide).getByRole("button", {
    name: /ver detalles del sorteo sorteo aniversario/i,
  });
  expect(backCtaButton.style.width).toBe("");
  expect(backCtaButton).toHaveClass("button--gold");

  cardToggle.focus();
  await userEvent.keyboard("{Enter}");

  expect(cardToggle).toHaveAttribute("aria-pressed", "false");
  expect(frontSide).toHaveAttribute("aria-hidden", "false");
  expect(flipWrapper).toHaveAttribute("data-active-face", "front");
  expect(within(frontSide).getByText("Ana García")).toBeInTheDocument();
});

test("conservar la vista de ganadores al abrir el detalle del sorteo", async () => {
  renderComponent();

  const cardToggle = screen.getByRole("button", {
    name: /mostrar premios del sorteo sorteo aniversario/i,
  });
  const detailButtons = screen.getAllByRole("button", {
    name: /ver detalles del sorteo sorteo aniversario/i,
  });
  const [frontSide] = screen.getAllByRole("group", { hidden: true });

  await userEvent.click(detailButtons[0]);

  expect(cardToggle).toHaveAttribute("aria-pressed", "false");
  expect(frontSide).toHaveAttribute("aria-hidden", "false");
});

test("ajusta la altura del flip al mostrar premios con texto extenso", async () => {
  const longPrizeRaffle = {
    ...finishedRaffle,
    id: "raffle-finished-long",
    title: "Sorteo con premios extensos",
    prizes: [
      {
        title:
          "Lote de experiencias gastronómicas premium en 3 ciudades diferentes con hospedaje incluido y actividades complementarias.",
      },
      {
        title:
          "Suscripción anual a plataformas educativas, cajas de suscripción y asesoría personalizada para emprendimientos emergentes.",
      },
    ],
  };

  render(
    <RaffleCard
      raffle={longPrizeRaffle}
      onMarkFinished={jest.fn()}
      onRequestReminder={jest.fn()}
      interactionMode="active"
    />
  );

  const flipWrapper = screen.getByTestId("raffle-card-flip");
  const shells = screen.getAllByTestId("raffle-card-shell");
  const [frontShell, backShell] = shells;
  const cardToggle = screen.getByRole("button", {
    name: /mostrar premios del sorteo sorteo con premios extensos/i,
  });

  Object.defineProperty(frontShell, "scrollHeight", {
    configurable: true,
    value: 280,
  });
  Object.defineProperty(backShell, "scrollHeight", {
    configurable: true,
    value: 460,
  });

  act(() => {
    window.dispatchEvent(new Event("resize"));
  });

  await waitFor(() => {
    expect(flipWrapper).toHaveAttribute("data-active-face", "front");
  });
  await waitFor(() => {
    expect(flipWrapper.style.height).toBe("280px");
  });
  const initialHeight = parseFloat(flipWrapper.style.height || "0");

  await userEvent.click(cardToggle);

  await waitFor(() => {
    expect(flipWrapper).toHaveAttribute("data-active-face", "back");
  });
  await waitFor(() => {
    const currentHeight = parseFloat(flipWrapper.style.height || "0");
    expect(currentHeight).toBeGreaterThan(initialHeight);
  });

  await waitFor(() => {
    expect(flipWrapper.style.height).toBe("460px");
  });

  expect(
    screen.getByText(
      /lote de experiencias gastronómicas premium en 3 ciudades diferentes/i
    )
  ).toBeInTheDocument();
});
