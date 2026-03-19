<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Получение корзины пользователя
        $user_id = $_GET['user_id'] ?? null;
        
        if ($user_id) {
            $stmt = $pdo->prepare("
                SELECT c.*, p.name, p.price, p.description, p.imageUrl 
                FROM cart c 
                JOIN products p ON c.product_id = p.id 
                WHERE c.user_id = ?
            ");
            $stmt->execute([$user_id]);
            $cart = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($cart);
        }
        break;
        
    case 'POST':
        // Добавление в корзину
        $data = json_decode(file_get_contents('php://input'), true);
        
        // Проверяем, есть ли уже такой товар в корзине
        $stmt = $pdo->prepare("SELECT id, quantity FROM cart WHERE user_id = ? AND product_id = ?");
        $stmt->execute([$data['user_id'], $data['product_id']]);
        $existing = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($existing) {
            // Обновляем количество
            $stmt = $pdo->prepare("UPDATE cart SET quantity = quantity + 1 WHERE id = ?");
            $stmt->execute([$existing['id']]);
        } else {
            // Добавляем новый товар
            $stmt = $pdo->prepare("INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)");
            $stmt->execute([$data['user_id'], $data['product_id'], $data['quantity']]);
        }
        
        echo json_encode(['success' => true]);
        break;
        
    case 'PUT':
        // Обновление количества
        parse_str($_SERVER['QUERY_STRING'], $params);
        $id = $params['id'] ?? null;
        
        if ($id) {
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $pdo->prepare("UPDATE cart SET quantity = ? WHERE id = ?");
            $stmt->execute([$data['quantity'], $id]);
            echo json_encode(['success' => true]);
        }
        break;
        
    case 'DELETE':
        // Удаление из корзины
        $user_id = $_GET['user_id'] ?? null;
        $id = $_GET['id'] ?? null;
        
        if ($user_id) {
            // Очистка всей корзины пользователя
            $stmt = $pdo->prepare("DELETE FROM cart WHERE user_id = ?");
            $stmt->execute([$user_id]);
        } else if ($id) {
            // Удаление конкретного товара
            $stmt = $pdo->prepare("DELETE FROM cart WHERE id = ?");
            $stmt->execute([$id]);
        }
        
        echo json_encode(['success' => true]);
        break;
}
?>