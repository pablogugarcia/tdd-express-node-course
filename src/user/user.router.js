const router = require('express').Router();
const UserService = require('./UserService');

router.post('/api/1.0/users', async (req, res) => {
  await UserService.save(req.body);
  res.send({ message: 'User created' });
});

module.exports = router;
