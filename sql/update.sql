-- Add remark image support for notes

ALTER TABLE `data`
ADD COLUMN `notes_img` varchar(255) NOT NULL DEFAULT '' COMMENT '备注图片文件名(可为空字符串)' AFTER `notes`;

ALTER TABLE `data`
ADD COLUMN `price` varchar(255) DEFAULT NULL COMMENT '价格' AFTER `status`;

ALTER TABLE `data`
ADD COLUMN `new_price` varchar(255) DEFAULT NULL COMMENT '第二次定价' AFTER `price`;

CREATE TABLE IF NOT EXISTS `price_publish_settings` (
    `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID',
    `publish_date` date NOT NULL COMMENT '公开设置日期',
    `is_public` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否公开价格：0不公开，1公开',
    `create_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uniq_publish_date` (`publish_date`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '按日期控制客户端价格是否公开';