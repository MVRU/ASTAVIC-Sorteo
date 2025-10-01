// src/components/admin/__tests__/ManageRafflesToolbar.test.js

import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ManageRafflesToolbar from "../manage/ManageRafflesToolbar";

const createUser = () =>
  typeof userEvent.setup === "function"
    ? userEvent.setup()
    : {
        click: (...args) => userEvent.click(...args),
        type: (...args) => userEvent.type(...args),
        selectOptions: (...args) => userEvent.selectOptions(...args),
      };

describe("ManageRafflesToolbar", () => {
  test("renderiza indicadores y propaga las acciones de filtrado", async () => {
    const user = createUser();
    const onTabChange = jest.fn();
    const onQueryChange = jest.fn();
    const onSortChange = jest.fn();

    const stats = { activeCount: 4, finishedCount: 2 };

    const { rerender } = render(
      <ManageRafflesToolbar
        tab="active"
        onTabChange={onTabChange}
        query=""
        onQueryChange={onQueryChange}
        sort="date_desc"
        onSortChange={onSortChange}
        stats={stats}
      />
    );

    const renderToolbar = (overrides = {}) =>
      rerender(
        <ManageRafflesToolbar
          tab="active"
          onTabChange={onTabChange}
          query={overrides.query ?? ""}
          onQueryChange={onQueryChange}
          sort={overrides.sort ?? "date_desc"}
          onSortChange={onSortChange}
          stats={stats}
        />
      );

    expect(screen.getByText(/activos: 4/i)).toBeInTheDocument();
    expect(screen.getByText(/finalizados: 2/i)).toBeInTheDocument();

    const searchInput = screen.getByLabelText(/buscar sorteos/i);
    fireEvent.change(searchInput, { target: { value: "promo" } });
    expect(onQueryChange).toHaveBeenCalledWith("promo");
    renderToolbar({ query: onQueryChange.mock.calls.at(-1)?.[0] });
    expect(screen.getByLabelText(/buscar sorteos/i)).toHaveValue("promo");

    const sortSelect = screen.getByLabelText(/ordenar resultados/i);
    await user.selectOptions(sortSelect, "title_asc");
    expect(onSortChange).toHaveBeenLastCalledWith("title_asc");

    await user.click(screen.getByRole("button", { name: /finalizados/i }));
    expect(onTabChange).toHaveBeenCalledWith("finished");
  });

  test("sincroniza el estado aria-pressed de las pestañas con la pestaña activa", () => {
    const onTabChange = jest.fn();
    const { rerender } = render(
      <ManageRafflesToolbar
        tab="active"
        onTabChange={onTabChange}
        query=""
        onQueryChange={jest.fn()}
        sort="date_desc"
        onSortChange={jest.fn()}
        stats={{ activeCount: 0, finishedCount: 0 }}
      />
    );

    expect(screen.getByRole("button", { name: /activos/i })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(
      screen.getByRole("button", { name: /finalizados/i })
    ).toHaveAttribute("aria-pressed", "false");

    rerender(
      <ManageRafflesToolbar
        tab="finished"
        onTabChange={onTabChange}
        query=""
        onQueryChange={jest.fn()}
        sort="date_desc"
        onSortChange={jest.fn()}
        stats={{ activeCount: 0, finishedCount: 3 }}
      />
    );

    expect(screen.getByRole("button", { name: /activos/i })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(
      screen.getByRole("button", { name: /finalizados/i })
    ).toHaveAttribute("aria-pressed", "true");
  });
});
