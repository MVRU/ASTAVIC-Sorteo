// ! DECISIÓN DE DISEÑO: Cubrimos interacciones clave del panel para asegurar que los modales funcionen según lo requerido.
import { render, screen, within, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManageRaffles, {
  UNSAVED_CHANGES_BEFORE_UNLOAD_MESSAGE,
} from '../ManageRaffles';
import { ToastProvider } from '../../../context/ToastContext';

const createUser = () =>
  typeof userEvent.setup === 'function'
    ? userEvent.setup()
    : {
        click: (...args) => userEvent.click(...args),
        type: (...args) => userEvent.type(...args),
        clear: (...args) => userEvent.clear(...args),
      };

const sampleRaffles = [
  {
    id: 'r1',
    title: 'Sorteo aniversario',
    description: 'Entre clientes frecuentes',
    datetime: new Date('2030-05-20T15:00:00Z').toISOString(),
    winnersCount: 2,
    finished: false,
    participants: ['Ana', 'Luis'],
    prizes: [{ title: 'Gift card' }],
  },
];

describe('ManageRaffles', () => {
  test('abre el modal de edición con los datos cargados', async () => {
    const user = createUser();
    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /editar/i }));

    const dialog = await screen.findByRole('dialog', { name: /editar sorteo/i });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByLabelText(/título/i)).toHaveValue('Sorteo aniversario');
    expect(
      within(dialog).getByRole('button', { name: /guardar cambios/i })
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole('button', { name: /cancelar/i })
    ).toBeInTheDocument();
  });

  test('requiere confirmación antes de eliminar un sorteo', async () => {
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

    await user.click(screen.getByRole('button', { name: /eliminar/i }));

    const dialog = await screen.findByRole('dialog', { name: /eliminar sorteo/i });
    expect(within(dialog).getByText(/¿seguro que querés eliminar/i)).toBeInTheDocument();

    await act(async () => {
      await user.click(within(dialog).getByRole('button', { name: /eliminar/i }));
    });
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('r1'));
    expect(
      await screen.findByText(/sorteo "sorteo aniversario" eliminado\./i)
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: /eliminar sorteo/i })
      ).not.toBeInTheDocument()
    );
  });

  test('muestra feedback si la fecha guardada del sorteo es inválida', async () => {
    const user = createUser();
    const brokenRaffle = [{ ...sampleRaffles[0], id: 'r2', datetime: 'invalid' }];

    renderWithToast(
      <ManageRaffles
        raffles={brokenRaffle}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /editar/i }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent(/fecha guardada.*inválida/i);
    expect(screen.getByLabelText(/fecha y hora/i)).toHaveValue('');
  });

  test('impide enviar cambios cuando la fecha queda vacía', async () => {
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

    await user.click(screen.getByRole('button', { name: /editar/i }));
    const datetimeInput = await screen.findByLabelText(/fecha y hora/i);
    await user.clear(datetimeInput);

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /guardar cambios/i }));
    });

    expect(onUpdate).not.toHaveBeenCalled();
    const alerts = await screen.findAllByRole('alert');
    const feedback = alerts.find((node) =>
      node.textContent?.toLowerCase().includes('ingresá una fecha válida')
    );
    expect(feedback).toBeDefined();
    expect(screen.getByRole('dialog', { name: /editar sorteo/i })).toBeInTheDocument();
  });

  test('pide confirmación antes de cerrar con cambios sin guardar', async () => {
    const user = createUser();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /editar/i }));
    const titleInput = await screen.findByLabelText(/título/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Título actualizado');

    await user.click(
      within(await screen.findByRole('dialog', { name: /editar sorteo/i }))
        .getByRole('button', { name: /cancelar/i })
    );

    const confirm = await screen.findByRole('dialog', {
      name: /descartar cambios/i,
    });
    expect(
      within(confirm).getByText(/cerrar la edición sin guardar los cambios/i)
    ).toBeInTheDocument();

    await user.click(
      within(confirm).getByRole('button', { name: /descartar/i })
    );

    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: /editar sorteo/i })
      ).not.toBeInTheDocument()
    );
  });

  test('mantiene el foco en el campo que se está editando', async () => {
    const user = createUser();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /editar/i }));
    const descriptionInput = await screen.findByLabelText(/descripción/i);
    descriptionInput.focus();
    await user.type(descriptionInput, 'Nueva descripción');

    await waitFor(() => {
      expect(descriptionInput).toHaveFocus();
    });

    const winnersInput = screen.getByLabelText(/ganadores/i);
    await user.click(winnersInput);
    await user.clear(winnersInput);
    await user.type(winnersInput, '3');

    await waitFor(() => {
      expect(winnersInput).toHaveFocus();
    });
  });

  test('advierte en español antes de recargar cuando hay cambios sin guardar', async () => {
    const user = createUser();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /editar/i }));
    const titleInput = await screen.findByLabelText(/título/i);
    await user.clear(titleInput);
    await user.type(titleInput, 'Título de prueba');

    const event = new Event('beforeunload', { cancelable: true });
    Object.defineProperty(event, 'returnValue', {
      writable: true,
      configurable: true,
      value: undefined,
    });

    window.dispatchEvent(event);

    expect(event.returnValue).toBe(UNSAVED_CHANGES_BEFORE_UNLOAD_MESSAGE);
  });

  test('valida que la fecha ingresada tenga un formato correcto', async () => {
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

    await user.click(screen.getByRole('button', { name: /editar/i }));
    const datetimeInput = await screen.findByLabelText(/fecha y hora/i);
    await user.clear(datetimeInput);
    datetimeInput.type = 'text';
    fireEvent.change(datetimeInput, { target: { value: '2024-13-40T99:00' } });

    await act(async () => {
      await user.click(screen.getByRole('button', { name: /guardar cambios/i }));
    });

    expect(onUpdate).not.toHaveBeenCalled();
    const alerts = await screen.findAllByRole('alert');
    const feedback = alerts.find((node) =>
      node.textContent?.toLowerCase().includes('válida')
    );
    expect(feedback).toBeDefined();
    expect(datetimeInput).toHaveAttribute('aria-invalid', 'true');
  });

  test('confirma antes de finalizar un sorteo activo', async () => {
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

    await user.click(screen.getByRole('button', { name: /finalizar/i }));

    const dialog = await screen.findByRole('dialog', { name: /finalizar sorteo/i });
    await act(async () => {
      await user.click(within(dialog).getByRole('button', { name: /finalizar/i }));
    });

    await waitFor(() => expect(onFinish).toHaveBeenCalledWith('r1'));
    expect(
      await screen.findByText(/sorteo "sorteo aniversario" marcado como finalizado\./i)
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: /finalizar sorteo/i })
      ).not.toBeInTheDocument()
    );
  });

  test('expone la grilla de sorteos con roles accesibles y etiquetas dinámicas', async () => {
    const user = createUser();

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    const activeList = screen.getByRole('list', {
      name: /sorteos activos/i,
    });
    expect(within(activeList).getAllByRole('listitem')).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /finalizados/i }));

    expect(activeList).toHaveAccessibleName(/sorteos finalizados/i);
    expect(within(activeList).queryAllByRole('listitem')).toHaveLength(0);
    expect(screen.getByText(/no hay sorteos finalizados/i)).toBeInTheDocument();
  });

  test('la tarjeta conserva etiquetas claras y agrupa las acciones', () => {
    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    const card = screen.getByRole('article', { name: /sorteo aniversario/i });
    expect(card).toHaveAttribute('data-state', 'active');

    const actionsGroup = within(card).getByRole('group', {
      name: /acciones del sorteo activo/i,
    });
    expect(actionsGroup).toBeInTheDocument();
    const actionButtons = within(actionsGroup).getAllByRole('button');
    expect(actionButtons).toHaveLength(3);
  });

  test('muestra un toast cuando la actualización se completa con éxito', async () => {
    const user = createUser();
    const onUpdate = jest.fn(() => ({
      ok: true,
      message: 'Sorteo actualizado correctamente.',
    }));

    renderWithToast(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={onUpdate}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={jest.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /editar/i }));
    await act(async () => {
      await user.click(screen.getByRole('button', { name: /guardar cambios/i }));
    });

    await waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(1));
    expect(
      await screen.findByText(/sorteo actualizado correctamente/i)
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: /editar sorteo/i })
      ).not.toBeInTheDocument()
    );
  });
});
const renderWithToast = (ui) => render(<ToastProvider>{ui}</ToastProvider>);

