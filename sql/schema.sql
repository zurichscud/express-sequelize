-- 建库
CREATE DATABASE IF NOT EXISTS `express_sequelize`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `express_sequelize`;

-- 文章表（参考 SQL；实际建表以 src/migrations 迁移为准）
CREATE TABLE IF NOT EXISTS `articles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `title` VARCHAR(200) NOT NULL COMMENT '标题',
  `summary` VARCHAR(500) DEFAULT NULL COMMENT '摘要',
  `content` TEXT NOT NULL COMMENT '正文',
  `author` VARCHAR(64) NOT NULL DEFAULT '匿名' COMMENT '作者',
  `status` ENUM('draft', 'published') NOT NULL DEFAULT 'published' COMMENT '状态',
  `views` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_articles_status_created` (`status`, `created_at`),
  KEY `idx_articles_title` (`title`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '文章表';

-- 站点设置表（仅一条记录）
CREATE TABLE IF NOT EXISTS `settings` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` VARCHAR(100) NOT NULL COMMENT '站点名称',
  `icp` VARCHAR(64) DEFAULT NULL COMMENT 'ICP 备案号',
  `copyright` VARCHAR(200) DEFAULT NULL COMMENT '版权信息',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '站点设置表（仅一条记录）';

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `email` VARCHAR(128) NOT NULL COMMENT '邮箱（唯一，登录凭证）',
  `password` VARCHAR(255) NOT NULL COMMENT '密码（bcrypt 哈希存储）',
  `username` VARCHAR(64) NOT NULL COMMENT '用户名（唯一）',
  `nickname` VARCHAR(64) DEFAULT NULL COMMENT '昵称',
  `sex` ENUM('unknown', 'male', 'female') NOT NULL DEFAULT 'unknown' COMMENT '性别',
  `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user' COMMENT '角色',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '用户表';

-- 分类表
CREATE TABLE IF NOT EXISTS `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` VARCHAR(64) NOT NULL COMMENT '分类名称（唯一）',
  `rank` INT NOT NULL DEFAULT 0 COMMENT '排序序号，越小越靠前',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `categories_name_unique` (`name`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '分类表';

-- 课程表
CREATE TABLE IF NOT EXISTS `courses` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `category_id` INT UNSIGNED NOT NULL COMMENT '分类 ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '所属用户 ID（创建者）',
  `name` VARCHAR(128) NOT NULL COMMENT '课程名称',
  `image` VARCHAR(500) DEFAULT NULL COMMENT '封面图片地址',
  `is_recommended` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '是否推荐',
  `content` TEXT DEFAULT NULL COMMENT '课程内容',
  `like_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '点赞数',
  `chapter_count` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '章节总数（由 chapters 表自动维护）',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_courses_category_id` (`category_id`),
  KEY `idx_courses_user_id` (`user_id`),
  KEY `idx_courses_recommended_created` (`is_recommended`, `created_at`),
  CONSTRAINT `courses_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `courses_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '课程表';

-- 课程点赞表
CREATE TABLE IF NOT EXISTS `likes` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `course_id` INT UNSIGNED NOT NULL COMMENT '课程 ID',
  `user_id` INT UNSIGNED NOT NULL COMMENT '点赞用户 ID',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `likes_course_id_user_id_unique` (`course_id`, `user_id`),
  KEY `idx_likes_user_id` (`user_id`),
  CONSTRAINT `likes_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `likes_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '课程点赞表';

-- 课程章节表
CREATE TABLE IF NOT EXISTS `chapters` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `course_id` INT UNSIGNED NOT NULL COMMENT '所属课程 ID',
  `title` VARCHAR(200) NOT NULL COMMENT '章节标题',
  `content` TEXT DEFAULT NULL COMMENT '章节内容',
  `video_url` VARCHAR(500) DEFAULT NULL COMMENT '视频地址',
  `rank` INT NOT NULL DEFAULT 0 COMMENT '排序序号，越小越靠前',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_chapters_course_rank` (`course_id`, `rank`),
  CONSTRAINT `chapters_course_id_foreign` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '课程章节表';

-- 附件表（上传到 OSS 的文件）
CREATE TABLE IF NOT EXISTS `attachments` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '主键',
  `user_id` INT UNSIGNED DEFAULT NULL COMMENT '上传用户 ID（用户删除后置空）',
  `name` VARCHAR(255) NOT NULL COMMENT '原始文件名',
  `object_key` VARCHAR(500) NOT NULL COMMENT 'OSS 对象 Key',
  `url` VARCHAR(500) NOT NULL COMMENT '公开访问地址',
  `type` ENUM('image', 'video') NOT NULL COMMENT '附件类型：image 图片 / video 视频',
  `mime_type` VARCHAR(100) NOT NULL COMMENT 'MIME 类型',
  `size` INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '文件大小（字节）',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `attachments_object_key_unique` (`object_key`),
  KEY `idx_attachments_user_id` (`user_id`),
  KEY `idx_attachments_type_created` (`type`, `created_at`),
  CONSTRAINT `attachments_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = '附件表（上传到 OSS 的文件）';
