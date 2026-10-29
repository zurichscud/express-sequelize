const { z } = require('zod');
const {
  bodyObject,
  requireAtLeastOneField,
  optionalString,
  optionalNonEmptyString
} = require('./common');

const updateSettingBodySchema = requireAtLeastOneField(
  bodyObject({
    name: optionalNonEmptyString('站点名称', 100),
    icp: optionalString('ICP 备案号', 64),
    copyright: optionalString('版权信息', 200)
  })
);

module.exports = {
  updateSettingBodySchema
};
