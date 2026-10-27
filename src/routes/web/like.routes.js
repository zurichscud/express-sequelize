const { Router } = require('express');
const {
  likeCourse,
  unlikeCourse,
  getLikeStatus,
  listLikedCourses
} = require('../../controllers/web/like.controller');
const { authenticateWeb } = require('../../middlewares/auth.middleware');

const router = Router();

// 点赞相关接口都需要前台登录态
router.use(authenticateWeb);

router.get('/', listLikedCourses);
router.post('/', likeCourse);
router.delete('/', unlikeCourse);
router.get('/status', getLikeStatus);
router.get('/:courseId', getLikeStatus);
router.delete('/:courseId', unlikeCourse);

module.exports = router;
