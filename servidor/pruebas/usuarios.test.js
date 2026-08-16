// =====================================================
// PRUEBAS DEL MÓDULO DE USUARIOS
// =====================================================
// Tests de integración para la gestión de usuarios del sistema.
//
// Cobertura:
//   - Seguridad: sin token (401), vendedor denegado (403)
//   - RBAC: solo admin puede listar y crear usuarios
//   - Validación: campos obligatorios al crear usuario
//   - Cambio de password: protección sin token y sin datos
//   - Seguridad extra: password_hash nunca se expone en la respuesta
//
// Este módulo tiene una particularidad: el endpoint /cambiar-password
// es accesible para CUALQUIER usuario autenticado (no solo admin),
// porque todos necesitan poder cambiar su propia contraseña.

// "La prueba más importante de este archivo es verificar que
//  password_hash nunca aparezca en la respuesta del listado.
//  Exponer hashes sería una vulnerabilidad critica."
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
// SUITE: Módulo de Usuarios
// ─────────────────────────────────────────────────────
describe('Módulo de Usuarios', () => {

  let tokenAdmin;
  let tokenVendedor;

  // Login paralelo de ambos roles.
  // Si falla, la suite se detiene con un mensaje que explica que revisar.
  beforeAll(async () => {
    [tokenAdmin, tokenVendedor] = await Promise.all([
      obtenerTokenAdmin(app),
      obtenerTokenVendedor(app)
    ]);
  });

  // ── Seguridad ────────────────────────────────────

  test('Debe rechazar listado de usuarios sin token', async () => {
    const res = await request(app).get('/api/usuarios');
    expect(res.status).toBe(401);
  });

  // RBAC: vendedor autenticado pero sin permiso para gestionar usuarios
  test('Vendedor NO puede listar usuarios (solo Admin)', async () => {

    const res = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${tokenVendedor}`);

    expect(res.status).toBe(403);
  });

  // ── Funcionalidad con Admin ──────────────────────

  test('Admin puede listar usuarios', async () => {

    const res = await request(app)
      .get('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    expect(Array.isArray(res.body.datos)).toBe(true);

    // CRÍTICO: verificar que el hash de contraseña NUNCA se exponga.
    // El SELECT del controlador omite password_hash a proposito.
    // Si alguien lo agrega por error, este test lo detecta.
    if (res.body.datos.length > 0) {
      expect(res.body.datos[0]).not.toHaveProperty('password_hash');
    }
  });

  // ── Validaciones al crear usuario ────────────────

  // Body completamente vacío: todos los campos son requeridos
  test('Debe rechazar crear usuario sin datos', async () => {

    const res = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.exito).toBe(false);
  });

  // Falta email: campo obligatorio individual
  test('Debe rechazar crear usuario sin email', async () => {

    const res = await request(app)
      .post('/api/usuarios')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({
        nombre_completo: 'Test User',
        password: 'password123',
        rol_id: 2
      });

    expect(res.status).toBe(400);
    expect(res.body.exito).toBe(false);
  });

  // ── Cambio de contraseña ─────────────────────────
  // Este endpoint es accesible para TODOS los roles autenticados,
  // a diferencia del resto del CRUD que es solo admin.

  // Sin token: verificamos que /cambiar-password también está protegido
  test('Debe rechazar cambio de contraseña sin token', async () => {
    const res = await request(app)
      .patch('/api/usuarios/cambiar-password')
      .send({
        passwordActual: 'test',
        passwordNueva: 'nueva123'
      });

    expect(res.status).toBe(401);
  });

  // Sin datos: el controlador exige passwordActual, passwordNueva y passwordConfirmacion
  test('Debe rechazar cambio de contraseña sin datos', async () => {

    const res = await request(app)
      .patch('/api/usuarios/cambiar-password')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.exito).toBe(false);
  });
});
