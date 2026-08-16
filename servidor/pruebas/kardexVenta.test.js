// =====================================================
// PRUEBAS DE TRAZABILIDAD: VENTA ↔ KARDEX
// =====================================================
// Esta suite verifica el ciclo completo de trazabilidad del inventario,
// que es el punto donde el sistema demuestra su integridad:
//
//   1. Al registrar una venta, el stock baja Y queda una SALIDA en el kardex
//   2. Al anular esa venta, el stock vuelve Y queda una ENTRADA de reversa
//   3. Al final, el inventario queda exactamente como estaba
//
// ¿Por que importa tanto?
// Porque el kardex es el historial contable del negocio. Si el stock se
// mueve sin dejar rastro, el sistema pierde la trazabilidad que justifica
// su existencia: sería imposible auditar por que un libro paso de 10 a 8
// unidades. Un kardex incompleto es peor que no tener kardex, porque
// aparenta una trazabilidad que en realidad no existe.
//
// Estas pruebas son de INTEGRACIÓN real: escriben en la base de datos.
// Por eso cada una deshace lo que hizo (anula la venta que creo), dejando
// el inventario en su estado original.
//
// "El sistema registra cada movimiento de inventario en el kardex, tanto
//  las salidas por venta como las entradas por anulación, con el stock
//  anterior y el nuevo. Todo dentro de la misma transacción, así que el
//  historial y el inventario nunca pueden desincronizarse."
// =====================================================

const request = require('supertest');

process.env.NODE_ENV = 'test';

const app = require('../app');

const { tokenAdmin: obtenerTokenAdmin } = require('./ayudantes/sesion');

// Cantidad de unidades que vendemos en la prueba.
// Usamos 2 (y no 1) para comprobar que la resta usa la cantidad real
// y no simplemente decrementa de uno en uno.
const UNIDADES_VENDIDAS = 2;

describe('Trazabilidad Venta ↔ Kardex', () => {

  let token;
  let libro;    // Libro con stock suficiente sobre el que operamos
  let clienteId;

  beforeAll(async () => {
    token = await obtenerTokenAdmin(app);

    // ── Buscamos un libro con stock suficiente ──
    const resLibros = await request(app)
      .get('/api/libros')
      .set('Authorization', `Bearer ${token}`);

    libro = resLibros.body.datos?.find(
      (l) => Number(l.stock_actual) >= UNIDADES_VENDIDAS && Number(l.precio_venta) > 0
    );

    // ── Buscamos un cliente al que asociar la venta ──
    const resClientes = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${token}`);

    clienteId = resClientes.body.datos?.[0]?.id;

    // Si la base de datos de prueba no tiene datos suficientes, lo decimos
    // claramente en vez de dejar que la prueba falle con un error confuso.
    if (!libro || !clienteId) {
      throw new Error(
        '[pruebas] No hay datos suficientes para la prueba de kardex.\n' +
        `  Se necesita al menos un libro con stock >= ${UNIDADES_VENDIDAS} y precio > 0,\n` +
        '  y al menos un cliente registrado.\n' +
        '  Solucion: recarga base_datos/sgi_libreria_completo.sql.'
      );
    }
  });

  test('Una venta descuenta el stock y deja una SALIDA en el kardex', async () => {
    const stockAntes      = Number(libro.stock_actual);
    const precio          = Number(libro.precio_venta);
    const totalEsperado   = precio * UNIDADES_VENDIDAS;

    // ── PASO 1: registrar la venta ──
    const resVenta = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cliente_id:  clienteId,
        total:       totalEsperado,
        metodo_pago: 'Efectivo',
        items: [{
          libro_id:        libro.id,
          cantidad:        UNIDADES_VENDIDAS,
          precio_unitario: precio
        }]
      });

    expect(resVenta.status).toBe(201);
    expect(resVenta.body.exito).toBe(true);
    expect(resVenta.body).toHaveProperty('ventaId');

    const ventaId = resVenta.body.ventaId;

    // ── PASO 2: el stock del libro debe haber bajado ──
    const resLibros = await request(app)
      .get('/api/libros')
      .set('Authorization', `Bearer ${token}`);

    const libroDespues = resLibros.body.datos.find((l) => l.id === libro.id);
    expect(Number(libroDespues.stock_actual)).toBe(stockAntes - UNIDADES_VENDIDAS);

    // ── PASO 3: el kardex debe tener la SALIDA correspondiente ──
    // Este es el corazon de la prueba. Antes de la corrección, la venta
    // descontaba el stock pero no escribia nada aquí, y el kardex quedaba
    // mostrando reversas de anulación sin la salida que las origino.
    const resKardex = await request(app)
      .get(`/api/movimientos?libro_id=${libro.id}`)
      .set('Authorization', `Bearer ${token}`);

    expect(resKardex.status).toBe(200);

    const salida = resKardex.body.datos.find(
      (m) => m.tipo_movimiento === 'SALIDA' &&
             m.observaciones === `Salida por venta #${ventaId}`
    );

    expect(salida).toBeDefined();
    expect(salida.cantidad).toBe(UNIDADES_VENDIDAS);

    // El kardex debe reflejar el movimiento real del inventario:
    // de donde venia y a donde llego.
    expect(Number(salida.stock_anterior)).toBe(stockAntes);
    expect(Number(salida.stock_nuevo)).toBe(stockAntes - UNIDADES_VENDIDAS);

    // ── PASO 4: limpieza — anulamos para no alterar el inventario ──
    await request(app)
      .patch(`/api/ventas/${ventaId}/anular`)
      .set('Authorization', `Bearer ${token}`);
  });

  test('Anular una venta devuelve el stock y deja una ENTRADA de reversa', async () => {
    // Volvemos a leer el stock: la prueba anterior lo dejo como estaba,
    // pero no damos por hecho el orden de ejecución entre pruebas.
    const resAntes = await request(app)
      .get('/api/libros')
      .set('Authorization', `Bearer ${token}`);

    const stockInicial = Number(
      resAntes.body.datos.find((l) => l.id === libro.id).stock_actual
    );
    const precio = Number(libro.precio_venta);

    // ── PASO 1: registrar una venta ──
    const resVenta = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cliente_id:  clienteId,
        total:       precio * UNIDADES_VENDIDAS,
        metodo_pago: 'Efectivo',
        items: [{
          libro_id:        libro.id,
          cantidad:        UNIDADES_VENDIDAS,
          precio_unitario: precio
        }]
      });

    expect(resVenta.status).toBe(201);
    const ventaId = resVenta.body.ventaId;

    // ── PASO 2: anularla ──
    const resAnular = await request(app)
      .patch(`/api/ventas/${ventaId}/anular`)
      .set('Authorization', `Bearer ${token}`);

    expect(resAnular.status).toBe(200);
    expect(resAnular.body.exito).toBe(true);

    // ── PASO 3: el stock debe haber vuelto EXACTAMENTE a su valor inicial ──
    // Ni más ni menos: si volviera de más, la anulación estaría creando
    // inventario de la nada.
    const resDespues = await request(app)
      .get('/api/libros')
      .set('Authorization', `Bearer ${token}`);

    const stockFinal = Number(
      resDespues.body.datos.find((l) => l.id === libro.id).stock_actual
    );
    expect(stockFinal).toBe(stockInicial);

    // ── PASO 4: el kardex debe tener la pareja completa SALIDA + ENTRADA ──
    const resKardex = await request(app)
      .get(`/api/movimientos?libro_id=${libro.id}`)
      .set('Authorization', `Bearer ${token}`);

    const salida = resKardex.body.datos.find(
      (m) => m.tipo_movimiento === 'SALIDA' &&
             m.observaciones === `Salida por venta #${ventaId}`
    );
    const entrada = resKardex.body.datos.find(
      (m) => m.tipo_movimiento === 'ENTRADA' &&
             m.observaciones === `Reversa por anulación de venta #${ventaId}`
    );

    // Ambas deben existir: una venta anulada sin su salida original
    // sería justamente el hueco de trazabilidad que corregimos.
    expect(salida).toBeDefined();
    expect(entrada).toBeDefined();
    expect(entrada.cantidad).toBe(UNIDADES_VENDIDAS);

    // La entrada debe partir de donde quedo la salida: el kardex tiene
    // que leerse como una cadena continua, sin saltos.
    expect(Number(entrada.stock_anterior)).toBe(Number(salida.stock_nuevo));
    expect(Number(entrada.stock_nuevo)).toBe(stockInicial);
  });

  test('No se puede anular dos veces la misma venta', async () => {
    const precio = Number(libro.precio_venta);

    const resVenta = await request(app)
      .post('/api/ventas')
      .set('Authorization', `Bearer ${token}`)
      .send({
        cliente_id:  clienteId,
        total:       precio * UNIDADES_VENDIDAS,
        metodo_pago: 'Efectivo',
        items: [{
          libro_id:        libro.id,
          cantidad:        UNIDADES_VENDIDAS,
          precio_unitario: precio
        }]
      });

    const ventaId = resVenta.body.ventaId;

    // Primera anulación: correcta
    const primera = await request(app)
      .patch(`/api/ventas/${ventaId}/anular`)
      .set('Authorization', `Bearer ${token}`);
    expect(primera.status).toBe(200);

    // Segunda anulación: debe rechazarse.
    // Si el sistema la aceptara, devolveria el stock DOS veces y estaría
    // creando inventario inexistente a partir de una sola venta.
    const segunda = await request(app)
      .patch(`/api/ventas/${ventaId}/anular`)
      .set('Authorization', `Bearer ${token}`);

    expect(segunda.status).toBe(400);
    expect(segunda.body.exito).toBe(false);
    expect(segunda.body.mensaje).toMatch(/ya fue anulada/i);
  });
});
