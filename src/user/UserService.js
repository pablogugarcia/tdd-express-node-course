const User = require('./User');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { sendEmailActivation } = require('../email/EmailService');

const generateToken = (len) => {
  return crypto.randomBytes(len).toString('hex').substring(0, len);
};

const save = async (body) => {
  const { username, email, password } = body;
  const hash = await bcrypt.hash(password, 10);
  const user = { username, email, password: hash, activationToken: generateToken(16) };
  await User.create(user);

  await sendEmailActivation(email, user.activationToken);
};

const findByEmail = (email) => {
  return User.findOne({ where: { email } });
};

module.exports = { save, findByEmail };
