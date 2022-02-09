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

const postUser = ({ username = 'user1', email = 'user1@mail.com', password = 'P4ssword' } = {}, options = {}) => {
  const agent = request(app).post('/api/1.0/users');

  if (options.language) {
    agent.set('Accept-Language', options.language);
  }

  return agent.send({
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

  const usernameNull = 'username cannot be null';
  const emailNull = 'E-mail cannot be null';
  const emailInvalid = 'E-mail is not valid';
  const passwordNull = 'Password cannot be null';
  const passwordLength = 'Password must be at least 6 characters';
  const passwordPattern = 'Password must have at least 1 uppercase, 1 lowercase letter and 1 number';
  const usernameLength = 'Must have min 4 and max 32 characters';
  const emailInUser = 'E-mail is already in use';

  it.each`
    field         | value             | expected
    ${'username'} | ${null}           | ${usernameNull}
    ${'username'} | ${'usr'}          | ${usernameLength}
    ${'username'} | ${'a'.repeat(33)} | ${usernameLength}
    ${'email'}    | ${null}           | ${emailNull}
    ${'email'}    | ${'fakeemail'}    | ${emailInvalid}
    ${'password'} | ${null}           | ${passwordNull}
    ${'password'} | ${'pass'}         | ${passwordLength}
    ${'password'} | ${'alllowercase'} | ${passwordPattern}
    ${'password'} | ${'ALLUPPERCASE'} | ${passwordPattern}
    ${'password'} | ${'1234567'}      | ${passwordPattern}
    ${'password'} | ${'lowerand123'}  | ${passwordPattern}
    ${'password'} | ${'UPPER1234'}    | ${passwordPattern}
  `('returns $expected when $field is $value', async ({ field, expected, value }) => {
    const response = await postUser({ [field]: value });
    expect(response.body.validationErrors[field]).toBe(expected);
  });

  it(`returns ${emailInUser} when email is already in use`, async () => {
    await User.create({ username: 'user1', email: 'user1@mail.com', password: 'P4ssword' });

    const response = await postUser();
    expect(response.body.validationErrors.email).toBe(emailInUser);
  });

  it('returns both email is in use and username cannot be null', async () => {
    await User.create({ username: 'user1', email: 'user1@mail.com', password: 'P4ssword' });
    const response = await postUser({ username: null });
    expect(Object.keys(response.body.validationErrors)).toEqual(['username', 'email']);
  });
});

describe('Internationalization', () => {
  const usernameNull = 'el nombre del usuario no puede estar vacio';
  const emailNull = 'E-mail no puede estar vacio';
  const emailInvalid = 'E-mail no es valido';
  const passwordNull = 'Contraseña no puede estar vacio';
  const passwordLength = 'Contraseña debe tener al menos 6 caracteres';
  const passwordPattern = 'Contraseña debe tener al menos 1 mayuscula, 1 minuscula y 1 numero';
  const usernameLength = 'El nombre de usuario debe tener entre 4 y 32 caracteres';
  const emailInUser = 'E-mail ya esta en uso';

  it.each`
    field         | value             | expected
    ${'username'} | ${null}           | ${usernameNull}
    ${'username'} | ${'usr'}          | ${usernameLength}
    ${'username'} | ${'a'.repeat(33)} | ${usernameLength}
    ${'email'}    | ${null}           | ${emailNull}
    ${'email'}    | ${'fakeemail'}    | ${emailInvalid}
    ${'password'} | ${null}           | ${passwordNull}
    ${'password'} | ${'pass'}         | ${passwordLength}
    ${'password'} | ${'alllowercase'} | ${passwordPattern}
    ${'password'} | ${'ALLUPPERCASE'} | ${passwordPattern}
    ${'password'} | ${'1234567'}      | ${passwordPattern}
    ${'password'} | ${'lowerand123'}  | ${passwordPattern}
    ${'password'} | ${'UPPER1234'}    | ${passwordPattern}
  `('returns $expected when $field is $value', async ({ field, expected, value }) => {
    const response = await postUser({ [field]: value }, { language: 'es' });
    expect(response.body.validationErrors[field]).toBe(expected);
  });

  it(`returns ${emailInUser} when email is already in use`, async () => {
    await User.create({ username: 'user1', email: 'user1@mail.com', password: 'P4ssword' });
    const response = await postUser(undefined, { language: 'es' });
    expect(response.body.validationErrors.email).toBe(emailInUser);
  });
});
