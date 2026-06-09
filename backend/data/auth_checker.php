<?php
function checkAuth($pdo, $userId) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    $token = str_replace('Bearer ', '', $authHeader);

    if (empty($token) || empty($userId) || empty($authHeader))
        return false;

    $checkStmt = $pdo->prepare("SELECT u.id FROM user_sessions u WHERE u.user_id = ? AND u.token = ?");
    $checkStmt->execute([$userId, $token]);
    return (bool)$checkStmt->fetch();
}
?>