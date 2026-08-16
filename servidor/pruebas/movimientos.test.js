// =====================================================
// PRUEBAS DEL MÓDULO DE MOVIMIENTOS (KARDEX)
// =====================================================
// Tests de integración para entradas y salidas de inventario.
//
// Cobertura:
//   - Seguridad: sin token (401), vendedor denegado (403)
//   - Validación: campos vacíos, tipo inválido, cantidad negativa,
//     entrada sin proveedor
//   - Funcional: admin puede listar movimientos
//
// El Kardex es exclusivo del administrador porque implica
// modificar directamente el stock del inventario.
// Los vendedores solo afectan stock indirectamente vía ventas.

// "Este es el archivo de pruebas más completo del backend
//  porque el módulo de movimientos tiene muchas reglas de negocio:
//  tipos válidos (ENTRADA/SALIDA/AJUSTE), proveedor obligatorio
//  en entradas, cantidades positivas, etc."
// =====================================================

// Supertest: peticiones HTTP contra Express sin servidor real
const request = require('supertest');

// Entorno de prueba
process.env.NODE_ENV = 'test';

// App Express para Supertest
const app = require('../app');

// Credenciales de ambos roles para probar RBAC.
// Las lee el ayudante compartido desde servidor/.env.test.
const {
  tokenAdmin:    obtenerTokenAdmin,
  tokenVendedor: obtenerTokenVendedor
} = require('./ayudantes/sesion');

// ─────────────────────────────────────────────────────
// SUITE: Módulo de Movimientos (Kardex)
// ─────────────────────────────────────────────────────
describe('Módulo de Movimientos (Kardex)', () => {

  let tokenAdmin;
  let tokenVendedor;

  // Login paralelo de ambos roles antes de los tests.
  // Si falla, la suite se detiene con un mensaje que explica que revisar.
  beforeAll(async () => {
    [tokenAdmin, tokenVendedor] = await Promise.all([
      obtenerTokenAdmin(app),
      obtenerTokenVendedor(app)
    ]);
  });

  // ── Pruebas de seguridad (autenticación y autorización) ──

  test('Debe rechazar listado de movimientos sin token', async () => {
    const res = await request(app).get('/api/movimientos');
    expect(res.status).toBe(401);
  });

  test('Debe rechazar registrar movimiento sin token', async () => {
    const res = await request(app)
      .post('/api/movimientos')
      .send({ libro_id: 1, tipo_movimiento: 'ENTRADA', cantidad: 5 });
    expect(res.status).toBe(401);
  });

  // RBAC: vendedor autenticado pero sin permiso → 403
  test('Vendedor NO puede acceder a movimientos (solo Admin)', async () => {

    const res = await request(app)
      .get('/api/movimientos')
      .set('Authorization', `Bearer ${tokenVendedor}`);

    expect(res.status).toBe(403);
  });

  // ── Pruebas de paginación del kardex ─────────────

  // Sin parámetros de paginación, la respuesta mantiene el formato
  // original { exito, datos, total }. Esto es retrocompatibilidad:
  // el frontend actual llama a este endpoint sin paginar y debe
  // seguir funcionando igual que antes.
  test('Sin parámetros devuelve el listado completo (retrocompatible)', async () => {
    const res = await request(app)
      .get('/api/movimientos')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    expect(Array.isArray(res.body.datos)).toBe(true);
    expect(res.body).toHaveProperty('total');
    expect(res.body).not.toHaveProperty('paginacion');
  });

  // Con ?pagina y ?limite, la respuesta incluye la metadata de paginación
  // y como máximo la cantidad de registros solicitada. El kardex crece
  // indefinidamente, así que sin este limite la respuesta acabaría
  // devolviendo miles de filas de una sola vez.
  test('Con ?pagina y ?limite devuelve una página con su metadata', async () => {
    const res = await request(app)
      .get('/api/movimientos?pagina=1&limite=5')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    expect(Array.isArray(res.body.datos)).toBe(true);
    expect(res.body.datos.length).toBeLessThanOrEqual(5);

    expect(res.body).toHaveProperty('paginacion');
    expect(res.body.paginacion.paginaActual).toBe(1);
    expect(res.body.paginacion.registrosPorPagina).toBe(5);
    expect(typeof res.body.paginacion.totalRegistros).toBe('number');
    expect(typeof res.body.paginacion.totalPaginas).toBe('number');
  });

  // El tope de 100 registros por página evita que alguien pida
  // ?limite=999999 y vacíe la tabla entera en una sola peticion.
  test('Un límite excesivo se recorta al máximo permitido', async () => {
    const res = await request(app)
      .get('/api/movimientos?pagina=1&limite=999999')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.paginacion.registrosPorPagina).toBe(100);
  });

  // ── Pruebas de validación (reglas de negocio) ────

  // Body vacío: el controlador exige libro_id, tipo_movimiento y cantidad
  test('Debe rechazar movimiento sin datos obligatorios', async () => {

    const res = await request(app)
      .post('/api/movimientos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.exito).toBe(false);
  });

  // Solo se aceptan ENTRADA, SALIDA y AJUSTE (constante TIPOS_MOVIMIENTO)
  test('Debe rechazar movimiento con tipo inválido', async () => {

    const res = await request(app)
      .post('/api/movimientos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ libro_id: 1, tipo_movimiento: 'INVALIDO', cantidad: 5 });

    expect(res.status).toBe(400);
    expect(res.body.exito).toBe(false);
  });

  // Las cantidades deben ser positivas — el tipo determina si suma o resta
  test('Debe rechazar movimiento con cantidad negativa', async () => {

    const res = await request(app)
      .post('/api/movimientos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ libro_id: 1, tipo_movimiento: 'ENTRADA', cantidad: -5 });

    expect(res.status).toBe(400);
    expect(res.body.exito).toBe(false);
  });

  // Regla de negocio: toda ENTRADA debe tener un proveedor asociado
  // porque necesitamos saber de donde viene la mercancía
  test('Debe rechazar ENTRADA sin proveedor', async () => {

    const res = await request(app)
      .post('/api/movimientos')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        libro_id: 1,
        tipo_movimiento: 'ENTRADA',
        cantidad: 5,
        costo_compra: 10000
        // Falta proveedor_id — obligatorio en entradas
      });

    expect(res.status).toBe(400);
    expect(res.body.exito).toBe(false);
  });

  // ── Prueba funcional con BD ──────────────────────

  test('Admin puede ver historial de movimientos', async () => {

    const res = await request(app)
      .get('/api/movimientos')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    expect(Array.isArray(res.body.datos)).toBe(true);
  });
});
