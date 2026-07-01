<?php
function userActions($pdo, $action, $userId) {
    $userController = new UserController($pdo);
    $input = json_decode(file_get_contents('php://input'), true)  ?? [];

    try {
        switch($action) {
            case 'get_all_users': 
                $userController->getAllUsers($userId); 
                break;
            case 'get_count_user_tasks': 
                $userController->getCountUserTasks($userId); 
                break;
            case 'add_new_user': 
                $userController->addNewUser($input); 
                break;
            case 'update_user': 
                $userController->updateUser($input); 
                break;
            case 'delete_user': 
                $userController->deleteUser($userId); 
                break;
            case 'get_all_roles': 
                $userController->getAllRoles($userId); 
                break;
            case 'get_profile': 
                $userController->getProfile($userId); 
                break;
            default:
                http_response_code(405);
                echo json_encode(["error" => "Method not allowed"]);
        }        
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack(); 
        }
        http_response_code(500);
        echo json_encode(["error" => "Ошибка сервера: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

class UserController {
    private $pdo;

    public function __construct($pdo) {
        $this->pdo = $pdo;
    }

    public function addNewUser($input) {
        $passwordHash = isset($input['password']) ? password_hash($input['password'], PASSWORD_BCRYPT) : null;

        $sql = "INSERT INTO users (first_name, last_name, middle_name, email, birth_date, id_role, username, password) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            $input['first_name'] ?? null,
            $input['last_name'] ?? null,
            $input['middle_name'] ?? '',
            $input['email'] ?? null,
            $input['birthday'] ?? null,
            $input['id_role'] ?? null,
            $input['username'] ?? '',
            $passwordHash
        ]);

        $newUserId = $this->pdo->lastInsertId();

        $roleSql = "SELECT id, permission_level, display_name as name, description, text_color as color, background_color 
                    FROM roles WHERE id = ?";
        $roleStmt = $this->pdo->prepare($roleSql);
        $roleStmt->execute([$input['id_role']]);
        $roleData = $roleStmt->fetch(PDO::FETCH_ASSOC);

        http_response_code(201);
        echo json_encode([
            "id" => (int)$newUserId,
            "role" => $roleData ? $roleData : null
        ], JSON_UNESCAPED_UNICODE);
    }

    public function updateUser($input) {
        if (!isset($input['id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing user ID for update"], JSON_UNESCAPED_UNICODE);
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
                
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            $input['first_name'] ?? null,
            $input['last_name'] ?? null,
            $input['middle_name'] ?? '',
            $input['email'] ?? null,
            $input['birthday'] ?? null,
            $input['id_role'] ?? null,
            $input['id']
        ]);

        $roleSql = "SELECT id, permission_level, display_name as name, description, text_color as color, background_color 
                    FROM roles WHERE id = ?";
        $roleStmt = $this->pdo->prepare($roleSql);
        $roleStmt->execute([$input['id_role']]);
        $roleData = $roleStmt->fetch(PDO::FETCH_ASSOC);

        echo json_encode([
            "status" => "success",
            "role" => $roleData ? $roleData : null
        ], JSON_UNESCAPED_UNICODE);
    }

    public function getAllRoles($userId) {
        $editorLevel = isset($_GET['editor_level']) ? (int)$_GET['editor_level'] : null;
        
        if (!$userId || $editorLevel === null) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required parameters"]);
            return;
        }
        
        $checkSql = "SELECT r.permission_level FROM users u LEFT JOIN roles r ON u.id_role = r.id WHERE u.id = ?";
        $checkStmt = $this->pdo->prepare($checkSql);
        $checkStmt->execute([$userId]);
        $realLevel = (int)$checkStmt->fetchColumn();

        if ($editorLevel > $realLevel) {
            $editorLevel = $realLevel;
        }

        $sql = "SELECT id, permission_level, display_name as name, description, text_color as color, background_color 
                FROM roles 
                WHERE permission_level < ?
                ORDER BY permission_level DESC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$editorLevel]);
        $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    public function deleteUser($currentAdminId) {
        $targetUserId = isset($_GET['target_user_id']) ? (int)$_GET['target_user_id'] : null;

        if (!$targetUserId) {
            http_response_code(400);
            echo json_encode(["error" => "Missing target user ID"]);
            return;
        }

        if ($targetUserId === (int)$currentAdminId) {
            http_response_code(400);
            echo json_encode(["error" => "Вы не можете удалить самого себя"], JSON_UNESCAPED_UNICODE);
            return;
        }

        try {
            $this->pdo->beginTransaction();

            /* удаление юзера с задачи */
            $sqlExecutors = "DELETE FROM task_executors WHERE id_user = ?";
            $stmtExecutors = $this->pdo->prepare($sqlExecutors);
            $stmtExecutors->execute([$targetUserId]);
            /* переписываение задачи на текущего админа доски*/
            $sqlAuthors = "UPDATE tasks SET author_id = ? WHERE author_id = ?";
            $stmtAuthors = $this->pdo->prepare($sqlAuthors);
            $stmtAuthors->execute([$currentAdminId, $targetUserId]);
            
            /* удаление пользователя*/
            $sqlUser = "DELETE FROM users WHERE id = ?";
            $stmtUser = $this->pdo->prepare($sqlUser);
            $stmtUser->execute([$targetUserId]);

            $this->pdo->commit();
            echo json_encode(["status" => "success", "deleted_id" => $targetUserId], JSON_UNESCAPED_UNICODE);

        } catch (PDOException $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            http_response_code(500);
            echo json_encode(["error" => "Ошибка при удалении: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function getAllUsers($userId) {
        $sql = "CALL GetTeamList(?)";
                
        $stmt = $this->pdo->prepare($sql);
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

    public function getCountUserTasks($userId) {
        $sql = "SELECT COUNT(*) as task_count FROM tasks WHERE author_id = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
    }

    public function getProfile($userId) {
        try {
            $stmt = $this->pdo->prepare("CALL GetUserProfile(?)");
            $stmt->execute([$userId]);
            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$result || empty($result['profile_json'])) {
                http_response_code(404);
                echo json_encode(["error" => "Пользователь не найден"], JSON_UNESCAPED_UNICODE);
                return;
            }

            echo $result['profile_json'];

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Ошибка сервера: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }
}