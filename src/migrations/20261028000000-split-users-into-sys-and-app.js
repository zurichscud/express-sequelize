'use strict';

/**
 * 把 users 拆分为：
 * - sys_users：后台登录账号（保留 role）
 * - app_users：前台注册用户（Web 登录账号，不保留 role）
 *
 * 数据迁移策略：
 * - 所有旧 users 记录复制到 app_users，并保留原 ID，保证 courses / likes 外键不受影响
 * - 其中 role=admin 的记录额外复制到 sys_users，并保留原 ID，供后台登录与附件归属使用
 * - attachments.user_id 改为引用 sys_users；上传者不是系统用户的记录置空
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable(
      'sys_users',
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: '主键'
        },
        email: {
          type: Sequelize.STRING(128),
          allowNull: false,
          unique: true,
          comment: '邮箱（唯一，登录凭证）'
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: '密码（bcrypt 哈希存储）'
        },
        username: {
          type: Sequelize.STRING(64),
          allowNull: false,
          unique: true,
          comment: '用户名（唯一）'
        },
        nickname: {
          type: Sequelize.STRING(64),
          allowNull: true,
          comment: '昵称'
        },
        sex: {
          type: Sequelize.ENUM('unknown', 'male', 'female'),
          allowNull: false,
          defaultValue: 'unknown',
          comment: '性别：unknown 未知 / male 男 / female 女'
        },
        role: {
          type: Sequelize.ENUM('user', 'admin'),
          allowNull: false,
          defaultValue: 'user',
          comment: '角色：user 普通用户 / admin 管理员'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        }
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        comment: '系统用户表（后台登录账号）'
      }
    );

    await queryInterface.createTable(
      'app_users',
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: '主键'
        },
        email: {
          type: Sequelize.STRING(128),
          allowNull: false,
          unique: true,
          comment: '邮箱（唯一，登录凭证）'
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: '密码（bcrypt 哈希存储）'
        },
        username: {
          type: Sequelize.STRING(64),
          allowNull: false,
          unique: true,
          comment: '用户名（唯一）'
        },
        nickname: {
          type: Sequelize.STRING(64),
          allowNull: true,
          comment: '昵称'
        },
        sex: {
          type: Sequelize.ENUM('unknown', 'male', 'female'),
          allowNull: false,
          defaultValue: 'unknown',
          comment: '性别：unknown 未知 / male 男 / female 女'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        }
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        comment: '前台用户表（Web 注册账号）'
      }
    );

    // 复制旧数据：全部进入 app_users，管理员额外进入 sys_users
    const [users] = await queryInterface.sequelize.query('SELECT * FROM `users`');
    if (users.length > 0) {
      const appUsers = users.map((user) => ({
        id: user.id,
        email: user.email,
        password: user.password,
        username: user.username,
        nickname: user.nickname,
        sex: user.sex,
        created_at: user.created_at,
        updated_at: user.updated_at
      }));
      await queryInterface.bulkInsert('app_users', appUsers);

      const sysUsers = users
        .filter((user) => user.role === 'admin')
        .map((user) => ({
          id: user.id,
          email: user.email,
          password: user.password,
          username: user.username,
          nickname: user.nickname,
          sex: user.sex,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at
        }));
      if (sysUsers.length > 0) {
        await queryInterface.bulkInsert('sys_users', sysUsers);
      }
    }

    // 先移除引用 users 的外键，才能调整引用关系并删除旧表
    await dropForeignKeysReferencing(queryInterface, ['users']);

    // 附件上传者改为系统用户；无法匹配的记录置空
    await queryInterface.sequelize.query(`
      UPDATE \`attachments\` AS a
      LEFT JOIN \`sys_users\` AS s ON s.id = a.user_id
      SET user_id = NULL
      WHERE a.user_id IS NOT NULL AND s.id IS NULL
    `);

    await queryInterface.dropTable('users');

    await queryInterface.addConstraint('courses', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'courses_user_id_foreign',
      references: { table: 'app_users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    await queryInterface.addConstraint('likes', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'likes_user_id_foreign',
      references: { table: 'app_users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await queryInterface.addConstraint('attachments', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'attachments_user_id_foreign',
      references: { table: 'sys_users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  async down(queryInterface, Sequelize) {
    await dropForeignKeysReferencing(queryInterface, ['sys_users', 'app_users']);

    // 还原旧 users 表
    await queryInterface.createTable(
      'users',
      {
        id: {
          type: Sequelize.INTEGER.UNSIGNED,
          primaryKey: true,
          autoIncrement: true,
          comment: '主键'
        },
        email: {
          type: Sequelize.STRING(128),
          allowNull: false,
          unique: true,
          comment: '邮箱（唯一，登录凭证）'
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: '密码（bcrypt 哈希存储）'
        },
        username: {
          type: Sequelize.STRING(64),
          allowNull: false,
          unique: true,
          comment: '用户名（唯一）'
        },
        nickname: {
          type: Sequelize.STRING(64),
          allowNull: true,
          comment: '昵称'
        },
        sex: {
          type: Sequelize.ENUM('unknown', 'male', 'female'),
          allowNull: false,
          defaultValue: 'unknown',
          comment: '性别：unknown 未知 / male 男 / female 女'
        },
        role: {
          type: Sequelize.ENUM('user', 'admin'),
          allowNull: false,
          defaultValue: 'user',
          comment: '角色：user 普通用户 / admin 管理员'
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false
        }
      },
      {
        charset: 'utf8mb4',
        collate: 'utf8mb4_unicode_ci',
        comment: '用户表'
      }
    );

    // app_users 保留原 ID（courses / likes 依赖）；sys_users 按邮箱/用户名去重后补入
    await queryInterface.sequelize.query(`
      INSERT INTO \`users\` (\`id\`, \`email\`, \`password\`, \`username\`, \`nickname\`, \`sex\`, \`role\`, \`created_at\`, \`updated_at\`)
      SELECT \`id\`, \`email\`, \`password\`, \`username\`, \`nickname\`, \`sex\`, 'user', \`created_at\`, \`updated_at\`
      FROM \`app_users\`
    `);
    // 同一账号也在 sys_users 中时，恢复其角色
    await queryInterface.sequelize.query(`
      UPDATE \`users\` AS u
      INNER JOIN \`sys_users\` AS s ON u.\`email\` = s.\`email\` AND u.\`username\` = s.\`username\`
      SET u.\`role\` = s.\`role\`
    `);
    await queryInterface.sequelize.query(`
      INSERT INTO \`users\` (\`email\`, \`password\`, \`username\`, \`nickname\`, \`sex\`, \`role\`, \`created_at\`, \`updated_at\`)
      SELECT s.\`email\`, s.\`password\`, s.\`username\`, s.\`nickname\`, s.\`sex\`, s.\`role\`, s.\`created_at\`, s.\`updated_at\`
      FROM \`sys_users\` AS s
      LEFT JOIN \`users\` AS u ON u.\`email\` = s.\`email\` OR u.\`username\` = s.\`username\`
      WHERE u.\`id\` IS NULL
    `);

    // 附件上传者无法匹配时置空
    await queryInterface.sequelize.query(`
      UPDATE \`attachments\` AS a
      LEFT JOIN \`users\` AS u ON u.id = a.user_id
      SET user_id = NULL
      WHERE a.user_id IS NOT NULL AND u.id IS NULL
    `);

    await queryInterface.addConstraint('courses', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'courses_user_id_foreign',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
    await queryInterface.addConstraint('likes', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'likes_user_id_foreign',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });
    await queryInterface.addConstraint('attachments', {
      fields: ['user_id'],
      type: 'foreign key',
      name: 'attachments_user_id_foreign',
      references: { table: 'users', field: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    await queryInterface.dropTable('sys_users');
    await queryInterface.dropTable('app_users');
  }
};

/**
 * 查询并删除所有引用指定表的外键
 * @param {import('sequelize').QueryInterface} queryInterface
 * @param {string[]} referencedTables
 */
async function dropForeignKeysReferencing(queryInterface, referencedTables) {
  const placeholders = referencedTables.map(() => '?').join(', ');
  const [constraints] = await queryInterface.sequelize.query(
    `SELECT TABLE_NAME, CONSTRAINT_NAME
     FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE()
       AND REFERENCED_TABLE_NAME IN (${placeholders})`,
    { replacements: referencedTables }
  );

  for (const constraint of constraints) {
    await queryInterface.sequelize.query(
      `ALTER TABLE \`${constraint.TABLE_NAME}\` DROP FOREIGN KEY \`${constraint.CONSTRAINT_NAME}\``
    );
  }
}
