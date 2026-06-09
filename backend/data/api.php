<?php
require_once 'cors.php';
require_once 'db_config.php';
require_once 'auth_checker.php';

require_once 'controllers/TaskController.php';
require_once 'controllers/UserController.php';
require_once 'AuthService.php';

$endpoint = $_GET['endpoint'] ?? '';
$action = $_GET['action'] ?? '';
$userId = $_GET['user_id'] ?? null;

if ($endpoint !== 'auth'){
    if (!checkAuth($pdo, $userId)) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

try{
    switch ($endpoint) {
    case 'tasks': taskActions($pdo, $action, $userId); break;
    case 'users': userActions($pdo, $action, $userId); break;
    case 'auth': authActions($pdo, $action); break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Endpoint not found']);
        break;
    }
}
catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>