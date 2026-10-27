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

const router = Router();

// 注册、登录、退出登录公开
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// 个人资料与密码需要前台登录态
router.get('/me', authenticateWeb, getProfile);
router.get('/profile', authenticateWeb, getProfile);
router.put('/me', authenticateWeb, updateProfile);
router.put('/profile', authenticateWeb, updateProfile);
router.put('/password', authenticateWeb, changePassword);

module.exports = router;
