const { Router } = require('express');
const {
  listCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse
} = require('../../controllers/admin/course.controller');
const { validate } = require('../../middlewares/validate.middleware');
const { pagination } = require('../../middlewares/pagination.middleware');
const {
  courseIdParamsSchema,
  adminListCoursesQuerySchema,
  createCourseBodySchema,
  updateCourseBodySchema
} = require('../../validators/course.validator');

const router = Router();

router.get(
  '/',
  pagination(),
  validate({ query: adminListCoursesQuerySchema }),
  listCourses
);
router.post('/', validate({ body: createCourseBodySchema }), createCourse);
router.get('/:id', validate({ params: courseIdParamsSchema }), getCourse);
router.put(
  '/:id',
  validate({ params: courseIdParamsSchema, body: updateCourseBodySchema }),
  updateCourse
);
router.delete('/:id', validate({ params: courseIdParamsSchema }), deleteCourse);

module.exports = router;
