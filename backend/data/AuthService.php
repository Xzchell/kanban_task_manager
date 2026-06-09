<?php
function authActions($pdo, $action) {
    try {
        switch($action){
            case 'login': login($pdo); break;
            case 'logout': logout($pdo); break;
            default:
                http_response_code(405);
                echo json_encode(["error" => "Method not allowed"]);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }    
}

function login($pdo){
    $eData = file_get_contents('php://input');
    $dData = json_decode($eData, true);
                
    $email = $dData['login'] ?? '';
    $password = $dData['password'] ?? '';

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
            
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$email, $email]);
    $userRow = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($userRow && password_verify($password, $userRow['password_hash'])) {
        $token = bin2hex(random_bytes(32));
        $stmt = $pdo->prepare("INSERT INTO user_sessions (user_id, token) VALUES (?, ?)");
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

        echo json_encode([
            "success" => true,
            "user_data" => $userData, 
            "token" => $token
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(401);
        echo json_encode([
            "success" => false,
            "message" => "Неверный логин или пароль"
        ], JSON_UNESCAPED_UNICODE);
    }
}

function logout($pdo){
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    $token = str_replace('Bearer ', '', $authHeader);

    $stmt = $pdo->prepare("DELETE FROM user_sessions WHERE token = ?");
    $stmt->execute([$token]);
    echo json_encode(["success" => "Выполнен выход"]);
}
?>