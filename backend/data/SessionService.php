<?php
require_once __DIR__ . '/libs/PHPMailer-7.1.1/src/Exception.php';
require_once __DIR__ . '/libs/PHPMailer-7.1.1/src/PHPMailer.php';
require_once __DIR__ . '/libs/PHPMailer-7.1.1/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class SessionService {
    private PDO $pdo;

    public function __construct(PDO $pdo) {
        $this->pdo = $pdo;
    }

    /*Получить список активных сессий пользователя*/
    public function getOtherSessions(string $currentToken) {
        if (empty($currentToken)) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Нет авторизации"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $userSql = "SELECT user_id FROM user_sessions WHERE token = ?";
        $stmt = $this->pdo->prepare($userSql);
        $stmt->execute([$currentToken]);
        $userId = $stmt->fetchColumn();

        if (!$userId) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Сессия не найдена или устарела"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $sessionsSql = "SELECT id, created_at FROM user_sessions WHERE user_id = ? AND token != ? ORDER BY id DESC";
        $sessionsStmt = $this->pdo->prepare($sessionsSql);
        $sessionsStmt->execute([$userId, $currentToken]);
        $rows = $sessionsStmt->fetchAll(PDO::FETCH_ASSOC);

        $sessionsList = [];
        foreach ($rows as $row) {
            $formattedDate = date('d.m.Y H:i', strtotime($row['created_at']));
            
            $sessionsList[] = [
                "id" => (int)$row['id'],
                "created_at" => $formattedDate,
                "device" => "Активная сессия (Вход: " . $formattedDate . ")"
            ];
        }

        echo json_encode(["success" => true, "sessions" => $sessionsList], JSON_UNESCAPED_UNICODE);
    }

    /*Удалине конкретной сессии*/
    public function revokeSession(string $currentToken, int $sessionId) {
        if (empty($currentToken) || empty($sessionId)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Неверные параметры запроса"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $checkSql = "SELECT s1.id FROM user_sessions s1 
                     JOIN user_sessions s2 ON s1.user_id = s2.user_id 
                     WHERE s2.token = ? AND s1.id = ?";
        $checkStmt = $this->pdo->prepare($checkSql);
        $checkStmt->execute([$currentToken, $sessionId]);
        
        if (!$checkStmt->fetch()) {
            http_response_code(403);
            echo json_encode(["success" => false, "message" => "Доступ запрещен или сессия не найдена"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $deleteStmt = $this->pdo->prepare("DELETE FROM user_sessions WHERE id = ?");
        $deleteStmt->execute([$sessionId]);

        echo json_encode(["success" => true, "message" => "Сессия успешно завершена"], JSON_UNESCAPED_UNICODE);
    }

    /*Отправка Email-уведомления о новом входе в аккаунт*/
    public function sendLoginNotification(string $email, string $fullName) {
        $mail = new PHPMailer(true);
        $loginDate = date('d.m.Y H:i:s');

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
            $mail->addAddress($email, $fullName);             

            $mail->isHTML(true);            
            $mail->Subject = 'Новый вход в ваш аккаунт Kanban Board';
            
            $mail->Body = "
                <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                    <h2 style='color: #ef4444;'>Уведомление о безопасности</h2>
                    <p>Здравствуйте, <b>" . htmlspecialchars($fullName) . "</b>.</p>
                    <p>В ваш аккаунт Kanban Board был совершен новый вход.</p>
                    <p><b>Дата и время:</b> {$loginDate}</p>
                    <br>
                    <p style='font-size: 12px; color: #9ca3af;'>Если это были вы, проигнорируйте это письмо. Если вы не совершали вход, рекомендуем немедленно изменить пароль в профиле и завершить чужие сессии.</p>
                </div>
            ";

            $mail->AltBody = "Здравствуйте, " . strip_tags($fullName) . ".\n\nВ ваш аккаунт был совершен вход {$loginDate}.\n\nЕсли это были не вы, немедленно измените пароль.";

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("PHPMailer Login Notification Error: {$mail->ErrorInfo}");
            return false;
        }
    }
}

function sessionActions(PDO $pdo, string $action) {
    $sessionService = new SessionService($pdo);
    $inputData = json_decode(file_get_contents('php://input'), true) ?? [];
    $token = $_COOKIE['auth_token'] ?? '';

    try {
        switch ($action) {
            case 'get_other_sessions':
                $sessionService->getOtherSessions($token);
                break;
                
            case 'revoke_session':
                $sessionId = (int)($inputData['sessionId'] ?? 0);
                $sessionService->revokeSession($token, $sessionId);
                break;
                
            default:
                http_response_code(405);
                echo json_encode(["error" => "Action not allowed"], JSON_UNESCAPED_UNICODE);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()], JSON_UNESCAPED_UNICODE);
    }
}