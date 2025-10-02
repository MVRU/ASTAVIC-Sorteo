// src/components/admin/__tests__/AdminModal.test.js

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminModal from "../AdminModal";

const setupUser = () =>
  typeof userEvent.setup === "function" ? userEvent.setup() : userEvent;

let originalScrollTo;

beforeAll(() => {
  originalScrollTo = window.scrollTo;
  window.scrollTo = jest.fn();
});

afterAll(() => {
  window.scrollTo = originalScrollTo;
});

describe("AdminModal", () => {
  const footer = <button type="button">Guardar cambios</button>;

  test("encierra el foco dentro del modal", async () => {
    const user = setupUser();
    render(
      <>
        <button type="button">Botón externo</button>
        <AdminModal
          open
          title="Configurar sorteo"
          description="Ajustá los parámetros del sorteo"
          onClose={jest.fn()}
          footer={footer}
        >
          <button type="button" data-modal-autofocus="true">
            Acción principal
          </button>
        </AdminModal>
      </>
    );

    const closeButton = screen.getByRole("button", { name: /cerrar modal/i });
    const primaryButton = screen.getByRole("button", {
      name: /acción principal/i,
    });
    const footerButton = screen.getByRole("button", {
      name: /guardar cambios/i,
    });

    expect(primaryButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(primaryButton).toHaveFocus();

    await user.tab();
    expect(footerButton).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();
  });

  test("restaura el foco al cerrar", async () => {
    const onClose = jest.fn();
    const triggerLabel = "Abrir modal admin";
    const { rerender } = render(
      <>
        <button type="button">{triggerLabel}</button>
        <AdminModal
          open={false}
          title="Configurar sorteo"
          description="Ajustá los parámetros del sorteo"
          onClose={onClose}
          footer={footer}
        >
          <button type="button" data-modal-autofocus="true">
            Acción principal
          </button>
        </AdminModal>
      </>
    );

    const triggerButton = screen.getByRole("button", { name: triggerLabel });
    triggerButton.focus();

    rerender(
      <>
        <button type="button">{triggerLabel}</button>
        <AdminModal
          open
          title="Configurar sorteo"
          description="Ajustá los parámetros del sorteo"
          onClose={onClose}
          footer={footer}
        >
          <button type="button" data-modal-autofocus="true">
            Acción principal
          </button>
        </AdminModal>
      </>
    );

    expect(
      screen.getByRole("button", { name: /acción principal/i })
    ).toHaveFocus();

    rerender(
      <>
        <button type="button">{triggerLabel}</button>
        <AdminModal
          open={false}
          title="Configurar sorteo"
          description="Ajustá los parámetros del sorteo"
          onClose={onClose}
          footer={footer}
        >
          <button type="button" data-modal-autofocus="true">
            Acción principal
          </button>
        </AdminModal>
      </>
    );

    await waitFor(() => {
      expect(triggerButton).toHaveFocus();
    });
  });
});
