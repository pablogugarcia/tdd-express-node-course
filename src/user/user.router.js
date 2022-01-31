const router = require('express').Router();
const UserService = require('./UserService');

const validateUsername = (req, res, next) => {
  const user = req.body;
  if (!user.username) {
    req.validationErrors = {
      ...req.validationErrors,
      username: 'username cannot be null',
    };
  }
  next();
};

const validateEmail = (req, res, next) => {
  const user = req.body;
  if (!user.email) {
    req.validationErrors = {
      ...req.validationErrors,
      email: 'E-mail cannot be null',
    };
  }
  next();
};

router.post('/api/1.0/users', validateUsername, validateEmail, async (req, res) => {
  if (req.validationErrors) {
    return res.status(400).json({
      validationErrors: req.validationErrors,
    });
  }
  await UserService.save(req.body);
  res.send({ message: 'User created' });
});

module.exports = router;
