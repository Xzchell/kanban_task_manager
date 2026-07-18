-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: MySQL-8.0    Database: manager_tasks_bd
-- ------------------------------------------------------
-- Server version	8.0.45

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `board_columns`
--

DROP TABLE IF EXISTS `board_columns`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `board_columns` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_board` int NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `id_board` (`id_board`),
  CONSTRAINT `board_columns_ibfk_1` FOREIGN KEY (`id_board`) REFERENCES `boards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=419 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `board_columns`
--

LOCK TABLES `board_columns` WRITE;
/*!40000 ALTER TABLE `board_columns` DISABLE KEYS */;
INSERT INTO `board_columns` VALUES (366,47,'Идеи',0),(367,47,'Задачи',1),(368,47,'В разработке',2),(369,47,'Тестирование',3),(370,47,'Готово',4),(371,47,'Колонка 6',5),(404,48,'Колонка 1',0),(405,48,'Колонка 2',1),(416,48,'Колонка 3',2);
/*!40000 ALTER TABLE `board_columns` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `board_invitations`
--

DROP TABLE IF EXISTS `board_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `board_invitations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `board_id` int NOT NULL,
  `inviter_id` int NOT NULL,
  `invitee_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `token` varchar(64) NOT NULL,
  `id_board_role` int NOT NULL DEFAULT '2',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_invite` (`board_id`,`invitee_id`),
  UNIQUE KEY `unique_token` (`token`),
  KEY `inviter_id` (`inviter_id`),
  KEY `invitee_id` (`invitee_id`),
  KEY `fk_invitations_role` (`id_board_role`),
  CONSTRAINT `board_invitations_ibfk_1` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `board_invitations_ibfk_2` FOREIGN KEY (`inviter_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `board_invitations_ibfk_3` FOREIGN KEY (`invitee_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_invitations_role` FOREIGN KEY (`id_board_role`) REFERENCES `board_roles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `board_invitations`
--

LOCK TABLES `board_invitations` WRITE;
/*!40000 ALTER TABLE `board_invitations` DISABLE KEYS */;
/*!40000 ALTER TABLE `board_invitations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `board_members`
--

DROP TABLE IF EXISTS `board_members`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `board_members` (
  `board_id` int NOT NULL,
  `user_id` int NOT NULL,
  `id_board_role` int NOT NULL DEFAULT '2',
  `id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`id`),
  KEY `board_members_users_FK` (`user_id`),
  KEY `board_members_board_roles_FK` (`id_board_role`),
  KEY `board_members_boards_FK` (`board_id`),
  CONSTRAINT `board_members_board_roles_FK` FOREIGN KEY (`id_board_role`) REFERENCES `board_roles` (`id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `board_members_boards_FK` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE CASCADE,
  CONSTRAINT `board_members_users_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=97 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `board_members`
--

LOCK TABLES `board_members` WRITE;
/*!40000 ALTER TABLE `board_members` DISABLE KEYS */;
INSERT INTO `board_members` VALUES (47,26,1,41),(48,27,1,43),(47,27,1,59),(47,5,3,69),(48,26,2,96);
/*!40000 ALTER TABLE `board_members` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `board_roles`
--

DROP TABLE IF EXISTS `board_roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `board_roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `board_roles`
--

LOCK TABLES `board_roles` WRITE;
/*!40000 ALTER TABLE `board_roles` DISABLE KEYS */;
INSERT INTO `board_roles` VALUES (1,'owner','Владелец Доски',NULL),(2,'user','Участник',NULL),(3,'spectator','Наблюдающий',NULL);
/*!40000 ALTER TABLE `board_roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `board_types`
--

DROP TABLE IF EXISTS `board_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `board_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `display_name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `max_users` int DEFAULT NULL,
  `has_websockets` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `board_types`
--

LOCK TABLES `board_types` WRITE;
/*!40000 ALTER TABLE `board_types` DISABLE KEYS */;
INSERT INTO `board_types` VALUES (1,'hakaton','Хакатон-доска',5,1),(2,'company','Командная доска',20,0);
/*!40000 ALTER TABLE `board_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `boards`
--

DROP TABLE IF EXISTS `boards`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `boards` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `id_type` int NOT NULL,
  `owner_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deadline` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_boards_type` (`id_type`),
  KEY `fk_boards_owner` (`owner_id`),
  CONSTRAINT `fk_boards_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_boards_type` FOREIGN KEY (`id_type`) REFERENCES `board_types` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=60 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `boards`
--

LOCK TABLES `boards` WRITE;
/*!40000 ALTER TABLE `boards` DISABLE KEYS */;
INSERT INTO `boards` VALUES (47,'ПРОЕКТ ИТМО','Отсчет до 18 июля',1,26,'2026-07-10 13:13:55','2026-07-18 18:00:00'),(48,'iva5','йцйцььь',2,27,'2026-07-11 19:40:10',NULL);
/*!40000 ALTER TABLE `boards` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `email_verifications`
--

DROP TABLE IF EXISTS `email_verifications`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `email_verifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `code` char(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `expires_at` timestamp NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_user_code` (`user_id`),
  CONSTRAINT `fk_verifications_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `email_verifications`
--

LOCK TABLES `email_verifications` WRITE;
/*!40000 ALTER TABLE `email_verifications` DISABLE KEYS */;
INSERT INTO `email_verifications` VALUES (19,27,'912328','2026-07-17 20:20:07','2026-07-17 20:38:29');
/*!40000 ALTER TABLE `email_verifications` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `color_role` varchar(10) DEFAULT NULL,
  `background_color` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tags_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'Дизайн','#ff5c00','#ffece1'),(2,'Вёрстка','#2c62b4','#e1f6ff'),(3,'Баг','#bc4848','#f8d9d9'),(4,'Бэкенд','#268fb0','#d9f4f8'),(5,'Фронтенд ','#ff00b8','#fbe6fc'),(6,'Срочно','#dc2626','#fef2f2'),(7,'Важно','#ea580c','#fff7ed'),(8,'Аналитика','#7c3aed','#f5f3ff'),(9,'Ресерч','#2563eb','#eff6ff'),(10,'Тестирование','#db2777','#fdf2f8'),(11,'Деплой','#059669','#ecfdf5'),(12,'База данных','#0284c7','#f0f9ff'),(13,'Refactoring','#4b5563','#f3f4f6'),(14,'Документация','#4d7c0f','#f7fee7'),(15,'Контент','#b45309','#fffbeb');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_attachments`
--

DROP TABLE IF EXISTS `task_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_attachments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_task` int NOT NULL,
  `id_user` int NOT NULL,
  `file_url` text NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `task_attachments_users_FK` (`id_user`),
  KEY `task_attachments_tasks_FK` (`id_task`),
  CONSTRAINT `task_attachments_tasks_FK` FOREIGN KEY (`id_task`) REFERENCES `tasks` (`id`),
  CONSTRAINT `task_attachments_users_FK` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_attachments`
--

LOCK TABLES `task_attachments` WRITE;
/*!40000 ALTER TABLE `task_attachments` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_attachments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_executors`
--

DROP TABLE IF EXISTS `task_executors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_executors` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_task` int NOT NULL,
  `id_user` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `task_executors_users_FK` (`id_user`),
  KEY `task_executors_tasks_FK` (`id_task`),
  CONSTRAINT `task_executors_tasks_FK` FOREIGN KEY (`id_task`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_executors_users_FK` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=324 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_executors`
--

LOCK TABLES `task_executors` WRITE;
/*!40000 ALTER TABLE `task_executors` DISABLE KEYS */;
INSERT INTO `task_executors` VALUES (322,98,27),(323,99,27);
/*!40000 ALTER TABLE `task_executors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_tags`
--

DROP TABLE IF EXISTS `task_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_tags` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_task` int NOT NULL,
  `id_tag` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `task_tags_tags_FK` (`id_tag`),
  KEY `task_tags_tasks_FK` (`id_task`),
  CONSTRAINT `task_tags_tags_FK` FOREIGN KEY (`id_tag`) REFERENCES `tags` (`id`),
  CONSTRAINT `task_tags_tasks_FK` FOREIGN KEY (`id_task`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=359 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_tags`
--

LOCK TABLES `task_tags` WRITE;
/*!40000 ALTER TABLE `task_tags` DISABLE KEYS */;
/*!40000 ALTER TABLE `task_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `short_desc` varchar(500) NOT NULL,
  `full_desc` text NOT NULL,
  `priority` int NOT NULL,
  `progress` int NOT NULL,
  `author_id` int NOT NULL,
  `id_column` int DEFAULT NULL,
  `deadline` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `isMvp` tinyint(1) NOT NULL DEFAULT '0',
  `time_point_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tasks_users_FK` (`author_id`),
  KEY `tasks_priorities_FK` (`priority`),
  KEY `fk_tasks_column` (`id_column`),
  KEY `fk_task_time_point` (`time_point_id`),
  CONSTRAINT `fk_task_time_point` FOREIGN KEY (`time_point_id`) REFERENCES `time_points` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_tasks_column` FOREIGN KEY (`id_column`) REFERENCES `board_columns` (`id`) ON DELETE CASCADE,
  CONSTRAINT `tasks_users_FK` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=100 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (98,'аупа','','',1,0,27,416,'2026-07-17 16:15:00','2026-07-17 16:16:42',0,NULL),(99,'1','','',1,0,27,366,NULL,'2026-07-17 18:51:16',0,23);
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `time_points`
--

DROP TABLE IF EXISTS `time_points`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `time_points` (
  `id` int NOT NULL AUTO_INCREMENT,
  `board_id` int NOT NULL,
  `title` varchar(100) NOT NULL,
  `target_date` datetime NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `time_points_boards_FK` (`board_id`),
  CONSTRAINT `time_points_boards_FK` FOREIGN KEY (`board_id`) REFERENCES `boards` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `time_points`
--

LOCK TABLES `time_points` WRITE;
/*!40000 ALTER TABLE `time_points` DISABLE KEYS */;
INSERT INTO `time_points` VALUES (15,47,'qwewqe','2026-07-18 10:00:00',NULL,'2026-07-13 14:42:36'),(16,47,'ааа','2026-07-18 10:00:00',NULL,'2026-07-13 14:44:52'),(17,47,'d','2026-07-18 10:00:00',NULL,'2026-07-13 14:47:19'),(22,47,'b','2026-07-18 07:00:00',NULL,'2026-07-13 15:57:56'),(23,47,'этам 1','2026-07-18 10:00:00',NULL,'2026-07-17 16:01:28');
/*!40000 ALTER TABLE `time_points` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_sessions_users_FK` (`user_id`),
  CONSTRAINT `user_sessions_users_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=189 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
INSERT INTO `user_sessions` VALUES (19,5,'35b89bee929d0421eb13dd4e1dbea3d764bad205a00e07f9da04df87144ffced','2026-04-27 21:54:24'),(46,5,'5fd4be2b379def89a894d13fdc1878a7e5424408da93c11cee034d5328254aa9','2026-05-16 15:55:07'),(47,5,'959c0b4984672cdb6d226010c193ac2ee4c4905032d0cfb351e0a56f77de33c7','2026-05-16 20:03:32'),(48,12,'e540ea8a21887f899141079952f52b2a9995201478cef104054892b1c206753b','2026-05-16 20:14:30'),(49,5,'2dfa6aea0af71157ef0faa6bf925f8d320d3ee260980ce5bf52cd68672d200ff','2026-05-17 09:43:47'),(50,10,'0a96a1a9dbe06cc51965847c6b4ac32da1d5683ed68d84575af488ed2b018113','2026-06-08 22:17:52'),(51,5,'38f1c933d64535a97589dfb173602c2f4e84f547e3cb9b8fd5799032ae73cf8f','2026-06-12 22:11:07'),(52,5,'34f753e2b16ac5a613797727a1078db5afa26382dbaeb670f1b5e7ba9519b5d7','2026-06-12 22:12:09'),(53,5,'bd2162d5488959cb9722a008c9e66f5743aa8b026e62caa2b3d21c24d2abf059','2026-06-12 22:20:56'),(54,5,'f4297e5607db3b7c56b138b945bd0d78a5d13b9416494ca15c634caa7f71f849','2026-06-12 22:32:27'),(55,5,'37ab5ee6d9172612f357cb5d312c0840feb4ace7ed1ea3fb73e0415b187f38e8','2026-06-12 22:33:36'),(57,5,'096574ce059bd1261a0ead97331596a514de663e4f2fd25ce9aca222df2eed08','2026-06-12 22:41:15'),(58,5,'09a0256b7f74deb24893f91b78089165c196b08f7cab80a07cbd2ca33d032448','2026-06-13 13:05:53'),(76,5,'b1b609d328b00ee16274714bc85d8c453af471f1f0c4095e8ec5a5dd65a7850e','2026-06-25 16:36:41'),(187,27,'18e8477068300b8eba396a336b0ea7e87b2ecab2a4e27253cdb4516b86c96c8b','2026-07-17 20:56:41'),(188,27,'d136ab749711275f65dadc0f661af6add83992f1050d99ea454cc3aa0f2497cf','2026-07-17 21:03:21');
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `last_name` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `birth_date` date NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `username` varchar(100) NOT NULL,
  `is_verified` tinyint(1) NOT NULL DEFAULT '0',
  `avatar_url` varchar(200) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=28 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (5,'Иванов','Иван','Иванович','2000-10-10','test@gmail.com','$2y$10$L.chTfyXWXNehWbvCNLmlek/JnBIilpU7WpcRPdQE4XITQGesdOYy','2026-05-16 15:47:50','ivandev',0,NULL),(10,'Высоковский','Андрей','','1999-11-10','andrew@gmail.com','$2y$10$E3IGm8ftOl/tXgOvegJKyusiY9gPS1LNLamKFsyNh.Brm.aiCaMpm','2026-05-16 15:05:44','andrew_ui',0,NULL),(12,'Ковалева','Дарья','Сергеевна','1997-07-14','kovaleva.d@team.ru','$2y$10$ggslS6EvUz4CyacrzRK7Aer9.UwchTY651iNLWx.jGnFKTuJXP2Y.','2026-05-16 20:05:24','dash_kovaleva',0,NULL),(13,'Смирнов','Илья','Николаевич','1994-03-22','smirnov.i@team.ru','$2y$10$7K.WiCZmX9zN2q.nN1EyQeQNY03r8sLoWSZ09SEg0khlaF3ah4NPq','2026-05-16 20:06:23','ilya_smirnov',0,NULL),(14,'Kluklev','Ivan','','1999-02-12','a@mail.ru','$2y$10$yT/OP22t/dD0zFJ0gxhk.Onaj7DIYobxkv2vKvAmJnNUMfIYncohe','2026-05-17 12:30:31','kluklev',0,NULL),(26,'Большак','Влад','Сер','2000-10-11','xzchellhome@gmail.com','$2y$12$XBwVdRVNl0PkBdUegGnc2.4rK5fHnfw5J6VZrFdMhPoU2lAggi7Na','2026-06-29 04:32:09','bolshak',1,NULL),(27,'Большаков','Владислав','Сергеевич','2007-10-14','serkossfry@gmail.com','$2y$12$i3ZUUME7wAib3ar3xQzFUePiUo2LnSpGGUybSZ2kHUmi50/nwCwIa','2026-07-17 20:17:09','xzchell',1,NULL);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'manager_tasks_bd'
--
/*!50003 DROP FUNCTION IF EXISTS `add_executor_task` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `add_executor_task`(_id_task int(11), _id_user int(11)) RETURNS int
    DETERMINISTIC
begin
	insert into task_executors (
		id_task, id_user
	)
	values (
		_id_task, _id_user
	);

	return last_insert_id();
end ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `add_task` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `add_task`(
    _title VARCHAR(100), 
    _short_desc VARCHAR(500), 
    _full_desc TEXT, 
    _priority INT, 
    _board_id INT,
    _deadline TIMESTAMP, 
    _author_id INT,
    _isMvp BOOLEAN,
    _time_point_id INT 
) RETURNS int
    DETERMINISTIC
BEGIN
    DECLARE _first_column_id INT;

    -- Находим ID самой первой колонки для этой доски
    SELECT id INTO _first_column_id 
    FROM board_columns 
    WHERE id_board = _board_id 
    ORDER BY position ASC 
    LIMIT 1;

    INSERT INTO tasks (
        title, short_desc, full_desc, priority, 
        progress, id_column, created_at, deadline, author_id, isMvp, time_point_id
    )
    VALUES (
        _title, _short_desc, _full_desc, _priority, 
        0, _first_column_id, NOW(), _deadline, _author_id, _isMvp, _time_point_id
    );

    RETURN LAST_INSERT_ID();
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `CheckUserAvailabilityForBoard` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `CheckUserAvailabilityForBoard`(
    p_user_id INT,
    p_board_id INT
) RETURNS tinyint(1)
    READS SQL DATA
    DETERMINISTIC
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM board_members bm 
        WHERE bm.board_id = p_board_id 
          AND bm.user_id = p_user_id
    ) THEN
        RETURN 0;
    END IF;

    IF EXISTS (
        SELECT 1 
        FROM board_invitations bi 
        WHERE bi.board_id = p_board_id 
          AND bi.invitee_id = p_user_id
    ) THEN
        RETURN 0;
    END IF;

    RETURN 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `CreateBoardFunction` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `CreateBoardFunction`(
    p_title VARCHAR(255),
    p_description TEXT,
    p_type_name VARCHAR(50),      
    p_owner_id INT,               
    p_deadline DATETIME,          
    p_invited_users_json TEXT,
    p_columns_json TEXT,
    p_time_points_json TEXT
) RETURNS int
    MODIFIES SQL DATA
BEGIN
    DECLARE v_board_id INT;
    DECLARE v_type_id INT;
    DECLARE v_dummy INT;

    SELECT id INTO v_type_id 
    FROM board_types 
    WHERE name = CAST(p_type_name AS BINARY)
    LIMIT 1;

    INSERT INTO boards (title, description, id_type, owner_id, deadline, created_at)
    VALUES (p_title, p_description, v_type_id, p_owner_id, p_deadline, NOW());

    SET v_board_id = LAST_INSERT_ID();

    SET v_dummy = InsertBoardColumns(v_board_id, p_columns_json);
    SET v_dummy = InsertBoardMembers(v_board_id, p_owner_id, p_invited_users_json);
    SET v_dummy = InsertBoardTimePoints(v_board_id, p_time_points_json);

    RETURN v_board_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetBoardColumnsJSON` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `GetBoardColumnsJSON`(p_board_id INT) RETURNS longtext CHARSET utf8mb4
    READS SQL DATA
BEGIN
    RETURN IFNULL((
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', bc.id,
                'name', bc.name,
                'position', CAST(bc.`position` AS SIGNED)
            )
        )
        FROM board_columns bc
        WHERE bc.id_board = p_board_id
    ), JSON_ARRAY());
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetBoardDetailsFunction` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `GetBoardDetailsFunction`(
    p_board_id INT,
    p_user_id INT
) RETURNS longtext CHARSET utf8mb4
    READS SQL DATA
BEGIN
    DECLARE v_result LONGTEXT;
    DECLARE v_has_access INT;

    SELECT COUNT(*) INTO v_has_access
    FROM boards b
    LEFT JOIN board_members bm ON b.id = bm.board_id AND bm.user_id = p_user_id
    WHERE b.id = p_board_id AND (b.owner_id = p_user_id OR bm.user_id IS NOT NULL);

    IF v_has_access = 0 THEN
        RETURN NULL;
    END IF;

    SELECT 
        JSON_OBJECT(
            'id', b.id,
            'title', b.title,
            'description', b.description,
            'createdAt', b.created_at,
            'deadline', b.deadline,
            'type', JSON_OBJECT(
                'name', bt.name,
                'displayName', bt.display_name,
                'maxUsers', CAST(bt.max_users AS SIGNED),
                'hasWebSockets', IF(bt.has_websockets = 1, TRUE, FALSE)
            ),
            'owner', JSON_OBJECT(
                'id', u.id,
                'lastName', u.last_name,
                'firstName', u.first_name,
                'middleName', IFNULL(u.middle_name, '')
            ),
            'columns', JSON_EXTRACT(GetBoardColumnsJSON(b.id), '$'),
            'timePoints', JSON_EXTRACT(GetBoardMilestonesJSON(b.id), '$'),
            'users', JSON_EXTRACT(GetBoardMembersJSON(b.id), '$'),
            'tasks', JSON_EXTRACT(GetBoardTasksJSON(b.id), '$')
        ) INTO v_result
    FROM boards b
    JOIN board_types bt ON b.id_type = bt.id
    JOIN users u ON b.owner_id = u.id
    WHERE b.id = p_board_id;

    RETURN v_result;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetBoardMembersJSON` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `GetBoardMembersJSON`(p_board_id INT) RETURNS longtext CHARSET utf8mb4
    READS SQL DATA
BEGIN
    RETURN IFNULL((
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', mu.id,
                'email', mu.email,
                'first_name', mu.first_name,
                'last_name', mu.last_name,
                'middle_name', IFNULL(mu.middle_name, ''),
                'avatar_url', IFNULL(mu.avatar_url, ''),
                'username', mu.username,
                'role', JSON_OBJECT(
                    'id', r.id,
                    'name', r.role_name,
                    'displayName', r.display_name,
                    'permission_level', CAST(r.id AS SIGNED),
                    'description', IFNULL(r.description, '')
                )
            )
        )
        FROM board_members bm
        JOIN users mu ON bm.user_id = mu.id
        JOIN board_roles r ON bm.id_board_role = r.id
        WHERE bm.board_id = p_board_id
    ), JSON_ARRAY());
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetBoardMilestonesJSON` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `GetBoardMilestonesJSON`(p_board_id INT) RETURNS longtext CHARSET utf8mb4
    READS SQL DATA
BEGIN
    RETURN IFNULL((
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', tp.id,
                'title', tp.title,
                'target_date', tp.target_date
            )
        )
        FROM time_points tp
        WHERE tp.board_id = p_board_id
    ), JSON_ARRAY());
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetBoardTasksJSON` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `GetBoardTasksJSON`(p_board_id INT) RETURNS longtext CHARSET utf8mb4
    READS SQL DATA
BEGIN
    RETURN IFNULL((
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', t.id,
                'title', t.title,
                'short_desc', IFNULL(t.short_desc, ''),
                'full_desc', IFNULL(t.full_desc, ''),
                'status', CAST(t.id_column AS SIGNED),
                'priority', CAST(t.priority AS SIGNED),
                'progress', CAST(IFNULL(t.progress, 0) AS SIGNED),
                'deadline', IFNULL(t.deadline, ''),
                'created_at', DATE_FORMAT(t.created_at, '%d.%m.%Y'),
                'author', JSON_OBJECT(
                    'id', au.id,
                    'first_name', au.first_name,
                    'last_name', au.last_name,
                    'middle_name', IFNULL(au.middle_name, '')
                ),
                'isMvp', IF(t.isMvp = 1, TRUE, FALSE),
                'tags', JSON_EXTRACT(GetTaskTagsJSON(t.id), '$'),
                'executors', JSON_EXTRACT(GetTaskExecutorsJSON(t.id), '$'),
                'time_point', IF(tp.id IS NULL, NULL, JSON_OBJECT(
                    'id', tp.id,
                    'title', tp.title,
                    'target_date', tp.target_date
                ))
            )
        )
        FROM tasks t
        JOIN users au ON t.author_id = au.id
        JOIN board_columns bc_task ON t.id_column = bc_task.id
        LEFT JOIN time_points tp ON t.time_point_id = tp.id
        WHERE bc_task.id_board = p_board_id
    ), JSON_ARRAY());
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetTaskExecutorsJSON` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `GetTaskExecutorsJSON`(p_task_id INT) RETURNS longtext CHARSET utf8mb4
    READS SQL DATA
BEGIN
    RETURN IFNULL((
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', ex.id,
                'email', ex.email,
                'first_name', ex.first_name,
                'last_name', ex.last_name,
                'middle_name', IFNULL(ex.middle_name, ''),
                'avatar_url', IFNULL(ex.avatar_url, ''),
                'username', ex.username,
                'role', JSON_OBJECT(
                    'id', br.id,
                    'name', br.role_name,
                    'displayName', br.display_name,
                    'permission_level', CAST(br.id AS SIGNED),
                    'description', IFNULL(br.description, '')
                )
            )
        )
        FROM task_executors te
        JOIN users ex ON te.id_user = ex.id
        JOIN tasks t ON te.id_task = t.id
        JOIN board_columns bc ON t.id_column = bc.id
        JOIN board_members bm ON bc.id_board = bm.board_id AND bm.user_id = ex.id
        JOIN board_roles br ON bm.id_board_role = br.id
        WHERE te.id_task = p_task_id
    ), JSON_ARRAY());
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetTaskTagsJSON` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `GetTaskTagsJSON`(p_task_id INT) RETURNS longtext CHARSET utf8mb4
    READS SQL DATA
BEGIN
    RETURN IFNULL((
        SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', tag.id,
                'name', tag.name,
                'tag_color', IFNULL(tag.color_role, '#ffffff'),
                'background_color', IFNULL(tag.background_color, '#000000')
            )
        )
        FROM task_tags tt 
        JOIN tags tag ON tt.id_tag = tag.id 
        WHERE tt.id_task = p_task_id
    ), JSON_ARRAY());
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `GetUserBoardsFunction` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `GetUserBoardsFunction`(
    p_user_id INT
) RETURNS longtext CHARSET utf8mb4
    READS SQL DATA
BEGIN
    DECLARE v_result LONGTEXT;

    SELECT 
        JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', b.id,
                'title', b.title,
                'description', b.description,
                'createdAt', b.created_at,
                'deadline', b.deadline,
                'type', JSON_OBJECT(
                    'name', bt.name,
                    'displayName', bt.display_name,
                    'maxUsers', CAST(bt.max_users AS SIGNED),
                    'hasWebSockets', IF(bt.has_websockets = 1, TRUE, FALSE)
                ),
                'owner', JSON_OBJECT(
                    'id', u.id,
                    'lastName', u.last_name,
                    'firstName', u.first_name,
                    'middleName', IFNULL(u.middle_name, '')
                ),
                'columns', (
                	SELECT JSON_ARRAYAGG(
                		JSON_OBJECT(
		                	'id', bc.id,
		                	'name', bc.name,
		                	'position', bc.`position`
		                )
                	)
                	FROM board_columns bc
                	WHERE b.id = bc.id_board
                ),
				'users', (
                    SELECT JSON_ARRAYAGG(
                        JSON_OBJECT(
                            'id', mu.id,
                            'email', mu.email,
                            'first_name', mu.first_name,
                            'last_name', mu.last_name,
                            'middle_name', IFNULL(mu.middle_name, ''),
                            'avatar_url', IFNULL(mu.avatar_url, ''),
                            'username', mu.username,
                            'role', JSON_OBJECT(
                                'id', br.id,
                                'name', br.role_name,
                                'displayName', br.display_name,
                                'permission_level', CAST(br.id AS SIGNED),
                                'description', IFNULL(br.description, '')
                            )
                        )
                    )
                    FROM board_members bm
                    JOIN users mu ON bm.user_id = mu.id
                    JOIN board_roles br ON bm.id_board_role = br.id
                    WHERE bm.board_id = b.id
                )
            )
        ) INTO v_result
    FROM boards b
    JOIN board_types bt ON b.id_type = bt.id
    JOIN users u ON b.owner_id = u.id
    WHERE (
        b.owner_id = p_user_id 
        OR b.id IN (SELECT bm2.board_id FROM board_members bm2 WHERE bm2.user_id = p_user_id)
    )
    ORDER BY b.created_at DESC;

    RETURN IFNULL(v_result, '[]');
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `InsertBoardColumns` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `InsertBoardColumns`(p_board_id INT, p_columns_json TEXT) RETURNS int
    MODIFIES SQL DATA
BEGIN
    IF p_columns_json IS NOT NULL AND JSON_VALID(p_columns_json) AND JSON_LENGTH(p_columns_json) > 0 THEN
        INSERT INTO board_columns (id_board, name, position)
        SELECT p_board_id, jt.col_name, jt.col_pos
        FROM JSON_TABLE(
            p_columns_json,
            '$[*]' COLUMNS(
                col_name VARCHAR(255) PATH '$.name',
                col_pos INT PATH '$.position'
            )
        ) AS jt;
    END IF;
    RETURN 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `InsertBoardMembers` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `InsertBoardMembers`(
    p_board_id INT, 
    p_owner_id INT,
    p_invited_users_json TEXT
) RETURNS int
    MODIFIES SQL DATA
BEGIN
    INSERT IGNORE INTO board_members (board_id, user_id, id_board_role)
    VALUES (p_board_id, p_owner_id, 1);

    IF p_invited_users_json IS NOT NULL AND JSON_VALID(p_invited_users_json) AND JSON_LENGTH(p_invited_users_json) > 0 THEN
        INSERT IGNORE INTO board_members (board_id, user_id, id_board_role)
        SELECT p_board_id, jt.user_id, IFNULL(jt.role_id, 2) 
        FROM JSON_TABLE(
            p_invited_users_json,
            '$[*]' COLUMNS(
                user_id INT PATH '$.user_id',
                role_id INT PATH '$.role_id'
            )
        ) AS jt

        WHERE jt.user_id <> p_owner_id;
    END IF;
    
    RETURN 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP FUNCTION IF EXISTS `InsertBoardTimePoints` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` FUNCTION `InsertBoardTimePoints`(p_board_id INT, p_time_points_json TEXT) RETURNS int
    MODIFIES SQL DATA
BEGIN
    IF p_time_points_json IS NOT NULL AND JSON_VALID(p_time_points_json) AND JSON_LENGTH(p_time_points_json) > 0 THEN
        INSERT INTO time_points (board_id, title, target_date, description, created_at)
        SELECT 
            p_board_id, 
            jt.tp_title,
            STR_TO_DATE(SUBSTRING_INDEX(jt.tp_target_date, '.', 1), '%Y-%m-%dT%H:%i:%s'),
            jt.tp_description, 
            NOW()
        FROM JSON_TABLE(
            p_time_points_json,
            '$[*]' COLUMNS(
                tp_title VARCHAR(255) PATH '$.title',
                tp_target_date VARCHAR(64) PATH '$.target_date',
                tp_description TEXT PATH '$.description'
            )
        ) AS jt;
    END IF;
    RETURN 1;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `change_member_role` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `change_member_role`(
    IN p_board_id INT,
    IN p_user_id INT,
    IN p_new_role_id INT
)
BEGIN
    UPDATE board_members 
    SET id_board_role = p_new_role_id
    WHERE board_id = p_board_id AND user_id = p_user_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `create_board` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `create_board`(
    IN _title VARCHAR(100),
    IN _description TEXT,
    IN _type_id INT,
    IN _owner_id INT,
    IN _invited_users_json TEXT, 
    OUT _new_board_id INT
)
BEGIN
    -- Создаем доску
    INSERT INTO boards (title, description, type_id, owner_id, created_at)
    VALUES (_title, _description, _type_id, _owner_id, NOW());
    
    -- Получаем ID только что созданной доски
    SET _new_board_id = LAST_INSERT_ID();
    
    INSERT INTO board_members (board_id, user_id, id_board_role)
    VALUES (_new_board_id, _owner_id, 1);
    
	IF _invited_users_json IS NOT NULL THEN
	    SELECT InsertBoardMembers(_new_board_id, _owner_id, _invited_users_json) INTO @discard;
	END IF;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `create_user_account` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `create_user_account`(
    IN p_username VARCHAR(100),
    IN p_email VARCHAR(100),
    IN p_password VARCHAR(100),
    IN p_full_name VARCHAR(300),
    IN p_birth_date DATE
)
BEGIN
    DECLARE v_last_name VARCHAR(100) DEFAULT '';
    DECLARE v_first_name VARCHAR(100) DEFAULT '';
    DECLARE v_middle_name VARCHAR(100) DEFAULT NULL;

    SET p_full_name = TRIM(p_full_name);
    SET v_last_name = SUBSTRING_INDEX(p_full_name, ' ', 1);

    IF INSTR(p_full_name, ' ') > 0 THEN
        SET p_full_name = SUBSTRING(p_full_name, INSTR(p_full_name, ' ') + 1);
        SET p_full_name = TRIM(p_full_name);

        SET v_first_name = SUBSTRING_INDEX(p_full_name, ' ', 1);

        IF INSTR(p_full_name, ' ') > 0 THEN
            SET v_middle_name = SUBSTRING(p_full_name, INSTR(p_full_name, ' ') + 1);
            SET v_middle_name = TRIM(v_middle_name);
        END IF;
    END IF;

    INSERT INTO users (username, email, password, last_name, first_name, middle_name, birth_date)
    VALUES (p_username, p_email, p_password, v_last_name, v_first_name, v_middle_name, p_birth_date);
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `delete_task_by_id` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `delete_task_by_id`(
    IN _task_id INT
)
BEGIN
    DELETE FROM tasks WHERE id = _task_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetTeamList` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetTeamList`(IN current_user_id INT)
BEGIN
    SELECT 
        u.id, 
        u.first_name, 
        u.last_name, 
        u.middle_name, 
        u.email, 
        u.birth_date,
        r.id AS role_id, 
        r.permission_level, 
        r.display_name AS role_name, 
        r.description AS role_description,
        r.text_color AS color, 
        r.background_color,
        CAST(COUNT(te.id_task) AS SIGNED) AS count_tasks,
        JSON_OBJECT(
            'total', CAST(COUNT(te.id_task) AS SIGNED),
            'todo', CAST(SUM(CASE WHEN t.status = 1 THEN 1 ELSE 0 END) AS SIGNED),
            'in_progress', CAST(SUM(CASE WHEN t.status = 2 THEN 1 ELSE 0 END) AS SIGNED),
            'done', CAST(SUM(CASE WHEN t.status = 3 THEN 1 ELSE 0 END) AS SIGNED)
        ) AS stats_json
    FROM users u 
    LEFT JOIN roles r ON u.id_role = r.id 
    LEFT JOIN task_executors te ON u.id = te.id_user
    LEFT JOIN tasks t ON te.id_task = t.id
    WHERE u.id != current_user_id
    GROUP BY u.id, r.id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GetUserProfile` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `GetUserProfile`(IN userId INT)
BEGIN
    SELECT 
        JSON_OBJECT(
            'id', CAST(u.id AS SIGNED),
            'first_name', u.first_name,
            'last_name', u.last_name,
            'middle_name', u.middle_name,
            'email', u.email,
            'birthday', IF(u.birth_date IS NOT NULL, DATE_FORMAT(u.birth_date, '%d.%m.%Y'), 'Не указана'),
            'username', u.username,
            'role', JSON_OBJECT(
                'id', CAST(r.id AS SIGNED),
                'role_name', r.display_name,
                'permission_level', CAST(r.permission_level AS SIGNED),
                'description', r.description,
                'background_color', r.background_color,
                'text_color', r.text_color
            ),
            'stats', JSON_OBJECT(
                'total', CAST(COUNT(te.id_task) AS SIGNED),
                'todo', CAST(COUNT(CASE WHEN t.status = 1 THEN 1 END) AS SIGNED),
                'in_progress', CAST(COUNT(CASE WHEN t.status = 2 THEN 1 END) AS SIGNED),
                'done', CAST(COUNT(CASE WHEN t.status = 3 THEN 1 END) AS SIGNED)
            )
        ) AS profile_json
    FROM users u 
    LEFT JOIN roles r ON u.id_role = r.id 
    LEFT JOIN task_executors te ON u.id = te.id_user
    LEFT JOIN tasks t ON te.id_task = t.id
    WHERE u.id = userId
    GROUP BY u.id, r.id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_board_tasks` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `get_board_tasks`(
    IN _board_id INT
)
BEGIN
    SELECT 
        t.id, 
        t.title, 
        t.short_desc, 
        t.full_desc, 
        t.priority, 
        t.status, 
        t.deadline, 
        t.author_id, 
        t.isMvp
    FROM tasks t
    INNER JOIN board_columns bc ON t.status = bc.id
    WHERE bc.id_board = _board_id
    ORDER BY t.id DESC;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `get_user_tasks` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_user_tasks`(IN p_user_id INT)
BEGIN
    SELECT 
        t.id, 
        t.title, 
        t.short_desc, 
        t.full_desc, 
        t.status, 
        t.priority, 
        t.progress, 
        JSON_OBJECT(
            'id', u.id, 
            'first_name', u.first_name, 
            'last_name', u.last_name, 
            'middle_name', u.middle_name
        ) AS author,
        t.deadline, 
        DATE_FORMAT(t.created_at, '%d.%m.%Y') as created_at,
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', tag.id, 
                'name', tag.name, 
                'tag_color', tag.color_role, 
                'background_color', tag.background_color
            )
        ) FROM task_tags tt 
          JOIN tags tag ON tt.id_tag = tag.id 
          WHERE tt.id_task = t.id
        ) AS tags,
        (SELECT JSON_ARRAYAGG(
            JSON_OBJECT(
                'id', ex.id, 
                'first_name', ex.first_name, 
                'last_name', ex.last_name
            )
        ) FROM task_executors te 
          JOIN users ex ON te.id_user = ex.id 
          WHERE te.id_task = t.id
        ) AS executors
    FROM tasks t 
    JOIN users u ON t.author_id = u.id
    WHERE t.id IN (SELECT id_task FROM task_executors WHERE id_user = p_user_id)
    GROUP BY t.id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `update_task_details` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `update_task_details`(
    IN _task_id INT,
    IN _title VARCHAR(100),
    IN _full_desc TEXT,
    IN _column_id INT,
    IN _priority INT,
    IN _deadline TIMESTAMP,
    IN _isMvp BOOLEAN,
    IN _time_point_id INT
)
BEGIN
    UPDATE tasks 
    SET title = _title, 
        full_desc = _full_desc, 
        id_column = _column_id, 
        priority = _priority, 
        deadline = _deadline,
        isMvp = _isMvp,
        time_point_id = _time_point_id
    WHERE id = _task_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `update_task_status` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`%` PROCEDURE `update_task_status`(
    IN _column_id INT,
    IN _task_id INT
)
BEGIN
    UPDATE tasks SET id_column = _column_id WHERE id = _task_id;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-18  2:12:17
