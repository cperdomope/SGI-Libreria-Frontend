const request = require('supertest');

process.env.NODE_ENV = 'test';

// La app real (con todos sus middlewares y rutas configurados)
const app = require('../app');

// Credenciales de prueba leídas de servidor/.env.test.
// Esta suite prueba el login en sí mismo, así que no puede usar los
// ayudantes que ya asumen una sesión iniciada: necesita el correo y la
// contraseña en crudo para probar los casos de éxito y de fallo.
// Si falta alguna variable, credenciales() lanza un error explicativo.
const { credenciales } = require('./ayudantes/sesion');

const { email: EMAIL_ADMIN, password: PASSWORD_ADMIN } = credenciales().admin;

describe('Módulo de Autenticación', () => {

  test('Debe rechazar login cuando falta el email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'cualquier' });

    expect(res.status).toBe(400);
    expect(res.body.exito).toBe(false);
  });

  test('Debe rechazar login cuando falta la contraseña', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL_ADMIN });

    expect(res.status).toBe(400);
    expect(res.body.exito).toBe(false);
  });

  test('Debe rechazar login con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL_ADMIN, password: 'contraseña_incorrecta_xyz' });

    // 401 si el usuario existe pero la contraseña es incorrecta
    // 401 también si el usuario no existe (respuesta genérica por seguridad)
    expect([400, 401]).toContain(res.status);
    expect(res.body.exito).toBe(false);
  });

  test('Debe rechazar acceso a ruta protegida sin token JWT', async () => {
    const res = await request(app).get('/api/libros');
    expect(res.status).toBe(401);
  });

  // Esta prueba es la que sostiene a todas las demás suites: si el login
  // con credenciales correctas no devuelve un token, ninguna otra prueba
  // autenticada del proyecto está comprobando nada. Por eso no lleva
  // ninguna salida anticipada: debe fallar si la BD no está disponible.
  test('Login exitoso retorna token y datos del usuario (requiere BD)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: EMAIL_ADMIN, password: PASSWORD_ADMIN });

    expect(res.status).toBe(200);
    expect(res.body.exito).toBe(true);
    expect(res.body).toHaveProperty('token');
    expect(res.body.usuario).toHaveProperty('id');
    expect(res.body.usuario).toHaveProperty('rol_id');
    expect(typeof res.body.token).toBe('string');
    expect(res.body.token.length).toBeGreaterThan(10);
  });
});