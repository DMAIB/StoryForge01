<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Нет данных']);
    exit();
}

if (empty($data['order_id']) || empty($data['status'])) {
    echo json_encode(['success' => false, 'message' => 'Не указан ID заказа или статус']);
    exit();
}

$allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
if (!in_array($data['status'], $allowedStatuses)) {
    echo json_encode(['success' => false, 'message' => 'Недопустимый статус']);
    exit();
}

try {
    $query = "UPDATE orders SET status = ? WHERE id = ?";
    $stmt = $pdo->prepare($query);
    $stmt->execute([$data['status'], $data['order_id']]);
    
    if ($stmt->rowCount() > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Статус заказа обновлен'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Заказ не найден или статус не изменился'
        ]);
    }
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка: ' . $e->getMessage()
    ]);
}
?>