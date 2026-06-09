<?php

function taskActions($pdo, $action, $userId) {
    try{
        switch($action){
            case 'get_tasks': getTasks($pdo, $userId); break;
            case 'create_task': createTask($pdo, $userId); break; 
            case 'update_task': updateTask($pdo, $userId); break;
            case 'update_status': updateStatus($pdo, $userId); break;
            case 'delete_task': deleteTask($pdo, $userId); break;
            case 'get_all_tags': getAllTags($pdo, $userId); break;
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

function updateStatus($pdo, $userId) {
    $input = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("UPDATE tasks SET status = ? WHERE id = ?");
    $stmt->execute([$input['status'], $input['id']]);
    echo json_encode(["success" => true]);
}

function createTask($pdo, $userId) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $pdo->beginTransaction();

    $sql = "SELECT add_task(?, ?, ?, ?, 0, ?, NOW(), ?, ?) AS new_id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        $input['title'],
        $input['short_desc'],
        $input['full_desc'],
        $input['priority'],
        $input['status'],
        $input['deadline'],
        $userId 
    ]);
    
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    $newTaskId = $result['new_id'];

    if ($newTaskId == null) {
        throw new Exception("Не удалось создать задачу");
    }

    if (isset($input['executors']) && is_array($input['executors'])) {
        $stmtExec = $pdo->prepare("INSERT INTO task_executors (id_task, id_user) VALUES (?, ?)");
        
        $listToInsert = [];
        $listToInsert[] = (int)$userId; 

        foreach ($input['executors'] as $item) {
            $id = 0;
            if (is_array($item))
                $id = (int)$item['id'];
            else
                $id = (int)$item;

            if ($id > 0 && !in_array($id, $listToInsert))
                $listToInsert[] = $id;
        }

        foreach ($listToInsert as $exId) {
            $stmtExec->execute([$newTaskId, $exId]);
        }
    }

    if (isset($input['tags']) && is_array($input['tags'])) {
        $stmtTag = $pdo->prepare("INSERT INTO task_tags (id_task, id_tag) VALUES (?, ?)");
        
        foreach ($input['tags'] as $tagItem) {
            $tagId = 0;
            if (is_array($tagItem)) {
                $tagId = (int)$tagItem['id'];
            } else {
                $tagId = (int)$tagItem;
            }

            if ($tagId > 0) {
                $stmtTag->execute([$newTaskId, $tagId]);
            }
        }
    }
    $pdo->commit();
    
    echo json_encode([
        "success" => true, 
        "id" => (int)$newTaskId
    ]);
}

function updateTask($pdo, $userId) {
    $input = json_decode(file_get_contents('php://input'), true);
    $taskId = $input['id'];

    $pdo->beginTransaction();
    $stmt = $pdo->prepare("UPDATE tasks SET title=?, full_desc=?, status=?, priority=?, deadline=? WHERE id=?");
    $stmt->execute([$input['title'], $input['full_desc'], $input['status'], $input['priority'], $input['deadline'], $taskId]);

    $pdo->prepare("DELETE FROM task_tags WHERE id_task = ?")->execute([$taskId]);
    if (!empty($input['tags'])) {
        $stmtTag = $pdo->prepare("INSERT INTO task_tags (id_task, id_tag) VALUES (?, ?)");
        foreach ($input['tags'] as $tag) {
            $tId = is_array($tag) ? (int)$tag['id'] : (int)$tag;
            $stmtTag->execute([$taskId, $tId]);
        }
    }

    $pdo->prepare("DELETE FROM task_executors WHERE id_task = ?")->execute([$taskId]);
    
    $listToSave = [];
    $listToSave[] = (int)$userId;

    if (isset($input['executors']) && is_array($input['executors'])) {
        foreach ($input['executors'] as $ex) {
            $exId = is_array($ex) ? (int)$ex['id'] : (int)$ex;
            if ($exId > 0 && !in_array($exId, $listToSave)) {
                $listToSave[] = $exId;
            }
        }
    }

    $stmtEx = $pdo->prepare("INSERT INTO task_executors (id_task, id_user) VALUES (?, ?)");
    foreach ($listToSave as $eId) {
        $stmtEx->execute([$taskId, $eId]);
    }

    $pdo->commit();
    echo json_encode(["success" => true]);
}

function getTasks($pdo, $userId) {
    try {
        $pdo->exec("SET lc_time_names = 'ru_RU'");

        $checkSql = "SELECT r.permission_level 
                     FROM users u 
                     LEFT JOIN roles r ON u.id_role = r.id 
                     WHERE u.id = ?";
        $checkStmt = $pdo->prepare($checkSql);
        $checkStmt->execute([$userId]);
        $permissionLevel = (int)$checkStmt->fetchColumn();

        if ($permissionLevel >= 3) {
            $stmt = $pdo->prepare("CALL get_all_tasks()");
            $stmt->execute();
        } else {
            $stmt = $pdo->prepare("CALL get_user_tasks(?)");
            $stmt->execute([$userId]);
        }

        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($tasks, JSON_UNESCAPED_UNICODE);

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => "Ошибка получения задач: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}

function getAllTags($pdo, $userId) {
    $sql = "SELECT id, name, color_role as tag_color, background_color FROM tags";
    echo json_encode($pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC), JSON_UNESCAPED_UNICODE);
}

function deleteTask($pdo, $userId) {
    $input = json_decode(file_get_contents('php://input'), true);
    $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
    $stmt->execute([$input['id']]);
    echo json_encode(["success" => true]);
}
?>