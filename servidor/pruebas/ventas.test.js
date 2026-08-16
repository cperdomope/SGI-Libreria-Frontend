// =====================================================
// PRUEBAS DEL MÓDULO DE VENTAS
// =====================================================
// Tests de integración para el registro de ventas.
//
// Cobertura:
//   - Seguridad: sin token en GET y POST (401)
//   - Validación: sin cliente_id, carrito vacío, total manipulado
//
// La prueba del total manipulado es especialmente importante:
// verifica que el backend recalcule el total desde los items
// y rechace si no coincide con lo que envío el frontend.
// Esto previene que un atacante modifique el total en la peticion.

// "Las ventas son el módulo más crítico del sistema porque
//  afectan directamente el dinero y el inventario.
//  Por eso validamos tanto la seguridad como la integridad
//  de los datos enviados desde el frontend."
// =====================================================

// Supertest: peticiones HTTP contra Express sin servidor real
const request = require('supertest');

// Entorno de prueba
process.env.NODE_ENV = 'test';

// App Express para Supertest
const app = require('../app');

// Ayudante compartido: lee las credenciales de .env.test e inicia sesion.
// Si el login falla, lanza un error con instrucciones en lugar de dejar
// el token en null (que haría que las pruebas se aprobaran sin ejecutarse).
const { tokenAdmin: obtenerTokenAdmin } = require('./ayudantes/sesion');

// ─────────────────────────────────────────────────────
// SUITE: Módulo de Ventas
// ─────────────────────────────────────────────────────
describe('Módulo de Ventas', () => {

  let tokenAdmin;

  // Login del admin antes de los tests.
  // Sin try/catch: si esto falla, la suite entera debe detenerse.
  // Solo necesitamos admin — ventas es accesible para admin Y vendedor,
  // pero las validaciones de negocio son las mismas para ambos roles.
  beforeAll(async () => {
    tokenAdmin = await obtenerTokenAdmin(app);
  });

  // ── Seguridad: endpoints protegidos ──────────────

  test('Debe rechazar listado de ventas sin token JWT', async () => {
    const res = await request(app).get('/api/ventas');
    expect(res.status).toBe(401);
  });

  test('Debe rechazar crear venta sin autenticación', async () => {
    const res = await request(app)
      .post('/api/ventas')
      .send({ cliente_id: 1, total: 50000, items: [{ libro_id: 1, cantidad: 1, precio_unitario: 50000 }] });
    expect(res.status).toBe(401);
  });

  // ── Validaciones de negocio ──────────────────────

  // Sin cliente_id: toda venta debe estar asociada a un cliente
  test('Debe rechazar venta sin cliente_id', async () => {

    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ total: 50000, items: [{ libro_id: 1, cantidad: 1, precio_unitario: 50000 }] });

    expect(res.status).toBe(400);
    expect(res.body.exito).toBe(false);
  });

  // Carrito vacío: no tiene sentido registrar una venta sin productos
  // toMatch(/regex/) verifica que el mensaje contenga el texto esperado
  test('Debe rechazar venta con carrito vacío', async () => {

    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cliente_id: 1, total: 0, items: [] });

    expect(res.status).toBe(400);
    expect(res.body.exito).toBe(false);
    expect(res.body.mensaje).toMatch(/datos incompletos/i);
  });

  // ANTI-FRAUDE: el frontend envía total=1 pero el item vale 50000.
  // El backend recalcula el total real desde los items y detecta
  // la discrepancia. Responde con código 'TOTAL_INVALIDO'.
  // Esto previene manipulación de precios vía DevTools o interceptor HTTP.
  test('Debe rechazar venta con total manipulado desde el frontend', async () => {

    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({ cliente_id: 1, total: 1, items: [{ libro_id: 1, cantidad: 1, precio_unitario: 50000 }] });

    expect(res.status).toBe(400);
    expect(res.body.codigo).toBe('TOTAL_INVALIDO');
  });
});
