<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        // Получение всех продуктов
        $stmt = $pdo->query("SELECT * FROM products ORDER BY id");
        $products = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode($products);
        break;
        
    case 'POST':
        // Добавление продукта
        $data = json_decode(file_get_contents('php://input'), true);
        
        $stmt = $pdo->prepare("INSERT INTO products (name, price, description, imageUrl) VALUES (?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['price'], $data['description'], $data['imageUrl']]);
        
        echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
        break;
        
    case 'PUT':
        // Обновление продукта
        $data = json_decode(file_get_contents('php://input'), true);
        $id = $_GET['id'] ?? null;
        
        if ($id) {
            $stmt = $pdo->prepare("UPDATE products SET name=?, price=?, description=?, imageUrl=? WHERE id=?");
            $stmt->execute([$data['name'], $data['price'], $data['description'], $data['imageUrl'], $id]);
            echo json_encode(['success' => true]);
        }
        break;
        
    case 'DELETE':
        // Удаление продукта
        $id = $_GET['id'] ?? null;
        
        if ($id) {
            $stmt = $pdo->prepare("DELETE FROM products WHERE id = ?");
            $stmt->execute([$id]);
            echo json_encode(['success' => true]);
        }
        break;
}
?>