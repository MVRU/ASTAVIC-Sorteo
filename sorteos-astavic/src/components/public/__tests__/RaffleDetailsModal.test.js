// src/components/public/__tests__/RaffleDetailsModal.test.js

import { createRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RaffleDetailsModal from "../RaffleDetailsModal";

const setupUser = () =>
  typeof userEvent.setup === "function" ? userEvent.setup() : userEvent;

const raffle = {
  id: "raffle-1",
  title: "Sorteo solidario",
  description: "Apoyamos a la comunidad",
  datetime: new Date().toISOString(),
  participants: Array.from(
    { length: 30 },
    (_, index) => `Participante ${index + 1}`
  ),
  winners: ["Ganador 1"],
  prizes: [{ title: "Premio mayor" }],
};

let originalScrollTo;

beforeAll(() => {
  originalScrollTo = window.scrollTo;
  window.scrollTo = jest.fn();
});

afterAll(() => {
  window.scrollTo = originalScrollTo;
});

describe("RaffleDetailsModal", () => {
  test("cicla el foco dentro del contenido", async () => {
    const user = setupUser();
    render(
      <RaffleDetailsModal
        raffle={raffle}
        isFinished
        participantsCount={raffle.participants.length}
        onClose={jest.fn()}
      />
    );

    const closeButton = screen.getByRole("button", {
      name: /cerrar detalles del sorteo/i,
    });
    const searchInput = screen.getByRole("searchbox", {
      name: /buscar participante/i,
    });
    const toggleButton = screen.getByRole("button", {
      name: /mostrar todos los participantes/i,
    });
    const footerButton = screen.getByRole("button", { name: /^cerrar$/i });

    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(searchInput).toHaveFocus();

    await user.tab();
    expect(toggleButton).toHaveFocus();

    await user.tab();
    expect(footerButton).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(footerButton).toHaveFocus();
  });

  test("devuelve el foco al disparador al cerrarse", async () => {
    const triggerRef = createRef();
    const handleClose = jest.fn();

    const Wrapper = ({ open }) => (
      <>
        <button type="button" ref={triggerRef}>
          Abrir detalles
        </button>
        {open ? (
          <RaffleDetailsModal
            raffle={raffle}
            isFinished
            participantsCount={raffle.participants.length}
            onClose={handleClose}
            returnFocusRef={triggerRef}
          />
        ) : null}
      </>
    );

    const { rerender } = render(<Wrapper open={false} />);

    const triggerButton = screen.getByRole("button", {
      name: /abrir detalles/i,
    });
    triggerButton.focus();

    rerender(<Wrapper open />);
    expect(
      screen.getByRole("button", { name: /cerrar detalles del sorteo/i })
    ).toHaveFocus();

    rerender(<Wrapper open={false} />);

    await waitFor(() => {
      expect(triggerButton).toHaveFocus();
    });
  });
});
