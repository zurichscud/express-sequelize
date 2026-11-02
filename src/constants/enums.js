/**
 * 数据库枚举字段统一使用 TINYINT 存储
 * 接口请求与响应同样使用这里的数字编码
 */

// 文章状态
const ARTICLE_STATUS = Object.freeze({
  DRAFT: 0,
  PUBLISHED: 1
});
const ARTICLE_STATUSES = Object.freeze([ARTICLE_STATUS.DRAFT, ARTICLE_STATUS.PUBLISHED]);

// 用户性别
const USER_SEX = Object.freeze({
  UNKNOWN: 0,
  MALE: 1,
  FEMALE: 2
});
const USER_SEXES = Object.freeze([USER_SEX.UNKNOWN, USER_SEX.MALE, USER_SEX.FEMALE]);

// 系统用户角色
const USER_ROLE = Object.freeze({
  USER: 0,
  ADMIN: 1
});
const USER_ROLES = Object.freeze([USER_ROLE.USER, USER_ROLE.ADMIN]);

// 附件类型
const ATTACHMENT_TYPE = Object.freeze({
  IMAGE: 0,
  VIDEO: 1
});
const ATTACHMENT_TYPES = Object.freeze([ATTACHMENT_TYPE.IMAGE, ATTACHMENT_TYPE.VIDEO]);

module.exports = {
  ARTICLE_STATUS,
  ARTICLE_STATUSES,
  USER_SEX,
  USER_SEXES,
  USER_ROLE,
  USER_ROLES,
  ATTACHMENT_TYPE,
  ATTACHMENT_TYPES
};
