const { Router } = require('express');
const { listCourses, getCourse } = require('../../controllers/web/course.controller');
const {
  likeCourse,
  unlikeCourse,
  getLikeStatus
} = require('../../controllers/web/like.controller');
const { authenticateWeb } = require('../../middlewares/auth.middleware');

const router = Router();

router.get('/', listCourses);

// 课程点赞别名，便于前端按课程维度调用
router.get('/:courseId/like', authenticateWeb, getLikeStatus);
router.post('/:courseId/like', authenticateWeb, likeCourse);
router.delete('/:courseId/like', authenticateWeb, unlikeCourse);

router.get('/:id', getCourse);

module.exports = router;
