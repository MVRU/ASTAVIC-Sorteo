// src/components/__tests__/LiveDrawModal.test.js

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LiveDrawModal from "../LiveDrawModal";

const setupUser = () =>
  typeof userEvent.setup === "function" ? userEvent.setup() : userEvent;

const raffle = {
  title: "Sorteo aniversario",
  description: "Celebración especial",
};

let originalScrollTo;

beforeAll(() => {
  originalScrollTo = window.scrollTo;
  window.scrollTo = jest.fn();
});

afterAll(() => {
  window.scrollTo = originalScrollTo;
});

describe("LiveDrawModal", () => {
  test("mantiene el foco dentro del modal al tabular", async () => {
    const user = setupUser();
    render(
      <>
        <button type="button">Disparador externo</button>
        <LiveDrawModal
          open
          raffle={raffle}
          message="Mostrando resultados"
          winners={["Ana"]}
          onClose={jest.fn()}
        />
      </>
    );

    const closeButton = screen.getByRole("button", { name: /cerrar modal/i });
    const confirmButton = screen.getByRole("button", { name: /listo/i });

    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(confirmButton).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(confirmButton).toHaveFocus();
  });

  test("restaura el foco al cerrar", async () => {
    const onClose = jest.fn();
    const triggerLabel = "Abrir modal";
    const { rerender } = render(
      <>
        <button type="button">{triggerLabel}</button>
        <LiveDrawModal
          open={false}
          raffle={raffle}
          message=""
          winners={[]}
          onClose={onClose}
        />
      </>
    );

    const triggerButton = screen.getByRole("button", { name: triggerLabel });
    triggerButton.focus();

    rerender(
      <>
        <button type="button">{triggerLabel}</button>
        <LiveDrawModal
          open
          raffle={raffle}
          message=""
          winners={[]}
          onClose={onClose}
        />
      </>
    );

    expect(screen.getByRole("button", { name: /cerrar modal/i })).toHaveFocus();

    rerender(
      <>
        <button type="button">{triggerLabel}</button>
        <LiveDrawModal
          open={false}
          raffle={raffle}
          message=""
          winners={[]}
          onClose={onClose}
        />
      </>
    );

    await waitFor(() => {
      expect(triggerButton).toHaveFocus();
    });
  });
});
