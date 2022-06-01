const router = require('express').Router();
const UserService = require('./UserService');
const { check, validationResult } = require('express-validator');
const ValidationException = require('../error/ValidationException');
const UserNotFoundException = require('./UserNotFoundException');

router.post(
  '/api/1.0/users',
  check('username')
    .notEmpty()
    .withMessage('usernameNull')
    .bail()
    .isLength({ max: 32, min: 4 })
    .withMessage('usernameLength'),
  check('email')
    .notEmpty()
    .withMessage('emailNull')
    .bail()
    .isEmail()
    .withMessage('emailInvalid')
    .bail()
    .custom(async (email) => {
      const user = await UserService.findByEmail(email);
      if (user) {
        throw new Error('emailInUser');
      }
    }),
  check('password')
    .notEmpty()
    .withMessage('passwordNull')
    .bail()
    .isLength({ min: 6 })
    .withMessage('passwordLength')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)
    .withMessage('passwordPattern'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(new ValidationException(errors.array()));
    }

    try {
      await UserService.save(req.body);
      res.send({ message: 'User created' });
    } catch (error) {
      // npres.status(502).send({ message: req.t(error.message) });
      next({ message: error.message, status: 502 });
    }
  }
);

router.post('/api/1.0/users/token/:token', async (req, res, next) => {
  const token = req.params.token;
  try {
    await UserService.activate(token);
    res.send({ message: 'User confirmed' });
  } catch (error) {
    return next({ message: error.message, status: 400 });
  }
});

router.get('/api/1.0/users', async (req, res) => {
  let page = req.query.page ? Number.parseInt(req.query.page) : 0;
  if (page < 0) {
    page = 0;
  }
  const users = await UserService.getUsers(page);
  res.send(users);
});

router.get('/api/1.0/users/:id', async (req, res, next) => {
  try {
    const user = await UserService.getUser(req.params.id);
    res.send(user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
