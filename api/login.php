<?php
require_once 'config.php';

$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'];
$password = $data['password'];

try {
    // Добавили address, photo в SELECT
    $stmt = $pdo->prepare("SELECT id, name, email, phone, address, photo, role, password FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user && password_verify($password, $user['password'])) {
        unset($user['password']);
        
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Неверный email или пароль']);
    }
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Ошибка входа: ' . $e->getMessage()]);
}
?>