const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { signup, login } = require('../src/controllers/authController');
const User = require('../src/models/User');

jest.mock('bcryptjs'); // Mock bcrypt
jest.mock('jsonwebtoken'); // Mock jwt
jest.mock('../src/models/User'); // Mock the User model

describe('authController - signup', () => {
  it('should create a new user with hashed password', async () => {
    const req = {
      body: {
        username: 'testuser',
        password: 'testpassword',
      },
    };

    const hashedPassword = 'hashedPassword';
    bcrypt.hash.mockResolvedValue(hashedPassword);

    const newUser = { _id: 'userid', username: 'testuser', password: hashedPassword };
    User.create.mockResolvedValue(newUser);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await signup(req, res);

    expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 10);
    expect(User.create).toHaveBeenCalledWith({ username: req.body.username, password: hashedPassword });
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: 'User created successfully', data: newUser });
  });

  it('should handle errors during user creation', async () => {
    const req = {
      body: {
        username: 'testuser',
        password: 'testpassword',
      },
    };

    const errorMessage = 'User creation failed';
    bcrypt.hash.mockRejectedValue(new Error(errorMessage));

    const next = jest.fn();

    await signup(req, {}, next);

    expect(bcrypt.hash).toHaveBeenCalledWith(req.body.password, 10);
    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });
});

describe('authController - login', () => {
  it('should return a JWT token on successful login', async () => {
    const req = {
      body: {
        username: 'testuser',
        password: 'testpassword',
      },
    };

    const user = { _id: 'userid', username: 'testuser', password: 'hashedPassword' };
    User.findOne.mockResolvedValue(user);

    bcrypt.compare.mockResolvedValue(true);

    const token = 'generatedToken';
    jwt.sign.mockReturnValue(token);

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ username: req.body.username });
    expect(bcrypt.compare).toHaveBeenCalledWith(req.body.password, user.password);
    expect(jwt.sign).toHaveBeenCalledWith({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: 'Login successful', token });
  });

  it('should handle invalid username or password during login', async () => {
    const req = {
      body: {
        username: 'testuser',
        password: 'testpassword',
      },
    };

    User.findOne.mockResolvedValue(null); // User not found

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await login(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ username: req.body.username });
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'Invalid username or password' });
  });

  it('should handle errors during login', async () => {
    const req = {
      body: {
        username: 'testuser',
        password: 'testpassword',
      },
    };

    const errorMessage = 'Login failed';
    User.findOne.mockRejectedValue(new Error(errorMessage));

    const next = jest.fn();

    await login(req, {}, next);

    expect(User.findOne).toHaveBeenCalledWith({ username: req.body.username });
    expect(next).toHaveBeenCalledWith(new Error(errorMessage));
  });
});
