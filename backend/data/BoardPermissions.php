<?php

class BoardPermissions {
    private PDO $pdo;
    private int $boardId;
    private int $currentUserId;
    private ?int $targetUserId;

    private int $boardOwnerId;
    private ?string $currentUserRoleName = null;
    private ?string $targetRoleName = null;

    public bool $isTrueCreator = false;
    public bool $isOwner = false;
    public bool $isUser = false;
    public bool $isSpectator = false;

    public function __construct(PDO $pdo, int $boardId, int $currentUserId, ?int $targetUserId = null) {
        $this->pdo = $pdo;
        $this->boardId = $boardId;
        $this->currentUserId = $currentUserId;
        $this->targetUserId = $targetUserId;

        if ($this->loadContext()) {
            $this->calculateFlags();
        }
    }

    private function loadContext(): bool {
        $sql = "
            SELECT 
                b.owner_id,
                br_init.role_name AS initiator_role_name,
                br_target.role_name AS target_role_name
            FROM boards b
            LEFT JOIN board_members bu_init 
                ON bu_init.board_id = b.id AND bu_init.user_id = ?
            LEFT JOIN board_roles br_init 
                ON br_init.id = bu_init.id_board_role
            LEFT JOIN board_members bu_target 
                ON bu_target.board_id = b.id AND bu_target.user_id = ?
            LEFT JOIN board_roles br_target 
                ON br_target.id = bu_target.id_board_role
            WHERE b.id = ?
        ";
        
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$this->currentUserId, $this->targetUserId ?? 0, $this->boardId]);
        $data = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$data) {
            return false;
        }

        $this->boardOwnerId = (int)$data['owner_id'];
        $this->currentUserRoleName = $data['initiator_role_name'];
        $this->targetRoleName = $data['target_role_name'];

        return true;
    }

    private function calculateFlags(): void {
        $this->isTrueCreator = ($this->boardOwnerId === $this->currentUserId);

        $hasOwnerRole = ($this->currentUserRoleName === 'owner' || $this->currentUserRoleName === 'admin');
        $this->isOwner = ($this->isTrueCreator || $hasOwnerRole);

        $this->isUser = (!$this->isOwner && $this->currentUserRoleName === 'user');
        $this->isSpectator = (!$this->isOwner && $this->currentUserRoleName === 'spectator');
    }

    public function canManageBoard(): bool {
        return $this->isOwner;
    }

    public function canInviteMembers(): bool {
        return $this->isOwner;
    }
    
    public function canChangeMemberRoleOrRemove(): bool {
        if (!$this->isOwner || $this->targetUserId === null) {
            return false;
        }

        if ($this->targetUserId === $this->boardOwnerId) {
            return false;
        }

        if ($this->isTrueCreator) {
            return true;
        }

        $isTargetOwner = ($this->targetRoleName === 'owner' || $this->targetRoleName === 'admin');
        return !$isTargetOwner;
    }

    public function canCreateAndMoveTasks(): bool {
        if ($this->isSpectator) {
            return false;
        }
        return ($this->isOwner || $this->isUser);
    }

    public function canEditOrDeleteTask(int $taskAuthorId): bool {
        if ($this->isSpectator) {
            return false;
        }
        if ($this->isOwner) {
            return true;
        }
        return ($this->isUser && $taskAuthorId === $this->currentUserId);
    }
}