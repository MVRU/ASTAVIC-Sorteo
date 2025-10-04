// src/components/admin/ManageRaffles.js
// * DECISIÓN: El panel lateral admite redimensionado horizontal con límites
//   seguros para acomodar formularios extensos sin comprometer la lectura del
//   listado principal.
// * DECISIÓN: El ancho preferido se persiste en almacenamiento seguro para
//   respetar la preferencia del usuario entre sesiones sin afectar contextos
//   móviles.
// * DECISIÓN: El asa de redimensionado provee instrucciones auditivas para
//   favorecer el descubrimiento y accesibilidad de la interacción.

import {
  useMemo,
  useState,
  useRef,
  useId,
  useCallback,
  useEffect,
} from "react";
import PropTypes from "prop-types";
import AdminModal from "./AdminModal";
import ManageRafflesToolbar from "./manage/ManageRafflesToolbar";
import EmptyHint from "./manage/EmptyHint";
import RaffleAdminCard from "./manage/RaffleAdminCard";
import RaffleEditCard from "./manage/RaffleEditCard";
import { useToast } from "../../context/ToastContext";
import { createPortal } from "react-dom";
import useFocusTrap from "../../hooks/useFocusTrap";
import useBodyScrollLock from "../../hooks/useBodyScrollLock";

const DRAWER_MIN_WIDTH = 360;
const DRAWER_MAX_WIDTH = 920;
const DRAWER_DEFAULT_WIDTH = 680;
const DRAWER_VIEWPORT_PADDING = 120;
const RESIZE_KEYBOARD_STEP = 24;
const RESIZE_KEYBOARD_LARGE_STEP = 72;
export const MANAGE_RAFFLES_DRAWER_WIDTH_STORAGE_KEY =
  "admin.manageRaffles.drawerWidth";

const clampWidthToBounds = (value, maxCandidate) => {
  const safeMax = Math.max(
    DRAWER_MIN_WIDTH,
    Math.min(DRAWER_MAX_WIDTH, maxCandidate)
  );
  return Math.min(Math.max(value, DRAWER_MIN_WIDTH), safeMax);
};

const readStoredDrawerWidth = (maxCandidate) => {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const storage = window.localStorage;
    if (!storage) return null;
    const rawValue = storage.getItem(MANAGE_RAFFLES_DRAWER_WIDTH_STORAGE_KEY);
    if (!rawValue) return null;
    const parsed = Number.parseInt(rawValue, 10);
    if (!Number.isFinite(parsed)) return null;
    return clampWidthToBounds(parsed, maxCandidate);
  } catch {
    return null;
  }
};

const computeViewportMaxWidth = () => {
  if (typeof window === "undefined" || typeof window.innerWidth !== "number") {
    return DRAWER_MAX_WIDTH;
  }
  const available = window.innerWidth - DRAWER_VIEWPORT_PADDING;
  const safeAvailable = Math.max(DRAWER_MIN_WIDTH, available);
  return Math.min(DRAWER_MAX_WIDTH, safeAvailable);
};

export const UNSAVED_CHANGES_BEFORE_UNLOAD_MESSAGE =
  "Hay cambios sin guardar en este sorteo. ¿Seguro que querés salir?";

const compactWhitespace = (value) =>
  String(value ?? "")
    .replace(/\r?\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const normalizeListForForm = (entries) => {
  if (!Array.isArray(entries)) return [];
  return entries
    .map((entry) => {
      if (typeof entry === "string") return compactWhitespace(entry);
      if (entry && typeof entry.title === "string")
        return compactWhitespace(entry.title);
      return "";
    })
    .filter((entry) => entry !== "");
};

const composeFormState = (raffle) => {
  const datetimeResult = toLocalInputValue(raffle.datetime);
  return {
    form: {
      id: raffle.id,
      title: raffle.title || "",
      description: raffle.description || "",
      datetime: datetimeResult.value,
      winnersCount:
        raffle.winnersCount === undefined || raffle.winnersCount === null
          ? "1"
          : String(raffle.winnersCount),
      finished: !!raffle.finished,
      prizes: normalizeListForForm(raffle.prizes),
      participants: normalizeListForForm(raffle.participants),
    },
    alert: datetimeResult.error
      ? { message: datetimeResult.error, field: "datetime" }
      : null,
  };
};

const normalizeList = (values) => {
  if (!Array.isArray(values)) return [];
  return values.map((value) => compactWhitespace(value));
};

const snapshotForm = (form) => ({
  title: form.title || "",
  description: form.description || "",
  datetime: form.datetime || "",
  winnersCount:
    form.winnersCount === undefined || form.winnersCount === null
      ? ""
      : String(form.winnersCount),
  finished: Boolean(form.finished),
  prizes: normalizeList(form.prizes || []),
  participants: normalizeList(form.participants || []),
});

const serializeForm = (form) => JSON.stringify(snapshotForm(form));

function toLocalInputValue(isoLike) {
  if (!isoLike) {
    return { value: "", error: null };
  }
  const d = new Date(isoLike);
  if (Number.isNaN(d.getTime())) {
    return {
      value: "",
      error:
        "La fecha guardada del sorteo es inválida. Ingresá una nueva fecha antes de guardar.",
    };
  }
  const pad = (n) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return {
    value: `${yyyy}-${MM}-${dd}T${hh}:${mm}`,
    error: null,
  };
}

function fromLocalInputValue(local) {
  if (!local) {
    return {
      ok: false,
      error: "Ingresá una fecha válida antes de guardar.",
    };
  }
  const parsed = new Date(local);
  if (Number.isNaN(parsed.getTime())) {
    return {
      ok: false,
      error: "La fecha ingresada no es válida. Revisala antes de guardar.",
    };
  }
  return { ok: true, value: parsed.toISOString() };
}

const formatIndexes = (indexes) =>
  indexes.map((index) => `#${index + 1}`).join(", ");

function buildPayloadFromForm(form) {
  const title = form.title.trim();
  if (!title) {
    return {
      ok: false,
      error: "El título no puede quedar vacío.",
      field: "title",
    };
  }
  const datetimeResult = fromLocalInputValue(form.datetime);
  if (!datetimeResult.ok) {
    return {
      ok: false,
      error: datetimeResult.error,
      field: "datetime",
    };
  }
  const parsedWinners = Number.parseInt(form.winnersCount, 10);
  const winnersCount =
    Number.isFinite(parsedWinners) && parsedWinners > 0 ? parsedWinners : 1;

  const normalizedPrizes = normalizeList(form.prizes || []);
  const normalizedParticipants = normalizeList(form.participants || []);

  const emptyPrizeIndexes = normalizedPrizes
    .map((value, index) => (!value ? index : null))
    .filter((value) => value !== null);
  if (emptyPrizeIndexes.length > 0) {
    return {
      ok: false,
      error: `Revisá los premios en las filas ${formatIndexes(
        emptyPrizeIndexes
      )}: no pueden quedar vacíos.`,
      field: "prizes",
      indexes: emptyPrizeIndexes,
    };
  }

  const emptyParticipantIndexes = normalizedParticipants
    .map((value, index) => (!value ? index : null))
    .filter((value) => value !== null);
  if (emptyParticipantIndexes.length > 0) {
    return {
      ok: false,
      error: `Completá los participantes en las filas ${formatIndexes(
        emptyParticipantIndexes
      )}: no pueden quedar vacíos.`,
      field: "participants",
      indexes: emptyParticipantIndexes,
    };
  }

  return {
    ok: true,
    payload: {
      id: form.id,
      title,
      description: form.description.trim(),
      datetime: datetimeResult.value,
      winnersCount,
      finished: Boolean(form.finished),
      prizes: normalizedPrizes
        .filter((value) => value)
        .map((prizeTitle) => ({ title: prizeTitle })),
      participants: normalizedParticipants.filter((value) => value),
    },
  };
}

const ManageRaffles = ({
  raffles,
  onUpdateRaffle,
  onDeleteRaffle,
  onMarkFinished,
}) => {
  const { showToast } = useToast();
  const [tab, setTab] = useState("active");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("date_desc");
  const [editingRaffle, setEditingRaffle] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const [formAlert, setFormAlert] = useState(null);
  const titleInputRef = useRef(null);
  const drawerRef = useRef(null);
  const previousFocusRef = useRef(null);
  const historySentinelRef = useRef(false);
  const skipPopStateRef = useRef(false);
  const previousHistoryStateRef = useRef(null);
  const editBaselineRef = useRef("");
  const editFormId = useId();
  const resizeHandleDescriptionId = useId();
  const alertId = `${editFormId}-alert`;
  const drawerElementId = `${editFormId}-drawer`;
  const resizeHandleTitle =
    "Arrastrá o usá el teclado para ajustar el ancho del panel";
  const resizeHandleInstructions =
    "Arrastrá el asa para modificar el ancho del panel. " +
    "También podés usar las flechas izquierda o derecha para ajustes cortos, " +
    "Page Up o Page Down para saltos amplios e Inicio o Fin para ir al máximo o mínimo permitidos.";
  const portalTarget = typeof document !== "undefined" ? document.body : null;
  const emitOutcomeToast = useCallback(
    (result, { successMessage, errorMessage }) => {
      if (result?.ok === false) {
        showToast({
          status: "error",
          message: result.message || errorMessage,
        });
        return false;
      }
      showToast({
        status: "success",
        message: (result && result.message) || successMessage,
      });
      return true;
    },
    [showToast]
  );

  const activeAll = useMemo(
    () => raffles.filter((r) => !r.finished),
    [raffles]
  );
  const finishedAll = useMemo(
    () => raffles.filter((r) => r.finished),
    [raffles]
  );

  const toolbarStats = useMemo(
    () => ({
      activeCount: activeAll.length,
      finishedCount: finishedAll.length,
    }),
    [activeAll, finishedAll]
  );

  const handleTabChange = useCallback((nextTab) => setTab(nextTab), [setTab]);
  const handleQueryChange = useCallback((value) => setQ(value), [setQ]);
  const handleSortChange = useCallback((value) => setSort(value), [setSort]);
  const isEditing = Boolean(editingRaffle);
  const [maxDrawerWidth, setMaxDrawerWidth] = useState(() =>
    computeViewportMaxWidth()
  );
  const [drawerWidth, setDrawerWidth] = useState(() => {
    const initialMax = Math.max(
      DRAWER_MIN_WIDTH,
      Math.min(DRAWER_MAX_WIDTH, computeViewportMaxWidth())
    );
    const stored = readStoredDrawerWidth(initialMax);
    if (stored !== null) {
      return stored;
    }
    return clampWidthToBounds(
      Math.max(DRAWER_DEFAULT_WIDTH, DRAWER_MIN_WIDTH),
      initialMax
    );
  });
  const [isResizing, setIsResizing] = useState(false);
  const resizingStateRef = useRef(null);

  const clampDrawerWidth = useCallback(
    (value) => clampWidthToBounds(value, maxDrawerWidth),
    [maxDrawerWidth]
  );

  const handlePointerMove = useCallback(
    (event) => {
      const state = resizingStateRef.current;
      if (!state) return;
      if (typeof event?.clientX !== "number") return;
      const delta = state.startX - event.clientX;
      const nextWidth = clampDrawerWidth(state.startWidth + delta);
      setDrawerWidth(nextWidth);
    },
    [clampDrawerWidth]
  );

  const handlePointerUp = useCallback(
    () => {
      const state = resizingStateRef.current;
      if (state && drawerRef.current && state.pointerId !== undefined) {
        drawerRef.current.releasePointerCapture?.(state.pointerId);
      }
      resizingStateRef.current = null;
      setIsResizing(false);
      if (typeof window !== "undefined") {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
      }
    },
    [handlePointerMove]
  );

  const handleResizePointerDown = useCallback(
    (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      if (!drawerRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      const rect = drawerRef.current.getBoundingClientRect();
      const startWidth = clampDrawerWidth(
        rect?.width ? rect.width : drawerWidth
      );
      const startX = typeof event.clientX === "number" ? event.clientX : 0;
      const pointerId = event.pointerId;
      resizingStateRef.current = { startX, startWidth, pointerId };
      setIsResizing(true);
      drawerRef.current.setPointerCapture?.(pointerId);
      if (typeof window !== "undefined") {
        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);
        window.addEventListener("pointercancel", handlePointerUp);
      }
    },
    [clampDrawerWidth, drawerWidth, handlePointerMove, handlePointerUp]
  );

  const handleResizeKeyDown = useCallback(
    (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        setDrawerWidth((prev) => clampDrawerWidth(prev + RESIZE_KEYBOARD_STEP));
        return;
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        setDrawerWidth((prev) => clampDrawerWidth(prev - RESIZE_KEYBOARD_STEP));
        return;
      }
      if (event.key === "PageUp") {
        event.preventDefault();
        setDrawerWidth((prev) =>
          clampDrawerWidth(prev + RESIZE_KEYBOARD_LARGE_STEP)
        );
        return;
      }
      if (event.key === "PageDown") {
        event.preventDefault();
        setDrawerWidth((prev) =>
          clampDrawerWidth(prev - RESIZE_KEYBOARD_LARGE_STEP)
        );
        return;
      }
      if (event.key === "Home") {
        event.preventDefault();
        setDrawerWidth(() => clampDrawerWidth(maxDrawerWidth));
        return;
      }
      if (event.key === "End") {
        event.preventDefault();
        setDrawerWidth(() => DRAWER_MIN_WIDTH);
      }
    },
    [clampDrawerWidth, maxDrawerWidth]
  );

  useEffect(() => {
    setDrawerWidth((prev) => clampDrawerWidth(prev));
  }, [clampDrawerWidth]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    const handleResize = () => {
      const nextMax = computeViewportMaxWidth();
      setMaxDrawerWidth(nextMax);
      setDrawerWidth((prev) => Math.min(Math.max(prev, DRAWER_MIN_WIDTH), nextMax));
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    try {
      const storage = window.localStorage;
      if (!storage) {
        return undefined;
      }
      const effectiveMax = Math.max(
        DRAWER_MIN_WIDTH,
        Math.min(DRAWER_MAX_WIDTH, maxDrawerWidth)
      );
      if (effectiveMax <= DRAWER_MIN_WIDTH) {
        storage.removeItem(MANAGE_RAFFLES_DRAWER_WIDTH_STORAGE_KEY);
        return undefined;
      }
      storage.setItem(
        MANAGE_RAFFLES_DRAWER_WIDTH_STORAGE_KEY,
        String(Math.round(clampDrawerWidth(drawerWidth)))
      );
    } catch {
      // -*- Se ignoran errores de almacenamiento para no bloquear la edición.
    }
    return undefined;
  }, [drawerWidth, clampDrawerWidth, maxDrawerWidth]);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  useEffect(() => {
    if (isEditing) return undefined;
    if (typeof window !== "undefined") {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    }
    resizingStateRef.current = null;
    setIsResizing(false);
    return undefined;
  }, [isEditing, handlePointerMove, handlePointerUp]);

  const list = useMemo(() => {
    const src = tab === "active" ? activeAll : finishedAll;
    const query = q.trim().toLowerCase();
    const filtered = !query
      ? src
      : src.filter((r) => {
          const bag = `${r.title || ""} ${r.description || ""}`.toLowerCase();
          return bag.includes(query);
        });

    if (sort === "date_asc") {
      return [...filtered].sort(
        (a, b) => new Date(a.datetime) - new Date(b.datetime)
      );
    }
    if (sort === "date_desc") {
      return [...filtered].sort(
        (a, b) => new Date(b.datetime) - new Date(a.datetime)
      );
    }
    if (sort === "title_asc") {
      return [...filtered].sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    }
    return filtered;
  }, [tab, activeAll, finishedAll, q, sort]);

  const startEdit = useCallback((raffle) => {
    const mapped = composeFormState(raffle);
    if (typeof document !== "undefined") {
      const activeElement = document.activeElement;
      previousFocusRef.current =
        activeElement && typeof activeElement.focus === "function"
          ? activeElement
          : null;
    }
    setEditingRaffle(raffle);
    setEditForm(mapped.form);
    setFormAlert(mapped.alert);
    editBaselineRef.current = serializeForm(mapped.form);
  }, []);

  const restorePreviousFocus = useCallback(() => {
    const node = previousFocusRef.current;
    previousFocusRef.current = null;
    if (!node || typeof node.focus !== "function") return;
    if (typeof document === "undefined") return;
    const ownerDocument = node.ownerDocument || document;
    if (
      typeof ownerDocument.contains === "function" &&
      !ownerDocument.contains(node)
    ) {
      return;
    }
    const scheduleFocus = () => node.focus();
    if (
      typeof window !== "undefined" &&
      typeof window.requestAnimationFrame === "function"
    ) {
      window.requestAnimationFrame(scheduleFocus);
    } else {
      scheduleFocus();
    }
  }, []);

  const closeEdit = useCallback(() => {
    setEditingRaffle(null);
    setEditForm(null);
    setFormAlert(null);
    editBaselineRef.current = "";
    restorePreviousFocus();
  }, [restorePreviousFocus]);

  const hasUnsavedChanges = useCallback(() => {
    if (!isEditing || !editForm) return false;
    return editBaselineRef.current !== serializeForm(editForm);
  }, [editForm, isEditing]);

  const openConfirm = useCallback((type, raffle, meta = null) => {
    setConfirmState({ type, raffle, meta });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmState(null);
  }, []);

  const requestCloseEdit = useCallback(
    (meta = {}) => {
      if (hasUnsavedChanges()) {
        openConfirm("discardEdit", editingRaffle || null, meta);
        return;
      }
      closeEdit();
      if (meta?.onDiscard) {
        meta.onDiscard();
      }
    },
    [hasUnsavedChanges, editingRaffle, closeEdit, openConfirm]
  );

  const requestCloseEditRef = useRef(requestCloseEdit);
  useEffect(() => {
    requestCloseEditRef.current = requestCloseEdit;
  }, [requestCloseEdit]);

  const hasUnsavedChangesRef = useRef(hasUnsavedChanges);
  useEffect(() => {
    hasUnsavedChangesRef.current = hasUnsavedChanges;
  }, [hasUnsavedChanges]);

  useBodyScrollLock(isEditing);
  useFocusTrap(drawerRef, isEditing);

  const effectiveMaxDrawerWidth = Math.max(
    DRAWER_MIN_WIDTH,
    Math.min(DRAWER_MAX_WIDTH, maxDrawerWidth)
  );
  const drawerClassName = isResizing
    ? "drawer anim-scale-in drawer--resizing"
    : "drawer anim-scale-in";
  const drawerInlineStyle = { width: `${drawerWidth}px` };
  const resizeValueText = `${Math.round(drawerWidth)} píxeles de ancho`;

  // Drawer UX: focus management, Esc to close, body scroll lock
  useEffect(() => {
    if (!isEditing) return undefined;
    const input = titleInputRef.current;
    if (input && typeof input.focus === "function") {
      input.focus();
    }
    return undefined;
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return undefined;
    if (typeof window === "undefined") return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        requestCloseEditRef.current?.();
      }
    };
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChangesRef.current?.()) {
        event.preventDefault();
        event.returnValue = UNSAVED_CHANGES_BEFORE_UNLOAD_MESSAGE;
        return UNSAVED_CHANGES_BEFORE_UNLOAD_MESSAGE;
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isEditing]);

  useEffect(() => {
    if (!isEditing) return undefined;
    if (!historySentinelRef.current) {
      previousHistoryStateRef.current = window.history.state ?? null;
      const baseState = window.history.state ?? {};
      window.history.pushState(
        { ...baseState, raffleEditModal: true },
        document.title,
        window.location.href
      );
      historySentinelRef.current = true;
    }
    const handlePopState = (event) => {
      if (skipPopStateRef.current) {
        skipPopStateRef.current = false;
        return;
      }
      if (!historySentinelRef.current) {
        return;
      }
      if (!hasUnsavedChangesRef.current?.()) {
        historySentinelRef.current = false;
        closeEdit();
        return;
      }
      skipPopStateRef.current = true;
      const baseState = event?.state ?? {};
      window.history.pushState(
        { ...baseState, raffleEditModal: true },
        document.title,
        window.location.href
      );
      requestCloseEditRef.current?.({
        origin: "browser-back",
        onDiscard: () => {
          const { history } = window;
          if (!history) return;
          if (typeof history.back === "function") {
            history.back();
          } else if (typeof history.go === "function") {
            history.go(-1);
          }
        },
      });
    };
    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
      if (historySentinelRef.current) {
        historySentinelRef.current = false;
        skipPopStateRef.current = false;
        if (typeof window.history.replaceState === "function") {
          window.history.replaceState(
            previousHistoryStateRef.current,
            document.title,
            window.location.href
          );
        }
      }
    };
  }, [isEditing, closeEdit]);

  const handleEditField = (event) => {
    const { name, value, type, checked } = event.target;
    setEditForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      };
    });
    if (formAlert && (!formAlert.field || formAlert.field === name)) {
      setFormAlert(null);
    }
  };

  const handleListFieldChange = useCallback(
    (field, values) => {
      setEditForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [field]: values,
        };
      });
      if (formAlert && (!formAlert.field || formAlert.field === field)) {
        setFormAlert(null);
      }
    },
    [formAlert]
  );

  const handlePrizesChange = useCallback(
    (values) => handleListFieldChange("prizes", values),
    [handleListFieldChange]
  );

  const handleParticipantsChange = useCallback(
    (values) => handleListFieldChange("participants", values),
    [handleListFieldChange]
  );

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editForm) return;
    const result = buildPayloadFromForm(editForm);
    if (!result.ok) {
      setFormAlert({
        message: result.error,
        field: result.field,
        indexes: result.indexes || [],
      });
      showToast({
        status: "error",
        message: result.error || "Revisá los datos antes de guardar.",
      });
      return;
    }
    try {
      const response = await Promise.resolve(onUpdateRaffle(result.payload));
      const success = emitOutcomeToast(response, {
        successMessage: "Sorteo actualizado correctamente.",
        errorMessage: "No se pudo actualizar el sorteo. Intentá nuevamente.",
      });
      if (success) {
        closeEdit();
      }
    } catch (error) {
      showToast({
        status: "error",
        message:
          error?.message ||
          "Ocurrió un error inesperado al actualizar. Intentá nuevamente.",
      });
    }
  };

  const confirmAction = async () => {
    if (!confirmState) return;
    const { type, raffle, meta } = confirmState;
    const label = raffle?.title || "el sorteo";
    try {
      switch (type) {
        case "delete": {
          const response = await Promise.resolve(onDeleteRaffle(raffle.id));
          const success = emitOutcomeToast(response, {
            successMessage: `Sorteo "${label}" eliminado.`,
            errorMessage: "No se pudo eliminar el sorteo. Intentá nuevamente.",
          });
          if (success) closeConfirm();
          break;
        }
        case "finish": {
          const response = await Promise.resolve(onMarkFinished(raffle.id));
          const success = emitOutcomeToast(response, {
            successMessage: `Sorteo "${label}" marcado como finalizado.`,
            errorMessage:
              "No se pudo marcar como finalizado. Intentá nuevamente.",
          });
          if (success) closeConfirm();
          break;
        }
        case "discardEdit": {
          closeConfirm();
          closeEdit();
          if (meta?.onDiscard) {
            meta.onDiscard();
          }
          break;
        }
        default: {
          closeConfirm();
        }
      }
    } catch (error) {
      showToast({
        status: "error",
        message:
          error?.message ||
          "Ocurrió un error inesperado al ejecutar la acción. Intentá nuevamente.",
      });
    }
  };

  const confirmCopy = buildConfirmCopy(confirmState);
  const listAriaLabel =
    tab === "active"
      ? "Listado de sorteos activos"
      : "Listado de sorteos finalizados";

  return (
    <section className="section-gap admin-manage">
      <div className="container">
        <ManageRafflesToolbar
          tab={tab}
          onTabChange={handleTabChange}
          query={q}
          onQueryChange={handleQueryChange}
          sort={sort}
          onSortChange={handleSortChange}
          stats={toolbarStats}
        />
      </div>

      <div className="container">
        <div
          className="manage-grid stagger is-on"
          role="list"
          aria-label={listAriaLabel}
        >
          {list.map((r) => (
            <div className="anim-up" key={r.id} role="listitem">
              <RaffleAdminCard
                raffle={r}
                onEdit={() => startEdit(r)}
                onDelete={() => openConfirm("delete", r)}
                onFinish={r.finished ? null : () => openConfirm("finish", r)}
              />
            </div>
          ))}
          {list.length === 0 && (
            <EmptyHint
              text={
                q
                  ? "Sin resultados para tu búsqueda."
                  : tab === "active"
                  ? "No hay sorteos activos."
                  : "No hay sorteos finalizados."
              }
            />
          )}
        </div>
      </div>

      {isEditing && portalTarget
        ? createPortal(
            <div
              className="drawer-layer"
              role="dialog"
              aria-modal="true"
              aria-labelledby="edit-drawer-title"
            >
              <div
                className="drawer-overlay"
                onClick={() => requestCloseEdit({ origin: "overlay" })}
              />
              <aside
                ref={drawerRef}
                id={drawerElementId}
                className={drawerClassName}
                style={drawerInlineStyle}
              >
                <p
                  id={resizeHandleDescriptionId}
                  className="sr-only"
                >
                  {resizeHandleInstructions}
                </p>
                <div
                  role="separator"
                  tabIndex={0}
                  aria-label="Modificar ancho del panel"
                  aria-describedby={resizeHandleDescriptionId}
                  aria-orientation="vertical"
                  aria-controls={drawerElementId}
                  aria-valuemin={DRAWER_MIN_WIDTH}
                  aria-valuemax={effectiveMaxDrawerWidth}
                  aria-valuenow={Math.round(drawerWidth)}
                  aria-valuetext={resizeValueText}
                  className="drawer__resize-handle"
                  title={resizeHandleTitle}
                  onPointerDown={handleResizePointerDown}
                  onKeyDown={handleResizeKeyDown}
                />
                <header className="drawer__header">
                  <div>
                    <h2 id="edit-drawer-title" className="drawer__title">
                      Editar sorteo
                    </h2>
                    <p className="drawer__desc">
                      Actualizá los datos y guardá los cambios cuando estés
                      listo.
                    </p>
                  </div>
                  <button
                    type="button"
                    className="button button--ghost"
                    aria-label="Cerrar panel"
                    onClick={() => requestCloseEdit({ origin: "header" })}
                  >
                    <span aria-hidden="true">&times;</span>
                  </button>
                </header>

                <div
                  className="drawer__content"
                  role="region"
                  aria-label="Formulario de edición"
                >
                  {editForm ? (
                    <RaffleEditCard
                      form={editForm}
                      onChange={handleEditField}
                      onSubmit={handleEditSubmit}
                      onPrizesChange={handlePrizesChange}
                      onParticipantsChange={handleParticipantsChange}
                      formId={editFormId}
                      titleRef={titleInputRef}
                      alert={formAlert}
                      alertId={alertId}
                    />
                  ) : null}
                </div>

                <footer className="drawer__footer">
                  <button
                    type="button"
                    className="button button--ghost"
                    onClick={() => requestCloseEdit({ origin: "footer" })}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="button button--primary"
                    form={editFormId}
                  >
                    Guardar cambios
                  </button>
                </footer>
              </aside>
            </div>,
            portalTarget
          )
        : null}

      <AdminModal
        open={Boolean(confirmState)}
        title={confirmCopy.title}
        description={confirmCopy.description}
        onClose={closeConfirm}
        footer={
          <>
            <button
              type="button"
              className="button button--ghost"
              onClick={closeConfirm}
            >
              Cancelar
            </button>
            <button
              type="button"
              className={
                confirmState?.type === "delete"
                  ? "button button--danger"
                  : "button button--primary"
              }
              onClick={confirmAction}
            >
              {confirmCopy.cta}
            </button>
          </>
        }
      >
        <p className="modal__text">{confirmCopy.body}</p>
      </AdminModal>
    </section>
  );
};

const buildConfirmCopy = (state) => {
  if (state?.type === "discardEdit") {
    return {
      title: "Descartar cambios",
      description: "Perderás los cambios no guardados en este sorteo.",
      body: "¿Querés cerrar la edición sin guardar los cambios?",
      cta: "Descartar",
    };
  }
  if (!state?.raffle) {
    return {
      title: "Confirmar acción",
      description: undefined,
      body: "Confirmá para continuar.",
      cta: "Confirmar",
    };
  }
  const title = state.raffle.title || "este sorteo";
  if (state.type === "delete") {
    return {
      title: "Eliminar sorteo",
      description: "Esta acción no se puede deshacer.",
      body: `¿Seguro que querés eliminar "${title}"?`,
      cta: "Eliminar",
    };
  }
  if (state.type === "finish") {
    return {
      title: "Finalizar sorteo",
      description: "El sorteo dejará de mostrarse como activo.",
      body: `¿Confirmás marcar como finalizado "${title}"?`,
      cta: "Finalizar",
    };
  }
  return {
    title: "Confirmar acción",
    description: "Revisá la información antes de continuar.",
    body: `¿Confirmás la acción sobre "${title}"?`,
    cta: "Confirmar",
  };
};

const raffleShape = PropTypes.shape({
  id: PropTypes.string.isRequired,
  title: PropTypes.string,
  description: PropTypes.string,
  datetime: PropTypes.string.isRequired,
  winnersCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  finished: PropTypes.bool,
  participants: PropTypes.arrayOf(PropTypes.string),
  prizes: PropTypes.arrayOf(PropTypes.shape({ title: PropTypes.string })),
});

ManageRaffles.propTypes = {
  raffles: PropTypes.arrayOf(raffleShape).isRequired,
  onUpdateRaffle: PropTypes.func.isRequired,
  onDeleteRaffle: PropTypes.func.isRequired,
  onMarkFinished: PropTypes.func.isRequired,
};

export default ManageRaffles;
