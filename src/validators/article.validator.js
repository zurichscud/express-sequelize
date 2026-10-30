const { z } = require("zod");
const {
  bodyObject,
  requireAtLeastOneField,
  idParam,
  queryText,
  queryEnum,
  requiredString,
  optionalString,
  optionalNonEmptyString,
} = require("./common");

const STATUSES = ["draft", "published"];
const STATUS_MESSAGE = "状态只能是 draft 或 published";

const articleIdParamsSchema = z.object({ id: idParam("文章") });

const adminListArticlesQuerySchema = z.object({
  title: queryText("标题关键词", 200),
  keyword: queryText("搜索关键词", 200),
  status: queryEnum(STATUSES, STATUS_MESSAGE),
});

const webListArticlesQuerySchema = z.object({
  keyword: queryText("搜索关键词", 200),
  sort: queryEnum(["latest", "hot", "views"], "排序方式无效"),
});

const createArticleBodySchema = bodyObject({
  title: requiredString("标题", 200),
  content: requiredString("正文"),
  summary: optionalString("摘要", 500),
  author: optionalString("作者", 64),
  status: z.enum(STATUSES, { error: STATUS_MESSAGE }).optional(),
});

const updateArticleBodySchema = requireAtLeastOneField(
  bodyObject({
    title: optionalNonEmptyString("标题", 200),
    content: optionalNonEmptyString("正文"),
    summary: optionalString("摘要", 500),
    author: optionalString("作者", 64),
    status: z.enum(STATUSES, { error: STATUS_MESSAGE }).optional(),
  }),
);

module.exports = {
  articleIdParamsSchema,
  adminListArticlesQuerySchema,
  webListArticlesQuerySchema,
  createArticleBodySchema,
  updateArticleBodySchema,
};
