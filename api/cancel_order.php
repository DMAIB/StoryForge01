<?php
// cancel_order.php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

function sendResponse($success, $message, $data = null) {
    $response = ['success' => $success, 'message' => $message];
    if ($data !== null) {
        $response['data'] = $data;
    }
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    exit();
}

// Получаем входные данные
$input = file_get_contents('php://input');
if (empty($input)) {
    sendResponse(false, 'Нет данных в запросе');
}

$data = json_decode($input, true);
if ($data === null) {
    sendResponse(false, 'Некорректный JSON: ' . json_last_error_msg());
}

if (!isset($data['order_id']) || !isset($data['user_id'])) {
    sendResponse(false, 'Необходимы параметры order_id и user_id');
}

$order_id = intval($data['order_id']);
$user_id = intval($data['user_id']);

if ($order_id <= 0 || $user_id <= 0) {
    sendResponse(false, 'Некорректные ID');
}

// Подключаем config.php
require_once __DIR__ . '/config.php';

// Проверяем соединение (для PDO используется $pdo)
if (!isset($pdo)) {
    sendResponse(false, 'Ошибка подключения к базе данных: переменная $pdo не определена');
}

try {
    // Проверяем существование заказа и его статус
    $check_query = "SELECT id, status FROM orders WHERE id = :order_id AND user_id = :user_id";
    $stmt = $pdo->prepare($check_query);
    $stmt->execute(['order_id' => $order_id, 'user_id' => $user_id]);
    $order = $stmt->fetch();
    
    if (!$order) {
        sendResponse(false, 'Заказ не найден или не принадлежит вам');
    }
    
    // Проверяем возможность отмены
    if (!in_array($order['status'], ['pending', 'processing'])) {
        sendResponse(false, 'Заказ нельзя отменить в текущем статусе: ' . $order['status']);
    }
    
    // Обновляем статус
    $update_query = "UPDATE orders SET status = 'cancelled' WHERE id = :order_id";
    $stmt = $pdo->prepare($update_query);
    $stmt->execute(['order_id' => $order_id]);
    
    if ($stmt->rowCount() > 0) {
        sendResponse(true, 'Заказ успешно отменен');
    } else {
        sendResponse(false, 'Ошибка при обновлении статуса');
    }
    
} catch (PDOException $e) {
    sendResponse(false, 'Ошибка базы данных: ' . $e->getMessage());
} catch (Exception $e) {
    sendResponse(false, 'Ошибка сервера: ' . $e->getMessage());
}
?>