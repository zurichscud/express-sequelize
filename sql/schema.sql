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
