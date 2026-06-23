<?php
require_once __DIR__ . '/libs/PHPMailer-7.1.1/src/Exception.php';
require_once __DIR__ . '/libs/PHPMailer-7.1.1/src/PHPMailer.php';
require_once __DIR__ . '/libs/PHPMailer-7.1.1/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

class AuthService{
    private $pdo; 

    public function __construct($pdo)
    {
        $this-> pdo = $pdo;
    }

    public function login($email, $password){
        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Заполните все поля"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $sql = "SELECT 
                    u.id, u.first_name, u.last_name, u.middle_name, 
                    u.birth_date as birthday, u.username, u.email, u.password as password_hash,
                    r.id as role_id, r.permission_level, r.display_name as role_name, 
                    r.description as role_description, r.background_color, r.text_color
                FROM users u 
                LEFT JOIN roles r ON u.id_role = r.id 
                WHERE u.email = ? OR u.username = ?"; 
                
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$email, $email]);
        $userRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($userRow && password_verify($password, $userRow['password_hash'])) {
            $token = bin2hex(random_bytes(32));
            $stmt = $this->pdo->prepare("INSERT INTO user_sessions (user_id, token) VALUES (?, ?)");
            $stmt->execute([$userRow['id'], $token]);
            
            $userData = [
                "id" => (int)$userRow['id'],
                "first_name" => $userRow['first_name'],
                "last_name" => $userRow['last_name'],
                "middle_name" => $userRow['middle_name'],
                "birthday" => $userRow['birthday'],
                "username" => $userRow['username'],
                "email" => $userRow['email'],
                "role" => [
                    "id" => (int)$userRow['role_id'],
                    "role_name" => $userRow['role_name'],
                    "permission_level" => (int)$userRow['permission_level'],
                    "description" => $userRow['role_description'],
                    "background_color" => $userRow['background_color'],
                    "text_color" => $userRow['text_color']
                ]
            ];

            setcookie(
                'auth_token',
                $token,
                [
                    'expires' => time() + 86400 * 7,
                    'path' => '/',
                    'domain' => 'kanban.local',
                    'secure' => true,
                    'httponly' => true,
                    'samesite' => 'None'
                ]
            );

            echo json_encode([
                "success" => true,
                "user_data" => $userData
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(401);
            echo json_encode([
                "success" => false,
                "message" => "Неверный логин или пароль"
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public function register($username, $email, $fullName, $birthDate, $password) {
        if (empty($username) || empty($email) || empty($fullName) || empty($password) || empty($birthDate)){
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Заполните все поля"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $checkSql = "SELECT id FROM users WHERE email = ? OR username = ?";
        $stmt = $this->pdo->prepare($checkSql);
        $stmt->execute([$email, $username]);

        if ($stmt->fetch()) {
            http_response_code(409);
            echo json_encode(["success" => false, "message" => "Пользователь с таким Email или Логином уже существует"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $formattedBirthDate = null;
        $dateParts = explode('.', $birthDate);
        if (count($dateParts) === 3) {
            $formattedBirthDate = $dateParts[2] . '-' . $dateParts[1] . '-' . $dateParts[0];
        } else {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Неверный формат даты"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $verificationCode = rand(100000, 999999);

        $sql = "CALL create_user_account(?, ?, ?, ?, ?, ?)";
        $insertStmt = $this->pdo->prepare($sql);

        $insertStmt->execute([
            $username,
            $email,
            $passwordHash,
            $fullName,
            $formattedBirthDate,
            $verificationCode
        ]);
        $isSent = $this->sendEmailNotification($email, $fullName, $verificationCode);
    
        echo json_encode([
            "success" => true,
            "message" => "Код подтверждения отправлен на вашу почту"
        ], JSON_UNESCAPED_UNICODE);
    }

    public function resendCode($email) {
        if (empty($email)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Email обязателен"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $sql = "SELECT id, first_name, last_name, middle_name, is_verified FROM users WHERE email = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$email]);
        $userRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$userRow) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Пользователь с таким Email не найден"], JSON_UNESCAPED_UNICODE);
            return;
        }

        if ((int)$userRow['is_verified'] === 1) {
            echo json_encode(["success" => true, "message" => "Этот аккаунт уже успешно подтвержден"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $newVerificationCode = rand(100000, 999999);

        $updateSql = "UPDATE users SET verification_code = ? WHERE id = ?";
        $updateStmt = $this->pdo->prepare($updateSql);
        $updateStmt->execute([$newVerificationCode, $userRow['id']]);

        $fullName = trim(($userRow['last_name'] ?? '') . ' ' . ($userRow['first_name'] ?? '') . ' ' . ($userRow['middle_name'] ?? ''));
        if (empty($fullName)) {
            $fullName = "Пользователь";
        }

        $isSent = $this->sendEmailNotification($email, $fullName, $newVerificationCode);

        echo json_encode([
            "success" => true,
            "message" => "Новый код подтверждения успешно отправлен на вашу почту"
        ], JSON_UNESCAPED_UNICODE);
    }
    
    private function sendEmailNotification($email, $fullName, $code) {
        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();                                  
            $mail->Host       = 'smtp.yandex.ru';
            $mail->SMTPAuth   = true;                         
            $mail->Username   = 'xzchellnon@yandex.ru';
            $mail->Password   = 'passs'; 
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;   
            $mail->Port       = 465;                          
            $mail->CharSet    = 'UTF-8';                      

            $mail->setFrom('xzchellnon@yandex.ru', 'Kanban Task');
            $mail->addAddress($email, $fullName);             

            $mail->XMailer = 'PHP/KanbanMailer'; 
            $mail->addCustomHeader('List-Unsubscribe', '<mailto:xzchellnon@yandex.ru?subject=unsubscribe>');

            $mail->isHTML(true);                              
            $mail->Subject = 'Ваш одноразовый код авторизации';
            
            $mail->Body    = "
                <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                    <h2 style='color: #4f46e5;'>Добро пожаловать в Kanban Board!</h2>
                    <p>Здравствуйте, <b>" . htmlspecialchars($fullName) . "</b>.</p>
                    <p>Для завершения регистрации введите следующий 6-значный код безопасности на странице подтверждения:</p>
                    <div style='background-color: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #111827; border-radius: 6px; display: inline-block; min-width: 150px;'>
                        {$code}
                    </div>
                    <br><br>
                    <p style='font-size: 12px; color: #9ca3af;'>Если вы не создавали аккаунт, просто проигнорируйте это письмо.</p>
                </div>
            ";

            $mail->AltBody = "Здравствуйте, " . strip_tags($fullName) . ".\n\nДля завершения регистрации введите следующий 6-значный код безопасности: {$code}\n\nЕсли вы не создавали аккаунт, просто проигнорируйте это письмо.";

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("PHPMailer Error: {$mail->ErrorInfo}");
            return false;
        }
    }
    public function verifyCode($email, $code) {
        if (empty($email) || empty($code)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Email и код обязательны"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $sql = "SELECT id, first_name, last_name, middle_name, birth_date as birthday, username, email, is_verified 
                FROM users 
                WHERE email = ? AND verification_code = ?";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$email, $code]);
        $userRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$userRow) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Неверный код подтверждения или Email"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $updateSql = "UPDATE users SET is_verified = 1, verification_code = NULL WHERE id = ?";
        $updateStmt = $this->pdo->prepare($updateSql);
        $updateStmt->execute([$userRow['id']]);

        $token = bin2hex(random_bytes(32));
        $sessionStmt = $this->pdo->prepare("INSERT INTO user_sessions (user_id, token) VALUES (?, ?)");
        $sessionStmt->execute([$userRow['id'], $token]);

        $userData = [
            "id" => (int)$userRow['id'],
            "first_name" => $userRow['first_name'] ?? '',
            "last_name" => $userRow['last_name'] ?? '',
            "middle_name" => $userRow['middle_name'] ?? '',
            "birthday" => $userRow['birthday'] ?? '',
            "username" => $userRow['username'],
            "email" => $userRow['email'],
            "role" => null
        ];

        setcookie(
            'auth_token',
            $token,
            [
                'expires' => time() + 86400 * 7,
                'path' => '/',
                'domain' => 'kanban.local',
                'secure' => true,
                'httponly' => true,
                'samesite' => 'None'
            ]
        );

        echo json_encode([
            "success" => true,
            "message" => "Почта успешно подтверждена",
            "user_data" => $userData
        ], JSON_UNESCAPED_UNICODE);
    }

    public function logout($token){
        if(!empty($token)){
            $stmt = $this->pdo->prepare("DELETE FROM user_sessions WHERE token = ?");
            $stmt->execute([$token]);
        }

        setcookie('auth_token', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'domain' => 'kanban.local',
            'secure' => true,
            'httponly' => true,
            'samesite' => 'None'
        ]);

        echo json_encode(["success" => "Выполнен выход"], JSON_UNESCAPED_UNICODE);
        return;
    }
}


function authActions($pdo, $action) {
    $authService = new AuthService($pdo);
    $inputData = json_decode(file_get_contents('php://input'), true) ?? [];

    try {
        switch($action){
            case 'login':
                $email = $inputData['login'] ?? [];
                $password = $inputData['password'] ?? [];

                $authService->login($email, $password);
                break;
            case 'logout': 
                $token = $_COOKIE['auth_token'] ?? '';

                $authService->logout($token);
                break;
            case 'register':
                $username = $inputData['username'] ?? '';
                $email = $inputData['email'] ?? '';
                $fullName = $inputData['fullNameUser'] ?? '';
                $birthDate = $inputData['birthDate'] ?? '';
                $password = $inputData['password'] ?? '';

                $authService->register($username, $email, $fullName, $birthDate, $password);
                break;
            case 'resend_code':
                $email = $inputData['email'] ?? '';
                
                $authService->resendCode($email);
                break;
            case 'verify':
                $email = $inputData['email'] ?? '';
                $code = $inputData['code'] ?? '';

                $authService->verifyCode($email, $code);
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
?>