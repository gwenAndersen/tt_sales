// @ts-nocheck
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import passport from 'passport';
import { registerRoutes } from './routes';
import { storage } from './storage';
import bcrypt from 'bcryptjs';

// Mock storage and bcrypt
jest.mock('./storage', () => ({
  storage: {
    findUserByUsername: jest.fn(),
    createUser: jest.fn(),
    getUser: jest.fn(),
  },
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn((password) => Promise.resolve(`hashed_${password}`)),
  compare: jest.fn((password, hashedPassword) => Promise.resolve(password === hashedPassword.replace('hashed_', ''))),
}));

// Mock passport.authenticate
jest.mock('passport', () => {
  const passport = jest.requireActual('passport');
  return {
    ...passport,
    initialize: () => (req, res, next) => next(),
    session: () => (req, res, next) => next(),
    authenticate: jest.fn((strategy, options, callback) => (req: any, res: any, next: any) => {
      if (callback) {
        return callback(null, { id: '1', username: 'testuser' }, { message: 'Logged In Successfully' });
      }
      if (strategy === 'local') {
        // Simulate successful authentication
        req.login = jest.fn((user, cb) => cb());
        req.user = { id: '1', username: 'testuser' }; // Mock req.user
        return next();
      }
      return next();
    }),
  };
});

describe('Authentication Routes', () => {
  let app: express.Express;

  beforeAll(async () => {
    // Initial setup for the test suite, if any
  });

  beforeEach(async () => {
    app = express();
    app.use(express.json());
    app.use(session({
      secret: 'testsecret',
      resave: false,
      saveUninitialized: false,
    }));
    app.use(passport.initialize());
    app.use(passport.session());
    await registerRoutes(app);
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    (storage.findUserByUsername as jest.Mock).mockResolvedValue(null);
    (storage.createUser as jest.Mock).mockResolvedValue({ id: '1', username: 'testuser', hashedPassword: 'hashed_password123' });

    // Create a new app instance for this test to apply specific middleware
    const testApp = express();
    testApp.use(express.json());
    testApp.use(session({
      secret: 'testsecret',
      resave: false,
      saveUninitialized: false,
    }));
    testApp.use(passport.initialize());
    testApp.use(passport.session());
    // Custom middleware to mock req.login
    testApp.use((req: any, res: any, next: any) => {
      req.login = jest.fn((user, cb) => cb());
      next();
    });
    await registerRoutes(testApp);

    const res = await request(testApp)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'password123' });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual({ id: '1', username: 'testuser' });
    expect(storage.findUserByUsername).toHaveBeenCalledWith('testuser');
    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    expect(storage.createUser).toHaveBeenCalledWith({ username: 'testuser', hashedPassword: 'hashed_password123' });
  });

  it('should return 409 if username already exists', async () => {
    (storage.findUserByUsername as jest.Mock).mockResolvedValue({ id: '1', username: 'testuser', hashedPassword: 'hashed_password' });

    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser', password: 'password123' });

    expect(res.statusCode).toEqual(409);
    expect(res.body).toEqual({ message: 'Username already exists.' });
  });

  it('should return 400 if username or password are missing', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ username: 'testuser' });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toEqual({ message: 'Username and password are required.' });
  });

  it('should log in a user successfully', async () => {
    (passport.authenticate as jest.Mock).mockImplementationOnce((strategy, options, callback) => (req: any, res: any, next: any) => {
      req.login = jest.fn((user, cb) => cb());
      req.user = { id: '1', username: 'testuser' }; // Mock req.user
      next();
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testuser', password: 'password123' });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ id: '1', username: 'testuser' });
  });

  it('should return authenticated user info for /api/auth/me', async () => {
    const testApp = express();
    testApp.use(express.json());
    testApp.use(session({
      secret: 'testsecret',
      resave: false,
      saveUninitialized: false,
    }));
    testApp.use(passport.initialize());
    testApp.use(passport.session());
    // Custom middleware to mock req.isAuthenticated and req.user
    testApp.use((req: any, res: any, next: any) => {
      req.isAuthenticated = () => true;
      req.user = { id: '1', username: 'testuser' };
      next();
    });
    await registerRoutes(testApp);

    const res = await request(testApp).get('/api/auth/me');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ id: '1', username: 'testuser' });
  });

  it('should return 401 for unauthenticated user for /api/auth/me', async () => {
    const testApp = express();
    testApp.use(express.json());
    testApp.use(session({
      secret: 'testsecret',
      resave: false,
      saveUninitialized: false,
    }));
    testApp.use(passport.initialize());
    testApp.use(passport.session());
    // Custom middleware to mock req.isAuthenticated
    testApp.use((req: any, res: any, next: any) => {
      req.isAuthenticated = () => false;
      next();
    });
    await registerRoutes(testApp);

    const res = await request(testApp).get('/api/auth/me');

    expect(res.statusCode).toEqual(401);
    expect(res.body).toEqual({ message: 'Not authenticated.' });
  });

  it('should log out a user successfully', async () => {
    const testApp = express();
    testApp.use(express.json());
    testApp.use(session({
      secret: 'testsecret',
      resave: false,
      saveUninitialized: false,
    }));
    testApp.use(passport.initialize());
    testApp.use(passport.session());
    // Custom middleware to mock req.logout and req.session.destroy
    testApp.use((req: any, res: any, next: any) => {
      req.logout = jest.fn((cb: any) => { setTimeout(() => cb(null), 1); });
      req.session = { destroy: jest.fn((cb: any) => { setTimeout(() => cb(null), 1); }), touch: jest.fn(), save: jest.fn((cb: any) => cb()), cookie: { secure: false } };
      next();
    });
    await registerRoutes(testApp);

    const res = await request(testApp).post('/api/auth/logout');

    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ message: 'Logged out successfully.' });
    // expect(passport.authenticate).toHaveBeenCalled(); // Ensure authenticate was called for logout
  });
});