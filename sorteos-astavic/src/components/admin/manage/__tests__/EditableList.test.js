// ! DECISIÓN DE DISEÑO: Cubrimos escenarios de edición, alta y baja para garantizar listas accesibles y controladas.
import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditableList from '../EditableList';

const createUser = () =>
  typeof userEvent.setup === 'function'
    ? userEvent.setup()
    : {
        click: (...args) => userEvent.click(...args),
        type: (...args) => userEvent.type(...args),
        clear: (...args) => userEvent.clear(...args),
      };

const ControlledList = ({ initialValues, onChangeSpy, label, addButtonLabel }) => {
  const [values, setValues] = React.useState(initialValues);
  return (
    <EditableList
      label={label}
      values={values}
      onChange={(nextValues) => {
        onChangeSpy(nextValues);
        setValues(nextValues);
      }}
      addButtonLabel={addButtonLabel}
    />
  );
};

describe('EditableList', () => {
  test('normaliza entradas al editar y agrega nuevos elementos enfocados', async () => {
    const user = createUser();
    const onChange = jest.fn();

    render(
      <ControlledList
        initialValues={[' Premio inicial ']}
        onChangeSpy={onChange}
        label="Premio"
        addButtonLabel="Agregar premio"
      />
    );

    const input = screen.getByLabelText(/premio 1/i, { selector: 'input' });
    await user.clear(input);
    await user.type(input, '   Nuevo Premio   ');

    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange).toHaveBeenLastCalledWith(['   Nuevo Premio   ']);
    await waitFor(() => expect(input).toHaveValue('   Nuevo Premio   '));

    await user.click(screen.getByRole('button', { name: /agregar premio/i }));

    const items = screen.getAllByLabelText(/premio \d+/i, { selector: 'input' });
    const newInput = items[items.length - 1];
    await waitFor(() => expect(newInput).toHaveFocus());

    await user.type(newInput, 'Taza edición especial');

    expect(onChange).toHaveBeenLastCalledWith([
      '   Nuevo Premio   ',
      'Taza edición especial',
    ]);
  });

  test('elimina elementos, mantiene duplicados y restablece el foco', async () => {
    const user = createUser();
    const onChange = jest.fn();

    render(
      <ControlledList
        initialValues={['Ana', 'Ana', 'Luis']}
        onChangeSpy={onChange}
        label="Participante"
        addButtonLabel="Agregar participante"
      />
    );

    await user.click(
      screen.getByRole('button', { name: /eliminar participante 3/i })
    );

    expect(onChange).toHaveBeenLastCalledWith(['Ana', 'Ana']);

    const list = screen.getByRole('group', { name: /participante/i });
    const participantFields = within(list).getAllByLabelText(/participante \d+/i, {
      selector: 'input',
    });
    await waitFor(() => expect(participantFields[1]).toHaveFocus());

    await user.click(screen.getByRole('button', { name: /eliminar participante 2/i }));
    expect(onChange).toHaveBeenLastCalledWith(['Ana']);

    await user.click(screen.getByRole('button', { name: /eliminar participante 1/i }));
    expect(onChange).toHaveBeenLastCalledWith([]);
    expect(screen.getByText(/aún no agregaste elementos/i)).toBeInTheDocument();
  });
});
