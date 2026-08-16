// =====================================================
// PRUEBAS DEL MÓDULO DE LIBROS (INVENTARIO)
// =====================================================
// Tests de integración para el CRUD de libros.
//
// Cobertura:
//   - 3 pruebas de seguridad (sin token → 401)
//   - 1 prueba de listado autenticado (admin → 200)
//   - 2 pruebas de validación (campos obligatorios y precio negativo)
//
// A diferencia de dashboard.test.js, aquí solo usamos admin
// porque el CRUD de libros requiere rol administrador.
// Los vendedores solo pueden VER libros, no crearlos.

// "Estas pruebas cubren tanto la capa de seguridad (middleware)
//  como la capa de validación (controlador). Si alguien modifica
//  las validaciones del controlador, estos tests lo detectan."
// =====================================================

// Supertest: simula peticiones HTTP sin levantar servidor
const request = require('supertest');

// Entorno de prueba para desactivar logs detallados de error
process.env.NODE_ENV = 'test';

// App Express — Supertest la consume directamente
const app = require('../app');

// Credenciales del admin de prueba.
// Solo necesitamos admin porque crear libros es exclusivo del administrador.
// Las lee el ayudante compartido desde servidor/.env.test.
const { tokenAdmin: obtenerTokenAdmin } = require('./ayudantes/sesion');

// ─────────────────────────────────────────────────────
// SUITE: Módulo de Libros
// ─────────────────────────────────────────────────────
describe('Módulo de Libros (Inventario)', () => {

  // Token del admin — se obtiene en beforeAll
  let tokenAdmin;

  // Login antes de todos los tests para obtener JWT.
  // Si falla, la suite se detiene con un mensaje que explica que revisar.
  beforeAll(async () => {
    tokenAdmin = await obtenerTokenAdmin(app);
  });

  // ── Pruebas de seguridad (no necesitan BD) ──────

  // Verificamos que los 3 métodos HTTP principales esten protegidos
  // GET, POST y DELETE deben devolver 401 sin token

  test('Debe rechazar listado de libros sin token JWT', async () => {
    const res = await request(app).get('/api/libros');
    expect(res.status).toBe(401);
  });

  test('Debe rechazar crear libro sin autenticación', async () => {
    const res = await request(app)
      .post('/api/libros')
      .send({ titulo: 'Test', precio_venta: 10000 });
    expect(res.status).toBe(401);
  });

  test('Debe rechazar eliminar libro sin autenticación', async () => {
    const res = await request(app).delete('/api/libros/1');
    expect(res.status).toBe(401);
  });

  // ── Pruebas con autenticación (necesitan BD) ────

  // Listado: verifica que la respuesta sea un array de libros
  test('Admin puede listar libros con token válido', async () => {

    const res = await request(app)
      .get('/api/libros')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    // Array.isArray() verifica que datos sea un arreglo, no un objeto u otro tipo
    expect(Array.isArray(res.body.datos)).toBe(true);
  });

  // Validación de campos: el controlador exige titulo como mínimo
  test('Debe rechazar crear libro sin título', async () => {

    const res = await request(app)
      .post('/api/libros')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ precio_venta: 10000 });

    expect(res.status).toBe(400);
    expect(res.body.exito).toBe(false);
  });

  // Validación de negocio: un precio negativo no tiene sentido
  test('Debe rechazar crear libro con precio negativo', async () => {

    const res = await request(app)
      .post('/api/libros')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ titulo: 'Libro Test', precio_venta: -5000 });

    expect(res.status).toBe(400);
    expect(res.body.exito).toBe(false);
  });
});
