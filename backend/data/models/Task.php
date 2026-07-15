<?php

class Task {
    private PDO $pdo;

    public ?int $id = null;
    public string $title;
    public ?string $fullDesc = null;
    public int $status;
    public int $priority;
    public ?string $deadline = null;
    public int $isMvp;
    public ?int $timePointId = null;

    public function __construct(PDO $pdo, array $data = []) {
        $this->pdo = $pdo;
        $this->id = $data['id'] ?? null;
        $this->title = $data['title'] ?? '';
        $this->fullDesc = $data['full_desc'] ?? null;
        $this->status = (int)($data['status'] ?? 0);
        $this->priority = (int)($data['priority'] ?? 1);
        $this->deadline = $data['deadline'] ?? null;
        $this->isMvp = (int)($data['isMvp'] ?? 0);
        $this->timePointId = $data['time_point_id'] ?? null;
    }

    /* Поиск задачи по ID */
    public static function find(PDO $pdo, int $id): ?self {
        $stmt = $pdo->prepare("SELECT id, title, full_desc, id_column as status, priority, deadline, isMvp, time_point_id FROM tasks WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        return $data ? new self($pdo, $data) : null;
    }

    /* Точечное обновление основных полей задачи */
    public function save(): bool {
        if (!$this->id) return false;

        $sql = "UPDATE tasks 
                SET title = :title, full_desc = :full_desc, id_column = :status, 
                    priority = :priority, deadline = :deadline, isMvp = :is_mvp, time_point_id = :point_id 
                WHERE id = :id";
        
        $stmt = $this->pdo->prepare($sql);
        return $stmt->execute([
            'title' => $this->title,
            'full_desc' => $this->fullDesc,
            'status' => $this->status,
            'priority' => $this->priority,
            'deadline' => $this->deadline,
            'is_mvp' => $this->isMvp,
            'point_id' => $this->timePointId,
            'id' => $this->id
        ]);
    }

    /* Синхронизация тегов */
    public function syncTags(array $incomingTags): void {
        if (!$this->id) return;

        // текущие теги задачи
        $stmt = $this->pdo->prepare("SELECT id_tag FROM task_tags WHERE id_task = ?");
        $stmt->execute([$this->id]);
        $currentTags = $stmt->fetchAll(PDO::FETCH_COLUMN);

        $newTags = [];
        foreach ($incomingTags as $tag) {
            $tId = is_array($tag) ? (int)$tag['id'] : (int)$tag;
            if ($tId > 0) $newTags[] = $tId;
        }

        $tagsToDelete = array_diff($currentTags, $newTags);
        $tagsToInsert = array_diff($newTags, $currentTags);

        // Точечно удаляем
        if (!empty($tagsToDelete)) {
            $placeholders = implode(',', array_fill(0, count($tagsToDelete), '?'));
            $this->pdo->prepare("DELETE FROM task_tags WHERE id_task = ? AND id_tag IN ($placeholders)")
                      ->execute(array_merge([$this->id], array_values($tagsToDelete)));
        }

        // Точечно добавляем
        if (!empty($tagsToInsert)) {
            $insStmt = $this->pdo->prepare("INSERT INTO task_tags (id_task, id_tag) VALUES (?, ?)");
            foreach ($tagsToInsert as $tagId) {
                $insStmt->execute([$this->id, $tagId]);
            }
        }
    }

    /* Синхронизация исполнителей */
    public function syncExecutors(array $incomingExecutors, int $creatorId): void {
        if (!$this->id) return;

        // Текущие исполнители из БД
        $stmt = $this->pdo->prepare("SELECT id_user FROM task_executors WHERE id_task = ?");
        $stmt->execute([$this->id]);
        $currentExecutors = $stmt->fetchAll(PDO::FETCH_COLUMN);

        // Формируем список на сохранение
        $newExecutors = [$creatorId];
        foreach ($incomingExecutors as $ex) {
            $exId = is_array($ex) ? (int)$ex['id'] : (int)$ex;
            if ($exId > 0 && !in_array($exId, $newExecutors)) {
                $newExecutors[] = $exId;
            }
        }

        $executorsToDelete = array_diff($currentExecutors, $newExecutors);
        $executorsToInsert = array_diff($newExecutors, $currentExecutors);

        // Точечно удаляем лишнихх
        if (!empty($executorsToDelete)) {
            $placeholders = implode(',', array_fill(0, count($executorsToDelete), '?'));
            $this->pdo->prepare("DELETE FROM task_executors WHERE id_task = ? AND id_user IN ($placeholders)")
                      ->execute(array_merge([$this->id], array_values($executorsToDelete)));
        }

        // Точечно добавляем новых
        if (!empty($executorsToInsert)) {
            $insStmt = $this->pdo->prepare("INSERT INTO task_executors (id_task, id_user) VALUES (?, ?)");
            foreach ($executorsToInsert as $userId) {
                $insStmt->execute([$this->id, $userId]);
            }
        }
    }
}