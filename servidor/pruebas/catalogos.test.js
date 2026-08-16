// =====================================================
// TESTS DE CATÁLOGOS (AUTORES Y CATEGORÍAS)
// =====================================================
// Estas pruebas verifican que los CRUDs de autores
// y categorías funcionen correctamente.
// Probamos:
//   - Seguridad: sin token no se puede acceder
//   - Permisos: vendedores pueden VER pero no crear
//   - Validaciones: campos obligatorios
//   - Funcionalidad: listado correcto

const request = require('supertest');

process.env.NODE_ENV = 'test';

const app = require('../app');

// Ayudante compartido: credenciales desde .env.test y login que falla
// de forma ruidosa si no puede autenticarse.
const {
  tokenAdmin:    obtenerTokenAdmin,
  tokenVendedor: obtenerTokenVendedor
} = require('./ayudantes/sesion');

describe('Módulo de Autores', () => {

  let tokenAdmin;
  let tokenVendedor;

  // Sin try/catch: si el login falla, la suite debe detenerse con un
  // error claro en lugar de continuar con tokens vacios.
  beforeAll(async () => {
    [tokenAdmin, tokenVendedor] = await Promise.all([
      obtenerTokenAdmin(app),
      obtenerTokenVendedor(app)
    ]);
  });

  test('Debe rechazar listado de autores sin token', async () => {
    const res = await request(app).get('/api/autores');
    expect(res.status).toBe(401);
  });

  test('Vendedor puede VER autores', async () => {

    const res = await request(app)
      .get('/api/autores')
      .set('Authorization', `Bearer ${tokenVendedor}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    expect(Array.isArray(res.body.datos)).toBe(true);
  });

  test('Vendedor NO puede crear autores (solo Admin)', async () => {

    const res = await request(app)
      .post('/api/autores')
      .set('Authorization', `Bearer ${tokenVendedor}`)
      .send({ nombre: 'Autor Test' });

    expect(res.status).toBe(403);
  });

  test('Debe rechazar crear autor sin nombre', async () => {

    const res = await request(app)
      .post('/api/autores')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.exito).toBe(false);
  });

  test('Admin puede listar autores con datos correctos', async () => {

    const res = await request(app)
      .get('/api/autores')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    expect(res.body).toHaveProperty('total');
    // Cada autor debe tener id y nombre
    if (res.body.datos.length > 0) {
      expect(res.body.datos[0]).toHaveProperty('id');
      expect(res.body.datos[0]).toHaveProperty('nombre');
    }
  });
});

describe('Módulo de Categorías', () => {

  let tokenAdmin;
  let tokenVendedor;

  // Sin try/catch: si el login falla, la suite debe detenerse con un
  // error claro en lugar de continuar con tokens vacios.
  beforeAll(async () => {
    [tokenAdmin, tokenVendedor] = await Promise.all([
      obtenerTokenAdmin(app),
      obtenerTokenVendedor(app)
    ]);
  });

  test('Debe rechazar listado de categorías sin token', async () => {
    const res = await request(app).get('/api/categorias');
    expect(res.status).toBe(401);
  });

  test('Vendedor puede VER categorías', async () => {

    const res = await request(app)
      .get('/api/categorias')
      .set('Authorization', `Bearer ${tokenVendedor}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    expect(Array.isArray(res.body.datos)).toBe(true);
  });

  test('Vendedor NO puede crear categorías (solo Admin)', async () => {

    const res = await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${tokenVendedor}`)
      .send({ nombre: 'Categoría Test' });

    expect(res.status).toBe(403);
  });

  test('Debe rechazar crear categoría sin nombre', async () => {

    const res = await request(app)
      .post('/api/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.exito).toBe(false);
  });

  test('Admin puede listar categorías correctamente', async () => {

    const res = await request(app)
      .get('/api/categorias')
      .set('Authorization', `Bearer ${tokenAdmin}`);

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    expect(res.body).toHaveProperty('total');
    if (res.body.datos.length > 0) {
      expect(res.body.datos[0]).toHaveProperty('id');
      expect(res.body.datos[0]).toHaveProperty('nombre');
    }
  });
});