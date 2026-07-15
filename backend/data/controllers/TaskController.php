<?php
require_once 'BoardPermissions.php';
require_once 'models/Task.php';

function taskActions(PDO $pdo, string $action, int $userId) {
    $taskController = new TaskController($pdo);
    $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
    
    $boardId = isset($_GET['board_id']) ? (int)$_GET['board_id'] : (isset($inputData['board_id']) ? (int)$inputData['board_id'] : 0);

    try {
        switch($action) {
            case 'get_tasks': 
                $taskController->getTasks($boardId, $userId); 
                break;
            case 'create_task': 
                $taskController->createTask($userId, $inputData, $boardId); 
                break; 
            case 'update_task': 
                $taskId = (int)$inputData['id'];
                $taskController->updateTask($userId, $boardId, $taskId, $inputData); 
                break;
            case 'update_status': 
                $taskId = (int)$inputData['id'];
                $status = (int)$inputData['status'];
                $taskController->updateStatus($userId, $boardId, $status, $taskId); 
                break;
            case 'delete_task': 
                $taskId = (int)$inputData['id'];
                $taskController->deleteTask($userId, $boardId, $taskId); 
                break;
            case 'get_all_tags': 
                $taskController->getAllTags(); 
                break;
            default:
                http_response_code(405);
                echo json_encode(["error" => "Method not allowed"], JSON_UNESCAPED_UNICODE);
        }        
    } catch (Exception $e) {
        if ($pdo->inTransaction()) $pdo->rollBack(); 
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

class TaskController {
    private PDO $pdo;

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function updateStatus(int $userId, int $boardId, int $status, int $id) {
        try {
            $permissions = new BoardPermissions($this->pdo, $boardId, $userId);

            if (!$permissions->isOwner && !$permissions->isUser) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Недостаточно прав для редактирования задач"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $stmt = $this->pdo->prepare("CALL update_task_status(?, ?)");
            $stmt->execute([$status, $id]);
            echo json_encode(["success" => true]);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function createTask(int $userId, array $input, int $boardId) {
        try {
            $permissions = new BoardPermissions($this->pdo, $boardId, $userId);

            if (!$permissions->isOwner && !$permissions->isUser) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Недостаточно прав для создания задач на этой доске"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $this->pdo->beginTransaction();

            $isMvp = isset($input['isMvp']) ? (int)$input['isMvp'] : 0;

            $sql = "SELECT add_task(?, ?, ?, ?, ?, ?, ?, ?, ?) AS new_id";
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                $input['title'] ?? '',
                $input['short_desc'] ?? '',
                $input['full_desc'] ?? '',
                $input['priority'] ?? 1,
                $boardId,
                $input['deadline'] ?? null,
                $userId,
                $isMvp,
                $input['time_point_id'] ?? null
            ]);
            
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            $newTaskId = $result['new_id'] ?? null;

            if ($newTaskId == null) {
                throw new Exception("Не удалось создать задачу");
            }

            if (isset($input['executors']) && is_array($input['executors'])) {
                $stmtExec = $this->pdo->prepare("INSERT INTO task_executors (id_task, id_user) VALUES (?, ?)");
                $listToInsert = [(int)$userId]; 

                foreach ($input['executors'] as $item) {
                    $id = is_array($item) ? (int)$item['id'] : (int)$item;
                    if ($id > 0 && !in_array($id, $listToInsert))
                        $listToInsert[] = $id;
                }

                foreach ($listToInsert as $exId) {
                    $stmtExec->execute([$newTaskId, $exId]);
                }
            }

            if (isset($input['tags']) && is_array($input['tags'])) {
                $stmtTag = $this->pdo->prepare("INSERT INTO task_tags (id_task, id_tag) VALUES (?, ?)");
                foreach ($input['tags'] as $tagItem) {
                    $tagId = is_array($tagItem) ? (int)$tagItem['id'] : (int)$tagItem;
                    if ($tagId > 0) {
                        $stmtTag->execute([$newTaskId, $tagId]);
                    }
                }
            }
            $this->pdo->commit();
            
            echo json_encode([
                "success" => true, 
                "id" => (int)$newTaskId
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function updateTask(int $userId, int $boardId, int $taskId, array $input) {
        try {
            $permissions = new BoardPermissions($this->pdo, $boardId, $userId);

            if (!$permissions->isOwner && !$permissions->isUser) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Недостаточно прав для изменения этой задачи"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $this->pdo->beginTransaction();
            
            // Поиск задачи в системе
            $task = Task::find($this->pdo, $taskId);
            if (!$task) {
                throw new Exception("Задача не найдена");
            }

            $task->title = $input['title'] ?? '';
            $task->fullDesc = $input['full_desc'] ?? null;
            $task->status = $input['status'] ?? 0;
            $task->priority = $input['priority'] ?? 1;
            $task->isMvp = isset($input['isMvp']) ? (int)$input['isMvp'] : 0;
            $task->deadline = $input['deadline'] ?? null;
            $task->timePointId = $input['time_point']['id'] ?? null;

            // Каскадное обновление сущностей
            $task->save();
            $task->syncTags($input['tags'] ?? []);
            $task->syncExecutors($input['executors'] ?? [], $userId);

            $this->pdo->commit();
            echo json_encode(["success" => true], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function getTasks(int $boardId, int $userId) {
        try {
            $permissions = new BoardPermissions($this->pdo, $boardId, $userId);

            if (!$permissions->isOwner && !$permissions->isUser && !$permissions->isSpectator) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Недостаточно прав для просмотра задач этой доски"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $this->pdo->exec("SET lc_time_names = 'ru_RU'");

            $stmt = $this->pdo->prepare("CALL get_board_tasks(?)");
            $stmt->execute([$boardId]);

            $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);

            foreach ($tasks as &$task) {
                if (isset($task['isMvp'])) {
                    $task['isMvp'] = (bool)$task['isMvp'];
                }
            }

            echo json_encode($tasks, JSON_UNESCAPED_UNICODE);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(["error" => "Ошибка получения задач: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function deleteTask(int $userId, int $boardId, int $id) {
        try {
            $permissions = new BoardPermissions($this->pdo, $boardId, $userId);

            if (!$permissions->isOwner && !$permissions->isUser) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Недостаточно прав для удаления этой задачи"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $stmt = $this->pdo->prepare("CALL delete_task_by_id(?)");
            $stmt->execute([$id]);
            echo json_encode(["success" => true], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function getAllTags() {
        $sql = "SELECT id, name, color_role as tag_color, background_color FROM tags";
        echo json_encode($this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
    }
}
?>