<?php
require_once __DIR__ . '/libs/PHPMailer-7.1.1/src/Exception.php';
require_once __DIR__ . '/libs/PHPMailer-7.1.1/src/PHPMailer.php';
require_once __DIR__ . '/libs/PHPMailer-7.1.1/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;


class AuthService{
    private PDO $pdo; 

    public function __construct(PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    public function login(string $email, string $password){
        if (empty($email) || empty($password)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Заполните все поля"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $sql = "SELECT 
                    id, first_name, last_name, middle_name, 
                    birth_date as birthday, username, email, password as password_hash,
                    is_verified
                FROM users 
                WHERE email = ? OR username = ?"; 
                
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$email, $email]);
        $userRow = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($userRow && password_verify($password, $userRow['password_hash'])) {

            if ((int)$userRow['is_verified'] === 0) {
                http_response_code(403);
                echo json_encode(["success" => false, "message" => "Пожалуйста, подтвердите вашу почту перед входом", "need_verif" => true], JSON_UNESCAPED_UNICODE);
                return;
            }

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
                "email" => $userRow['email']
            ];

            setcookie(
                'auth_token',
                $token,
                [
                    'expires' => time() + 86400 * 7,
                    'path' => '/',
                    'secure' => isset($_SERVER['HTTPS']),
                    'httponly' => true,
                    'samesite' => 'Lax'
                ]
            );

            $fullName = trim(($userRow['last_name'] ?? '') . ' ' . ($userRow['first_name'] ?? '') . ' ' . ($userRow['middle_name'] ?? ''));

            $sessionService = new SessionService($this->pdo);
            $sessionService->sendLoginNotification($email, $fullName);

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

    public function register(string $username, string $email, string $fullName, string $birthDate, string $password) {
        if (empty($username) || empty($email) || empty($fullName) || empty($password) || empty($birthDate)){
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Заполните все поля"], JSON_UNESCAPED_UNICODE);
            return;
        }
        
        /* проверка на сущ пользователя */
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
        $formattedBirthDate = $dateParts[2] . '-' . $dateParts[1] . '-' . $dateParts[0];

        $passwordHash = password_hash($password, PASSWORD_BCRYPT);
        $verificationCode = rand(100000, 999999);

        $sql = "CALL create_user_account(?, ?, ?, ?, ?)";
        $insertStmt = $this->pdo->prepare($sql);

        $insertStmt->execute([
            $username,
            $email,
            $passwordHash,
            $fullName,
            $formattedBirthDate,
        ]);

        $userStmt = $this->pdo->prepare("SELECT id FROM users WHERE email = ?");
        $userStmt->execute([$email]);
        $userRow = $userStmt->fetch(PDO::FETCH_ASSOC);
        $userId = $userRow['id'];

        $expiresAt = date('Y-m-d H:i:s', time() + 900);
        $codeStmt = $this->pdo->prepare("INSERT INTO email_verifications (user_id, code, expires_at) VALUES (?, ?, ?)");
        $codeStmt->execute([$userId, $verificationCode, $expiresAt]);
        
        $this->sendEmailNotification($email, $fullName, $verificationCode);
    
        echo json_encode([
            "success" => true,
            "message" => "Код подтверждения отправлен на вашу почту"
        ], JSON_UNESCAPED_UNICODE);
    }

    public function resendCode(string $email, bool $isPasswordReset = false) {
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

        if (!$isPasswordReset && (int)$userRow['is_verified'] === 1) {
            echo json_encode(["success" => true, "message" => "Этот аккаунт уже успешно подтвержден"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $newVerificationCode = rand(100000, 999999);
        $expiresAt = date('Y-m-d H:i:s', time() + 900);

        $updateSql = "INSERT INTO email_verifications (user_id, code, expires_at) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE code = VALUES(code), expires_at = VALUES(expires_at)";
        $updateStmt = $this->pdo->prepare($updateSql);
        $updateStmt->execute([$userRow['id'], $newVerificationCode, $expiresAt]);

        $fullName = trim(($userRow['last_name'] ?? '') . ' ' . ($userRow['first_name'] ?? '') . ' ' . ($userRow['middle_name'] ?? ''));
        
        if (empty($fullName)) {
            $fullName = "Пользователь";
        }

        $this->sendEmailNotification($email, $fullName, $newVerificationCode, $isPasswordReset);

        echo json_encode([
            "success" => true,
            "message" => "Новый код подтверждения успешно отправлен на вашу почту"
        ], JSON_UNESCAPED_UNICODE);
    }
    
    private function sendEmailNotification(string $email, string $fullName, string $code, bool $isPasswordReset = false) {
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
            $mail->addAddress($email, $fullName);             
            $mail->addReplyTo('xzchellnon@yandex.ru', 'Поддержка');

            $mail->XMailer = 'PHP/KanbanMailer'; 
            $mail->addCustomHeader('List-Unsubscribe', '<mailto:xzchellnon@yandex.ru?subject=unsubscribe>');

            $mail->isHTML(true);            

            if ($isPasswordReset) {
                $mail->Subject = 'Восстановление пароля в Kanban Board';
                
                $titleText = "Запрос на смену пароля";
                $descText = "Мы получили запрос на изменение пароля для вашего аккаунта. Введите следующий 6-значный код на странице подтверждения для установки нового пароля:";
                $footerText = "Если вы не запрашивали смену пароля, просто проигнорируйте это письмо и убедитесь в безопасности вашего аккаунта.";
                
                $altDescText = "Мы получили запрос на изменение пароля. Ваш 6-значный код безопасности: {$code}";
            } else {
                $mail->Subject = 'Ваш одноразовый код авторизации';
                
                $titleText = "Добро пожаловать в Kanban Board!";
                $descText = "Для завершения регистрации введите следующий 6-значный код безопасности на странице подтверждения:";
                $footerText = "Если вы не создавали аккаунт, просто проигнорируйте это письмо.";
                
                $altDescText = "Для завершения регистрации введите следующий 6-значный код безопасности: {$code}";
            }
            
            $mail->Body    = "
                <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                    <h2 style='color: #4f46e5;'>{$titleText}</h2>
                    <p>Здравствуйте, <b>" . htmlspecialchars($fullName) . "</b>.</p>
                    <p>{$descText}</p>
                    <div style='background-color: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; color: #111827; border-radius: 6px; display: inline-block; min-width: 150px;'>
                        {$code}
                    </div>
                    <br><br>
                    <p style='font-size: 12px; color: #9ca3af;'>{$footerText}</p>
                </div>
            ";

            $mail->AltBody = "Здравствуйте, " . strip_tags($fullName) . ".\n\n" . $altDescText . "\n\n" . $footerText;

            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log("PHPMailer Error: {$mail->ErrorInfo}");
            return false;
        }
    }

    public function verifyCode(string $email, string $code, bool $isPasswordReset = false) {
        if (empty($email) || empty($code)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Email и код обязательны"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $userSql = "SELECT id, is_verified FROM users WHERE email = ?";
        $userStmt = $this->pdo->prepare($userSql);
        $userStmt->execute([$email]);
        $userRow = $userStmt->fetch(PDO::FETCH_ASSOC);

        if (!$userRow) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Пользователь с таким Email не найден"], JSON_UNESCAPED_UNICODE);
            return;
        }

        if (!$isPasswordReset && (int)$userRow['is_verified'] === 1) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Этот аккаунт уже верифицирован"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $userId = $userRow['id'];

        $codeSql = "SELECT code, expires_at FROM email_verifications WHERE user_id = ?";
        $codeStmt = $this->pdo->prepare($codeSql);
        $codeStmt->execute([$userId]);
        $verification = $codeStmt->fetch(PDO::FETCH_ASSOC);

        if (!$verification) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Код подтверждения не запрашивался или устарел"], JSON_UNESCAPED_UNICODE);
            return;
        }

        if ($verification['code'] !== (string)$code) {
            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Неверный код подтверждения"], JSON_UNESCAPED_UNICODE);
            return;
        }

        if (strtotime($verification['expires_at']) < time()) {
            $deleteCodeStmt = $this->pdo->prepare("DELETE FROM email_verifications WHERE user_id = ?");
            $deleteCodeStmt->execute([$userId]);

            http_response_code(401);
            echo json_encode(["success" => false, "message" => "Срок действия кода истек. Запросите новый код."], JSON_UNESCAPED_UNICODE);
            return;
        }

        if ($isPasswordReset) {
            $deleteCodeStmt = $this->pdo->prepare("DELETE FROM email_verifications WHERE user_id = ?");
            $deleteCodeStmt->execute([$userId]);

            echo json_encode([
                "success" => true,
                "message" => "Код успешно подтвержден. Теперь вы можете изменить пароль."
            ], JSON_UNESCAPED_UNICODE);
            
            return;
        } else {
            $this->pdo->beginTransaction();

            $updateUserStmt = $this->pdo->prepare("UPDATE users SET is_verified = 1 WHERE id = ?");
            $updateUserStmt->execute([$userId]);

            $deleteCodeStmt = $this->pdo->prepare("DELETE FROM email_verifications WHERE user_id = ?");
            $deleteCodeStmt->execute([$userId]);

            $token = bin2hex(random_bytes(32));
            
            $sessionStmt = $this->pdo->prepare("INSERT INTO user_sessions (user_id, token) VALUES (?, ?)");
            $sessionStmt->execute([$userId, $token]);

            $this->pdo->commit();

            $fullDataSql = "SELECT u.id, u.first_name, u.last_name, u.middle_name, u.birth_date as birthday, u.username, u.email FROM users u WHERE u.id = ?";
            
            $dataStmt = $this->pdo->prepare($fullDataSql);
            $dataStmt->execute([$userId]);
            $fullUser = $dataStmt->fetch(PDO::FETCH_ASSOC);

            $userData = [
                "id" => (int)$fullUser['id'],
                "first_name" => $fullUser['first_name'] ?? '',
                "last_name" => $fullUser['last_name'] ?? '',
                "middle_name" => $fullUser['middle_name'] ?? '',
                "birthday" => $fullUser['birthday'] ?? '',
                "username" => $fullUser['username'],
                "email" => $fullUser['email'],
                "role" => null
            ];

            setcookie(
                'auth_token',
                $token,
                [
                    'expires' => time() + 86400 * 7,
                    'path' => '/',
                    'secure' => isset($_SERVER['HTTPS']),
                    'httponly' => true,
                    'samesite' => 'Lax'
                ]
            );

            echo json_encode([
                "success" => true,
                "message" => "Почта успешно подтверждена",
                "user_data" => $userData
            ], JSON_UNESCAPED_UNICODE);
        }
    }

    public function logout(string $token){
        if(!empty($token)){
            $stmt = $this->pdo->prepare("DELETE FROM user_sessions WHERE token = ?");
            $stmt->execute([$token]);
        }

        setcookie('auth_token', '', [
            'expires' => time() - 3600,
            'path' => '/',
            'secure' => isset($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Lax'
        ]);

        echo json_encode(["success" => "Выполнен выход"], JSON_UNESCAPED_UNICODE);
        return;
    }

    public function updatePassword(string $email, string $newPassword) {
        if (empty($email) || empty($newPassword)) {
            http_response_code(400);
            echo json_encode(["success" => false, "message" => "Email и новый пароль обязательны"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $sql = "SELECT id FROM users WHERE email = ?";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$email]);
        $userId = $stmt->fetchColumn();

        if (!$userId) {
            http_response_code(404);
            echo json_encode(["success" => false, "message" => "Пользователь не найден"], JSON_UNESCAPED_UNICODE);
            return;
        }

        $passwordHash = password_hash($newPassword, PASSWORD_BCRYPT);

        $updateSql = "UPDATE users SET password = ? WHERE id = ?";
        $updateStmt = $this->pdo->prepare($updateSql);
        $updateStmt->execute([$passwordHash, $userId]);

        echo json_encode([
            "success" => true,
            "message" => "Пароль успешно изменен."
        ], JSON_UNESCAPED_UNICODE);
    }
}


function authActions(PDO $pdo, string $action) {
    $authService = new AuthService($pdo);
    $inputData = json_decode(file_get_contents('php://input'), true) ?? [];

    try {
        switch($action){
            case 'login':
                $email = $inputData['login'] ?? '';
                $password = $inputData['password'] ?? '';
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
                $isPasswordReset = (bool)($inputData['isPasswordReset'] ?? false);
                
                $authService->resendCode($email, $isPasswordReset);
                break;
                
            case 'verify':
                $email = $inputData['email'] ?? '';
                $code = $inputData['code'] ?? '';
                $isPasswordReset = (bool)($inputData['isPasswordReset'] ?? false);
                
                $authService->verifyCode($email, $code, $isPasswordReset);
                break;

            case 'update_password':
                $email = $inputData['email'] ?? '';
                $newPassword = $inputData['password'] ?? '';
                
                $authService->updatePassword($email, $newPassword);
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