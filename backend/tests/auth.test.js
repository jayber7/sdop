const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const Usuario = require('../src/models/Usuario');
const UnidadOrganizativa = require('../src/models/UnidadOrganizativa');

let mongoServer;
let adminUser;
let unidad1;
let unidad2;

jest.setTimeout(30000);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

beforeEach(async () => {
  await Usuario.deleteMany({});
  await UnidadOrganizativa.deleteMany({});

  unidad1 = await UnidadOrganizativa.create({
    nombre: 'Dirección de Infraestructura',
    codigo: 'DI',
    descripcion: 'Test unidad',
    color: '#1565c0',
  });

  unidad2 = await UnidadOrganizativa.create({
    nombre: 'Jefatura de Transporte',
    codigo: 'JT',
    descripcion: 'Test unidad',
    color: '#e65100',
  });

  adminUser = await Usuario.create({
    nombre: 'Admin Test',
    email: 'admin@test.bo',
    password: 'Admin123!',
    rol: 'ADMIN',
    unidadesAcceso: [unidad1._id, unidad2._id],
    activo: true,
  });
});

describe('Auth - POST /api/auth/login', () => {
  test('Login exitoso con credenciales correctas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.bo', password: 'Admin123!' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.usuario.email).toBe('admin@test.bo');
    expect(res.body.data.usuario.rol).toBe('ADMIN');
    expect(res.body.data.usuario.unidadesAcceso).toHaveLength(2);
  });

  test('Login falla con email incorrecto', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.bo', password: 'Admin123!' });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Credenciales incorrectas');
  });

  test('Login falla con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.bo', password: 'WrongPassword!' });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Credenciales incorrectas');
  });

  test('Login falla con campos vacíos', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: '', password: '' });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toBe('Email y contraseña son requeridos');
  });

  test('Login falla sin enviar body', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.status).toBe('error');
  });

  test('Cuenta desactivada no puede login', async () => {
    await Usuario.create({
      nombre: 'User Inactivo',
      email: 'inactivo@test.bo',
      password: 'Test123!',
      rol: 'VISOR',
      activo: false,
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inactivo@test.bo', password: 'Test123!' });

    expect(res.status).toBe(403);
    expect(res.body.status).toBe('error');
    expect(res.body.message).toContain('desactivada');
  });

  test('Email case-insensitive', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'ADMIN@TEST.BO', password: 'Admin123!' });

    expect(res.status).toBe(200);
    expect(res.body.data.usuario.email).toBe('admin@test.bo');
  });

  test('Token JWT contiene id, rol y unidadesAcceso', async () => {
    const jwt = require('jsonwebtoken');
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.bo', password: 'Admin123!' });

    const decoded = jwt.verify(res.body.data.token, process.env.JWT_SECRET || 'sdop-jwt-secret');
    expect(decoded.id).toBe(adminUser._id.toString());
    expect(decoded.rol).toBe('ADMIN');
    expect(decoded.unidadesAcceso).toHaveLength(2);
  });
});

describe('Auth - POST /api/auth/login (bloqueo por intentos)', () => {
  test('Cuenta se bloquea tras 5 intentos fallidos', async () => {
    await Usuario.create({
      nombre: 'User Bloqueo',
      email: 'bloqueo@test.bo',
      password: 'Test123!',
      rol: 'VISOR',
      activo: true,
    });

    for (let i = 0; i < 5; i++) {
      await request(app)
        .post('/api/auth/login')
        .send({ email: 'bloqueo@test.bo', password: 'WrongPassword!' });
    }

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bloqueo@test.bo', password: 'Test123!' });

    expect(res.status).toBe(403);
    expect(res.body.message).toContain('bloqueada');
  });
});

describe('Auth - GET /api/auth/me', () => {
  test('Obtiene perfil con token válido', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.bo', password: 'Admin123!' });

    const token = loginRes.body.data.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('admin@test.bo');
    expect(res.body.data.rol).toBe('ADMIN');
  });

  test('Sin token retorna 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  test('Token inválido retorna 401', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalidtoken123');
    expect(res.status).toBe(401);
  });
});

describe('Auth - POST /api/auth/cambiar-password', () => {
  test('Cambio de contraseña exitoso', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.bo', password: 'Admin123!' });

    const token = loginRes.body.data.token;

    const res = await request(app)
      .post('/api/auth/cambiar-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ passwordActual: 'Admin123!', passwordNuevo: 'NuevaPass456!' });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');

    const loginNew = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.bo', password: 'NuevaPass456!' });

    expect(loginNew.status).toBe(200);
  });

  test('Cambio falla con contraseña actual incorrecta', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.bo', password: 'Admin123!' });

    const token = loginRes.body.data.token;

    const res = await request(app)
      .post('/api/auth/cambiar-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ passwordActual: 'WrongPass!', passwordNuevo: 'NuevaPass456!' });

    expect(res.status).toBe(401);
    expect(res.body.message).toContain('actual incorrecta');
  });
});

describe('Auth - POST /api/auth/logout', () => {
  test('Logout exitoso con token válido', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@test.bo', password: 'Admin123!' });

    const token = loginRes.body.data.token;

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
  });
});
