// src/utils/validation.js

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export const sanitizeEmail = (value) => (value || "").trim().toLowerCase();

export const isValidEmail = (value) => EMAIL_PATTERN.test(sanitizeEmail(value));

export { EMAIL_PATTERN };

export default isValidEmail;
