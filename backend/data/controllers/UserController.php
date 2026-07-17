<?php

use PHPMailer\PHPMailer\PHPMailer;

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
                $userController->searchUser($searchQuery, $boardId); 
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
            case 'accept_invitation':
                $token = isset($input["token"]) ? trim($input["token"]) : '';
                $userController->acceptInvitation($token, $userId);
                break;
            case 'decline_invitation':
                $token = isset($input["token"]) ? trim($input["token"]) : '';
                $userController->declineInvitation($token, $userId);
                break;
            case 'get_invitation_details':
                $token = isset($_GET["token"]) ? trim($_GET["token"]) : (isset($input["token"]) ? trim($input["token"]) : '');
                $userController->getInvitationDetails($token, $userId);
                break;
            case 'update_profile':
                $userController->updateProfile($userId, $input);
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

    public function searchUser(string $searchQuery, int $boardId){
        $searchQuery = trim($searchQuery);

        if (strlen($searchQuery) < 3) return;

        try {
            if ($boardId === -1) {
                $sql = "SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.middle_name 
                        FROM users u
                        WHERE (
                            u.email = :query 
                            OR u.username = :query 
                            OR CONCAT(u.last_name, ' ', u.first_name) = :query
                        )
                        LIMIT 1";
                $params = [':query' => $searchQuery];
            } else {
                $sql = "SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.middle_name 
                        FROM users u
                        WHERE (
                            u.email = :query 
                            OR u.username = :query 
                            OR CONCAT(u.last_name, ' ', u.first_name) = :query
                        )
                        AND CheckUserAvailabilityForBoard(u.id, :board_id) = 1
                        LIMIT 1";
                $params = [
                    ':query' => $searchQuery,
                    ':board_id' => $boardId
                ];
            }

            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);
            
            $user = $stmt->fetch(PDO::FETCH_ASSOC);

            http_response_code(200);
            echo json_encode([
                "success" => true,
                "user" => $user ? [$user] : []
            ], JSON_UNESCAPED_UNICODE);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                "success" => false, 
                "error" => "Ошибка при поиске участника: " . $e->getMessage()
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public function getInvitationDetails(string $token, int $currentUserId): void {
        try {
            if (empty($token)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Токен приглашения не указан"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $stmt = $this->pdo->prepare("
                SELECT 
                    b.id AS board_id,
                    b.title AS board_title,
                    u.first_name AS owner_first_name,
                    u.last_name AS owner_last_name,
                    u.middle_name AS owner_middle_name,
                    i.invitee_id,
                    i.id_board_role AS role_id,
                    r.role_name,
                    r.display_name AS role_display_name
                FROM board_invitations i
                INNER JOIN boards b ON i.board_id = b.id
                INNER JOIN users u ON i.inviter_id = u.id
                LEFT JOIN board_roles r ON i.id_board_role = r.id
                WHERE i.token = ?
                LIMIT 1
            ");
            
            $stmt->execute([$token]);
            $invitation = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$invitation) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Приглашение не найдено или токен недействителен"], JSON_UNESCAPED_UNICODE);
                return;
            }

            if ((int)$invitation['invitee_id'] !== $currentUserId) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Это приглашение предназначено для другого пользователя"], JSON_UNESCAPED_UNICODE);
                return;
            }

            http_response_code(200);
            echo json_encode([
                "success" => true,
                "data" => [
                    "boardOwner" => [
                        "firstName" => $invitation['owner_first_name'],
                        "lastName" => $invitation['owner_last_name'],
                        "middleName" => $invitation['owner_middle_name'] ?? ""
                    ],
                    "boardInfo" => [
                        "id" => (int)$invitation['board_id'],
                        "title" => $invitation['board_title']
                    ],
                    "invitedRole" => [
                        "id" => (int)($invitation['role_id'] ?? 2),
                        "name" => $invitation['role_name'] ?? "member",
                        "displayName" => $invitation['role_display_name'] ?? "Участник",
                        "permission_level" => (int)($invitation['role_id'] ?? 2)
                    ]
                ]
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Ошибка сервера при получении данных: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function acceptInvitation(string $token, int $currentUserId) {
        try{
            $stmt = $this->pdo->prepare("
                SELECT board_id, invitee_id, id_board_role
                FROM board_invitations 
                WHERE token = ? 
                LIMIT 1
            ");

            $stmt->execute([$token]);
            $invitation = $stmt->fetch(PDO::FETCH_ASSOC);

            if(!$invitation){
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Приглашение не найдено или уже недействительно"], JSON_UNESCAPED_UNICODE);
                return;
            }
            
            // приглашение именно этого пользователя
            if($invitation['invitee_id'] !== $currentUserId){
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Это приглашение предназначено для другого пользователя"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $boardId = $invitation['board_id'];
            $roleId = $invitation['id_board_role'];
            $this->pdo->beginTransaction();

            $insertMemberStmt = $this->pdo->prepare("
                INSERT INTO board_members (board_id, user_id, id_board_role) 
                VALUES (?, ?, ?)
            ");
            
            $insertMemberStmt->execute([$boardId, $currentUserId, $roleId]);

            $deleteInvitationStmt = $this->pdo->prepare("
                DELETE FROM board_invitations 
                WHERE token = ?
            ");

            $deleteInvitationStmt->execute([$token]);

            $this->pdo->commit();

            http_response_code(200);
            echo json_encode([
                "success" => true, 
                "message" => "Вы успешно присоединились к проекту",
                "board_id" => $boardId
            ], JSON_UNESCAPED_UNICODE);
        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Ошибка при принятии приглашения: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    private function sendBatchInvitationEmails(array $emailsData) {
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();                                            
            $mail->Host       = 'smtp.yandex.ru';
            $mail->SMTPAuth   = true;                                 
            $mail->Username   = 'xzchellnon@yandex.ru';
            $mail->Password   = 'ynoerqllkrpxxcso'; 
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;   
            $mail->Port       = 465;                                  
            $mail->CharSet    = 'UTF-8';                              

            $mail->setFrom('xzchellnon@yandex.ru', 'Kanban Task');
            $mail->addReplyTo('xzchellnon@yandex.ru', 'Поддержка');
            $mail->XMailer = 'PHP/KanbanMailer'; 
            $mail->addCustomHeader('List-Unsubscribe', '<mailto:xzchellnon@yandex.ru?subject=unsubscribe>');
            $mail->isHTML(true);

            $mail->SMTPKeepAlive = true; 

            foreach ($emailsData as $data) {
                try {
                    $mail->clearAddresses();
                    
                    $mail->addAddress($data['email'], $data['fullName']);
                    $mail->Subject = 'Приглашение присоединиться к проекту: ' . $data['boardTitle'];

                    $acceptUrl = "https://localhost:5173/invite/accept?token=" . $data['token'];

                    $mail->Body = "
                        <div style='font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;'>
                            <h2 style='color: #4f46e5; margin-top: 0;'>Вас пригласили в Kanban Board!</h2>
                            <p>Здравствуйте, <b>" . htmlspecialchars($data['fullName']) . "</b>.</p>
                            <p>Пользователь <b>" . htmlspecialchars($data['inviterName']) . "</b> пригласил вас присоединиться к совместной работе над доской <b>«" . htmlspecialchars($data['boardTitle']) . "»</b>.</p>
                            
                            <p>Для подтверждения участия нажмите на кнопку ниже:</p>
                            <div style='text-align: center; margin: 25px 0;'>
                                <a href='{$acceptUrl}' style='background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 6px; display: inline-block; box-shadow: 0 2px 4px rgba(79, 70, 229, 0.4);'>
                                    Принять приглашение
                                </a>
                            </div>
                            
                            <p style='font-size: 12px; color: #9ca3af;'>Если кнопка не работает, перейдите по прямой ссылке: <br>
                            <a href='{$acceptUrl}' style='color: #4f46e5; word-break: break-all;'>{$acceptUrl}</a></p>
                            
                            <br><hr style='border: none; border-top: 1px solid #e5e7eb;'>
                            <p style='font-size: 12px; color: #9ca3af;'>Если вы не ожидали этого приглашения, просто проигнорируйте письмо.</p>
                        </div>
                    ";

                    $mail->AltBody = "Здравствуйте, " . strip_tags($data['fullName']) . ".\n\nПользователь " . strip_tags($data['inviterName']) . " пригласил вас в проект «" . strip_tags($data['boardTitle']) . "».\n\nЧтобы принять приглашение, перейдите по ссылке: {$acceptUrl}";

                    $mail->send();
                } catch (Exception $e) {
                    error_log("Ошибка отправки письма для {$data['email']}: " . $mail->ErrorInfo);
                }
            }

            $mail->smtpClose();

        } catch (Exception $e) {
            error_log("Критическая ошибка SMTP при массовой рассылке: " . $e->getMessage());
        }
    }

    public function addMembersToBoard(int $boardId, int $initiatorId, array $members) {
        try {
            $permissions = new BoardPermissions($this->pdo, $boardId, $initiatorId, null);

            if (!$permissions->canInviteMembers()) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Недостаточно прав для приглашения участников"], JSON_UNESCAPED_UNICODE);
                return;
            }

            if (empty($members)) {
                http_response_code(400);
                echo json_encode(["success" => false, "message" => "Список приглашаемых участников пуст"], JSON_UNESCAPED_UNICODE);
                return;
            }

            // получаем данные автора доски для письма
            $commonInfoStmt = $this->pdo->prepare("
                SELECT 
                    (SELECT CONCAT(first_name, ' ', last_name) FROM users WHERE id = :inviter_id) as inviter_name,
                    (SELECT title FROM boards WHERE id = :board_id) as board_title
            ");
            $commonInfoStmt->execute([
                ':inviter_id' => $initiatorId,
                ':board_id' => $boardId
            ]);
            $commonInfo = $commonInfoStmt->fetch(PDO::FETCH_ASSOC);

            $inviterName = $commonInfo['inviter_name'] ?? 'Пользователь';
            $boardTitle = $commonInfo['board_title'] ?? 'Новый проект';

            $this->pdo->beginTransaction();

            $invitedList = [];
            $emailsToSend = [];

            // добавление записи приглашения в бд
            $insertStmt = $this->pdo->prepare("
                INSERT INTO board_invitations (board_id, inviter_id, invitee_id, token, id_board_role) 
                VALUES (:board_id, :inviter_id, :invitee_id, :token, :role_id)
            ");
            
            // данные получателей письма
            $userStmt = $this->pdo->prepare("
                SELECT email, CONCAT(first_name, ' ', last_name) as full_name 
                FROM users 
                WHERE id = ?
            ");

            foreach ($members as $member) {
                $userId = (int)$member['user_id'];
                $roleId = isset($member['role_id']) ? (int)$member['role_id'] : 2;
                $token = bin2hex(random_bytes(32));

                // добавляем запись приглашения в бд
                $insertStmt->execute([
                    ':board_id' => $boardId,
                    ':inviter_id' => $initiatorId,
                    ':invitee_id' => $userId,
                    ':token' => $token,
                    ':role_id' => $roleId
                ]);

                // данные получателя
                $userStmt->execute([$userId]);
                $user = $userStmt->fetch(PDO::FETCH_ASSOC);

                if ($user) {
                    $emailsToSend[] = [
                        'email' => $user['email'],
                        'fullName' => $user['full_name'],
                        'inviterName' => $inviterName,
                        'boardTitle' => $boardTitle,
                        'token' => $token
                    ];
                }

                $invitedList[] = $userId;
            }

            $this->pdo->commit();

            if (!empty($emailsToSend)) {
                $this->sendBatchInvitationEmails($emailsToSend);
            }

            http_response_code(200);
            echo json_encode([
                "success" => true,
                "message" => "Обработка приглашений завершена",
                "invited_users" => $invitedList
            ], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) {
                $this->pdo->rollBack();
            }
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Ошибка при приглашении пользователей: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
        }
    }

    public function declineInvitation(string $token, int $currentUserId): void {
        try {
            $stmt = $this->pdo->prepare("
                SELECT invitee_id 
                FROM board_invitations 
                WHERE token = ? 
                LIMIT 1
            ");
            $stmt->execute([$token]);
            $invitation = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$invitation) {
                http_response_code(404);
                echo json_encode(["success" => false, "message" => "Приглашение не найдено"], JSON_UNESCAPED_UNICODE);
                return;
            }

            //отклонить приглашение может только адресат
            if ((int)$invitation['invitee_id'] !== $currentUserId) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Вы не можете отклонить чужое приглашение"], JSON_UNESCAPED_UNICODE);
                return;
            }

            $deleteStmt = $this->pdo->prepare("DELETE FROM board_invitations WHERE token = ?");
            $deleteStmt->execute([$token]);

            http_response_code(200);
            echo json_encode(["success" => true, "message" => "Приглашение отклонено"], JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode(["success" => false, "message" => "Ошибка при отклонении приглашения: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
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

    public function updateProfile(int $userId, array $input) {
        try {
            $this->pdo->beginTransaction();
            $sql = "UPDATE users 
                    SET last_name = :last_name, 
                        first_name = :first_name, 
                        middle_name = :middle_name, 
                        birth_date = :birth_date, 
                        username = :username
                    WHERE id = :id";

            $updateStmt = $this->pdo->prepare($sql);
            $updateStmt->execute([
                'last_name'   => $input['last_name'] ?? '',
                'first_name'  => $input['first_name'] ?? '',
                'middle_name' => $input['middle_name'] ?? null,
                'birth_date'  => $input['birthday'] ?? null, 
                'username'    => $input['username'] ?? '',
                'id'          => $userId
            ]);

            $this->pdo->commit();
            echo json_encode([
                "success" => true,
                ],JSON_UNESCAPED_UNICODE);

        } catch (Exception $e) {
            if ($this->pdo->inTransaction()) $this->pdo->rollBack();
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
            if($initiatorId != $targetUserId){
                $permissions = new BoardPermissions($this->pdo, $boardId, $initiatorId, $targetUserId);

                if (!$permissions->canChangeMemberRoleOrRemove()) {
                    http_response_code(403);
                    echo json_encode(["success" => false, "message" => "Недостаточно прав для удаления этого участника"], JSON_UNESCAPED_UNICODE);
                    return;
                }
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