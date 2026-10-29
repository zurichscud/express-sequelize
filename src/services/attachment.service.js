const { Op } = require('sequelize');
const { Attachment, SysUser } = require('../models');
const { removeObject } = require('./upload.service');

const TYPES = ['image', 'video'];

// 列表只返回展示所需字段，上传者仅暴露安全信息
const LIST_ATTRIBUTES = [
  'id',
  'user_id',
  'name',
  'object_key',
  'url',
  'type',
  'mime_type',
  'size',
  'createdAt',
  'updatedAt'
];

const UPLOADER_INCLUDE = {
  model: SysUser,
  as: 'user',
  attributes: ['id', 'username', 'nickname']
};

/**
 * 分页查询附件列表，按上传时间倒序
 * @param {{ offset: number, limit: number, keyword?: string, type?: string }} options
 * @returns {Promise<{ list: object[], total: number }>}
 */
async function listAttachments({ offset, limit, keyword, type }) {
  const where = {};
  if (TYPES.includes(type)) {
    where.type = type;
  }
  if (keyword) {
    where[Op.or] = [
      { name: { [Op.like]: `%${keyword}%` } },
      { object_key: { [Op.like]: `%${keyword}%` } },
      { url: { [Op.like]: `%${keyword}%` } }
    ];
  }

  const { count, rows } = await Attachment.findAndCountAll({
    where,
    attributes: LIST_ATTRIBUTES,
    include: [UPLOADER_INCLUDE],
    order: [
      ['createdAt', 'DESC'],
      ['id', 'DESC']
    ],
    offset,
    limit
  });

  return { list: rows, total: count };
}

/**
 * 删除附件：先删除 OSS 文件，成功后再删除数据库记录
 * OSS 删除失败时保留记录，便于重试，避免数据库与 OSS 状态不一致
 * @param {number|string} id
 * @returns {Promise<boolean>} 附件不存在时返回 false
 */
async function deleteAttachmentById(id) {
  const attachment = await Attachment.findByPk(id);
  if (!attachment) {
    return false;
  }

  await removeObject(attachment.object_key);
  await attachment.destroy();
  return true;
}

module.exports = {
  listAttachments,
  deleteAttachmentById
};
