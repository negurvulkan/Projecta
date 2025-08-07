<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['id']) || !isset($input['data'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid input']);
    exit;
}

$db = getDB();
$stmt = $db->prepare('UPDATE layouts SET data = ?, name = COALESCE(?, name), updated_at = CURRENT_TIMESTAMP WHERE id = ?');
$stmt->execute([json_encode($input['data']), $input['name'] ?? null, intval($input['id'])]);

echo json_encode(['status' => 'ok']);
?>
