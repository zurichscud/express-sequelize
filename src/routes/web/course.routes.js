const { Router } = require('express');
const { listCourses, getCourse } = require('../../controllers/web/course.controller');
const {
  likeCourse,
  unlikeCourse,
  getLikeStatus
} = require('../../controllers/web/like.controller');
const { authenticateWeb } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { pagination } = require('../../middlewares/pagination.middleware');
const {
  courseIdParamsSchema,
  webListCoursesQuerySchema
} = require('../../validators/course.validator');
const { likeCourseIdParamsSchema } = require('../../validators/like.validator');

const router = Router();

router.get(
  '/',
  pagination({ defaultPageSize: 12, maxPageSize: 60 }),
  validate({ query: webListCoursesQuerySchema }),
  listCourses
);

// 课程点赞别名，便于前端按课程维度调用
router.get(
  '/:courseId/like',
  authenticateWeb,
  validate({ params: likeCourseIdParamsSchema }),
  getLikeStatus
);
router.post(
  '/:courseId/like',
  authenticateWeb,
  validate({ params: likeCourseIdParamsSchema }),
  likeCourse
);
router.delete(
  '/:courseId/like',
  authenticateWeb,
  validate({ params: likeCourseIdParamsSchema }),
  unlikeCourse
);

router.get('/:id', validate({ params: courseIdParamsSchema }), getCourse);

module.exports = router;
