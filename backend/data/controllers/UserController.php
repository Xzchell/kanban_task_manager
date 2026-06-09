<?php
function userActions($pdo, $action, $userId) {
    try {
        switch($action) {
            case 'get_all_users': getAllUsers($pdo, $userId); break;
            case 'get_count_user_tasks': getCountUserTasks($pdo, $userId); break;
            case 'add_new_user': addNewUser($pdo); break;
            case 'update_user': updateUser($pdo); break;
            case 'delete_user': deleteUser($pdo, $userId); break;
            case 'get_all_roles': getAllRoles($pdo, $userId); break;
            case 'get_profile': getProfile($pdo, $userId); break;
            default:
                http_response_code(405);
                echo json_encode(["error" => "Method not allowed"]);
        }        
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack(); 
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}

function addNewUser($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid JSON input"]);
        return;
    }

    $passwordHash = isset($input['password']) ? password_hash($input['password'], PASSWORD_BCRYPT) : null;

    $sql = "INSERT INTO users (first_name, last_name, middle_name, email, birth_date, id_role, username, password) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $input['first_name'],
        $input['last_name'],
        $input['middle_name'] ?? '',
        $input['email'],
        $input['birthday'] ?? null,
        $input['id_role'],
        $input['username'] ?? '',
        $passwordHash
    ]);

    $newUserId = $pdo->lastInsertId();

    $roleSql = "SELECT id, permission_level, display_name as name, description, text_color as color, background_color 
                FROM roles WHERE id = ?";
    $roleStmt = $pdo->prepare($roleSql);
    $roleStmt->execute([$input['id_role']]);
    $roleData = $roleStmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(201);
    echo json_encode([
        "id" => (int)$newUserId,
        "role" => $roleData
    ], JSON_UNESCAPED_UNICODE);
}

function updateUser($pdo) {
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input || !isset($input['id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid parameters for updating"]);
        return;
    }

    $sql = "UPDATE users SET 
                first_name = ?, 
                last_name = ?, 
                middle_name = ?, 
                email = ?, 
                birth_date = ?, 
                id_role = ?
            WHERE id = ?";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $input['first_name'],
        $input['last_name'],
        $input['middle_name'] ?? '',
        $input['email'],
        $input['birthday'] ?? null,
        $input['id_role'],
        $input['id']
    ]);

    $roleSql = "SELECT id, permission_level, display_name as name, description, text_color as color, background_color 
                FROM roles WHERE id = ?";
    $roleStmt = $pdo->prepare($roleSql);
    $roleStmt->execute([$input['id_role']]);
    $roleData = $roleStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "role" => $roleData
    ], JSON_UNESCAPED_UNICODE);
}

function getAllRoles($pdo, $userId) {
    $editorLevel = isset($_GET['editor_level']) ? (int)$_GET['editor_level'] : null;
    
    if (!$userId || $editorLevel === null) {
        http_response_code(400);
        echo json_encode(["error" => "Missing required parameters"]);
        return;
    }
    $checkSql = "SELECT r.permission_level FROM users u LEFT JOIN roles r ON u.id_role = r.id WHERE u.id = ?";
    $checkStmt = $pdo->prepare($checkSql);
    $checkStmt->execute([$userId]);
    $realLevel = (int)$checkStmt->fetchColumn();

    if ($editorLevel > $realLevel) {
        $editorLevel = $realLevel;
    }

    $sql = "SELECT id, permission_level, display_name as name, description, text_color as color, background_color 
                FROM roles 
                WHERE permission_level < ?
                ORDER BY permission_level DESC";

    $stmt = $pdo->prepare($sql);
    $stmt->execute([$editorLevel]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($data, JSON_UNESCAPED_UNICODE);
}

function deleteUser($pdo, $currentAdminId) {
    $targetUserId = isset($_GET['target_user_id']) ? (int)$_GET['target_user_id'] : null;

    if (!$targetUserId) {
        http_response_code(400);
        echo json_encode(["error" => "Missing target user ID"]);
        return;
    }

    //Защита от самоудаления
    if ($targetUserId === (int)$currentAdminId) {
        http_response_code(400);
        echo json_encode(["error" => "Вы не можете удалить самого себя"], JSON_UNESCAPED_UNICODE);
        return;
    }

    try {
        $pdo->beginTransaction();

        // Удаляем пользователя из исполнителей задач
        $sqlExecutors = "DELETE FROM task_executors WHERE id_user = ?";
        $stmtExecutors = $pdo->prepare($sqlExecutors);
        $stmtExecutors->execute([$targetUserId]);

        //Переписываем авторство задач на текущего админа (который делает удаление)
        $sqlAuthors = "UPDATE tasks SET author_id = ? WHERE author_id = ?";
        $stmtAuthors = $pdo->prepare($sqlAuthors);
        $stmtAuthors->execute([$currentAdminId, $targetUserId]);

        //Удаление самого пользователя
        $sqlUser = "DELETE FROM users WHERE id = ?";
        $stmtUser = $pdo->prepare($sqlUser);
        $stmtUser->execute([$targetUserId]);

        $pdo->commit();

        echo json_encode(["status" => "success", "deleted_id" => $targetUserId], JSON_UNESCAPED_UNICODE);

    } catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        http_response_code(500);
        echo json_encode(["error" => "Ошибка при удалении: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

function getAllUsers($pdo, $userId) {
    $sql = "CALL GetTeamList(?)";
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($data as &$user) {
        if (!empty($user['stats_json'])) {
            $user['stats'] = json_decode($user['stats_json'], true);
        } else {
            $user['stats'] = ['total' => 0, 'todo' => 0, 'in_progress' => 0, 'done' => 0];
        }
        unset($user['stats_json']);
    }
    unset($user);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
}

function getCountUserTasks($pdo, $userId){
    $sql = "SELECT COUNT(*) as task_executors FROM tasks WHERE id_user = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$userId]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
}
function getProfile($pdo, $userId) {
    try {
        $stmt = $pdo->prepare("CALL GetUserProfile(?)");
        $stmt->execute([$userId]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result || empty($result['profile_json'])) {
            http_response_code(404);
            echo json_encode(["error" => "Пользователь не найден"], JSON_UNESCAPED_UNICODE);
            return;
        }

        header('Content-Type: application/json; charset=utf-8');
        echo $result['profile_json'];

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Ошибка сервера: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}