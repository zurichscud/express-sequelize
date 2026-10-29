const { Router } = require('express');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout
} = require('../../controllers/web/auth.controller');
const { authenticateWeb } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const {
  loginBodySchema,
  registerBodySchema,
  profileUpdateBodySchema,
  changePasswordBodySchema
} = require('../../validators/user.validator');

const router = Router();

// 注册、登录、退出登录公开
router.post('/register', validate({ body: registerBodySchema }), register);
router.post('/login', validate({ body: loginBodySchema }), login);
router.post('/logout', logout);

// 个人资料与密码需要前台登录态
router.get('/me', authenticateWeb, getProfile);
router.get('/profile', authenticateWeb, getProfile);
router.put(
  '/me',
  authenticateWeb,
  validate({ body: profileUpdateBodySchema }),
  updateProfile
);
router.put(
  '/profile',
  authenticateWeb,
  validate({ body: profileUpdateBodySchema }),
  updateProfile
);
router.put(
  '/password',
  authenticateWeb,
  validate({ body: changePasswordBodySchema }),
  changePassword
);

module.exports = router;
