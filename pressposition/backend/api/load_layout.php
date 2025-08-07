<?php
header('Content-Type: application/json');
require_once __DIR__ . '/../db.php';

$db = getDB();
if (isset($_GET['id'])) {
    $stmt = $db->prepare('SELECT * FROM layouts WHERE id = ?');
    $stmt->execute([intval($_GET['id'])]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
} else {
    $row = $db->query('SELECT * FROM layouts ORDER BY updated_at DESC LIMIT 1')->fetch(PDO::FETCH_ASSOC);
}

if (!$row) {
    http_response_code(404);
    echo json_encode(['error' => 'Layout not found']);
    exit;
}

$row['data'] = json_decode($row['data'], true);
echo json_encode($row);
?>
