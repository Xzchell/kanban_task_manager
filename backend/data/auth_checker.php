<?php
function checkAuth(PDO $pdo) {
    $token = $_COOKIE['auth_token'] ?? '';

    if (empty($token))
        return false;

    $checkStmt = $pdo->prepare("SELECT u.user_id FROM user_sessions u WHERE u.token = ? LIMIT 1");
    $checkStmt->execute([$token]);
    $session = $checkStmt->fetch(PDO::FETCH_ASSOC);
    return (bool)$session ? $session['user_id'] : null;
}
?>