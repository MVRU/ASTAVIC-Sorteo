// src/components/admin/__tests__/ManageRaffles.test.js
// * DECISIÓN: Garantizamos que la edición preserve las mismas reglas que el
//   alta, verificando mensajes y focos accesibles ante errores de validación.

import {
  render,
  screen,
  within,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ManageRaffles, {
  UNSAVED_CHANGES_BEFORE_UNLOAD_MESSAGE,
  MANAGE_RAFFLES_DRAWER_WIDTH_STORAGE_KEY,
} from "../ManageRaffles";
import { ToastProvider } from "../../../context/ToastContext";

const createUser = () =>
  typeof userEvent.setup === "function"
    ? userEvent.setup()
    : {
        click: (...args) => userEvent.click(...args),
        type: (...args) => userEvent.type(...args),
        clear: (...args) => userEvent.clear(...args),
        tab: (...args) => userEvent.tab(...args),
      };

const sampleRaffles = [
  {
    id: "r1",
    title: "Sorteo aniversario",
    description: "Entre clientes frecuentes",
    datetime: new Date("2030-05-20T15:00:00Z").toISOString(),
    winnersCount: 2,
    finished: false,
    participants: ["Ana", "Luis"],
    prizes: [{ title: "Gift card" }],
  },
];

describe("ManageRaffles", () => {
  beforeEach(() => {
    window.localStorage?.clear();
  });

  test("abre el modal de edición con los datos cargados", async () => {
    const user = createUser();
    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));

    const dialog = await screen.findByRole("dialog", {
      name: /editar sorteo/i,
    });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByLabelText(/título/i)).toHaveValue("Sorteo aniversario");
    expect(
      within(dialog).getByRole("button", { name: /guardar cambios/i })
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("button", { name: /cancelar/i })
    ).toBeInTheDocument();
  });

  test("requiere confirmación antes de eliminar un sorteo", async () => {
    const user = createUser();
    const onDelete = jest.fn();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={onDelete}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /eliminar/i }));

    const dialog = await screen.findByRole("dialog", {
      name: /eliminar sorteo/i,
    });
    expect(
      within(dialog).getByText(/¿seguro que querés eliminar/i)
    ).toBeInTheDocument();

    await act(async () => {
      await user.click(
        within(dialog).getByRole("button", { name: /eliminar/i })
      );
    });
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith("r1"));
    expect(
      await screen.findByText(/sorteo "sorteo aniversario" eliminado\./i)
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: /eliminar sorteo/i })
      ).not.toBeInTheDocument()
    );
  });

  test("muestra feedback si la fecha guardada del sorteo es inválida", async () => {
    const user = createUser();
    const brokenRaffle = [
      { ...sampleRaffles[0], id: "r2", datetime: "invalid" },
    ];

    renderWithToast(
      <ManageRaffles
        raffles={brokenRaffle}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));
    const dialog = await screen.findByRole("dialog", {
      name: /editar sorteo/i,
    });

    const alert = await within(dialog).findByRole("alert");
    expect(alert).toHaveTextContent(/fecha guardada.*inválida/i);
    expect(screen.getByLabelText(/fecha y hora/i)).toHaveValue("");
  });

  test("impide enviar cambios cuando la fecha queda vacía", async () => {
    const user = createUser();
    const onUpdate = jest.fn();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={onUpdate}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));
    const datetimeInput = await screen.findByLabelText(/fecha y hora/i);
    await user.clear(datetimeInput);

    await act(async () => {
      await user.click(
        screen.getByRole("button", { name: /guardar cambios/i })
      );
    });

    expect(onUpdate).not.toHaveBeenCalled();
    const alerts = await screen.findAllByRole("alert");
    const feedback = alerts.find((node) =>
      node.textContent?.toLowerCase().includes("ingresá una fecha válida")
    );
    expect(feedback).toBeDefined();
    expect(
      screen.getByRole("dialog", { name: /editar sorteo/i })
    ).toBeInTheDocument();
  });

  test("rechaza guardar cuando el título tiene menos de tres caracteres", async () => {
    const user = createUser();
    const onUpdate = jest.fn();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={onUpdate}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));
    const dialog = await screen.findByRole("dialog", {
      name: /editar sorteo/i,
    });

    const titleInput = within(dialog).getByLabelText(/título/i);
    await user.clear(titleInput);
    await user.type(titleInput, "ab");

    await act(async () => {
      await user.click(
        within(dialog).getByRole("button", { name: /guardar cambios/i })
      );
    });

    expect(onUpdate).not.toHaveBeenCalled();
    const alert = await within(dialog).findByRole("alert");
    expect(alert).toHaveTextContent("El título debe tener al menos 3 caracteres.");
    expect(titleInput).toHaveAttribute("aria-invalid", "true");
    expect(
      screen.getByRole("dialog", { name: /editar sorteo/i })
    ).toBeInTheDocument();
  });

  test("muestra los índices correspondientes cuando hay premios vacíos", async () => {
    const user = createUser();
    const onUpdate = jest.fn();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={onUpdate}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));
    const dialog = await screen.findByRole("dialog", {
      name: /editar sorteo/i,
    });

    const firstPrizeInput = within(dialog).getByLabelText(/premio 1/i, {
      selector: "input",
    });
    await user.clear(firstPrizeInput);

    await user.click(
      within(dialog).getByRole("button", { name: /agregar premio/i })
    );

    await act(async () => {
      await user.click(
        within(dialog).getByRole("button", { name: /guardar cambios/i })
      );
    });

    expect(onUpdate).not.toHaveBeenCalled();
    const alert = await within(dialog).findByRole("alert");
    expect(alert).toHaveTextContent(/filas #1, #2/i);

    const prizeInputs = within(dialog).getAllByLabelText(/premio \d+/i, {
      selector: "input",
    });
    expect(prizeInputs[0]).toHaveAttribute("aria-invalid", "true");
    expect(prizeInputs[1]).toHaveAttribute("aria-invalid", "true");
  });

  test("impide guardar si queda un único participante", async () => {
    const user = createUser();
    const onUpdate = jest.fn();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={onUpdate}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));
    const dialog = await screen.findByRole("dialog", {
      name: /editar sorteo/i,
    });

    await user.click(
      within(dialog).getByRole("button", { name: /eliminar participante 2/i })
    );

    await act(async () => {
      await user.click(
        within(dialog).getByRole("button", { name: /guardar cambios/i })
      );
    });

    expect(onUpdate).not.toHaveBeenCalled();
    const alert = await within(dialog).findByRole("alert");
    expect(alert).toHaveTextContent(/al menos 2 participantes distintos/i);

    const participantInput = within(dialog).getByLabelText(/participante 1/i, {
      selector: "input",
    });
    expect(participantInput).toHaveAttribute("aria-invalid", "true");
  });

  test("permite gestionar listas con altas, bajas y duplicados", async () => {
    const user = createUser();
    const onUpdate = jest.fn().mockResolvedValue({ ok: true });

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={onUpdate}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));
    const dialog = await screen.findByRole("dialog", {
      name: /editar sorteo/i,
    });

    const firstPrizeInput = within(dialog).getByLabelText(/premio 1/i, {
      selector: "input",
    });
    await user.clear(firstPrizeInput);
    await user.type(firstPrizeInput, "Gift card VIP");
    await waitFor(() => expect(firstPrizeInput).toHaveValue("Gift card VIP"));

    await user.click(
      within(dialog).getByRole("button", { name: /agregar premio/i })
    );
    let prizeInputs = within(dialog).getAllByLabelText(/premio \d+/i, {
      selector: "input",
    });
    const newPrizeInput = prizeInputs[prizeInputs.length - 1];
    await user.type(newPrizeInput, "Taza edición especial");
    await waitFor(() =>
      expect(newPrizeInput).toHaveValue("Taza edición especial")
    );

    await user.click(
      within(dialog).getByRole("button", { name: /eliminar participante 2/i })
    );

    await user.click(
      within(dialog).getByRole("button", { name: /agregar participante/i })
    );
    let participantInputs = within(dialog).getAllByLabelText(
      /participante \d+/i,
      {
        selector: "input",
      }
    );
    let lastParticipant = participantInputs[participantInputs.length - 1];
    await user.type(lastParticipant, "Lucía");

    await user.click(
      within(dialog).getByRole("button", { name: /agregar participante/i })
    );
    participantInputs = within(dialog).getAllByLabelText(/participante \d+/i, {
      selector: "input",
    });
    lastParticipant = participantInputs[participantInputs.length - 1];
    await user.type(lastParticipant, "Ana");

    await act(async () => {
      await user.click(
        within(dialog).getByRole("button", { name: /guardar cambios/i })
      );
    });

    await waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
    const payload = onUpdate.mock.calls[0][0];

    expect(payload.id).toBe("r1");
    expect(payload.prizes).toEqual([
      { title: "Gift card VIP" },
      { title: "Taza edición especial" },
    ]);
    expect(payload.participants).toEqual(["Ana", "Lucía", "Ana"]);
    expect(payload.datetime).toBe(sampleRaffles[0].datetime);
  });

  test("pide confirmación antes de cerrar con cambios sin guardar", async () => {
    const user = createUser();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));
    const titleInput = await screen.findByLabelText(/título/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Título actualizado");

    await user.click(
      within(
        await screen.findByRole("dialog", { name: /editar sorteo/i })
      ).getByRole("button", { name: /cancelar/i })
    );

    const confirm = await screen.findByRole("dialog", {
      name: /descartar cambios/i,
    });
    expect(
      within(confirm).getByText(/cerrar la edición sin guardar los cambios/i)
    ).toBeInTheDocument();

    await user.click(
      within(confirm).getByRole("button", { name: /descartar/i })
    );

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: /editar sorteo/i })
      ).not.toBeInTheDocument()
    );
  });

  test("mantiene el foco en el campo que se está editando", async () => {
    const user = createUser();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));
    const descriptionInput = await screen.findByLabelText(/descripción/i);
    descriptionInput.focus();
    await user.type(descriptionInput, "Nueva descripción");

    await waitFor(() => {
      expect(descriptionInput).toHaveFocus();
    });

    const winnersInput = screen.getByLabelText(/ganadores/i);
    await user.click(winnersInput);
    await user.clear(winnersInput);
    await user.type(winnersInput, "3");

    await waitFor(() => {
      expect(winnersInput).toHaveFocus();
    });
  });

  test("advierte en español antes de recargar cuando hay cambios sin guardar", async () => {
    const user = createUser();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));
    const titleInput = await screen.findByLabelText(/título/i);
    await user.clear(titleInput);
    await user.type(titleInput, "Título de prueba");

    const event = new Event("beforeunload", { cancelable: true });
    Object.defineProperty(event, "returnValue", {
      writable: true,
      configurable: true,
      value: undefined,
    });

    window.dispatchEvent(event);

    expect(event.returnValue).toBe(UNSAVED_CHANGES_BEFORE_UNLOAD_MESSAGE);
  });

  test("cicla el foco dentro del drawer y bloquea el scroll del body", async () => {
    const user = createUser();
    const initialBodyStyles = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    const trigger = screen.getByRole("button", { name: /editar/i });
    await user.click(trigger);

    const dialog = await screen.findByRole("dialog", {
      name: /editar sorteo/i,
    });
    const titleInput = within(dialog).getByLabelText(/título/i);
    expect(titleInput).toHaveFocus();

    expect(document.body.style.overflow).toBe("hidden");
    expect(document.body.style.position).toBe("fixed");
    expect(document.body.style.width).toBe("100%");
    expect(document.body.style.top).toMatch(/^-\d+/);

    const saveButton = within(dialog).getByRole("button", {
      name: /guardar cambios/i,
    });
    const closeButton = within(dialog).getByRole("button", {
      name: /cerrar panel/i,
    });
    const resizeHandle = within(dialog).getByRole("separator", {
      name: /modificar ancho del panel/i,
    });

    saveButton.focus();
    await user.tab();
    expect(resizeHandle).toHaveFocus();

    await user.tab();
    expect(closeButton).toHaveFocus();

    resizeHandle.focus();
    await user.tab({ shift: true });
    expect(saveButton).toHaveFocus();

    await user.click(within(dialog).getByRole("button", { name: /cancelar/i }));

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: /editar sorteo/i })
      ).not.toBeInTheDocument()
    );

    await waitFor(() =>
      expect(document.body.style.overflow).toBe(initialBodyStyles.overflow)
    );
    expect(document.body.style.position).toBe(initialBodyStyles.position);
    expect(document.body.style.top).toBe(initialBodyStyles.top);
    expect(document.body.style.width).toBe(initialBodyStyles.width);
  });

  test("expone instrucciones accesibles para el asa de redimensionado", async () => {
    const user = createUser();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));

    const dialog = await screen.findByRole("dialog", {
      name: /editar sorteo/i,
    });
    const handle = within(dialog).getByRole("separator", {
      name: /modificar ancho del panel/i,
    });
    const description = within(dialog).getByText(/arrastrá el asa/i);
    expect(description).toHaveClass("sr-only");

    const describedBy = handle.getAttribute("aria-describedby");
    expect(describedBy).toBe(description.getAttribute("id"));
    expect(describedBy).toBeTruthy();

    expect(handle).toHaveAttribute("title");
    expect(handle.getAttribute("title") || "").toMatch(/teclado/i);
  });

  test("permite ajustar el ancho del drawer con teclado dentro de los límites", async () => {
    const user = createUser();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));

    const dialog = await screen.findByRole("dialog", {
      name: /editar sorteo/i,
    });
    const handle = within(dialog).getByRole("separator", {
      name: /modificar ancho del panel/i,
    });

    handle.focus();
    const readWidth = () =>
      Number.parseInt(handle.getAttribute("aria-valuenow") || "0", 10);
    const initialWidth = readWidth();

    fireEvent.keyDown(handle, { key: "ArrowLeft" });
    const expandedWidth = readWidth();
    expect(expandedWidth).toBeGreaterThan(initialWidth);

    fireEvent.keyDown(handle, { key: "ArrowRight" });
    const restoredWidth = readWidth();
    expect(restoredWidth).toBe(initialWidth);

    fireEvent.keyDown(handle, { key: "End" });
    const minWidth = Number.parseInt(handle.getAttribute("aria-valuemin"), 10);
    expect(readWidth()).toBe(minWidth);

    fireEvent.keyDown(handle, { key: "Home" });
    const maxWidth = Number.parseInt(handle.getAttribute("aria-valuemax"), 10);
    expect(readWidth()).toBe(maxWidth);
  });

  test("restaura y guarda el ancho personalizado del panel", async () => {
    window.localStorage.setItem(
      MANAGE_RAFFLES_DRAWER_WIDTH_STORAGE_KEY,
      "812"
    );
    const user = createUser();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));

    const dialog = await screen.findByRole("dialog", {
      name: /editar sorteo/i,
    });
    const handle = within(dialog).getByRole("separator", {
      name: /modificar ancho del panel/i,
    });

    expect(handle).toHaveAttribute("aria-valuenow", "812");

    fireEvent.keyDown(handle, { key: "ArrowLeft" });

    await waitFor(() =>
      expect(
        window.localStorage.getItem(
          MANAGE_RAFFLES_DRAWER_WIDTH_STORAGE_KEY
        )
      ).not.toBe("812")
    );

    const stored = window.localStorage.getItem(
      MANAGE_RAFFLES_DRAWER_WIDTH_STORAGE_KEY
    );
    expect(Number.parseInt(stored || "0", 10)).toBe(
      Number.parseInt(handle.getAttribute("aria-valuenow") || "0", 10)
    );
  });

  test("restaura el foco en el disparador al cerrar el panel sin cambios", async () => {
    const user = createUser();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    const trigger = screen.getByRole("button", { name: /editar/i });
    await user.click(trigger);

    const dialog = await screen.findByRole("dialog", {
      name: /editar sorteo/i,
    });
    await user.click(within(dialog).getByRole("button", { name: /cancelar/i }));

    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: /editar sorteo/i })
      ).not.toBeInTheDocument()
    );

    await waitFor(() => {
      expect(trigger).toHaveFocus();
    });
  });

  test("valida que la fecha ingresada tenga un formato correcto", async () => {
    const user = createUser();
    const onUpdate = jest.fn();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={onUpdate}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));
    const datetimeInput = await screen.findByLabelText(/fecha y hora/i);
    await user.clear(datetimeInput);
    datetimeInput.type = "text";
    fireEvent.change(datetimeInput, { target: { value: "2024-13-40T99:00" } });

    await act(async () => {
      await user.click(
        screen.getByRole("button", { name: /guardar cambios/i })
      );
    });

    expect(onUpdate).not.toHaveBeenCalled();
    const alerts = await screen.findAllByRole("alert");
    const feedback = alerts.find((node) =>
      node.textContent?.toLowerCase().includes("válida")
    );
    expect(feedback).toBeDefined();
    expect(datetimeInput).toHaveAttribute("aria-invalid", "true");
  });

  test("confirma antes de finalizar un sorteo activo", async () => {
    const user = createUser();
    const onFinish = jest.fn();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={onFinish}
      />
    );

    await user.click(screen.getByRole("button", { name: /finalizar/i }));

    const dialog = await screen.findByRole("dialog", {
      name: /finalizar sorteo/i,
    });
    await act(async () => {
      await user.click(
        within(dialog).getByRole("button", { name: /finalizar/i })
      );
    });

    await waitFor(() => expect(onFinish).toHaveBeenCalledWith("r1"));
    expect(
      await screen.findByText(
        /sorteo "sorteo aniversario" marcado como finalizado\./i
      )
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: /finalizar sorteo/i })
      ).not.toBeInTheDocument()
    );
  });

  test("expone la grilla de sorteos con roles accesibles y etiquetas dinámicas", async () => {
    const user = createUser();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    const activeList = screen.getByRole("list", {
      name: /sorteos activos/i,
    });
    expect(within(activeList).getAllByRole("listitem")).toHaveLength(1);

    await user.click(screen.getByRole("button", { name: /finalizados/i }));

    expect(activeList).toHaveAccessibleName(/sorteos finalizados/i);
    expect(within(activeList).queryAllByRole("listitem")).toHaveLength(0);
    expect(screen.getByText(/no hay sorteos finalizados/i)).toBeInTheDocument();
  });

  test("la tarjeta conserva etiquetas claras y agrupa las acciones", () => {
    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    const card = screen.getByRole("article", { name: /sorteo aniversario/i });
    expect(card).toHaveAttribute("data-state", "active");

    const actionsGroup = within(card).getByRole("group", {
      name: /acciones del sorteo activo/i,
    });
    expect(actionsGroup).toBeInTheDocument();
    const actionButtons = within(actionsGroup).getAllByRole("button");
    expect(actionButtons).toHaveLength(3);
  });

  test("muestra un toast cuando la actualización se completa con éxito", async () => {
    const user = createUser();
    const onUpdate = jest.fn(() => ({
      ok: true,
      message: "Sorteo actualizado correctamente.",
    }));

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={onUpdate}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole("button", { name: /editar/i }));
    await act(async () => {
      await user.click(
        screen.getByRole("button", { name: /guardar cambios/i })
      );
    });

    await waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByText(/sorteo actualizado correctamente/i)
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole("dialog", { name: /editar sorteo/i })
      ).not.toBeInTheDocument()
    );
  });
});
const renderWithToast = (ui) => render(<ToastProvider>{ui}</ToastProvider>);
