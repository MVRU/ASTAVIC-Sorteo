// src/components/admin/__tests__/AdminDashboard.test.js

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminDashboard from "../AdminDashboard";
import { ToastProvider } from "../../../context/ToastContext";

const renderWithProviders = (ui) => render(<ToastProvider>{ui}</ToastProvider>);
const setupUser = () =>
  typeof userEvent.setup === "function" ? userEvent.setup() : userEvent;

describe("AdminDashboard", () => {
  test("muestra errores inline accesibles al fallar la validación", async () => {
    const onCreateRaffle = jest.fn();
    renderWithProviders(
      <AdminDashboard
        onLogout={jest.fn()}
        onCreateRaffle={onCreateRaffle}
        raffles={[]}
      />
    );

    const user = setupUser();
    await user.click(screen.getByRole("button", { name: /crear sorteo/i }));

    const titleInput = screen.getByRole("textbox", {
      name: /título del sorteo/i,
    });
    await waitFor(() => {
      expect(titleInput).toHaveAttribute("aria-invalid", "true");
    });
    expect(titleInput.getAttribute("aria-describedby")).toMatch(
      /raffle-title-error/
    );
    expect(
      screen.getByText("El título debe tener al menos 3 caracteres.", {
        selector: "#raffle-title-error",
      })
    ).toBeInTheDocument();

    const prizeInput = screen.getByRole("textbox", { name: /premio 1/i });
    expect(prizeInput).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("El título del premio 1 no puede estar vacío.", {
        selector: "#create-prizes-error",
      })
    ).toBeInTheDocument();

    const manualInput = screen.getByRole("textbox", {
      name: /participante manual 1/i,
    });
    expect(manualInput).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByText("No se detectaron participantes (archivo o texto).", {
        selector: "#create-manual-error",
      })
    ).toBeInTheDocument();
    expect(manualInput.getAttribute("aria-describedby")).toMatch(
      /create-manual-error/
    );

    const dropZone = screen.getByRole("button", {
      name: /soltá tu archivo/i,
    });
    expect(dropZone.getAttribute("aria-describedby")).toMatch(
      /create-manual-error/
    );

    await waitFor(() => {
      expect(titleInput).toHaveFocus();
    });
  });

  test("rechaza sorteos con un único participante", async () => {
    const onCreateRaffle = jest.fn();
    renderWithProviders(
      <AdminDashboard
        onLogout={jest.fn()}
        onCreateRaffle={onCreateRaffle}
        raffles={[]}
      />
    );

    const user = setupUser();
    const titleInput = screen.getByRole("textbox", {
      name: /título del sorteo/i,
    });
    await user.type(titleInput, "Sorteo robusto");

    const datetimeInput = screen.getByLabelText(/fecha y hora/i, {
      selector: "input",
    });
    const futureValue = new Date(Date.now() + 86400000)
      .toISOString()
      .slice(0, 16);
    fireEvent.change(datetimeInput, { target: { value: futureValue } });

    const prizeInput = screen.getByRole("textbox", { name: /premio 1/i });
    await user.type(prizeInput, "Pack de bienvenida");

    const participantInput = screen.getByRole("textbox", {
      name: /participante manual 1/i,
    });
    await user.type(participantInput, "ana@example.com");

    await user.click(screen.getByRole("button", { name: /crear sorteo/i }));

    const manualError = await screen.findByText(
      /al menos 2 participantes distintos/i,
      {
        selector: "#create-manual-error",
      }
    );
    expect(manualError).toBeInTheDocument();
    expect(onCreateRaffle).not.toHaveBeenCalled();
  });

  test("deshabilita la interacción en la tarjeta de vista previa", () => {
    renderWithProviders(
      <AdminDashboard
        onLogout={jest.fn()}
        onCreateRaffle={jest.fn()}
        raffles={[]}
      />
    );

    screen.getByRole("heading", { name: /vista previa/i });

    expect(
      screen.queryByRole("button", { name: /ver sorteo/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /avisarme por email/i })
    ).not.toBeInTheDocument();

    const previewViewButton = screen.getByText(/ver sorteo/i, {
      selector: "button",
      hidden: true,
    });
    const previewReminderButton = screen.getByText(/avisarme por email/i, {
      selector: "button",
      hidden: true,
    });

    expect(previewViewButton).toBeDisabled();
    expect(previewReminderButton).toBeDisabled();

    previewViewButton.click();
    previewReminderButton.click();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
