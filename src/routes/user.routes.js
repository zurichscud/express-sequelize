const { Router } = require('express');
const {
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
} = require('../controllers/user.controller');

const router = Router();

router.get('/', listUsers);
router.post('/', createUser);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;
