-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- 主机： 1Panel-mysql-mk1n
-- 生成日期： 2025-09-06 04:32:24
-- 服务器版本： 8.4.5
-- PHP 版本： 8.2.29

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

START TRANSACTION;

SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */
;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */
;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */
;
/*!40101 SET NAMES utf8mb4 */
;

--
-- 数据库： `expressDD`
--

-- --------------------------------------------------------

--
-- 表的结构 `building`
--

CREATE TABLE `building` (
    `id` int NOT NULL COMMENT '顺序',
    `print` varchar(255) NOT NULL COMMENT '输出用的排序规则',
    `input` varchar(255) NOT NULL COMMENT '输入的时候渲染的规则'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '建筑表，哪一栋的楼';

--
-- 转存表中的数据 `building`
--

INSERT INTO
    `building` (`id`, `print`, `input`)
VALUES (1, '松A', '梅A'),
    (2, '松B', '梅B'),
    (3, '楠A', '兰A'),
    (4, '楠B', '兰B'),
    (5, '桂A', '桃A'),
    (6, '桂B', '桃B'),
    (7, '榕A', '榕A'),
    (8, '榕B', '榕B'),
    (9, '饭堂', '楠A'),
    (10, '菊A', '楠B'),
    (11, '菊B', '菊A'),
    (12, '兰A', '菊B'),
    (13, '兰B', '竹A'),
    (14, '梅A', '竹B'),
    (15, '梅B', '松A'),
    (16, '桃A', '松B'),
    (17, '桃B', '桂A'),
    (18, '竹A', '桂B'),
    (19, '竹B', '饭堂'),
    (20, '其他', '其他');

-- --------------------------------------------------------

--
-- 表的结构 `building_users`
--

CREATE TABLE `building_users` (
    `id` int NOT NULL,
    `building` varchar(255) NOT NULL COMMENT '栋-宿舍号',
    `wechat_name` varchar(255) NOT NULL COMMENT '微信名字',
    `create_at` varchar(255) NOT NULL COMMENT '谁增加的'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '记录每一个宿舍中的成员';

-- --------------------------------------------------------

--
-- 表的结构 `data`
--

CREATE TABLE `data` (
    `id` int NOT NULL COMMENT '数据id',
    `building_users_id` int NOT NULL COMMENT '微信名的id',
    `status` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT '未送达' COMMENT '当前快递的状态',
    `price` varchar(255) DEFAULT NULL COMMENT '第一次定价',
    `new_price` varchar(255) DEFAULT NULL COMMENT '第二次定价',
    `create_at` varchar(255) NOT NULL COMMENT '谁创建的数据',
    `time` date NOT NULL COMMENT '快递是哪一天的',
    `insert_time` datetime NOT NULL COMMENT '登记数据更新数据库的时间',
    `building` varchar(255) NOT NULL COMMENT '哪栋楼',
    `room` varchar(255) NOT NULL COMMENT '宿舍号',
    `pickupCode` varchar(255) NOT NULL COMMENT '取件玛',
    `expressNumber` varchar(255) NOT NULL COMMENT '快递单号',
    `notes` varchar(255) NOT NULL COMMENT '备注',
    `notes_img` varchar(255) NOT NULL DEFAULT '' COMMENT '备注图片文件名(可为空字符串)'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '记录了快递数据';

-- --------------------------------------------------------

--
-- 表的结构 `price_publish_settings`
--

CREATE TABLE `price_publish_settings` (
    `id` int NOT NULL COMMENT '主键ID',
    `publish_date` date NOT NULL COMMENT '公开设置日期',
    `is_public` tinyint(1) NOT NULL DEFAULT '0' COMMENT '是否公开价格：0不公开，1公开',
    `create_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '按日期控制客户端价格是否公开';

-- --------------------------------------------------------

--
-- 表的结构 `lottery`
--

CREATE TABLE `lottery` (
    `id` int NOT NULL COMMENT '抽奖活动id',
    `title` varchar(255) NOT NULL COMMENT '标题',
    `time` date NOT NULL COMMENT '抽奖时间(这一天的晚上10:30)',
    `create_by` varchar(255) NOT NULL COMMENT '谁创建的活动',
    `create_at` datetime NOT NULL COMMENT '数据记录服务器时间',
    `num` int NOT NULL DEFAULT '3' COMMENT '抽奖个数',
    `y_n` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'false' COMMENT '是否完成当天抽奖'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '抽奖活动记录表';

-- --------------------------------------------------------

--
-- 表的结构 `upload_img`
--

CREATE TABLE `upload_img` (
    `pid` int NOT NULL COMMENT '图片id',
    `original` varchar(255) NOT NULL COMMENT '原图图片文件名',
    `compressed` varchar(255) NOT NULL COMMENT '压缩图片文件名',
    `userid` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户id',
    `upload_time` datetime NOT NULL COMMENT '上传时间',
    `backup_y_n` varchar(255) NOT NULL COMMENT '图片是否归档(云盘？)'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '上传的图片';

-- --------------------------------------------------------

--
-- 表的结构 `users`
--

CREATE TABLE `users` (
    `userid` varchar(255) NOT NULL COMMENT '用户登录id',
    `password` varchar(255) NOT NULL COMMENT '密码',
    `name` varchar(255) NOT NULL COMMENT '用户名字',
    `rule` varchar(255) NOT NULL COMMENT '用户权限'
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci COMMENT = '用户表';

--
-- 转储表的索引
--

--
-- 表的索引 `building_users`
--
ALTER TABLE `building_users` ADD PRIMARY KEY (`id`);

--
-- 表的索引 `data`
--
ALTER TABLE `data`
ADD PRIMARY KEY (`id`),
ADD UNIQUE KEY `id` (`id`);

--
-- 表的索引 `lottery`
--
ALTER TABLE `lottery` ADD PRIMARY KEY (`id`);

--
-- 表的索引 `price_publish_settings`
--
ALTER TABLE `price_publish_settings`
ADD PRIMARY KEY (`id`),
ADD UNIQUE KEY `uniq_publish_date` (`publish_date`);

--
-- 表的索引 `users`
--
ALTER TABLE `users` ADD PRIMARY KEY (`userid`);

--
-- 在导出的表使用AUTO_INCREMENT
--

--
-- 使用表AUTO_INCREMENT `building_users`
--
ALTER TABLE `building_users`
MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- 使用表AUTO_INCREMENT `data`
--
ALTER TABLE `data`
MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '数据id';

--
-- 使用表AUTO_INCREMENT `lottery`
--
ALTER TABLE `lottery`
MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '抽奖活动id';

--
-- 使用表AUTO_INCREMENT `price_publish_settings`
--
ALTER TABLE `price_publish_settings`
MODIFY `id` int NOT NULL AUTO_INCREMENT COMMENT '主键ID';

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */
;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */
;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */
;