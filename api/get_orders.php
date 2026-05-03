<?php
require_once 'config.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;

if (!$user_id) {
    echo json_encode(['success' => false, 'message' => 'User ID required']);
    exit();
}

try {
    // Получаем все заказы пользователя
    $stmt = $pdo->prepare("
        SELECT * FROM orders 
        WHERE user_id = ? 
        ORDER BY created_at DESC
    ");
    $stmt->execute([$user_id]);
    $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Для каждого заказа получаем товары
    foreach ($orders as &$order) {
        $stmt = $pdo->prepare("
            SELECT * FROM order_items 
            WHERE order_id = ?
        ");
        $stmt->execute([$order['id']]);
        $order['items'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    echo json_encode([
        'success' => true,
        'orders' => $orders
    ]);
    
} catch(PDOException $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>