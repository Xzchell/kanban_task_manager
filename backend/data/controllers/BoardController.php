<?php
require_once 'BoardPermissions.php';
require_once 'models/Board.php';

class BoardController {
    private PDO $pdo; 

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }   

    public function getLstBoards(int $userId){
        $sql = "SELECT GetUserBoardsFunction(:user_id) AS boards_json";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['user_id' => (int)$userId]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $boardsArray = json_decode($result['boards_json'], true);

        http_response_code(200);
        echo json_encode([
            "success" => true, 
            "boards" => $boardsArray
        ], JSON_UNESCAPED_UNICODE);
    }

    public function createNewBoard(int $userId, $inputData){
        if (empty($inputData['title']) || empty($inputData['type_name'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Заполните название и тип доски"], JSON_UNESCAPED_UNICODE);
            return;
        }

        try {
            $title = trim($inputData['title']);
            $description = $inputData['description'] ?? null;
            $typeName = $inputData['type_name'];

            $deadline = null;
            if ($typeName === 'hakaton' && !empty($inputData['deadline'])) {
                try {
                    $date = new DateTime($inputData['deadline']);
                    $date->setTimezone(new DateTimeZone('Europe/Moscow'));
                    $deadline = $date->format('Y-m-d H:i:s');
                } catch (Exception $e) {
                    $deadline = null; 
                }
            }

            $invitedUsers = $inputData['invited_users'] ?? [];
            $invitedJsonString = json_encode($invitedUsers);

            $columns = $inputData['columns'] ?? [];
            $columnsJsonString = json_encode($columns);

            $time_points = $inputData['milestones'] ?? [];
            $time_pointsJsonString = json_encode($time_points);

            $this->pdo->beginTransaction();

            $sql = "SELECT CreateBoardFunction(:title, :description, :type_name, :owner_id, :deadline, :invited_users, :columns, :time_points) AS new_board_id";
            $stmt = $this->pdo->prepare($sql);
            
            $stmt->execute([
                'title' => $title,
                'description' => $description,
                'type_name' => $typeName,
                'owner_id' => (int)$userId,
                'deadline' => $deadline,
                'invited_users' => $invitedJsonString,
                'columns' => $columnsJsonString,
                'time_points' => $time_pointsJsonString
            ]);

            $result = $stmt->fetch(PDO::FETCH_ASSOC);

            $this->pdo->commit();

            http_response_code(201);
            echo json_encode([
                "success" => true,
                "board_id" => (int)$result['new_board_id']
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function updateDataBoard (int $userId, int $boardId, array $input) {
        if (empty($input['title'])) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Название доски не может быть пустым"], JSON_UNESCAPED_UNICODE);
            return;
        }

        try {
            $permissions = new BoardPermissions($this->pdo, $boardId, $userId);
            if (!$permissions->isOwner && !$permissions->canManageBoard()) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Недостаточно прав для изменения этой доски"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $this->pdo->beginTransaction();

            $board = Board::find($this->pdo, $boardId);
            if (!$board) {
                throw new Exception("Доска не найдена в системе");
            }

            $board->title = trim($input['title']);
            $board->description = $input['description'] ?? null;
            
            // Форматирование даты
            if (!empty($input['deadline'])) {
                $date = new DateTime($input['deadline']);
                $date->setTimezone(new DateTimeZone('Europe/Moscow'));
                $board->deadline = $date->format('Y-m-d H:i:s');
            } else {
                $board->deadline = null;
            }

            $board->save(); 
            $board->syncColumns($input['columns'] ?? []);
            $board->syncTimePoints($input['timePoints'] ?? []);

            $sqlDetails = "SELECT GetBoardDetailsFunction(:board_id, :user_id) AS board_info_json";
            $stmtDetails = $this->pdo->prepare($sqlDetails);
            $stmtDetails->execute(['board_id' => $boardId, 'user_id' => $userId]);
            $resultDetails = $stmtDetails->fetch(PDO::FETCH_ASSOC);
            $freshBoardData = json_decode($resultDetails['board_info_json'], true);

            $this->pdo->commit();
            
            http_response_code(200);
            echo json_encode([
                "success" => true, 
                "message" => "Данные доски успешно обновлены",
                "board" => $freshBoardData
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function getBoardDetails (int $boardId, int $userId) {
        try {
            $permissions = new BoardPermissions($this->pdo, (int)$boardId, (int)$userId);

            if (!$permissions->isOwner && !$permissions->isUser && !$permissions->isSpectator) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Недостаточно прав для просмотра этой доски"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $sql = "SELECT GetBoardDetailsFunction(:board_id, :user_id) AS board_info_json";

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['board_id' => (int)$boardId, 'user_id' => (int)$userId]);

            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $boardData = json_decode($result['board_info_json'], true);

            http_response_code(200);
            echo json_encode([
                "success" => true, 
                "board" => $boardData
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }
    public function deleteBoard(int $userId, int $boardId) {
        if ($boardId <= 0) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Не указан идентификатор доски"], JSON_UNESCAPED_UNICODE);
            return;
        }

        try {
            $permissions = new BoardPermissions($this->pdo, $boardId, $userId);

            if (!$permissions->isOwner) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "У вас нет прав для удаления этой доски"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $this->pdo->beginTransaction();
            $sql = "DELETE FROM boards WHERE id = :board_id";
            
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['board_id' => $boardId]);

            $this->pdo->commit();

            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Рабочее пространство успешно удалено"
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Ошибка сервера: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }
}

function boardActions(PDO $pdo, string $action, int $userId){
    $boardController = new BoardController($pdo);
    $inputData = json_decode(file_get_contents('php://input'), true) ?? [];

    try{
        switch($action){
            case 'get_boards': $boardController->getLstBoards($userId); break;
            case 'create_board': $boardController->createNewBoard($userId, $inputData); break;
            case 'get_board_details':
                $boardId = isset($_GET["board_id"]) ? (int)$_GET["board_id"] : 0;
                $boardController->getBoardDetails($boardId, $userId); break;
            case 'delete_board':
                $boardId = isset($_GET["board_id"]) ? (int)$_GET["board_id"] : 0; 
                $boardController->deleteBoard($userId, $boardId); 
                break;
            case 'update_board' : 
                $boardId = isset($_GET["board_id"]) ? (int)$_GET["board_id"] : 0; 
                $boardController->updateDataBoard($userId, $boardId, $inputData);
                break;
            default:
                http_response_code(405);
                echo json_encode(["error" => "Action not allowed"], JSON_UNESCAPED_UNICODE);
        }
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack(); 
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }
}
?>