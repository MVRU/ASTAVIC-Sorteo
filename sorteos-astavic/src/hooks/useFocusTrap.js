// src/hooks/useFocusTrap.js

import { useEffect } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
  "[contenteditable='true']",
].join(",");

const getFocusableElements = (container) => {
  if (!container) return [];
  const nodeList = container.querySelectorAll(FOCUSABLE_SELECTOR);
  return Array.from(nodeList).filter((element) => {
    const isDisabled =
      element.hasAttribute("disabled") ||
      element.getAttribute("aria-disabled") === "true";
    const tabIndex = element.getAttribute("tabindex");
    return !isDisabled && tabIndex !== "-1";
  });
};

const useFocusTrap = (containerRef, active) => {
  useEffect(() => {
    if (!active) return undefined;
    if (typeof document === "undefined") return undefined;

    const container = containerRef?.current;
    if (!container) return undefined;

    const handleKeyDown = (event) => {
      if (event.key !== "Tab") return;

      const focusable = getFocusableElements(container);
      if (focusable.length === 0) return;

      const firstElement = focusable[0];
      const lastElement = focusable[focusable.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey) {
        if (
          !container.contains(activeElement) ||
          activeElement === firstElement
        ) {
          event.preventDefault();
          lastElement.focus();
        }
        return;
      }

      if (!container.contains(activeElement)) {
        event.preventDefault();
        firstElement.focus();
        return;
      }

      if (activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => {
      container.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, active]);
};

export default useFocusTrap;
