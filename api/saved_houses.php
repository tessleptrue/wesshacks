<?php
// API endpoint for saved houses
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Include database connection
require_once "../config.php";

// Start session for auth purposes
session_start();

// Check if user is logged in via API key or session
function isAuthorized() {
    global $conn;
    
    $api_key = isset($_SERVER['HTTP_AUTHORIZATION']) ? $_SERVER['HTTP_AUTHORIZATION'] : '';
    $username = '';
    
    // Check API key
    if (!empty($api_key)) {
        if (strpos($api_key, 'Bearer ') === 0) {
            $token = substr($api_key, 7);
            // For demonstration, we'll just check if it's a non-empty string
            if (!empty($token)) {
                return ["authorized" => true, "username" => "api_user"]; // Placeholder
            }
        }
    } 
    // Check session auth
    elseif (isset($_SESSION['loggedin']) && $_SESSION['loggedin'] === true) {
        return ["authorized" => true, "username" => $_SESSION['username'], "user_id" => $_SESSION['id']];
    }
    
    return ["authorized" => false];
}

// GET saved houses for current user
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $auth = isAuthorized();
    
    if (!$auth["authorized"]) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Unauthorized'
        ]);
        exit;
    }
    
    $user_id = $auth["user_id"];
    
    // Get saved houses for user
    $sql = "SELECT h.* FROM houses h 
            JOIN saved_houses s ON h.street_address = s.house_address 
            WHERE s.user_id = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "i", $user_id);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    
    $houses = [];
    while ($row = mysqli_fetch_assoc($result)) {
        // Add calculated fields
        $row['reviews_count'] = getReviewsCount($conn, $row['street_address']);
        $row['avg_rating'] = getAverageRating($conn, $row['street_address']);
        $houses[] = $row;
    }
    
    mysqli_stmt_close($stmt);
    
    // Return JSON response
    echo json_encode([
        'status' => 'success',
        'count' => count($houses),
        'data' => $houses
    ]);
}
// POST to save a house
elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $auth = isAuthorized();
    
    if (!$auth["authorized"]) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Unauthorized'
        ]);
        exit;
    }
    
    $user_id = $auth["user_id"];
    
    // Get house_address from POST data
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (!$data) {
        // Try to get from $_POST
        $data = $_POST;
    }
    
    if (empty($data['house_address'])) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'House address is required'
        ]);
        exit;
    }
    
    $house_address = $data['house_address'];
    
    // Check if house exists
    $check_house_sql = "SELECT street_address FROM houses WHERE street_address = ?";
    $check_house_stmt = mysqli_prepare($conn, $check_house_sql);
    mysqli_stmt_bind_param($check_house_stmt, "s", $house_address);
    mysqli_stmt_execute($check_house_stmt);
    mysqli_stmt_store_result($check_house_stmt);
    
    if (mysqli_stmt_num_rows($check_house_stmt) == 0) {
        mysqli_stmt_close($check_house_stmt);
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'House not found'
        ]);
        exit;
    }
    
    mysqli_stmt_close($check_house_stmt);
    
    // Check if already saved
    $check_saved_sql = "SELECT * FROM saved_houses WHERE user_id = ? AND house_address = ?";
    $check_saved_stmt = mysqli_prepare($conn, $check_saved_sql);
    mysqli_stmt_bind_param($check_saved_stmt, "is", $user_id, $house_address);
    mysqli_stmt_execute($check_saved_stmt);
    mysqli_stmt_store_result($check_saved_stmt);
    
    if (mysqli_stmt_num_rows($check_saved_stmt) > 0) {
        mysqli_stmt_close($check_saved_stmt);
        echo json_encode([
            'status' => 'success',
            'message' => 'House already saved',
            'is_saved' => true
        ]);
        exit;
    }
    
    mysqli_stmt_close($check_saved_stmt);
    
    // Save the house
    $sql = "INSERT INTO saved_houses (user_id, house_address) VALUES (?, ?)";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "is", $user_id, $house_address);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'House saved successfully',
            'is_saved' => true
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to save house: ' . mysqli_error($conn)
        ]);
    }
    
    mysqli_stmt_close($stmt);
}
// DELETE to unsave a house
elseif ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $auth = isAuthorized();
    
    if (!$auth["authorized"]) {
        http_response_code(401);
        echo json_encode([
            'status' => 'error',
            'message' => 'Unauthorized'
        ]);
        exit;
    }
    
    $user_id = $auth["user_id"];
    
    // Get house_address from URL parameter
    $house_address = isset($_GET['house']) ? $_GET['house'] : '';
    
    if (empty($house_address)) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'House address is required'
        ]);
        exit;
    }
    
    // Delete the saved house
    $sql = "DELETE FROM saved_houses WHERE user_id = ? AND house_address = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "is", $user_id, $house_address);
    
    if (mysqli_stmt_execute($stmt)) {
        echo json_encode([
            'status' => 'success',
            'message' => 'House unsaved successfully',
            'is_saved' => false
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'status' => 'error',
            'message' => 'Failed to unsave house: ' . mysqli_error($conn)
        ]);
    }
    
    mysqli_stmt_close($stmt);
}
// Method not allowed
else {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed'
    ]);
}

// Function to get average rating for a house
function getAverageRating($conn, $house_address) {
    $sql = "SELECT AVG(rating) as avg_rating FROM house_reviews WHERE house_address = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $house_address);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
    
    return $row['avg_rating'] ? round($row['avg_rating'] * 10) / 10 : 0; // Round to 1 decimal place
}

// Function to get reviews count for a house
function getReviewsCount($conn, $house_address) {
    $sql = "SELECT COUNT(*) as count FROM house_reviews WHERE house_address = ?";
    $stmt = mysqli_prepare($conn, $sql);
    mysqli_stmt_bind_param($stmt, "s", $house_address);
    mysqli_stmt_execute($stmt);
    $result = mysqli_stmt_get_result($stmt);
    $row = mysqli_fetch_assoc($result);
    mysqli_stmt_close($stmt);
    
    return $row['count'];
}

mysqli_close($conn);
?>