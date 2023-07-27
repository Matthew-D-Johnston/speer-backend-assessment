const request = require('supertest');
const app = require('../src/app'); // Assuming your Express app is exported from app.js

describe('Integration tests for authRoutes', () => {
  let token; // To store the JWT token for authenticated requests

  it('should create a new user on /signup POST', async () => {
    const newUser = {
      username: 'testuser',
      password: 'testpassword',
    };

    const response = await request(app).post('/api/auth/signup').send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe('User created successfully');
    expect(response.body.data).toHaveProperty('_id');
    expect(response.body.data.username).toBe(newUser.username);
  });

  it('should return a JWT token on successful /login POST', async () => {
    const credentials = {
      username: 'testuser',
      password: 'testpassword',
    };

    const response = await request(app).post('/api/auth/login').send(credentials);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Login successful');
    expect(response.body.token).toBeDefined();
    token = response.body.token; // Store the token for authenticated requests
  });

  it('should handle invalid credentials on /login POST', async () => {
    const invalidCredentials = {
      username: 'invaliduser',
      password: 'invalidpassword',
    };

    const response = await request(app).post('/api/auth/login').send(invalidCredentials);

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Invalid username or password');
  });

  it('should be able to access authenticated route on /test-authenticated GET', async () => {
    const response = await request(app)
      .get('/api/test-authenticated')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Authenticated route accessed successfully');
  });

  it('should not be able to access authenticated route without token on /test-authenticated GET', async () => {
    const response = await request(app).get('/api/test-authenticated');

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Authentication required');
  });
});
