const { z } = require("zod");

// 查询字符串里的空值统一按“未传”处理，避免 ?courseId= 被当成 0
const emptyToUndefined = (value) =>
  value === "" || value === null ? undefined : value;

/**
 * 请求体必须是 JSON 对象；未传请求体时按空对象处理，
 * 这样创建/更新接口仍能给出字段级的中文提示
 * @param {Record<string, import('zod').ZodType>} shape
 */
function bodyObject(shape) {
  return z.preprocess(
    (value) => (value === undefined || value === null ? {} : value),
    z.object(shape, { error: "请求体格式不正确" }),
  );
}

/**
 * 更新接口要求至少提交一个可修改字段
 * zod 会自动丢弃白名单之外的字段，因此只提交只读字段时这里会命中
 * @param {import('zod').ZodType} schema
 * @param {string} [message]
 */
function requireAtLeastOneField(schema, message = "没有需要更新的字段") {
  return schema.refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    {
      message,
    },
  );
}

/**
 * 路径参数中的正整数 ID，如 /articles/:id
 * @param {string} label 资源名称，用于拼接错误提示
 */
function idParam(label) {
  return z.preprocess(
    emptyToUndefined,
    z.coerce
      .number({ error: `${label} ID 无效` })
      .int(`${label} ID 无效`)
      .positive(`${label} ID 无效`),
  );
}

/**
 * 请求体中的正整数 ID（必填）
 * @param {string} label
 */
function idValue(label) {
  return z.coerce
    .number({ error: `${label} ID 无效` })
    .int(`${label} ID 无效`)
    .positive(`${label} ID 无效`);
}

/**
 * 请求体中的正整数 ID（选填）
 * @param {string} label
 */
function optionalIdValue(label) {
  return z.preprocess(
    (value) => (value === null ? undefined : value),
    idValue(label).optional(),
  );
}

/**
 * 查询参数中的正整数 ID（选填）
 * @param {string} label
 */
function queryId(label) {
  return z.preprocess(emptyToUndefined, idValue(label).optional());
}

/**
 * 查询参数中的字符串：去首尾空格，空串视为未传
 * @param {string} label
 * @param {number} [max]
 */
function queryText(label, max = 100) {
  return z.preprocess(
    emptyToUndefined,
    z
      .string({ error: `${label}格式不正确` })
      .trim()
      .max(max, `${label}长度不能超过 ${max} 个字符`)
      .optional(),
  );
}

/**
 * 查询参数中的枚举值，空串视为未传
 * 解决的是 ?status=&title=xxx ===> status: "" 的问题，避免被当成默认值
 * @param {string[]} values
 * @param {string} message
 */
function queryEnum(values, message) {
  return z.preprocess(
    emptyToUndefined,
    z.enum(values, { error: message }).optional(),
  );
}

/**
 * 请求体必填字符串：去首尾空格后不能为空
 * @param {string} label
 * @param {number} [max]
 */
function requiredString(label, max) {
  const schema = z
    .string({ error: `${label}格式不正确` })
    .trim()
    .min(1, `${label}不能为空`);

  return z.preprocess(
    (value) => (value === undefined || value === null ? "" : value),
    max ? schema.max(max, `${label}长度不能超过 ${max} 个字符`) : schema,
  );
}

/**
 * 请求体选填字符串：允许空字符串（用于清空字段）
 * @param {string} label
 * @param {number} [max]
 */
function optionalString(label, max) {
  const schema = z.string({ error: `${label}格式不正确` }).trim();
  return z.preprocess(
    (value) => (value === null ? undefined : value),
    (max
      ? schema.max(max, `${label}长度不能超过 ${max} 个字符`)
      : schema
    ).optional(),
  );
}

/**
 * 请求体选填字符串：不传可以，传了就不能是空串
 * @param {string} label
 * @param {number} [max]
 */
function optionalNonEmptyString(label, max) {
  const schema = z
    .string({ error: `${label}格式不正确` })
    .trim()
    .min(1, `${label}不能为空`);

  return z.preprocess(
    (value) => (value === null ? undefined : value),
    (max
      ? schema.max(max, `${label}长度不能超过 ${max} 个字符`)
      : schema
    ).optional(),
  );
}

/**
 * 请求体选填整数
 * @param {string} label
 * @param {{ min?: number, max?: number }} [options]
 */
function optionalInt(label, { min, max } = {}) {
  let schema = z.coerce
    .number({ error: `${label}必须是整数` })
    .int(`${label}必须是整数`);

  if (min !== undefined) {
    schema = schema.min(
      min,
      min === 0 ? `${label}必须是不小于 0 的整数` : `${label}不能小于 ${min}`,
    );
  }
  if (max !== undefined) {
    schema = schema.max(max, `${label}不能大于 ${max}`);
  }

  return z.preprocess(
    (value) => (value === null ? undefined : value),
    schema.optional(),
  );
}

/**
 * 请求体选填布尔值，兼容 true / 'true' / 1 / '1' 等入参
 * @param {string} label
 */
function optionalBoolean(label) {
  return z.preprocess(
    (value) => {
      if (value === null) return undefined;
      if (value === true || value === "true" || value === 1 || value === "1")
        return true;
      if (value === false || value === "false" || value === 0 || value === "0")
        return false;
      return value;
    },
    z.boolean({ error: `${label}格式不正确` }).optional(),
  );
}

module.exports = {
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
  optionalBoolean,
};
