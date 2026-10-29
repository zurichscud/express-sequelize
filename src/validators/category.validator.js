const { z } = require('zod');
const {
  bodyObject,
  requireAtLeastOneField,
  idParam,
  requiredString,
  optionalNonEmptyString,
  optionalInt
} = require('./common');

const categoryIdParamsSchema = z.object({ id: idParam('分类') });

const createCategoryBodySchema = bodyObject({
  name: requiredString('分类名称', 64),
  rank: optionalInt('排序序号')
});

const updateCategoryBodySchema = requireAtLeastOneField(
  bodyObject({
    name: optionalNonEmptyString('分类名称', 64),
    rank: optionalInt('排序序号')
  })
);

module.exports = {
  categoryIdParamsSchema,
  createCategoryBodySchema,
  updateCategoryBodySchema
};
