<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['name']) || !isset($input['data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

$db = getDB();
$stmt = $db->prepare('INSERT INTO layouts (name, data) VALUES (?, ?)');
$stmt->execute([$input['name'], json_encode($input['data'])]);
$id = $db->lastInsertId();

echo json_encode(['id' => $id]);
?>
