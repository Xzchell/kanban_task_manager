<?php
require_once 'BoardPermissions.php';

function userActions(PDO $pdo, string $action, int $userId) {
    $userController = new UserController($pdo);
    $input = json_decode(file_get_contents('php://input'), true) ?? [];

    $boardId = isset($_GET["board_id"]) ? (int)$_GET["board_id"] : (isset($input["board_id"]) ? (int)$input["board_id"] : 0);

    try {
        switch($action) {
            case 'get_profile': 
                $userController->getProfile($userId); 
                break;
                
            case 'search_user': 
                $searchQuery = isset($input["query"]) ? trim($input["query"]) : '';
                $userController->searchUser($searchQuery); 
                break;
                
            case 'update_member_role':
                $newRoleId = isset($input["newIdRole"]) ? (int)$input["newIdRole"] : 0;
                $targetUserId = isset($input["targetUserId"]) ? (int)$input["targetUserId"] : 0;
                
                $userController->updateMemberRole($boardId, $userId, $targetUserId, $newRoleId);
                break;
                
            case 'remove_board_member':
                $targetUserId = isset($input["targetUserId"]) ? (int)$input["targetUserId"] : 0;
                
                $userController->removeMember($boardId, $userId, $targetUserId);
                break;
            case 'add_board_members' : 
                $members = isset($input["members"]) ? (array)$input["members"] : [];
                $userController->addMembersToBoard($boardId, $userId, $members);
                break;
            default:
                http_response_code(405);
                echo json_encode(["error" => "Method not allowed"], JSON_UNESCAPED_UNICODE);
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
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    public function searchUser(string $searchQuery){
        $searchQuery = trim($searchQuery);

        if (strlen($searchQuery) < 3) return;

        try {
            $sql = "SELECT id, username, email, first_name, last_name, middle_name 
                    FROM users 
                    WHERE email = :query 
                       OR username = :query 
                       OR CONCAT(last_name, ' ', first_name) = :query
                    LIMIT 1";

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([':query' => $searchQuery]);
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            echo json_encode([
                "success" => true,
                "user" => $user ? [$user] : []
            ], JSON_UNESCAPED_UNICODE);
        }
        catch (PDOException $e){
            http_response_code(500);
            echo json_encode(["error" => "Ошибка при поиске участника: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function addMembersToBoard(int $boardId, int $initiatorId, array $members) {
        try {
            $permissions = new BoardPermissions($this->pdo, $boardId, $initiatorId, null);

            if (!$permissions->canInviteMembers()) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Недостаточно прав для добавления участников"], JSON_UNESCAPED_UNICODE);
                return;
            }

            if (empty($members)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Список добавляемых участников пуст"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $this->pdo->beginTransaction();

            $sql = "INSERT IGNORE INTO board_members (board_id, user_id, id_board_role) VALUES (?, ?, ?)";
            $stmt = $this->pdo->prepare($sql);

            foreach ($members as $member) {
                $roleId = isset($member['role_id']) ? (int)$member['role_id'] : 2;
                $userId = (int)$member['user_id'];

                $stmt->execute([$boardId, $userId, $roleId]);
            }
            
            $this->pdo->commit();

            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Участники успешно добавлены"
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function updateMemberRole(int $boardId, int $initiatorId, int $targetUserId, int $newRoleId) {
        try{
            $permissions = new BoardPermissions($this->pdo, $boardId, $initiatorId, $targetUserId);

            if (!$permissions->canChangeMemberRoleOrRemove()) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Недостаточно прав для изменения роли этого участника"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $this->pdo->beginTransaction();

            $sql = "UPDATE board_members SET id_board_role = ? WHERE board_id = ? AND user_id = ?";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([$newRoleId, $boardId, $targetUserId]);
            
            $this->pdo->commit();

            http_response_code(200);
            echo json_encode([
                "success" => true
            ], JSON_UNESCAPED_UNICODE);

        }catch(Exception $e){
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function getProfile(int $userId) {
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

    public function removeMember(int $boardId, int $initiatorId, int $targetUserId): void {
        try {
            $permissions = new BoardPermissions($this->pdo, $boardId, $initiatorId, $targetUserId);

            if (!$permissions->canChangeMemberRoleOrRemove()) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Недостаточно прав для удаления этого участника"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $this->pdo->beginTransaction();

            $sqlDelete = "DELETE FROM board_members WHERE board_id = ? AND user_id = ?";
            $stmtDelete = $this->pdo->prepare($sqlDelete);
            $stmtDelete->execute([$boardId, $targetUserId]);
            
            $this->pdo->commit();

            http_response_code(200);
            echo json_encode(["success" => true], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Ошибка сервера: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }
}