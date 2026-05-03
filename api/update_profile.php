<?php
require_once 'config.php';

// Заголовки для JSON
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обработка preflight запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Получаем данные из запроса
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Нет данных для обновления']);
    exit();
}

$userId = $data['user_id'] ?? null;
$name = trim($data['name'] ?? '');
$email = trim($data['email'] ?? '');
$phone = trim($data['phone'] ?? '');
$address = trim($data['address'] ?? ''); // Адрес может быть пустым
$photo = $data['photo'] ?? null; // Фото в base64

// Проверка ID пользователя
if (!$userId) {
    echo json_encode(['success' => false, 'message' => 'ID пользователя не указан']);
    exit();
}

// Валидация обязательных полей
if (empty($name) || empty($email) || empty($phone)) {
    echo json_encode(['success' => false, 'message' => 'Имя, email и телефон обязательны для заполнения']);
    exit();
}

if (strlen($name) < 2) {
    echo json_encode(['success' => false, 'message' => 'Имя должно содержать минимум 2 символа']);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Введите корректный email']);
    exit();
}

try {
    // Проверка, что email не принадлежит другому пользователю
    $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ? AND id != ?");
    $stmt->execute([$email, $userId]);
    
    if ($stmt->fetch()) {
        echo json_encode(['success' => false, 'message' => 'Этот email уже используется другим пользователем']);
        exit();
    }
    
    // Обновляем данные (с адресом и опционально с фото)
    if ($photo !== null) {
        // Обновление с фото
        $sql = "UPDATE users SET name = ?, email = ?, phone = ?, address = ?, photo = ? WHERE id = ?";
        $params = [$name, $email, $phone, $address, $photo, $userId];
    } else {
        // Обновление без фото
        $sql = "UPDATE users SET name = ?, email = ?, phone = ?, address = ? WHERE id = ?";
        $params = [$name, $email, $phone, $address, $userId];
    }
    
    $stmt = $pdo->prepare($sql);
    $result = $stmt->execute($params);
    
    if ($result) {
        // Получаем обновленные данные пользователя
        $stmt = $pdo->prepare("SELECT id, name, email, phone, address, photo, role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'user' => $user,
            'message' => 'Профиль успешно обновлен'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Ошибка при обновлении профиля']);
    }
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Ошибка базы данных: ' . $e->getMessage()]);
}
?>