const { z } = require('zod');
const {
  bodyObject,
  idParam,
  idValue,
  optionalIdValue,
  queryId
} = require('./common');

// 课程点赞支持路径参数、请求体 course_id、查询参数 course_id 三种来源
const likeCourseIdParamsSchema = z.object({ courseId: idParam('课程') });
const likeCourseBodySchema = bodyObject({ course_id: idValue('课程') });
const optionalLikeCourseBodySchema = bodyObject({ course_id: optionalIdValue('课程') });
const optionalLikeCourseQuerySchema = z.object({ course_id: queryId('课程') });

module.exports = {
  likeCourseIdParamsSchema,
  likeCourseBodySchema,
  optionalLikeCourseBodySchema,
  optionalLikeCourseQuerySchema
};
