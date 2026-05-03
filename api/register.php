<?php
require_once 'config.php';

// Получаем данные из запроса
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Нет данных для регистрации']);
    exit();
}

$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$password = $data['password'] ?? '';

// Проверяем, что все поля заполнены
if (empty($name) || empty($email) || empty($phone) || empty($password)) {
    echo json_encode(['success' => false, 'message' => 'Все поля должны быть заполнены']);
    exit();
}

// Дополнительные проверки
if (strlen($name) < 2) {
    echo json_encode(['success' => false, 'message' => 'Имя должно содержать минимум 2 символа']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Введите корректный email']);
    exit();
}

if (strlen($password) < 6) {
    echo json_encode(['success' => false, 'message' => 'Пароль должен содержать минимум 6 символов']);
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
    
    // Добавление нового пользователя с ролью 'user' по умолчанию
    $stmt = $pdo->prepare("INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, 'user')");
    $result = $stmt->execute([$name, $email, $phone, $hashedPassword]);
    
    if ($result) {
        $userId = $pdo->lastInsertId();
        
        // Получаем данные пользователя (включая роль)
        $stmt = $pdo->prepare("SELECT id, name, email, phone, role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'user' => $user,
            'message' => 'Регистрация успешна'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ошибка при сохранении пользователя']);
    }
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Ошибка базы данных: ' . $e->getMessage()]);
}
?>