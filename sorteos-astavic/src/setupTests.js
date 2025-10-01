// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// ! DECISIÓN DE DISEÑO: Proveemos un polyfill mínimo de matchMedia para mantener coherencia de pruebas en JSDOM.
if (typeof window !== 'undefined' && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}

// * Centralizamos el stub de scrollTo para evitar warnings de JSDOM en modales que bloquean el body.
if (typeof window !== 'undefined') {
  window.scrollTo = jest.fn();
}
