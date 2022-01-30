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

describe('User registry', () => {
  const postValidUser = () => {
    return request(app).post('/api/1.0/users').send({
      username: 'user1',
      email: 'user1@mail.com',
      password: 'Password',
    });
  };

  it('returns 200 ok when signup request is valid', async () => {
    const response = await postValidUser();
    expect(response.status).toBe(200);
  });

  it('returns success message when signup request is valid', async () => {
    const response = await postValidUser();
    expect(response.body.message).toBe('User created');
  });

  it('saves the user to database', async () => {
    await postValidUser();
    const users = await User.findAll();
    expect(users.length).toBe(1);
  });

  it('saves the user to database', async () => {
    await postValidUser();
    const users = await User.findAll();
    expect(users.length).toBe(1);
  });

  it('saves the email and username into database', async () => {
    await postValidUser();
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.username).toBe('user1');
    expect(savedUser.email).toBe('user1@mail.com');
  });

  it('hashes the password of the user', async () => {
    await postValidUser();
    const users = await User.findAll();
    const savedUser = users[0];
    expect(savedUser.password).not.toBe('Password');
  });
});
