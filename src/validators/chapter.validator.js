const { z } = require('zod');
const {
  bodyObject,
  requireAtLeastOneField,
  idParam,
  idValue,
  optionalIdValue,
  queryId,
  queryText,
  requiredString,
  optionalString,
  optionalNonEmptyString,
  optionalInt
} = require('./common');

const chapterIdParamsSchema = z.object({ id: idParam('章节') });

const adminListChaptersQuerySchema = z.object({
  course_id: queryId('课程'),
  keyword: queryText('搜索关键词', 200)
});

const webListChaptersQuerySchema = z.object({
  course_id: queryId('课程'),
  keyword: queryText('搜索关键词', 200)
});

const createChapterBodySchema = bodyObject({
  course_id: idValue('课程'),
  title: requiredString('章节标题', 200),
  content: optionalString('章节内容'),
  video_url: optionalString('视频地址', 500),
  rank: optionalInt('排序序号')
});

const updateChapterBodySchema = requireAtLeastOneField(
  bodyObject({
    course_id: optionalIdValue('课程'),
    title: optionalNonEmptyString('章节标题', 200),
    content: optionalString('章节内容'),
    video_url: optionalString('视频地址', 500),
    rank: optionalInt('排序序号')
  })
);

module.exports = {
  chapterIdParamsSchema,
  adminListChaptersQuerySchema,
  webListChaptersQuerySchema,
  createChapterBodySchema,
  updateChapterBodySchema
};
