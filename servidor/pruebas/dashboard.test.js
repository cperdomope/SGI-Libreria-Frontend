// =====================================================
// PRUEBAS DEL DASHBOARD (PANEL DE CONTROL)
// =====================================================
// Tests de integración para el endpoint de estadisticas.
//
// Que se prueba aquí:
//   1. Que sin token se rechace con 401 (no autenticado)
//   2. Que un vendedor reciba 403 (no autorizado — solo Admin)
//   3. Que un admin reciba 200 con la estructura de datos esperada
//
// Estos tests validan RBAC (Control de Acceso Basado en Roles):
//   - 401 = "No se quien eres" (falta autenticación)
//   - 403 = "Se quien eres, pero no tienes permiso" (falta autorización)
//
// Patron de beforeAll:
//   Hacemos login de ambos roles EN PARALELO con Promise.all()
//   antes de ejecutar los tests. Si la BD no está disponible,
//   los tokens quedan en null y las pruebas que los necesitan
//   se saltan con return (skip graceful).

// "El dashboard es exclusivo del administrador porque muestra
//  información sensible del negocio: ventas totales, ingresos,
//  stock crítico, etc. Los vendedores solo necesitan acceso
//  a ventas, clientes e inventario."
// =====================================================

// Supertest: simula peticiones HTTP contra Express sin levantar servidor
const request = require('supertest');

// Entorno de prueba: desactiva logs de error detallados
// y puede afectar el comportamiento del rate limiter
process.env.NODE_ENV = 'test';

// Importamos la app Express (Supertest la maneja internamente)
const app = require('../app');

// Credenciales de prueba para ambos roles.
// Viven en servidor/.env.test (fuera del repositorio) y las lee el
// ayudante compartido, que además falla de forma ruidosa si el login
// no funciona en lugar de dejar los tokens vacios.
const {
  tokenAdmin:    obtenerTokenAdmin,
  tokenVendedor: obtenerTokenVendedor
} = require('./ayudantes/sesion');

// ─────────────────────────────────────────────────────
// SUITE: Dashboard (Estadisticas)
// ─────────────────────────────────────────────────────
describe('Dashboard (Estadísticas)', () => {

  // Tokens para cada rol — se obtienen en beforeAll
  let tokenAdmin;
  let tokenVendedor;

  // ─── SETUP: Login paralelo de ambos roles ────────
  // beforeAll se ejecuta UNA vez antes de todos los tests del describe.
  // Usamos Promise.all() para hacer ambos logins simultaneamente,
  // reduciendo el tiempo de setup a la mitad.
  //
  // No hay try/catch a proposito: si el login falla, Jest marca la suite
  // completa como fallida con el mensaje del ayudante. Antes se capturaba
  // el error y las pruebas seguian adelante con tokens en null, lo que
  // las hacia pasar sin comprobar nada.
  beforeAll(async () => {
    [tokenAdmin, tokenVendedor] = await Promise.all([
      obtenerTokenAdmin(app),
      obtenerTokenVendedor(app)
    ]);
  });

  // ─── TEST 1: Sin token → 401 ────────────────────
  // Esta prueba es "pura": no depende de BD ni de tokens.
  // Verifica que verificarToken bloquee peticiones anonimas.
  test('Debe rechazar dashboard sin token', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(401);
  });

  // ─── TEST 2: Vendedor → 403 ─────────────────────
  // El vendedor está autenticado (tiene token) pero NO autorizado.
  // El middleware verificarRol(soloAdministrador) debe rechazarlo.
  // 403 Forbidden = "Se quien eres, pero no tienes acceso a este recurso"
  test('Vendedor NO puede ver el dashboard (solo Admin)', async () => {

    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${tokenVendedor}`);

    expect(res.status).toBe(403);
  });

  // ─── TEST 3: Admin → 200 + estructura correcta ──
  // Verificamos no solo que responda 200, sino que la respuesta
  // tenga las propiedades esperadas. Esto protege contra regresiones:
  // si alguien renombra un campo en el controlador, este test falla.
  test('Admin puede ver el dashboard con datos correctos', async () => {

    const res = await request(app)
      .get('/api/dashboard')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);

    // Validamos que la respuesta contenga las secciones principales
    // toHaveProperty() verifica que la clave exista (sin importar el valor)
    const datos = res.body.datos;
    expect(datos).toHaveProperty('ventas_hoy');
    expect(datos).toHaveProperty('total_libros');
    expect(datos).toHaveProperty('total_clientes');
    expect(datos).toHaveProperty('inventario');
    expect(datos).toHaveProperty('ventas_por_mes');
  });
});
