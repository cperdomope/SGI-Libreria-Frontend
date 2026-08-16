// =====================================================
// AYUDANTE DE SESIÓN PARA LAS PRUEBAS
// =====================================================
// Este módulo centraliza el inicio de sesión que necesitan
// casi todas las suites de prueba.
//
// ¿Por que existe?
// Antes, cada archivo de prueba repetia este bloque:
//
//   beforeAll(async () => {
//     try {
//       const res = await request(app).post('/api/auth/login')...
//       tokenAdmin = res.body.token || null;
//     } catch {
//       // BD no disponible — tests con token se saltan
//     }
//   });
//
//   it('...', async () => {
//     if (!tokenAdmin) return;   // ← el problema
//     ...
//   });
//
// Ese patron tiene un defecto grave: si el login falla, tokenAdmin
// queda en null, cada prueba sale por el return y Jest las reporta
// como APROBADAS sin haber ejecutado una sola comprobacion. La suite
// muestra "47 passed" mientras en realidad no está probando nada.
//
// Una suite que no puede autenticarse no está verificando el sistema,
// y decir lo contrario es peor que no tener pruebas: da una confianza
// que no existe. Por eso aquí fallamos de forma ruidosa y explicita.
// =====================================================

const path    = require('path');
const request = require('supertest');

// Cargamos las credenciales de prueba desde servidor/.env.test
// (archivo ignorado por git; la plantilla versionada es .env.test.example).
// Se mantienen fuera del código para que nadie las suba al repositorio
// por descuido y para poder apuntar las pruebas a otra base de datos
// sin tocar ningun archivo .test.js.
require('dotenv').config({
  path: path.join(__dirname, '..', '..', '.env.test')
});

/**
 * Lee una variable de entorno obligatoria para las pruebas.
 *
 * No usamos valores por defecto a proposito: un valor por defecto
 * equivocado es justamente lo que mantuvo la suite en verde falso.
 * Si la variable falta, queremos enterarnos ahora.
 *
 * @param   {string} nombre  Nombre de la variable de entorno.
 * @returns {string}         Valor de la variable.
 * @throws  {Error}          Si la variable no está definida.
 */
const leerCredencial = (nombre) => {
  const valor = process.env[nombre];

  if (!valor) {
    throw new Error(
      `[pruebas] Falta la variable de entorno ${nombre}.\n` +
      '  Solucion: copia servidor/.env.test.example a servidor/.env.test\n' +
      '  y completa las credenciales de los usuarios de prueba.'
    );
  }

  return valor;
};

/**
 * Inicia sesión contra la API y devuelve el token JWT.
 *
 * @async
 * @param   {Object} app       Aplicación Express (require('../app')).
 * @param   {string} email     Correo del usuario de prueba.
 * @param   {string} password  Contraseña del usuario de prueba.
 * @param   {string} etiqueta  Nombre del rol, solo para el mensaje de error.
 * @returns {Promise<string>}  Token JWT valido.
 * @throws  {Error}            Si el login no devuelve 200 con token.
 */
const iniciarSesion = async (app, email, password, etiqueta) => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email, password });

  if (res.status !== 200 || !res.body.token) {
    const detalle = res.body?.mensaje || res.body?.error || 'sin mensaje';

    throw new Error(
      `[pruebas] No se pudo iniciar sesion como ${etiqueta} (HTTP ${res.status}): ${detalle}\n` +
      '  Revisa, en este orden:\n' +
      '   1. Que MySQL este corriendo y la base inventario_libreria exista.\n' +
      '   2. Que se haya cargado base_datos/sgi_libreria_completo.sql.\n' +
      '   3. Que las credenciales de servidor/.env.test coincidan con las\n' +
      '      del script SQL (ver LEEME_ENTREGA.txt).\n' +
      '   4. Que la cuenta no este bloqueada: el sistema bloquea por 3 minutos\n' +
      '      tras 3 intentos fallidos. Reinicia el servidor o espera.'
    );
  }

  return res.body.token;
};

/**
 * Obtiene un token JWT del usuario administrador de prueba.
 *
 * @async
 * @param   {Object} app      Aplicación Express.
 * @returns {Promise<string>} Token JWT del administrador (rol_id = 1).
 * @throws  {Error}           Si faltan credenciales o el login falla.
 */
const tokenAdmin = (app) => iniciarSesion(
  app,
  leerCredencial('TEST_ADMIN_EMAIL'),
  leerCredencial('TEST_ADMIN_PASSWORD'),
  'administrador'
);

/**
 * Obtiene un token JWT del usuario vendedor de prueba.
 *
 * @async
 * @param   {Object} app      Aplicación Express.
 * @returns {Promise<string>} Token JWT del vendedor (rol_id = 2).
 * @throws  {Error}           Si faltan credenciales o el login falla.
 */
const tokenVendedor = (app) => iniciarSesion(
  app,
  leerCredencial('TEST_VENDEDOR_EMAIL'),
  leerCredencial('TEST_VENDEDOR_PASSWORD'),
  'vendedor'
);

/**
 * Devuelve las credenciales crudas de los usuarios de prueba.
 *
 * Lo necesita auth.test.js, que prueba el login en si mismo y por tanto
 * no puede usar los ayudantes que ya asumen un login exitoso.
 *
 * @returns {{admin: {email: string, password: string},
 *            vendedor: {email: string, password: string}}}
 * @throws  {Error} Si falta alguna variable de entorno.
 */
const credenciales = () => ({
  admin: {
    email:    leerCredencial('TEST_ADMIN_EMAIL'),
    password: leerCredencial('TEST_ADMIN_PASSWORD')
  },
  vendedor: {
    email:    leerCredencial('TEST_VENDEDOR_EMAIL'),
    password: leerCredencial('TEST_VENDEDOR_PASSWORD')
  }
});

module.exports = { tokenAdmin, tokenVendedor, credenciales };
