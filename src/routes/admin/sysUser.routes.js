const { Router } = require('express');
const {
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
} = require('../../controllers/admin/sysUser.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { pagination } = require('../../middlewares/pagination.middleware');
const {
  userIdParamsSchema,
  sysUserListQuerySchema,
  sysUserCreateBodySchema,
  sysUserUpdateBodySchema
} = require('../../validators/user.validator');

const router = Router();

router.get(
  '/',
  pagination(),
  validate({ query: sysUserListQuerySchema }),
  listUsers
);
router.post('/', validate({ body: sysUserCreateBodySchema }), createUser);
router.get('/:id', validate({ params: userIdParamsSchema }), getUser);
router.put(
  '/:id',
  validate({ params: userIdParamsSchema, body: sysUserUpdateBodySchema }),
  updateUser
);
router.delete('/:id', validate({ params: userIdParamsSchema }), deleteUser);

module.exports = router;
