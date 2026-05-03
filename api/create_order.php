<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Получаем данные
$data = json_decode(file_get_contents('php://input'), true);

if (!$data) {
    echo json_encode(['success' => false, 'message' => 'Нет данных заказа']);
    exit();
}

// Валидация обязательных полей
if (empty($data['user_id']) || empty($data['delivery_address']) || empty($data['payment_method']) || empty($data['items'])) {
    echo json_encode(['success' => false, 'message' => 'Заполните все обязательные поля']);
    exit();
}

try {
    // Начинаем транзакцию
    $pdo->beginTransaction();
    
    // Генерируем уникальный номер заказа
    $order_number = 'ORD-' . date('Ymd') . '-' . uniqid();
    
    // Вставляем заказ
    $stmt = $pdo->prepare("
        INSERT INTO orders (user_id, order_number, total_price, delivery_address, payment_method, status) 
        VALUES (?, ?, ?, ?, ?, 'pending')
    ");
    
    $stmt->execute([
        $data['user_id'],
        $order_number,
        $data['total_price'],
        $data['delivery_address'],
        $data['payment_method']
    ]);
    
    $order_id = $pdo->lastInsertId();
    
    // Подготавливаем запрос для вставки товаров
    $stmt = $pdo->prepare("
        INSERT INTO order_items (order_id, product_id, product_name, product_price, quantity) 
        VALUES (?, ?, ?, ?, ?)
    ");
    
    foreach ($data['items'] as $item) {
        // Проверяем, существует ли товар в таблице products
        $checkStmt = $pdo->prepare("SELECT id, name, price FROM products WHERE id = ?");
        $checkStmt->execute([$item['id']]);
        $product = $checkStmt->fetch(PDO::FETCH_ASSOC);
        
        if ($product) {
            // Товар существует - используем его данные
            $product_name = $product['name'];
            $product_price = $product['price'];
            $product_id = $product['id'];
        } else {
            // Товара нет в БД - используем данные из корзины, НО вставляем product_id = NULL
            // или создаем временный товар
            $product_name = $item['name'];
            $product_price = $item['price'];
            $product_id = null; // Временно ставим NULL
        }
        
        $stmt->execute([
            $order_id,
            $product_id,
            $product_name,
            $product_price,
            $item['quantity']
        ]);
        
        // Очищаем корзину пользователя (удаляем эти товары из корзины)
        $deleteCart = $pdo->prepare("DELETE FROM cart WHERE user_id = ? AND product_id = ?");
        $deleteCart->execute([$data['user_id'], $item['id']]);
    }
    
    // Подтверждаем транзакцию
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Заказ успешно создан',
        'order_id' => $order_id,
        'order_number' => $order_number
    ]);
    
} catch(PDOException $e) {
    // Откатываем транзакцию в случае ошибки
    $pdo->rollBack();
    echo json_encode(['success' => false, 'message' => 'Ошибка: ' . $e->getMessage()]);
}
?>