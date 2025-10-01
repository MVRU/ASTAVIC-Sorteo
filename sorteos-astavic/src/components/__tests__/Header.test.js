// ! DECISIÓN DE DISEÑO: Validamos el menú móvil para evitar fugas de foco y scroll en el header.
// * Las pruebas fuerzan viewport móvil simulando matchMedia consistente en todos los escenarios.
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Header from "../Header";

describe("Header - menú móvil accesible", () => {
  const originalMatchMedia = window.matchMedia;

  const enableMobileViewport = () => {
    window.matchMedia = (query) => {
      const listeners = new Set();
      return {
        matches: query.includes("max-width"),
        media: query,
        addEventListener: (_event, handler) => listeners.add(handler),
        removeEventListener: (_event, handler) => listeners.delete(handler),
        addListener: (handler) => listeners.add(handler),
        removeListener: (handler) => listeners.delete(handler),
        dispatchEvent: (event) => {
          listeners.forEach((listener) => listener(event));
        },
      };
    };
  };

  afterAll(() => {
    window.matchMedia = originalMatchMedia;
  });

  const createUser = () =>
    (typeof userEvent.setup === "function" ? userEvent.setup() : userEvent);

  const renderHeader = (props = {}) => {
    enableMobileViewport();
    return render(
      <Header
        currentRoute="public"
        onNavigate={jest.fn()}
        logoSrc="/Logo.png"
        isAdmin={false}
        {...props}
      />
    );
  };

  it("atrapa el foco dentro del menú móvil mientras está abierto", async () => {
    const user = createUser();
    renderHeader();

    const toggleButton = screen.getByRole("button", { name: /abrir menú/i });
    await user.click(toggleButton);

    const dialog = await within(document.body).findByRole("dialog", {
      name: /menú de navegación móvil/i,
    });
    const header = screen.getByRole("banner");
    expect(
      within(header).queryByRole("dialog", { name: /menú de navegación móvil/i })
    ).toBeNull();
    const closeButton = within(dialog).getByRole("button", {
      name: /cerrar menú/i,
    });
    expect(closeButton).toHaveFocus();

    await user.tab();
    const firstLink = within(dialog).getByRole("link", { name: /inicio/i });
    expect(firstLink).toHaveFocus();

    await user.tab();
    const secondLink = within(dialog).getByRole("link", {
      name: /todos los sorteos/i,
    });
    expect(secondLink).toHaveFocus();

    await user.tab();
    const thirdLink = within(dialog).getByRole("link", {
      name: /sorteos finalizados/i,
    });
    expect(thirdLink).toHaveFocus();

    await user.tab();
    const adminLink = within(dialog).getByRole("link", {
      name: /administración/i,
    });
    expect(adminLink).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    await user.tab({ shift: true });
    expect(adminLink).toHaveFocus();
  });

  it("bloquea el scroll del body y restaura el foco al cerrar", async () => {
    const user = createUser();
    renderHeader();

    const toggleButton = screen.getByRole("button", { name: /abrir menú/i });
    await user.click(toggleButton);

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");

    const layer = screen.getByTestId("header-mobile-layer");
    expect(layer).toBeInTheDocument();
    const header = screen.getByRole("banner");
    expect(within(header).queryByTestId("header-mobile-layer")).toBeNull();

    const overlay = within(document.body).getByTestId("header-mobile-overlay");
    await user.click(overlay);

    expect(document.body.style.overflow).toBe("");
    expect(document.body.style.position).toBe("");
    expect(toggleButton).toHaveFocus();
  });
});
