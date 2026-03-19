<?php
require_once 'config.php';

echo "<h1>Проверка подключения к БД</h1>";

try {
    echo "<p style='color:green'>✓ Подключение к MySQL успешно</p>";
    
    $stmt = $pdo->query("SELECT DATABASE()");
    $dbname = $stmt->fetchColumn();
    echo "<p>Текущая база данных: <strong>" . $dbname . "</strong></p>";
    
    $tables = $pdo->query("SHOW TABLES");
    echo "<h2>Таблицы в базе:</h2>";
    echo "<ul>";
    $hasProducts = false;
    while ($table = $tables->fetchColumn()) {
        echo "<li>" . $table . "</li>";
        if ($table == 'products') $hasProducts = true;
    }
    echo "</ul>";
    
    if ($hasProducts) {
        $products = $pdo->query("SELECT * FROM products");
        $count = $products->rowCount();
        echo "<p>Количество товаров в таблице products: <strong>" . $count . "</strong></p>";
        
        if ($count > 0) {
            echo "<h3>Первые 3 товара:</h3>";
            $stmt = $pdo->query("SELECT * FROM products LIMIT 3");
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                echo "<pre>";
                print_r($row);
                echo "</pre>";
            }
        } else {
            echo "<p style='color:red'>✗ В таблице products нет товаров!</p>";
        }
    }
    
} catch(PDOException $e) {
    echo "<p style='color:red'>✗ Ошибка: " . $e->getMessage() . "</p>";
}
?>