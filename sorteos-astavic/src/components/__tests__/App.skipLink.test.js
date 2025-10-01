// src/components/__tests__/App.skipLink.test.js
// ! DECISIÓN DE DISEÑO: Verificamos el flujo de lazo de foco del enlace de salto para prevenir regresiones de accesibilidad.
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../../App";
import { ToastProvider } from "../../context/ToastContext";

const renderWithProviders = () =>
  render(
    <ToastProvider>
      <App />
    </ToastProvider>
  );

const setupUser = () =>
  (typeof userEvent.setup === "function" ? userEvent.setup() : userEvent);

describe("App skip link", () => {
  test("permite saltar al contenido principal con el teclado", async () => {
    renderWithProviders();
    const user = setupUser();

    const skipLink = screen.getByRole("link", {
      name: /saltar al contenido principal/i,
    });

    await user.tab();
    expect(skipLink).toHaveFocus();
    expect(skipLink).toHaveAttribute("href", "#main-content");

    await user.keyboard("{Enter}");
    const main = screen.getByRole("main");

    expect(main).toHaveFocus();
  });
});
