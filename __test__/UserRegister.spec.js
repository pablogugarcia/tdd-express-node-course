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

const postUser = ({ username = 'user1', email = 'user1@mail.com', password = 'P4ssword' } = {}) => {
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

  it('returns both errors if username and email are null', async () => {
    const response = await postUser({ email: null, username: null });
    expect(Object.keys(response.body.validationErrors)).toEqual(['username', 'email']);
  });

  it.each`
    field         | value             | expected
    ${'username'} | ${null}           | ${'username cannot be null'}
    ${'username'} | ${'usr'}          | ${'Must have min 4 and max 32 characters'}
    ${'username'} | ${'a'.repeat(33)} | ${'Must have min 4 and max 32 characters'}
    ${'email'}    | ${null}           | ${'E-mail cannot be null'}
    ${'email'}    | ${'fakeemail'}    | ${'E-mail is not valid'}
    ${'password'} | ${null}           | ${'Password cannot be null'}
    ${'password'} | ${'pass'}         | ${'Password must be at least 6 characters'}
    ${'password'} | ${'alllowercase'} | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'ALLUPPERCASE'} | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'1234567'}      | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'lowerand123'}  | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
    ${'password'} | ${'UPPER1234'}    | ${'Password must have at least 1 uppercase, 1 lowercase letter and 1 number'}
  `('returns $expected when $field is $value', async ({ field, expected, value }) => {
    const response = await postUser({ [field]: value });
    expect(response.body.validationErrors[field]).toBe(expected);
  });
});
