const User = require('./User');
const bcrypt = require('bcrypt');

const save = async (body) => {
  const { username, email, password } = body;
  const hash = await bcrypt.hash(password, 10);
  await User.create({ username, email, password: hash });
};

module.exports = { save };
