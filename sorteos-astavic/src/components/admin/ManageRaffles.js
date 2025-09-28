// src/components/admin/ManageRaffles.js
// ! DECISIÓN DE DISEÑO: Reorganizamos la vista en piezas pequeñas para mantener SRP y facilitar futuras extensiones.
import { useCallback, useState } from "react";
import PropTypes from "prop-types";
import { validateRaffleDraft } from "../../utils/raffleValidation";
import ManageRafflesToolbar from "./manage/ManageRafflesToolbar";
import RaffleAdminCard from "./manage/RaffleAdminCard";
import RaffleEditCard from "./manage/RaffleEditCard";
import EmptyHint from "./manage/EmptyHint";
import {
  mapRaffleToForm,
  mapFormToPayload,
  mapFormToValidationDraft,
} from "./manage/manageRafflesHelpers";
import useRaffleListFilters from "./manage/useRaffleListFilters";

const ManageRaffles = ({
  raffles,
  onUpdateRaffle,
  onDeleteRaffle,
  onMarkFinished,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState(null);
  const [tab, setTab] = useState("active");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("date_desc");

  const { list, stats } = useRaffleListFilters({
    raffles,
    tab,
    query,
    sort,
  });

  const startEdit = useCallback((raffle) => {
    setFormError(null);
    setForm(mapRaffleToForm(raffle));
    setEditingId(raffle.id);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setForm(null);
    setFormError(null);
  }, []);

  const handleChange = useCallback((event) => {
    const { name, value, type, checked } = event.target;
    setFormError(null);
    setForm((prev) =>
      prev
        ? {
            ...prev,
            [name]: type === "checkbox" ? checked : value,
          }
        : prev
    );
  }, []);

  const handleSave = useCallback(
    (event) => {
      event.preventDefault();
      if (!form) return;

      const draft = mapFormToValidationDraft(form);
      const errors = validateRaffleDraft(draft);
      if (errors.length > 0) {
        setFormError(errors[0]);
        return;
      }

      try {
        const payload = mapFormToPayload(form);
        onUpdateRaffle(payload);
        cancelEdit();
      } catch (error) {
        setFormError(
          error?.message === "invalid-date"
            ? "La fecha/hora no es válida."
            : "No se pudo guardar el sorteo. Revisá los datos ingresados."
        );
      }
    },
    [cancelEdit, form, onUpdateRaffle]
  );

  const askDelete = useCallback(
    (raffle) => {
      const confirmed = window.confirm(
        `¿Eliminar definitivamente "${raffle.title}"?`
      );
      if (confirmed) onDeleteRaffle(raffle.id);
    },
    [onDeleteRaffle]
  );

  const askFinish = useCallback(
    (raffle) => {
      const confirmed = window.confirm(
        `¿Marcar como finalizado "${raffle.title}"?`
      );
      if (confirmed) onMarkFinished(raffle.id);
    },
    [onMarkFinished]
  );

  return (
    <section className="section-gap admin-manage">
      <ManageRafflesToolbar
        tab={tab}
        onTabChange={setTab}
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        stats={stats}
      />

      <div className="container">
        <div className="manage-grid">
          {list.map((raffle) =>
            editingId === raffle.id ? (
              <RaffleEditCard
                key={raffle.id}
                form={form}
                onChange={handleChange}
                onSave={handleSave}
                onCancel={cancelEdit}
                error={formError}
              />
            ) : (
              <RaffleAdminCard
                key={raffle.id}
                raffle={raffle}
                onEdit={() => startEdit(raffle)}
                onDelete={() => askDelete(raffle)}
                onFinish={
                  raffle.finished ? null : () => askFinish(raffle)
                }
              />
            )
          )}
          {list.length === 0 && (
            <EmptyHint
              text={
                query
                  ? "Sin resultados para tu búsqueda."
                  : tab === "active"
                  ? "No hay sorteos activos."
                  : "No hay sorteos finalizados."
              }
            />
          )}
        </div>
      </div>
    </section>
  );
};

ManageRaffles.propTypes = {
  raffles: PropTypes.arrayOf(PropTypes.object).isRequired,
  onUpdateRaffle: PropTypes.func.isRequired,
  onDeleteRaffle: PropTypes.func.isRequired,
  onMarkFinished: PropTypes.func.isRequired,
};

export default ManageRaffles;
