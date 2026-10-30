const { z } = require('zod');
const {
  bodyObject,
  idParam,
  idValue,
  optionalIdValue,
  queryId
} = require('./common');

// 课程点赞支持路径参数、请求体 courseId、查询参数 courseId 三种来源
const likeCourseIdParamsSchema = z.object({ courseId: idParam('课程') });
const likeCourseBodySchema = bodyObject({ courseId: idValue('课程') });
const optionalLikeCourseBodySchema = bodyObject({ courseId: optionalIdValue('课程') });
const optionalLikeCourseQuerySchema = z.object({ courseId: queryId('课程') });

module.exports = {
  likeCourseIdParamsSchema,
  likeCourseBodySchema,
  optionalLikeCourseBodySchema,
  optionalLikeCourseQuerySchema
};
