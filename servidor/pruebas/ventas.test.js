// =====================================================
// PRUEBAS DEL MÓDULO DE VENTAS
// =====================================================
// Tests de integración para el registro de ventas.
//
// Cobertura:
//   - Seguridad: sin token en GET y POST (401)
//   - Validación: sin cliente_id, carrito vacío
//   - Anti-fraude nivel 1: total manipulado (TOTAL_INVALIDO)
//   - Anti-fraude nivel 2: precio manipulado (PRECIO_INVALIDO)
//
// Las dos últimas son las importantes, y prueban barreras distintas:
//
//   Nivel 1 — el atacante cambia solo el total. Sus cifras dejan de
//   cuadrar entre sí y el backend lo detecta antes de la transacción.
//
//   Nivel 2 — el atacante cambia el precio Y el total a la vez, de modo
//   que sí cuadran entre sí. La primera barrera no puede verlo; solo se
//   descubre comparando contra el precio guardado en mdc_libros.
//   Sin esta segunda prueba, la primera daría una falsa sensación de
//   seguridad: pasar el nivel 1 no impide vender un libro por $1.

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

  // ANTI-FRAUDE NIVEL 2: aquí el atacante es más cuidadoso y falsea el
  // precio unitario Y el total a la vez, así que sus cifras son coherentes
  // entre sí (1 unidad x $1 = $1). La validación previa a la transacción
  // no tiene forma de detectarlo: para el servidor son números que suman.
  //
  // Quien lo detecta es el PASO 2 de crearVenta, que lee precio_venta de
  // mdc_libros sobre la fila ya bloqueada y compara. Responde
  // 'PRECIO_INVALIDO' y la venta nunca llega a registrarse.
  test('Debe rechazar venta con el precio unitario manipulado', async () => {

    // Buscamos un libro real del catálogo con stock disponible, para
    // asegurarnos de que el rechazo venga de la validación de precio
    // y no de una falta de inventario.
    const resLibros = await request(app)
      .get('/api/libros')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    const libro = resLibros.body.datos?.find(
      (l) => Number(l.stock_actual) >= 1 && Number(l.precio_venta) > 1
    );

    // Si la base de prueba no tiene datos suficientes lo decimos claro,
    // en vez de dejar que la prueba falle con un error confuso.
    if (!libro) {
      throw new Error(
        '[pruebas] No hay un libro con stock >= 1 y precio > 1.\n' +
        '  Solucion: recarga base_datos/sgi_libreria_completo.sql.'
      );
    }

    const res = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        cliente_id: 1,
        total: 1,
        items: [{ libro_id: libro.id, cantidad: 1, precio_unitario: 1 }]
      });

    expect(res.status).toBe(400);
    expect(res.body.codigo).toBe('PRECIO_INVALIDO');
  });
});
