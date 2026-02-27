-- Add remark image support for notes

ALTER TABLE `data`
  ADD COLUMN `notes_img` varchar(255) NOT NULL DEFAULT '' COMMENT '备注图片文件名(可为空字符串)' AFTER `notes`;
