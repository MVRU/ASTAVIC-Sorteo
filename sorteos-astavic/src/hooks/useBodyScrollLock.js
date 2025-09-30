// ! DECISIÓN DE DISEÑO: Hook reutilizable para bloquear el scroll del body cuando un overlay está activo.
// * Conserva el desplazamiento previo y los estilos inline para restaurarlos al desmontar sin fugas.
// -!- Riesgo: En escenarios con múltiples locks simultáneos depende de la disciplina en el montaje/desmontaje.
import { useEffect, useRef } from "react";

const DEFAULT_STYLES = Object.freeze({
  overflow: "",
  position: "",
  top: "",
  width: "",
});

const DEFAULT_SCROLL = Object.freeze({ x: 0, y: 0 });

const useBodyScrollLock = (active) => {
  const previousStylesRef = useRef(DEFAULT_STYLES);
  const scrollPositionRef = useRef(DEFAULT_SCROLL);

  useEffect(() => {
    if (!active) return undefined;
    if (typeof document === "undefined" || typeof window === "undefined") {
      return undefined;
    }

    const { body } = document;
    if (!body) return undefined;

    previousStylesRef.current = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };

    scrollPositionRef.current = {
      x: window.scrollX || window.pageXOffset || 0,
      y: window.scrollY || window.pageYOffset || 0,
    };

    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollPositionRef.current.y}px`;
    body.style.width = "100%";

    return () => {
      body.style.overflow = previousStylesRef.current.overflow;
      body.style.position = previousStylesRef.current.position;
      body.style.top = previousStylesRef.current.top;
      body.style.width = previousStylesRef.current.width;
      window.scrollTo(scrollPositionRef.current.x, scrollPositionRef.current.y);
    };
  }, [active]);
};

export default useBodyScrollLock;
