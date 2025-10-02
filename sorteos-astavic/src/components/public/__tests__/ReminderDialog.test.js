// src/components/public/__tests__/ReminderDialog.test.js

import { createRef } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ReminderDialog from "../ReminderDialog";

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

describe("ReminderDialog", () => {
  const baseProps = {
    email: "",
    submitting: false,
    isEmailValid: true,
    onClose: jest.fn(),
    onSubmit: jest.fn(),
    onEmailChange: jest.fn(),
    onResetRaffle: jest.fn(),
  };

  test("mantiene el foco confinado dentro del diálogo", async () => {
    const emailFieldRef = createRef();
    const user = setupUser();
    render(
      <>
        <button type="button">Exterior</button>
        <ReminderDialog
          {...baseProps}
          open
          raffle={null}
          emailFieldRef={emailFieldRef}
        />
      </>
    );

    const closeButton = screen.getByRole("button", {
      name: /cerrar recordatorio/i,
    });
    const emailInput = screen.getByLabelText(/correo electrónico/i);
    const submitButton = screen.getByRole("button", {
      name: /quiero recibir novedades/i,
    });

    expect(emailInput).toHaveFocus();

    await user.tab({ shift: true });
    expect(closeButton).toHaveFocus();

    await user.tab();
    expect(emailInput).toHaveFocus();

    await user.tab();
    expect(submitButton).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();
  });

  test("restaura el foco al elemento invocador al cerrarse", async () => {
    const emailFieldRef = createRef();
    const triggerLabel = "Abrir recordatorio";
    const { rerender } = render(
      <>
        <button type="button">{triggerLabel}</button>
        <ReminderDialog
          {...baseProps}
          open={false}
          raffle={null}
          emailFieldRef={emailFieldRef}
        />
      </>
    );

    const triggerButton = screen.getByRole("button", { name: triggerLabel });
    triggerButton.focus();

    rerender(
      <>
        <button type="button">{triggerLabel}</button>
        <ReminderDialog
          {...baseProps}
          open
          raffle={null}
          emailFieldRef={emailFieldRef}
        />
      </>
    );

    expect(screen.getByLabelText(/correo electrónico/i)).toHaveFocus();

    rerender(
      <>
        <button type="button">{triggerLabel}</button>
        <ReminderDialog
          {...baseProps}
          open={false}
          raffle={null}
          emailFieldRef={emailFieldRef}
        />
      </>
    );

    await waitFor(() => {
      expect(triggerButton).toHaveFocus();
    });
  });
});
