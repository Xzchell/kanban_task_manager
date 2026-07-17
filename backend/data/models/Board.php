<?php

class Board {
    private PDO $pdo;
    
    public ?int $id = null;
    public string $title;
    public ?string $description = null;
    public ?string $deadline = null;

    public function __construct(PDO $pdo, array $data = []) {
        $this->pdo = $pdo;
        $this->id = $data['id'] ?? null;
        $this->title = $data['title'] ?? '';
        $this->description = $data['description'] ?? null;
        $this->deadline = $data['deadline'] ?? null;
    }

    /* Поиск доски по ID и создание её объектного представления */
    public static function find(PDO $pdo, int $id): ?self {
        $stmt = $pdo->prepare("SELECT id, title, description, deadline FROM boards WHERE id = :id");
        $stmt->execute(['id' => $id]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);
        
        return $data ? new self($pdo, $data) : null;
    }

    /* Сохранение изменений основных полей доски */
    public function save(): bool {
        if (!$this->id) return false;

        $sql = "UPDATE boards SET title = :title, description = :description, deadline = :deadline WHERE id = :id";
        $stmt = $this->pdo->prepare($sql);
        
        return $stmt->execute([
            'title' => $this->title,
            'description' => $this->description,
            'deadline' => $this->deadline,
            'id' => $this->id
        ]);
    }

    /* Diff-алгоритм для синхронизации колонок с переносом задач при удалении столбца */
    public function syncColumns(array $newColumns): void {
        if (!$this->id) return;

        $stmt = $this->pdo->prepare("SELECT id FROM board_columns WHERE id_board = :board_id");
        $stmt->execute(['board_id' => $this->id]);
        $currentColumns = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $currentIds = array_column($currentColumns, 'id');
        $newIds = array_filter(array_column($newColumns, 'id')); 

        //вычисляем ID колонок, которые идут на удаление
        $idsToDelete = array_diff($currentIds, $newIds);
        
        //удаление стобцов
        if (!empty($idsToDelete)) {
            $remainingValidColumns = array_filter($newColumns, function($col) use ($currentIds, $idsToDelete) {
                return isset($col['id']) && in_array($col['id'], $currentIds) && !in_array($col['id'], $idsToDelete);
            });

            usort($remainingValidColumns, function($a, $b) {
                return $a['position'] <=> $b['position'];
            });
            
            $fallbackColumnId = !empty($remainingValidColumns) ? (int)$remainingValidColumns[0]['id'] : null;

            if (!$fallbackColumnId) {
                throw new Exception("Невозможно удалить все колонки. Должна остаться как минимум одна существующая колонка.");
            }

            $placeholders = implode(',', array_fill(0, count($idsToDelete), '?'));
            
            $moveTasksStmt = $this->pdo->prepare(
                "UPDATE tasks SET id_column = ? WHERE id_column IN ($placeholders)"
            );
            
            $executeParams = array_merge([$fallbackColumnId], array_values($idsToDelete));
            $moveTasksStmt->execute($executeParams);

            $delStmt = $this->pdo->prepare("DELETE FROM board_columns WHERE id IN ($placeholders)");
            $delStmt->execute(array_values($idsToDelete));
        }

        // создаем новые или обновляем существующие колонки
        foreach ($newColumns as $col) {
            if (isset($col['id']) && in_array($col['id'], $currentIds)) {
                $updStmt = $this->pdo->prepare("UPDATE board_columns SET name = :title, position = :position WHERE id = :id");
                $updStmt->execute([
                    'title' => $col['name'],
                    'position' => (int)$col['position'],
                    'id' => (int)$col['id']
                ]);
            } else {
                $insStmt = $this->pdo->prepare("INSERT INTO board_columns (id_board, name, position) VALUES (:board_id, :title, :position)");
                $insStmt->execute([
                    'board_id' => $this->id,
                    'title' => $col['name'],
                    'position' => (int)$col['position']
                ]);
            }
        }
    }

    /* Diff-алгоритм для таймпоинтов с занулением связей у задач */
    public function syncTimePoints(array $newTimePoints): void {
        if (!$this->id) return;

        // Получаем текущие ID таймпоинтов доски из БД
        $stmt = $this->pdo->prepare("SELECT id FROM time_points WHERE board_id = :board_id");
        $stmt->execute(['board_id' => $this->id]);
        $currentTimePoints = $stmt->fetchAll(PDO::FETCH_ASSOC);

        $currentIds = array_column($currentTimePoints, 'id');
        $newIds = array_filter(array_column($newTimePoints, 'id'));

        // Вычисляем, какие таймпоинты нужно удалить
        $idsToDelete = array_diff($currentIds, $newIds);
        if (!empty($idsToDelete)) {
            $placeholders = implode(',', array_fill(0, count($idsToDelete), '?'));

            $safeTasksStmt = $this->pdo->prepare("UPDATE tasks SET time_point_id = NULL WHERE time_point_id IN ($placeholders)");
            $safeTasksStmt->execute(array_values($idsToDelete));

            $delStmt = $this->pdo->prepare("DELETE FROM time_points WHERE id IN ($placeholders)");
            $delStmt->execute(array_values($idsToDelete));
        }

        // Обновляем старые или создаем новые таймпоинты
        foreach ($newTimePoints as $tp) {
            $title = $tp['title'] ?? '';
            $targetDate = null;
            if (!empty($tp['target_date'])) {
                try {
                    $date = new DateTime($tp['target_date']);
                    $targetDate = $date->format('Y-m-d H:i:s');
                } catch (Exception $e) {
                    $targetDate = null;
                }
            }
            $description = $tp['description'] ?? null;

            if (isset($tp['id']) && in_array($tp['id'], $currentIds)) {
                $updStmt = $this->pdo->prepare("UPDATE time_points SET title = :title, target_date = :target_date, description = :description WHERE id = :id");
                $updStmt->execute([
                    'title' => $title,
                    'target_date' => $targetDate,
                    'description' => $description,
                    'id' => (int)$tp['id']
                ]);
            } else {
                $insStmt = $this->pdo->prepare("INSERT INTO time_points (board_id, title, target_date, description) VALUES (:board_id, :title, :target_date, :description)");
                $insStmt->execute([
                    'board_id' => $this->id,
                    'title' => $title,
                    'target_date' => $targetDate,
                    'description' => $description
                ]);
            }
        }
    }
}