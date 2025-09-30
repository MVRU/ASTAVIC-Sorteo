import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RaffleForm from "../RaffleForm";
import { ToastProvider } from "../../../context/ToastContext";

const renderWithToast = (ui) => render(<ToastProvider>{ui}</ToastProvider>);

const setupUser = () =>
  typeof userEvent.setup === "function" ? userEvent.setup() : userEvent;

describe("RaffleForm", () => {
  test("actualiza vista previa con participantes manuales", async () => {
    const onPreviewChange = jest.fn();
    renderWithToast(
      <RaffleForm
        onCreateRaffle={() => ({ ok: true })}
        onStatusChange={() => {}}
        onPreviewChange={onPreviewChange}
      />
    );

    const manualTextarea = screen.getByLabelText(/pegalo manualmente/i);
    await userEvent.type(manualTextarea, "Ana\nBruno");

    await waitFor(() => {
      expect(onPreviewChange).toHaveBeenCalledWith(
        expect.objectContaining({
          participants: ["Ana", "Bruno"],
        })
      );
    });
  });

  test("envía sorteo válido y propaga el estado", async () => {
    const onCreateRaffle = jest.fn(() => ({ ok: true, message: "Listo" }));
    const onStatusChange = jest.fn();
    renderWithToast(
      <RaffleForm
        onCreateRaffle={onCreateRaffle}
        onStatusChange={onStatusChange}
        onPreviewChange={() => {}}
        status={null}
        isDesktop
      />
    );

    const user = setupUser();
    await userEvent.type(screen.getByLabelText(/título del sorteo/i), "Nuevo sorteo");
    fireEvent.change(screen.getByLabelText(/fecha y hora/i), {
      target: { value: "2099-05-01T12:00" },
    });
    await userEvent.type(screen.getByLabelText(/título del premio 1/i), "Primer premio");
    await userEvent.type(screen.getByLabelText(/pegalo manualmente/i), "ana@example.com");

    await user.click(screen.getByRole("button", { name: /crear sorteo/i }));

    await waitFor(() => {
      expect(onCreateRaffle).toHaveBeenCalledTimes(1);
    });

    const createdRaffle = onCreateRaffle.mock.calls[0][0];
    expect(createdRaffle).toBeTruthy();
    expect(createdRaffle.id).toEqual(expect.any(String));
    expect(createdRaffle.id.length).toBeGreaterThan(0);
    expect(createdRaffle).toMatchObject({
      title: "Nuevo sorteo",
      description: "",
      datetime: "2099-05-01T12:00",
      winnersCount: 1,
      prizes: [{ title: "Primer premio" }],
      finished: false,
    });
    expect(createdRaffle.participants).toEqual(["ana@example.com"]);

    expect(onStatusChange).toHaveBeenCalledWith({ ok: true, message: "Listo" });
  });

  test("muestra un toast informativo al limpiar manualmente el formulario", async () => {
    renderWithToast(
      <RaffleForm
        onCreateRaffle={() => ({ ok: true })}
        onStatusChange={() => {}}
        onPreviewChange={() => {}}
      />
    );

    const user = setupUser();
    await user.type(screen.getByLabelText(/título del sorteo/i), "Demo");
    await user.click(screen.getByRole("button", { name: /limpiar/i }));

    expect(
      await screen.findByText(/Formulario restablecido\. Podés empezar desde cero\./i)
    ).toBeInTheDocument();
  });
});
