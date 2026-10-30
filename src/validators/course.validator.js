const { z } = require('zod');
const {
  bodyObject,
  requireAtLeastOneField,
  idParam,
  idValue,
  optionalIdValue,
  queryId,
  queryText,
  queryEnum,
  requiredString,
  optionalString,
  optionalNonEmptyString,
  optionalInt,
  optionalBoolean
} = require('./common');

const RECOMMEND_MESSAGE = '是否推荐只能是 true 或 false';

const courseIdParamsSchema = z.object({ id: idParam('课程') });

const adminListCoursesQuerySchema = z.object({
  categoryId: queryId('分类'),
  userId: queryId('用户'),
  isRecommended: queryEnum(['true', 'false', '1', '0'], RECOMMEND_MESSAGE),
  keyword: queryText('搜索关键词', 200)
});

const webListCoursesQuerySchema = z.object({
  categoryId: queryId('分类'),
  isRecommended: queryEnum(['true', 'false', '1', '0'], RECOMMEND_MESSAGE),
  keyword: queryText('搜索关键词', 200)
});

const createCourseBodySchema = bodyObject({
  categoryId: idValue('分类'),
  userId: idValue('用户'),
  name: requiredString('课程名称', 128),
  image: optionalString('封面图片', 500),
  isRecommended: optionalBoolean('是否推荐'),
  content: optionalString('课程内容'),
  likeCount: optionalInt('点赞数', { min: 0 })
});

// userId 创建后不可变更，chapterCount 由章节接口维护，二者都会被 schema 丢弃
const updateCourseBodySchema = requireAtLeastOneField(
  bodyObject({
    categoryId: optionalIdValue('分类'),
    name: optionalNonEmptyString('课程名称', 128),
    image: optionalString('封面图片', 500),
    isRecommended: optionalBoolean('是否推荐'),
    content: optionalString('课程内容'),
    likeCount: optionalInt('点赞数', { min: 0 })
  })
);

module.exports = {
  courseIdParamsSchema,
  adminListCoursesQuerySchema,
  webListCoursesQuerySchema,
  createCourseBodySchema,
  updateCourseBodySchema
};
