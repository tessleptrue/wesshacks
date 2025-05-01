<?php
require_once '../config.php';
header('Content-Type: application/json');
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $result = $conn->query("SELECT * FROM forum_posts ORDER BY created_at DESC");
    $posts = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode(['status' => 'success', 'data' => $posts]);
} elseif ($method === 'POST') {
    $data = json_decode(file_get_contents("php://input"), true);
    $stmt = $conn->prepare("INSERT INTO forum_posts (title, contact_info, content, username) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssss", $data['title'], $data['contact_info'], $data['content'], $data['username']);
    $stmt->execute();
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
}
?>