<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

$db = getDB();
$rows = $db->query('SELECT id, name, updated_at FROM layouts ORDER BY updated_at DESC')->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($rows);
?>
