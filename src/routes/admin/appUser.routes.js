const { Router } = require('express');
const {
  listUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser
} = require('../../controllers/admin/appUser.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { pagination } = require('../../middlewares/pagination.middleware');
const {
  userIdParamsSchema,
  appUserListQuerySchema,
  appUserCreateBodySchema,
  appUserUpdateBodySchema
} = require('../../validators/user.validator');

const router = Router();

router.get(
  '/',
  pagination(),
  validate({ query: appUserListQuerySchema }),
  listUsers
);
router.post('/', validate({ body: appUserCreateBodySchema }), createUser);
router.get('/:id', validate({ params: userIdParamsSchema }), getUser);
router.put(
  '/:id',
  validate({ params: userIdParamsSchema, body: appUserUpdateBodySchema }),
  updateUser
);
router.delete('/:id', validate({ params: userIdParamsSchema }), deleteUser);

module.exports = router;
