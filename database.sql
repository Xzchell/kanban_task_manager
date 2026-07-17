-- MySQL dump 10.13  Distrib 8.0.19, for Win64 (x86_64)
--
-- Host: localhost    Database: manager_tasks_bd
-- ------------------------------------------------------
-- Server version	5.7.25

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
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `description` varchar(100) DEFAULT NULL,
  `permission_level` int(11) NOT NULL,
  `background_color` varchar(100) DEFAULT NULL,
  `text_color` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `roles_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'user','Пользователь','Исполнитель задач',1,NULL,NULL),(2,'admin','Админ','Админ проекта',3,NULL,NULL),(3,'manager','Team Lead','Создает задачи, назначает исполнителей, устанавливает дедлайны и приоритеты.',3,'#FFE8A3','#856404'),(4,'design','UI Дизайнер','-',1,'#f3e8ff','#8200de'),(5,'devevloper-frontend','Frontend Разработчик','Основная роль. Может брать задачи в работу, менять их статус',1,'#FFF0F6','#D63384'),(6,'developer-backend','Backend Разработчик',NULL,1,'#E7F5FF','#007BFF'),(7,'developer-fullstack','Fullstack Разработчик',NULL,1,'#F3F0FF','#6F42C1'),(8,'qa-engineer','QA Engineer',NULL,1,'#D4EDDA','#155724'),(9,'system-analyst','Системный Аналитик',NULL,1,'#E2E3E5','#383D41');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tags`
--

DROP TABLE IF EXISTS `tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `color_role` varchar(10) DEFAULT NULL,
  `background_color` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `tags_name_unique` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tags`
--

LOCK TABLES `tags` WRITE;
/*!40000 ALTER TABLE `tags` DISABLE KEYS */;
INSERT INTO `tags` VALUES (1,'Дизайн','#ff5c00','#ffece1'),(2,'Вёрстка','#2c62b4','#e1f6ff'),(3,'Баг','#bc4848','#f8d9d9'),(4,'Бэкенд','#268fb0','#d9f4f8'),(5,'Фронтенд ','#ff00b8','#fbe6fc');
/*!40000 ALTER TABLE `tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_attachments`
--

DROP TABLE IF EXISTS `task_attachments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_attachments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_task` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  `file_url` text NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `task_attachments_users_FK` (`id_user`),
  KEY `task_attachments_tasks_FK` (`id_task`),
  CONSTRAINT `task_attachments_tasks_FK` FOREIGN KEY (`id_task`) REFERENCES `tasks` (`id`),
  CONSTRAINT `task_attachments_users_FK` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
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
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_task` int(11) NOT NULL,
  `id_user` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `task_executors_users_FK` (`id_user`),
  KEY `task_executors_tasks_FK` (`id_task`),
  CONSTRAINT `task_executors_tasks_FK` FOREIGN KEY (`id_task`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_executors_users_FK` FOREIGN KEY (`id_user`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=89 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_executors`
--

LOCK TABLES `task_executors` WRITE;
/*!40000 ALTER TABLE `task_executors` DISABLE KEYS */;
INSERT INTO `task_executors` VALUES (68,2,5),(69,2,10),(83,3,5),(84,3,12),(85,3,10),(87,25,5),(88,25,13);
/*!40000 ALTER TABLE `task_executors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `task_tags`
--

DROP TABLE IF EXISTS `task_tags`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `task_tags` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_task` int(11) NOT NULL,
  `id_tag` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `task_tags_tags_FK` (`id_tag`),
  KEY `task_tags_tasks_FK` (`id_task`),
  CONSTRAINT `task_tags_tags_FK` FOREIGN KEY (`id_tag`) REFERENCES `tags` (`id`),
  CONSTRAINT `task_tags_tasks_FK` FOREIGN KEY (`id_task`) REFERENCES `tasks` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=118 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `task_tags`
--

LOCK TABLES `task_tags` WRITE;
/*!40000 ALTER TABLE `task_tags` DISABLE KEYS */;
INSERT INTO `task_tags` VALUES (103,2,1),(113,3,2),(114,3,5),(116,25,4),(117,25,3);
/*!40000 ALTER TABLE `task_tags` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tasks`
--

DROP TABLE IF EXISTS `tasks`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tasks` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `short_desc` varchar(500) NOT NULL,
  `full_desc` text NOT NULL,
  `status` int(11) NOT NULL,
  `priority` int(11) NOT NULL,
  `progress` int(11) NOT NULL,
  `author_id` int(11) NOT NULL,
  `deadline` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `tasks_users_FK` (`author_id`),
  KEY `tasks_priorities_FK` (`priority`),
  KEY `tasks_status_FK` (`status`),
  CONSTRAINT `tasks_users_FK` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tasks`
--

LOCK TABLES `tasks` WRITE;
/*!40000 ALTER TABLE `tasks` DISABLE KEYS */;
INSERT INTO `tasks` VALUES (2,'Дизайн карточки - СРОЧНОЕ!!','Обдумать и сделать дизайн карточки. Перенести дизайн в react проект.','<p>Hello everybody!</p><p>ss<br>a</p><p></p><h2>asdfdsf</h2><p></p>',2,4,0,5,'2026-04-13 21:00:00','2026-03-30 10:12:40'),(3,'Алгоритм отслеживания выгорания- СРОЧНО!!','Разработать логику уведомлений на основе активности разработчика.','<p>Система должна анализировать время нахождения задач в колонке \"В работе\". Если задача висит без движения более 3-х дней, статус автора должен подсвечиваться индикатором <strong><em>\"Риск выгорания\"</em></strong>.<br></p>',3,2,0,5,'2026-05-13 21:00:00','2026-03-30 14:16:59'),(25,'Оптимизация SQL-запроса получения списка команды с агрегацией данных - СРОЧНО!!!','Переписать текущую выборку пользователей. Вместо отдельных запросов к таблице задач написать один комбинированный LEFT JOIN с использованием COUNT и GROUP BY, чтобы за один проход собирать статистику по статусам (todo, in_progress, done) для IUserResponseDTO.','<p>Переписать текущую выборку пользователей. Вместо отдельных запросов к таблице задач написать один комбинированный</p><p>LEFT JOIN</p><p>с использованием</p><p>COUNT<br>НАписать доп инфуsad</p><h3>asdsads</h3><p></p><pre><code>sadsad\nsad\nsadsdsd</code></pre><p>и</p><p>GROUP BY</p><p>, чтобы за один проход собирать статистику по статусам (</p><p>todo</p><p>,</p><p>in_progress</p><p>,</p><p>done</p><p>) для</p><p>IUserResponseDTO</p>',2,4,0,12,'2026-05-20 21:00:00','2026-05-16 20:18:47');
/*!40000 ALTER TABLE `tasks` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(100) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_sessions_users_FK` (`user_id`),
  CONSTRAINT `user_sessions_users_FK` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
INSERT INTO `user_sessions` VALUES (19,5,'35b89bee929d0421eb13dd4e1dbea3d764bad205a00e07f9da04df87144ffced','2026-04-27 21:54:24'),(46,5,'5fd4be2b379def89a894d13fdc1878a7e5424408da93c11cee034d5328254aa9','2026-05-16 15:55:07'),(47,5,'959c0b4984672cdb6d226010c193ac2ee4c4905032d0cfb351e0a56f77de33c7','2026-05-16 20:03:32'),(48,12,'e540ea8a21887f899141079952f52b2a9995201478cef104054892b1c206753b','2026-05-16 20:14:30'),(49,5,'2dfa6aea0af71157ef0faa6bf925f8d320d3ee260980ce5bf52cd68672d200ff','2026-05-17 09:43:47'),(50,10,'0a96a1a9dbe06cc51965847c6b4ac32da1d5683ed68d84575af488ed2b018113','2026-06-08 22:17:52');
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `last_name` varchar(100) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `birth_date` date NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `id_role` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `username` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`),
  UNIQUE KEY `users_username_unique` (`username`),
  KEY `users_roles_FK` (`id_role`),
  CONSTRAINT `users_roles_FK` FOREIGN KEY (`id_role`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (5,'Иванов','Иван','Иванович','2000-10-10','test@gmail.com','$2y$10$L.chTfyXWXNehWbvCNLmlek/JnBIilpU7WpcRPdQE4XITQGesdOYy',3,'2026-05-16 15:47:50','ivandev'),(10,'Высоковский','Андрей','','1999-11-10','andrew@gmail.com','$2y$10$E3IGm8ftOl/tXgOvegJKyusiY9gPS1LNLamKFsyNh.Brm.aiCaMpm',4,'2026-05-16 15:05:44','andrew_ui'),(12,'Ковалева','Дарья','Сергеевна','1997-07-14','kovaleva.d@team.ru','$2y$10$ggslS6EvUz4CyacrzRK7Aer9.UwchTY651iNLWx.jGnFKTuJXP2Y.',5,'2026-05-16 20:05:24','dash_kovaleva'),(13,'Смирнов','Илья','Николаевич','1994-03-22','smirnov.i@team.ru','$2y$10$7K.WiCZmX9zN2q.nN1EyQeQNY03r8sLoWSZ09SEg0khlaF3ah4NPq',9,'2026-05-16 20:06:23','ilya_smirnov'),(14,'Kluklev','Ivan','','1999-02-12','a@mail.ru','$2y$10$yT/OP22t/dD0zFJ0gxhk.Onaj7DIYobxkv2vKvAmJnNUMfIYncohe',8,'2026-05-17 12:30:31','kluklev');
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
CREATE DEFINER=`root`@`localhost` FUNCTION `add_executor_task`(_id_task int(11), _id_user int(11)) RETURNS int(11)
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
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` FUNCTION `add_task`(_title varchar(100), _short_desc varchar(500), _full_desc text, _priority int(11), _progress int(11), _status int(11), _created_at timestamp, _deadline timestamp, _author_id int(11)) RETURNS int(11)
    DETERMINISTIC
begin
	insert into tasks (
		title, short_desc, full_desc, priority, 
        progress, status, created_at, deadline, author_id
	)
	values (
		_title, _short_desc, _full_desc, _priority, 
        _progress, _status, _created_at, _deadline, _author_id
	);

	return last_insert_id();
end ;;
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
/*!50003 DROP PROCEDURE IF EXISTS `get_all_tasks` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_general_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `get_all_tasks`()
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
    GROUP BY t.id;
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
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-06-09 18:30:03
