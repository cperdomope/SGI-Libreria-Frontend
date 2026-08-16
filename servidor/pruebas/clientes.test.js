// =====================================================
// PRUEBAS DEL MÓDULO DE CLIENTES
// =====================================================
// Tests de integración para los endpoints de clientes.
//
// Que se prueba aquí:
//   1. Que los endpoints rechacen peticiones sin token (401)
//   2. Que un vendedor autenticado pueda listar clientes
//
// Patron de pruebas:
//   - Las pruebas sin BD son "puras": no dependen de MySQL,
//     solo verifican que el middleware de autenticación funcione.
//   - Las pruebas CON BD (login real) se saltan gracefully
//     si la base de datos no está disponible.
//
// Herramientas:
//   - Jest: framework de testing (describe, test, expect)
//   - Supertest: permite hacer peticiones HTTP al app de Express
//     sin necesidad de levantar el servidor en un puerto real.

// "Los clientes pueden ser gestionados por Administradores y Vendedores,
//  a diferencia de otros módulos que son exclusivos del Admin.
//  Por eso probamos con credenciales de vendedor: si el vendedor
//  puede acceder, el admin también puede (tiene más permisos)."
// =====================================================

// Supertest: librería que simula peticiones HTTP contra una app Express
const request = require('supertest');

// Establecemos el entorno como 'test' para que los errores
// no muestren detalles internos y el rate limiter sea más permisivo
process.env.NODE_ENV = 'test';

// Importamos la app de Express (sin levantar servidor)
// Supertest se encarga de crear un servidor temporal para las pruebas
const app = require('../app');

// Credenciales del vendedor de prueba, leídas de servidor/.env.test
// por el ayudante compartido.
// Usamos vendedor (no admin) porque clientes es accesible para ambos roles.
const { tokenVendedor: obtenerTokenVendedor } = require('./ayudantes/sesion');

// ─────────────────────────────────────────────────────
// SUITE: Módulo de Clientes
// ─────────────────────────────────────────────────────
describe('Módulo de Clientes', () => {

  // ─── TEST 1: GET sin token ───────────────────────
  // El middleware verificarToken debe bloquear la petición
  // antes de que llegue al controlador.
  test('Debe rechazar listado de clientes sin autenticación', async () => {
    const res = await request(app).get('/api/clientes');
    expect(res.status).toBe(401);
  });

  // ─── TEST 2: POST sin token ──────────────────────
  // Intentamos crear un cliente sin autenticacion.
  // Verificamos que la protección aplica a todos los métodos HTTP,
  // no solo a GET.
  test('Debe rechazar crear cliente sin token', async () => {
    const res = await request(app)
      .post('/api/clientes')
      .send({ nombre_completo: 'Test', documento: '123' });
    expect(res.status).toBe(401);
  });

  // ─── TEST 3: Vendedor autenticado puede listar ───
  // Esta prueba requiere conexión a MySQL para hacer login real.
  // Si la BD no está disponible, obtenerTokenVendedor lanza un error con
  // instrucciones y la prueba falla. Antes se saltaba con un console.warn,
  // pero una prueba que se salta sola no prueba nada: la suite quedaba en
  // verde mientras el endpoint podia estar roto.
  test('Vendedor puede acceder al listado de clientes (requiere BD)', async () => {
    // Paso 1: Login real para obtener un JWT válido
    const token = await obtenerTokenVendedor(app);

    // Paso 2: Petición autenticada con el token en el header Authorization
    // Formato: "Bearer <token>" — estándar JWT
    const res = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${token}`);

    // Verificamos que el endpoint responde correctamente
    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
  });
});
