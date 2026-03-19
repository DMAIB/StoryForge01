<?php
require_once 'config.php';

// Получаем данные из запроса
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Нет данных для регистрации']);
    exit();
}

$name = $data['name'] ?? '';
$email = $data['email'] ?? '';
$phone = $data['phone'] ?? '';
$password = $data['password'] ?? '';

// Проверяем, что все поля заполнены
if (empty($name) || empty($email) || empty($phone) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Все поля должны быть заполнены']);
    exit();
}

try {
    // Проверка существующего пользователя
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
    $stmt->execute([$email]);
    
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Email уже зарегистрирован']);
        exit();
    }
    
    // Хешируем пароль
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
    
    // Добавление нового пользователя
    $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password) VALUES (?, ?, ?, ?)");
    $result = $stmt->execute([$name, $email, $phone, $hashedPassword]);
    
    if ($result) {
        $userId = $pdo->lastInsertId();
        
        // Получаем данные пользователя
        $stmt = $pdo->prepare("SELECT id, name, email, phone FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'user' => $user
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ошибка при сохранении пользователя']);
    }
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Ошибка базы данных: ' . $e->getMessage()]);
}
?>