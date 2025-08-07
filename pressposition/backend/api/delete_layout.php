<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

$db = getDB();
$stmt = $db->prepare('DELETE FROM layouts WHERE id = ?');
$stmt->execute([intval($input['id'])]);

echo json_encode(['status' => 'ok']);
?>
