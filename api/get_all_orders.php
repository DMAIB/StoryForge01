<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Content-Type');

try {
    $query = "
        SELECT o.*, u.name as user_name, u.email as user_email
        FROM orders o
        LEFT JOIN users u ON o.user_id = u.id
        ORDER BY o.created_at DESC
    ";
    
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Для каждого заказа получаем товары
    foreach ($orders as &$order) {
        $itemsQuery = "SELECT * FROM order_items WHERE order_id = ?";
        $itemsStmt = $pdo->prepare($itemsQuery);
        $itemsStmt->execute([$order['id']]);
        $order['items'] = $itemsStmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Добавляем поля subtotal_price и delivery_price, если их нет
        if (!isset($order['subtotal_price'])) {
            $order['subtotal_price'] = $order['total_price'];
        }
        if (!isset($order['delivery_price'])) {
            $order['delivery_price'] = 0;
        }
    }
    
    echo json_encode([
        'success' => true,
        'orders' => $orders
    ]);
    
} catch(PDOException $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Ошибка: ' . $e->getMessage()
    ]);
}
?>