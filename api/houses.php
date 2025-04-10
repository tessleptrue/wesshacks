<?php
header('Content-Type: application/json');
require_once '../config.php';

$sql = "SELECT * FROM houses";
$result = mysqli_query($conn, $sql);

$houses = [];

if ($result) {
    while ($row = mysqli_fetch_assoc($result)) {
        $houses[] = $row;
    }
    echo json_encode($houses);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to fetch houses']);
}
?>