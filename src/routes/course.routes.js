const { Router } = require('express');
const {
  listCourses,
  createCourse,
  getCourse,
  updateCourse,
  deleteCourse
} = require('../controllers/course.controller');

const router = Router();

router.get('/', listCourses);
router.post('/', createCourse);
router.get('/:id', getCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

module.exports = router;
