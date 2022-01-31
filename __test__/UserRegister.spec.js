const request = require('supertest');
const app = require('../src/app');
const sequelize = require('../src/config/database');
const User = require('../src/user/User');

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true, cascade: true });
});

const postUser = ({ username = 'user1', email = 'user1@mail.com', password = 'Password' } = {}) => {
  return request(app).post('/api/1.0/users').send({
    username,
    email,
    password,
  });
};

describe('User registry', () => {
  it('returns 200 ok when signup request is valid', async () => {
    const response = await postUser();
    expect(response.status).toBe(200);
  });

  it('returns success message when signup request is valid', async () => {
    const response = await postUser();
    expect(response.body.message).toBe('User created');
  });

  it('saves the user to database', async () => {
    await postUser();
    const users = await User.findAll();
    expect(users.length).toBe(1);
  });

  it('saves the user to database', async () => {
    await postUser();
    const users = await User.findAll();
    expect(users.length).toBe(1);
  });

  it('saves the email and username into database', async () => {
    await postUser();
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.username).toBe('user1');
    expect(savedUser.email).toBe('user1@mail.com');
  });

  it('hashes the password of the user', async () => {
    await postUser();
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.password).not.toBe('Password');
  });

  it('returns status 400 if the username is null', async () => {
    const response = await postUser({ username: null });
    expect(response.status).toBe(400);
  });

  it('returns validationErrors field in response body when validation error happens', async () => {
    const response = await postUser({ username: null });
    expect(response.body.validationErrors).not.toBeUndefined();
  });

  it('returns username cannot be null when username is null', async () => {
    const response = await postUser({ username: null });
    expect(response.body.validationErrors.username).toBe('username cannot be null');
  });

  it('returns E-mail cannot be null when email is null', async () => {
    const response = await postUser({ email: null });
    expect(response.body.validationErrors.email).toBe('E-mail cannot be null');
  });

  it('returns both errors if username and email are null', async () => {
    const response = await postUser({ email: null, username: null });
    expect(Object.keys(response.body.validationErrors)).toEqual(['username', 'email']);
  });
});
