// src/utils/validation.js
// ! DECISIÓN DE DISEÑO: Centralizamos validaciones reutilizables para sostener DRY y consistencia entre vistas.

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const sanitizeEmail = (value) => (value || "").trim().toLowerCase();

export const isValidEmail = (value) => EMAIL_PATTERN.test(sanitizeEmail(value));

export { EMAIL_PATTERN };

export default isValidEmail;
