/*
 Navicat Premium Data Transfer

 Source Server         : localhost_3306
 Source Server Type    : MySQL
 Source Server Version : 80045 (8.0.45)
 Source Host           : localhost:3306
 Source Schema         : fund_sales

 Target Server Type    : MySQL
 Target Server Version : 80045 (8.0.45)
 File Encoding         : 65001

 Date: 25/03/2026 05:53:00
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for customer_follow
-- ----------------------------
DROP TABLE IF EXISTS `customer_follow`;
CREATE TABLE `customer_follow`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `customer_id` int NULL DEFAULT NULL COMMENT '对应哪个客户\n',
  `follow_way` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '跟进方式（电话/微信/面谈）',
  `follow_content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL COMMENT '跟进内容（聊了啥）',
  `follow_time` datetime NULL DEFAULT NULL COMMENT '跟进时间',
  `next_plan` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '下次计划（什么时候再联系）',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 6 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of customer_follow
-- ----------------------------
INSERT INTO `customer_follow` VALUES (1, 1, '电话', '沟通净值情况', '2025-03-01 00:00:00', '下月回访');
INSERT INTO `customer_follow` VALUES (2, 2, '面谈', '推荐科创基金', '2025-03-05 00:00:00', '发送资料');
INSERT INTO `customer_follow` VALUES (3, 3, '微信', '介绍混合基金', '2025-03-10 00:00:00', '跟进意向');
INSERT INTO `customer_follow` VALUES (4, 11, '微信', '阿巴阿巴阿巴', '2026-03-25 00:00:00', '下个月15号跟进');
INSERT INTO `customer_follow` VALUES (5, 1, '电话', '哇哇哇哇哇', '2026-03-25 00:00:00', '111');

-- ----------------------------
-- Table structure for customer_hold
-- ----------------------------
DROP TABLE IF EXISTS `customer_hold`;
CREATE TABLE `customer_hold`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `customer_id` int NULL DEFAULT NULL COMMENT '客户ID（对应 customers 表）',
  `product_id` int NULL DEFAULT NULL COMMENT '产品ID（对应 products 表）',
  `hold_amount` decimal(12, 2) NULL DEFAULT NULL COMMENT '持有金额（万元）',
  `buy_time` datetime NULL DEFAULT NULL COMMENT '购买时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of customer_hold
-- ----------------------------
INSERT INTO `customer_hold` VALUES (1, 1, 1, 500.00, '2024-01-15 00:00:00');
INSERT INTO `customer_hold` VALUES (2, 1, 2, 800.00, '2024-02-20 00:00:00');
INSERT INTO `customer_hold` VALUES (3, 2, 3, 300.00, '2024-03-10 00:00:00');
INSERT INTO `customer_hold` VALUES (4, 3, 5, 200.00, '2024-05-20 00:00:00');
INSERT INTO `customer_hold` VALUES (5, 4, 4, 1000.00, '2024-06-10 00:00:00');
INSERT INTO `customer_hold` VALUES (6, 6, 6, 700.00, '2024-08-20 00:00:00');
INSERT INTO `customer_hold` VALUES (7, 8, 9, 1200.00, '2024-09-05 00:00:00');
INSERT INTO `customer_hold` VALUES (8, 10, 10, 600.00, '2024-10-15 00:00:00');
INSERT INTO `customer_hold` VALUES (9, 11, 5, 25.00, '2026-03-25 00:00:00');
INSERT INTO `customer_hold` VALUES (10, 13, 14, 666666.00, '2026-03-25 00:00:00');
INSERT INTO `customer_hold` VALUES (11, 13, 4, 15125.00, '2026-03-25 00:00:00');
INSERT INTO `customer_hold` VALUES (12, 1, 14, 1251.00, '2026-03-25 00:00:00');

-- ----------------------------
-- Table structure for customers
-- ----------------------------
DROP TABLE IF EXISTS `customers`;
CREATE TABLE `customers`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '客户唯一ID',
  `customer_name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '客户姓名（张总/李总）',
  `phone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '客户电话',
  `company` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '客户公司',
  `customer_status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '客户状态（意向/合作/流失）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 14 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of customers
-- ----------------------------
INSERT INTO `customers` VALUES (1, '张小强', '13800138000', 'XX科技', '合作客户', '2026-03-24 22:01:28');
INSERT INTO `customers` VALUES (2, '李大为', '13900139000', 'XX贸易', '合作客户', '2026-03-24 22:01:28');
INSERT INTO `customers` VALUES (3, '王自在', '13700137000', 'XX制造', '意向客户', '2026-03-24 22:01:28');
INSERT INTO `customers` VALUES (4, '赵春来', '13600136000', 'XX金融', '合作客户', '2026-03-24 22:01:28');
INSERT INTO `customers` VALUES (5, '孙大永', '13500135000', 'XX建筑', '意向客户', '2026-03-24 22:01:28');
INSERT INTO `customers` VALUES (6, '周贝贝', '13400134000', 'XX互联网', '合作客户', '2026-03-24 22:01:28');
INSERT INTO `customers` VALUES (7, '吴大力', '13300133000', 'XX物流', '意向客户', '2026-03-24 22:01:28');
INSERT INTO `customers` VALUES (8, '郑国强', '13200132000', 'XX餐饮', '合作客户', '2026-03-24 22:01:28');
INSERT INTO `customers` VALUES (9, '冯力国', '13100131000', 'XX教育', '意向客户', '2026-03-24 22:01:28');
INSERT INTO `customers` VALUES (10, '陈平安', '13000130000', 'XX地产', '合作客户', '2026-03-24 22:01:28');

-- ----------------------------
-- Table structure for products
-- ----------------------------
DROP TABLE IF EXISTS `products`;
CREATE TABLE `products`  (
  `id` int NOT NULL AUTO_INCREMENT COMMENT '产品唯一ID（系统用）',
  `product_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '产品名称（如：稳健增长一号）',
  `product_type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '产品类型（股票型/债券型/混合型/货币型）',
  `latest_nav` decimal(10, 4) NULL DEFAULT NULL COMMENT '最新净值（基金价格）',
  `establish_scale` decimal(12, 2) NULL DEFAULT NULL COMMENT '成立规模（发行了多少钱）',
  `product_status` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL COMMENT '产品状态（募集中/运作中/已清盘）',
  `create_time` datetime NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 23 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of products
-- ----------------------------
INSERT INTO `products` VALUES (1, '稳健增长一号', '混合型', 1.0568, 5000.00, '运作中', '2026-03-24 22:01:04');
INSERT INTO `products` VALUES (2, '乐享债券A', '债券型', 1.0234, 8000.00, '运作中', '2026-03-24 22:01:04');
INSERT INTO `products` VALUES (3, '科创股票精选', '股票型', 1.2345, 3000.00, '运作中', '2026-03-24 22:01:04');
INSERT INTO `products` VALUES (4, '货币宝利通', '货币型', 1.0012, 20000.00, '运作中', '2026-03-24 22:01:04');
INSERT INTO `products` VALUES (5, '红利优选混合', '混合型', 1.1023, 4500.00, '募集中', '2026-03-24 22:01:04');
INSERT INTO `products` VALUES (6, '高收益债券B', '债券型', 1.0456, 6000.00, '运作中', '2026-03-24 22:01:04');
INSERT INTO `products` VALUES (7, '新能源股票基金', '股票型', 0.9876, 2500.00, '已清盘', '2026-03-24 22:01:04');
INSERT INTO `products` VALUES (8, '养老目标混合', '混合型', 1.0890, 7000.00, '募集中', '2026-03-24 22:01:04');
INSERT INTO `products` VALUES (9, '短期理财债券', '债券型', 1.0123, 15000.00, '运作中', '2026-03-24 22:01:04');
INSERT INTO `products` VALUES (10, '消费升级股票', '股票型', 1.1567, 3500.00, '运作中', '2026-03-24 22:01:04');
INSERT INTO `products` VALUES (13, '特色产品', '股票型', 1.0000, 0.00, '运作中', '2026-03-25 00:36:52');
INSERT INTO `products` VALUES (16, '大力基金', '股票型', 1000.0000, 500.00, '运作中', '2026-03-25 04:28:14');
INSERT INTO `products` VALUES (17, '英伟达', '混合型', 1000.0000, 155.00, '募集中', '2026-03-25 04:41:14');
INSERT INTO `products` VALUES (22, '阿里基金', '股票型', 1000.0000, NULL, '运作中', '2026-03-25 04:50:57');

SET FOREIGN_KEY_CHECKS = 1;
