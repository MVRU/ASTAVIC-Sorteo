// ! DECISIÓN DE DISEÑO: Cubrimos interacciones clave del panel para asegurar que los modales funcionen según lo requerido.
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ManageRaffles from '../ManageRaffles';

const createUser = () =>
  typeof userEvent.setup === 'function'
    ? userEvent.setup()
    : {
        click: (...args) => userEvent.click(...args),
        type: (...args) => userEvent.type(...args),
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
    render(
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
  });

  test('requiere confirmación antes de eliminar un sorteo', async () => {
    const user = createUser();
    const onDelete = jest.fn();

    render(
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

    await user.click(within(dialog).getByRole('button', { name: /eliminar/i }));
    expect(onDelete).toHaveBeenCalledWith('r1');
  });

  test('confirma antes de finalizar un sorteo activo', async () => {
    const user = createUser();
    const onFinish = jest.fn();

    render(
      <ManageRaffles
        raffles={sampleRaffles}
        onUpdateRaffle={jest.fn()}
        onDeleteRaffle={jest.fn()}
        onMarkFinished={onFinish}
      />
    );

    await user.click(screen.getByRole('button', { name: /finalizar/i }));

    const dialog = await screen.findByRole('dialog', { name: /finalizar sorteo/i });
    await user.click(within(dialog).getByRole('button', { name: /finalizar/i }));

    expect(onFinish).toHaveBeenCalledWith('r1');
  });
});
