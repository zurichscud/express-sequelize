'use strict';

/**
 * 把枚举字段从 ENUM 改为 TINYINT，并转换已有数据。
 *
 * 编码约定：
 * - articles.status       0 草稿 / 1 已发布
 * - sys_users.sex         0 未知 / 1 男 / 2 女
 * - sys_users.role        0 普通用户 / 1 管理员
 * - app_users.sex         0 未知 / 1 男 / 2 女
 * - attachments.type      0 图片 / 1 视频
 *
 * 先改为 VARCHAR 临时列，避免 MySQL 把枚举字符串直接转成 0。
 */

const COLUMNS = [
  {
    table: 'articles',
    column: 'status',
    temporaryDefault: "'1'",
    temporaryComment: '状态（迁移临时列）',
    fromEnumToInt: `CASE \`status\`
      WHEN 'draft' THEN '0'
      WHEN 'published' THEN '1'
      ELSE '1'
    END`,
    finalDefinition: 'TINYINT NOT NULL DEFAULT 1',
    finalComment: '状态：0 草稿 / 1 已发布',
    fromIntToEnum: `CASE \`status\`
      WHEN '0' THEN 'draft'
      WHEN '1' THEN 'published'
      ELSE 'published'
    END`,
    enumDefinition: "ENUM('draft', 'published') NOT NULL DEFAULT 'published'",
    enumComment: '状态：draft 草稿 / published 已发布'
  },
  {
    table: 'sys_users',
    column: 'sex',
    temporaryDefault: "'0'",
    temporaryComment: '性别（迁移临时列）',
    fromEnumToInt: `CASE \`sex\`
      WHEN 'unknown' THEN '0'
      WHEN 'male' THEN '1'
      WHEN 'female' THEN '2'
      ELSE '0'
    END`,
    finalDefinition: 'TINYINT NOT NULL DEFAULT 0',
    finalComment: '性别：0 未知 / 1 男 / 2 女',
    fromIntToEnum: `CASE \`sex\`
      WHEN '0' THEN 'unknown'
      WHEN '1' THEN 'male'
      WHEN '2' THEN 'female'
      ELSE 'unknown'
    END`,
    enumDefinition: "ENUM('unknown', 'male', 'female') NOT NULL DEFAULT 'unknown'",
    enumComment: '性别：unknown 未知 / male 男 / female 女'
  },
  {
    table: 'sys_users',
    column: 'role',
    temporaryDefault: "'0'",
    temporaryComment: '角色（迁移临时列）',
    fromEnumToInt: `CASE \`role\`
      WHEN 'user' THEN '0'
      WHEN 'admin' THEN '1'
      ELSE '0'
    END`,
    finalDefinition: 'TINYINT NOT NULL DEFAULT 0',
    finalComment: '角色：0 普通用户 / 1 管理员',
    fromIntToEnum: `CASE \`role\`
      WHEN '0' THEN 'user'
      WHEN '1' THEN 'admin'
      ELSE 'user'
    END`,
    enumDefinition: "ENUM('user', 'admin') NOT NULL DEFAULT 'user'",
    enumComment: '角色：user 普通用户 / admin 管理员'
  },
  {
    table: 'app_users',
    column: 'sex',
    temporaryDefault: "'0'",
    temporaryComment: '性别（迁移临时列）',
    fromEnumToInt: `CASE \`sex\`
      WHEN 'unknown' THEN '0'
      WHEN 'male' THEN '1'
      WHEN 'female' THEN '2'
      ELSE '0'
    END`,
    finalDefinition: 'TINYINT NOT NULL DEFAULT 0',
    finalComment: '性别：0 未知 / 1 男 / 2 女',
    fromIntToEnum: `CASE \`sex\`
      WHEN '0' THEN 'unknown'
      WHEN '1' THEN 'male'
      WHEN '2' THEN 'female'
      ELSE 'unknown'
    END`,
    enumDefinition: "ENUM('unknown', 'male', 'female') NOT NULL DEFAULT 'unknown'",
    enumComment: '性别：unknown 未知 / male 男 / female 女'
  },
  {
    table: 'attachments',
    column: 'type',
    temporaryDefault: null,
    temporaryComment: '附件类型（迁移临时列）',
    fromEnumToInt: `CASE \`type\`
      WHEN 'image' THEN '0'
      WHEN 'video' THEN '1'
      ELSE '0'
    END`,
    finalDefinition: 'TINYINT NOT NULL',
    finalComment: '附件类型：0 图片 / 1 视频',
    fromIntToEnum: `CASE \`type\`
      WHEN '0' THEN 'image'
      WHEN '1' THEN 'video'
      ELSE 'image'
    END`,
    enumDefinition: "ENUM('image', 'video') NOT NULL",
    enumComment: '附件类型：image 图片 / video 视频'
  }
];

async function changeToVarchar(queryInterface, definition) {
  const defaultValue = definition.temporaryDefault
    ? ` DEFAULT ${definition.temporaryDefault}`
    : '';
  await queryInterface.sequelize.query(
    `ALTER TABLE \`${definition.table}\` ` +
      `MODIFY COLUMN \`${definition.column}\` VARCHAR(20) NOT NULL${defaultValue} ` +
      `COMMENT '${definition.temporaryComment}'`
  );
}

async function changeColumn(queryInterface, definition, type, comment) {
  await queryInterface.sequelize.query(
    `ALTER TABLE \`${definition.table}\` ` +
      `MODIFY COLUMN \`${definition.column}\` ${type} COMMENT '${comment}'`
  );
}

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    for (const definition of COLUMNS) {
      await changeToVarchar(queryInterface, definition);
      await queryInterface.sequelize.query(
        `UPDATE \`${definition.table}\` ` +
          `SET \`${definition.column}\` = ${definition.fromEnumToInt}`
      );
      await changeColumn(
        queryInterface,
        definition,
        definition.finalDefinition,
        definition.finalComment
      );
    }
  },

  async down(queryInterface) {
    for (const definition of COLUMNS) {
      await changeToVarchar(queryInterface, definition);
      await queryInterface.sequelize.query(
        `UPDATE \`${definition.table}\` ` +
          `SET \`${definition.column}\` = ${definition.fromIntToEnum}`
      );
      await changeColumn(
        queryInterface,
        definition,
        definition.enumDefinition,
        definition.enumComment
      );
    }
  }
};
