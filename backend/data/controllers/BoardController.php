<?php
class BoardController {
    private $pdo; 

    public function __construct($pdo)
    {
        $this-> pdo = $pdo;
    }   

    public function getLstBoards($userId){
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

    public function createNewBoard($userId, $inputData){
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
                    $deadline = $date->format('Y-m-d H:i:s');
                } catch (Exception $e) {
                    $deadline = null; 
                }
            }

            $invitedUsers = $inputData['invited_users'] ?? [];
            $invitedJsonString = json_encode($invitedUsers);

            $columns = $inputData['columns'] ?? [];
            $columnsJsonString = json_encode($columns);

            $this->pdo->beginTransaction();

            $sql = "SELECT CreateBoardFunction(:title, :description, :type_name, :owner_id, :deadline, :invited_users, :columns) AS new_board_id";
            $stmt = $this->pdo->prepare($sql);
            
            $stmt->execute([
                'title'         => $title,
                'description'   => $description,
                'type_name'     => $typeName,
                'owner_id'      => (int)$userId,
                'deadline'      => $deadline,
                'invited_users' => $invitedJsonString,
                'columns'       => $columnsJsonString
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
}

function boardActions($pdo, $action, $userId){
    $boardController = new BoardController($pdo);
    $inputData = json_decode(file_get_contents('php://input'), true) ?? [];

    try{
        switch($action){
            case 'get_boards': $boardController->getLstBoards($userId); break;
            case 'create_board': $boardController->createNewBoard($userId, $inputData); break;
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