/**
 * =====================================================
 * UTILIDADES DE VALIDACIÓN
 * =====================================================
 * Sistema de Gestión de Inventario - Librería
 * Proyecto SENA - Tecnólogo en ADSO
 *
 * @description Validaciones de formato reutilizables por los
 * controladores del sistema.
 *
 * ¿Por qué un archivo aparte?
 * La misma expresión regular de correo estaba repetida en cuatro
 * controladores (auth, usuarios, clientes y proveedores). Centralizarla
 * aplica el principio DRY (Don't Repeat Yourself): si algún día hay que
 * ajustar la regla de validación, se modifica en UN solo lugar y el
 * cambio aplica en todo el sistema, sin riesgo de que una copia quede
 * con la regla antigua.
 *
 * @version 1.0.0
 */

// ─────────────────────────────────────────────────────────
// EXPRESIÓN REGULAR DE CORREO ELECTRÓNICO
// ─────────────────────────────────────────────────────────
// Verifica el formato básico "algo@algo.algo":
//   [^\s@]+   → uno o más caracteres que no sean espacio ni @
//   @         → el símbolo arroba, obligatorio
//   [^\s@]+   → el dominio, sin espacios ni @
//   \.        → un punto literal
//   [^\s@]+   → la extensión (com, co, edu.co…)
// Los delimitadores ^ y $ obligan a que TODA la cadena cumpla el patrón,
// no solo una parte de ella.
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Indica si una cadena tiene formato de correo electrónico válido.
 *
 * @param {string} email - Correo a validar (idealmente ya normalizado
 *   con trim() y toLowerCase() por el controlador que lo recibe).
 * @returns {boolean} true si el formato es válido, false en caso contrario.
 *
 * @example
 * esEmailValido('ldarlys@sena.edu.co');  // true
 * esEmailValido('correo-sin-arroba');    // false
 */
const esEmailValido = (email) => REGEX_EMAIL.test(email);

module.exports = {
  REGEX_EMAIL,
  esEmailValido
};
