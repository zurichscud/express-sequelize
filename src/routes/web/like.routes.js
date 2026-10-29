const { Router } = require('express');
const {
  likeCourse,
  unlikeCourse,
  getLikeStatus,
  listLikedCourses
} = require('../../controllers/web/like.controller');
const { authenticateWeb } = require('../../middlewares/auth.middleware');
const { validate } = require('../../middlewares/validate.middleware');
const { pagination } = require('../../middlewares/pagination.middleware');
const {
  likeCourseIdParamsSchema,
  likeCourseBodySchema,
  optionalLikeCourseBodySchema,
  optionalLikeCourseQuerySchema
} = require('../../validators/like.validator');

const router = Router();

// 点赞相关接口都需要前台登录态
router.use(authenticateWeb);

router.get('/', pagination({ maxPageSize: 50 }), listLikedCourses);
router.post('/', validate({ body: likeCourseBodySchema }), likeCourse);
router.delete(
  '/',
  validate({ body: optionalLikeCourseBodySchema, query: optionalLikeCourseQuerySchema }),
  unlikeCourse
);
router.get('/status', validate({ query: optionalLikeCourseQuerySchema }), getLikeStatus);
router.get('/:courseId', validate({ params: likeCourseIdParamsSchema }), getLikeStatus);
router.delete('/:courseId', validate({ params: likeCourseIdParamsSchema }), unlikeCourse);

module.exports = router;
