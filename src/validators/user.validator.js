const { z } = require('zod');
const {
  idParam,
  queryText,
  queryEnum,
  optionalString,
  bodyObject,
  requireAtLeastOneField
} = require('./common');

const SEXES = ['unknown', 'male', 'female'];
const ROLES = ['user', 'admin'];

const PASSWORD_MESSAGE = '密码长度需在 6-72 位之间';

/** 必填邮箱：去首尾空格，入库前与模型保持一致地转小写 */
function emailField() {
  return z.preprocess(
    (value) => (value === undefined || value === null ? '' : value),
    z
      .string({ error: '邮箱格式不正确' })
      .trim()
      .min(1, '邮箱不能为空')
      .max(128, '邮箱长度不能超过 128 个字符')
      .email('邮箱格式不正确')
      .transform((value) => value.toLowerCase())
  );
}

/** 选填邮箱：传了就不能为空 */
function optionalEmailField() {
  return z.preprocess(
    (value) => (value === null ? undefined : value),
    z
      .string({ error: '邮箱格式不正确' })
      .trim()
      .min(1, '邮箱不能为空')
      .max(128, '邮箱长度不能超过 128 个字符')
      .email('邮箱格式不正确')
      .transform((value) => value.toLowerCase())
      .optional()
  );
}

/** 必填密码：只校验明文格式，哈希由模型钩子完成 */
function passwordField() {
  return z.preprocess(
    (value) => (value === undefined || value === null ? '' : value),
    z
      .string({ error: '密码格式不正确' })
      .min(1, '密码不能为空')
      .min(6, PASSWORD_MESSAGE)
      .max(72, PASSWORD_MESSAGE)
  );
}

/** 选填密码：更新用户时不传则保持原密码 */
function optionalPasswordField() {
  return z.preprocess(
    (value) => (value === null ? undefined : value),
    z
      .string({ error: '密码格式不正确' })
      .min(6, PASSWORD_MESSAGE)
      .max(72, PASSWORD_MESSAGE)
      .optional()
  );
}

/** 必填用户名 */
function usernameField() {
  return z.preprocess(
    (value) => (value === undefined || value === null ? '' : value),
    z
      .string({ error: '用户名格式不正确' })
      .trim()
      .min(1, '用户名不能为空')
      .max(64, '用户名长度不能超过 64 个字符')
      .regex(/^[A-Za-z0-9_-]+$/, '用户名只能包含字母、数字、下划线和短横线')
  );
}

/** 选填用户名：传了就不能为空 */
function optionalUsernameField() {
  return z.preprocess(
    (value) => (value === null ? undefined : value),
    z
      .string({ error: '用户名格式不正确' })
      .trim()
      .min(1, '用户名不能为空')
      .max(64, '用户名长度不能超过 64 个字符')
      .regex(/^[A-Za-z0-9_-]+$/, '用户名只能包含字母、数字、下划线和短横线')
      .optional()
  );
}

function sexField() {
  return z.preprocess(
    (value) => (value === null ? undefined : value),
    z.enum(SEXES, { error: '性别只能是 unknown、male 或 female' }).optional()
  );
}

function roleField() {
  return z.preprocess(
    (value) => (value === null ? undefined : value),
    z.enum(ROLES, { error: '角色只能是 user 或 admin' }).optional()
  );
}

// 前台用户没有角色字段，zod 会自动丢弃 role 等白名单之外的字段
const createUserShape = {
  email: emailField(),
  password: passwordField(),
  username: usernameField(),
  nickname: optionalString('昵称', 64),
  sex: sexField()
};

const updateUserShape = {
  email: optionalEmailField(),
  password: optionalPasswordField(),
  username: optionalUsernameField(),
  nickname: optionalString('昵称', 64),
  sex: sexField()
};

const userIdParamsSchema = z.object({ id: idParam('用户') });

const appUserListQuerySchema = z.object({
  keyword: queryText('搜索关键词', 200),
  sex: queryEnum(SEXES, '性别只能是 unknown、male 或 female')
});

const sysUserListQuerySchema = z.object({
  keyword: queryText('搜索关键词', 200),
  sex: queryEnum(SEXES, '性别只能是 unknown、male 或 female'),
  role: queryEnum(ROLES, '角色只能是 user 或 admin')
});

const appUserCreateBodySchema = bodyObject(createUserShape);
const appUserUpdateBodySchema = requireAtLeastOneField(bodyObject(updateUserShape));

const sysUserCreateBodySchema = bodyObject({ ...createUserShape, role: roleField() });
const sysUserUpdateBodySchema = requireAtLeastOneField(
  bodyObject({ ...updateUserShape, role: roleField() })
);

// 注册只允许提交普通用户资料，role 不在 schema 内会被自动丢弃
const registerBodySchema = bodyObject(createUserShape);

/**
 * 登录请求体：账号兼容 account / email / username 三种字段名
 * 解析后统一成 { account, password }，控制器无需再判空
 */
const loginBodySchema = bodyObject({
  account: z.string({ error: '请输入邮箱或用户名' }).trim().optional(),
  email: z.string({ error: '请输入邮箱或用户名' }).trim().optional(),
  username: z.string({ error: '请输入邮箱或用户名' }).trim().optional(),
  password: z.string({ error: '请输入密码' }).optional()
})
  .transform(({ account, email, username, password }) => ({
    account: account ?? email ?? username ?? '',
    password: password ?? ''
  }))
  .refine((data) => data.account.length > 0, { message: '请输入邮箱或用户名' })
  .refine((data) => data.password.length > 0, { message: '请输入密码' });

const profileUpdateBodySchema = requireAtLeastOneField(
  bodyObject({
    nickname: optionalString('昵称', 64),
    sex: sexField()
  })
);

const changePasswordBodySchema = bodyObject({
  oldPassword: z.preprocess(
    (value) => (value === undefined || value === null ? '' : value),
    z.string({ error: '请输入原密码' }).min(1, '请输入原密码')
  ),
  newPassword: z.preprocess(
    (value) => (value === undefined || value === null ? '' : value),
    z
      .string({ error: '请输入新密码' })
      .min(1, '请输入新密码')
      .min(6, PASSWORD_MESSAGE)
      .max(72, PASSWORD_MESSAGE)
  )
});

module.exports = {
  SEXES,
  ROLES,
  loginBodySchema,
  registerBodySchema,
  profileUpdateBodySchema,
  changePasswordBodySchema,
  userIdParamsSchema,
  appUserListQuerySchema,
  appUserCreateBodySchema,
  appUserUpdateBodySchema,
  sysUserListQuerySchema,
  sysUserCreateBodySchema,
  sysUserUpdateBodySchema
};
