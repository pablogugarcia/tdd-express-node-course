const router = require('express').Router();
const UserService = require('./UserService');
const { check, validationResult } = require('express-validator');

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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const validationErrors = {};
      errors.array().forEach((error) => {
        validationErrors[error.param] = req.t(error.msg);
      });
      return res.status(400).json({ validationErrors });
    }

    try {
      await UserService.save(req.body);
      res.send({ message: 'User created' });
    } catch (error) {
      res.status(502).send({message: req.t(error.message)});
    }
  }
);

module.exports = router;
