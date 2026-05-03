<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Подключение к БД
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'storyforge';

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Ошибка подключения к БД: ' . $conn->connect_error]));
}

$conn->set_charset("utf8mb4");

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user_id = isset($_GET['user_id']) ? intval($_GET['user_id']) : 0;
    
    if ($user_id <= 0) {
        echo json_encode(['success' => false, 'message' => 'Не указан ID пользователя']);
        exit;
    }
    
    // Получаем заказы пользователя
    $query = "SELECT id, order_number, total_price, delivery_address, payment_method, status, created_at, updated_at 
              FROM orders 
              WHERE user_id = ? 
              ORDER BY created_at DESC";
    
    $stmt = $conn->prepare($query);
    $stmt->bind_param('i', $user_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $orders = [];
    while ($order = $result->fetch_assoc()) {
        // Получаем товары для каждого заказа
        $items_query = "SELECT product_id, product_name, product_price, quantity 
                        FROM order_items 
                        WHERE order_id = ?";
        $items_stmt = $conn->prepare($items_query);
        $items_stmt->bind_param('i', $order['id']);
        $items_stmt->execute();
        $items_result = $items_stmt->get_result();
        
        $items = [];
        while ($item = $items_result->fetch_assoc()) {
            $items[] = $item;
        }
        
        $order['items'] = $items;
        $orders[] = $order;
        
        $items_stmt->close();
    }
    
    $stmt->close();
    $conn->close();
    
    echo json_encode(['success' => true, 'orders' => $orders]);
} else {
    echo json_encode(['success' => false, 'message' => 'Метод не поддерживается']);
}
?>