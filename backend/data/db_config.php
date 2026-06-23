<?php
$host = "MySQL-8.0";
$user = "root";
$pass = "";
$db = "manager_tasks_bd";

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db;charset=utf8", $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
    ]);
} catch (PDOException $e) {
    die(json_encode(["error" => "Connection failed: " . $e->getMessage()]));
}
?>